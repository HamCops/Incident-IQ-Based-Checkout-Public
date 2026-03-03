// ============================================
// CHARGE SHEET REPOSITORY - DATA ACCESS LAYER
// ============================================
// Handles all Google Sheets operations for charge sheet tracking
// Part of the automatic charge sheet system for devices 3+ days overdue
//
// RESPONSIBILITIES:
// - Charge sheet tracking (logging, status updates, history)
// - Sheet initialization and management
// - Duplicate prevention
// - Resolution tracking
//
// INTEGRATION:
// - Uses CHARGE_SHEET_CONFIG from Config.gs
// - Follows same patterns as CheckoutRepository.gs
// - Uses existing security functions (logSafe, safeLog)
// ============================================

/**
 * Charge Sheet Repository - Google Sheets Data Access Layer
 * Abstracts all charge sheet tracking operations
 */
var ChargeSheetRepository = (function() {

  // Column definitions - Single source of truth
  var COLUMNS = {
    CHARGE_SHEET_ID: 0,
    GENERATION_TIMESTAMP: 1,
    STUDENT_EMAIL: 2,
    STUDENT_NAME: 3,
    DEVICE_TYPE: 4,
    ASSET_TAG: 5,
    SERIAL_NUMBER: 6,
    MODEL: 7,
    CHECKOUT_DATE: 8,
    DAYS_OVERDUE: 9,
    REPLACEMENT_COST: 10,
    EMAIL_SENT: 11,
    EMAIL_TIMESTAMP: 12,
    EMAIL_RECIPIENTS: 13,
    STATUS: 14,
    RETURN_DATE: 15,
    RESOLUTION_NOTES: 16,
    LAST_UPDATED: 17
  };

  var SHEET_NAME = 'Charge Sheet Tracking';

  /**
   * Gets the charge sheet tracking sheet, creates if doesn't exist
   * @returns {Sheet} Google Sheets Sheet object
   */
  function getChargeSheetSheet() {
    var config = getIncidentIQConfig();
    var ss = SpreadsheetApp.openById(config.spreadsheetId);
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      initializeChargeSheetSheet(sheet);
      logSafe('ChargeSheetRepository: Created new Charge Sheet Tracking sheet with headers');
    }

    return sheet;
  }

  /**
   * Initializes the charge sheet tracking sheet with headers and formatting
   * @param {Sheet} sheet - The sheet to initialize
   */
  function initializeChargeSheetSheet(sheet) {
    // Add headers
    var headers = [
      'Charge Sheet ID',
      'Generation Timestamp',
      'Student Email',
      'Student Name',
      'Device Type',
      'Asset Tag',
      'Serial Number',
      'Model',
      'Checkout Date',
      'Days Overdue',
      'Replacement Cost',
      'Email Sent',
      'Email Timestamp',
      'Email Recipients',
      'Status',
      'Return Date',
      'Resolution Notes',
      'Last Updated'
    ];

    sheet.appendRow(headers);

    // Format header row
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#ffd200'); // School brand color (customizable)
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(11);
    headerRange.setHorizontalAlignment('center');

    // Freeze header row
    sheet.setFrozenRows(1);

    // Set column widths
    sheet.setColumnWidth(1, 120);  // Charge Sheet ID
    sheet.setColumnWidth(2, 150);  // Generation Timestamp
    sheet.setColumnWidth(3, 200);  // Student Email
    sheet.setColumnWidth(4, 150);  // Student Name
    sheet.setColumnWidth(5, 100);  // Device Type
    sheet.setColumnWidth(6, 100);  // Asset Tag
    sheet.setColumnWidth(7, 120);  // Serial Number
    sheet.setColumnWidth(8, 200);  // Model
    sheet.setColumnWidth(9, 120);  // Checkout Date
    sheet.setColumnWidth(10, 90);  // Days Overdue
    sheet.setColumnWidth(11, 120); // Replacement Cost
    sheet.setColumnWidth(12, 80);  // Email Sent
    sheet.setColumnWidth(13, 150); // Email Timestamp
    sheet.setColumnWidth(14, 250); // Email Recipients
    sheet.setColumnWidth(15, 100); // Status
    sheet.setColumnWidth(16, 120); // Return Date
    sheet.setColumnWidth(17, 200); // Resolution Notes
    sheet.setColumnWidth(18, 150); // Last Updated

    // Add conditional formatting for status
    // Status column values: Generated, Sent, Returned, Billed, Cancelled
    var statusRange = sheet.getRange('O2:O1000'); // Column O (Status)

    // Add data validation for status column
    var statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Generated', 'Sent', 'Returned', 'Billed', 'Cancelled', 'Pending'], true)
      .setAllowInvalid(false)
      .build();
    statusRange.setDataValidation(statusRule);

    logSafe('ChargeSheetRepository: Sheet initialized with headers and formatting');
  }

  /**
   * Logs a new charge sheet to the tracking sheet
   *
   * @param {Object} chargeSheet - Charge sheet data
   * @param {string} chargeSheet.chargeSheetId - Unique ID (e.g., CS-2025-0001)
   * @param {Date} chargeSheet.generationDate - When charge sheet was generated
   * @param {string} chargeSheet.studentEmail - Student email address
   * @param {string} chargeSheet.studentName - Student full name
   * @param {string} chargeSheet.deviceType - Device type (Chromebook, Charger)
   * @param {string} chargeSheet.assetTag - 6-digit asset tag
   * @param {string} chargeSheet.serialNumber - Device serial number
   * @param {string} chargeSheet.model - Device model
   * @param {Date} chargeSheet.checkoutDate - When device was checked out
   * @param {number} chargeSheet.daysOverdue - Days overdue at generation
   * @param {number} chargeSheet.replacementCost - Total replacement cost
   * @returns {Object} {success: boolean, error?: string}
   */
  function logChargeSheet(chargeSheet) {
    try {
      logSafe('ChargeSheetRepository.logChargeSheet() - Logging charge sheet: ' + chargeSheet.chargeSheetId);

      var sheet = getChargeSheetSheet();

      var row = [
        chargeSheet.chargeSheetId,
        chargeSheet.generationDate || new Date(),
        chargeSheet.studentEmail,
        chargeSheet.studentName,
        chargeSheet.deviceType,
        chargeSheet.assetTag,
        chargeSheet.serialNumber,
        chargeSheet.model,
        chargeSheet.checkoutDate,
        chargeSheet.daysOverdue,
        chargeSheet.replacementCost,
        'No',  // Email Sent - will be updated later
        '',    // Email Timestamp
        '',    // Email Recipients
        'Generated', // Status
        '',    // Return Date
        '',    // Resolution Notes
        new Date() // Last Updated
      ];

      sheet.appendRow(row);

      logSafe('✅ Charge sheet logged: ' + chargeSheet.chargeSheetId);
      return {success: true};

    } catch (error) {
      safeLog('❌ ChargeSheetRepository.logChargeSheet() - Error:', {error: error.toString()});
      return {
        success: false,
        error: 'Failed to log charge sheet: ' + error.toString()
      };
    }
  }

  /**
   * Updates charge sheet status after email is sent
   *
   * @param {string} chargeSheetId - Charge sheet ID to update
   * @param {boolean} emailSent - Whether email was sent successfully
   * @param {Array<string>} recipients - Email recipient addresses
   * @returns {Object} {success: boolean, error?: string}
   */
  function updateEmailStatus(chargeSheetId, emailSent, recipients) {
    try {
      logSafe('ChargeSheetRepository.updateEmailStatus() - Updating: ' + chargeSheetId);

      var sheet = getChargeSheetSheet();
      var data = sheet.getDataRange().getValues();

      // Find the charge sheet row
      for (var i = 1; i < data.length; i++) {
        if (data[i][COLUMNS.CHARGE_SHEET_ID] === chargeSheetId) {
          // Update email status columns
          sheet.getRange(i + 1, COLUMNS.EMAIL_SENT + 1).setValue(emailSent ? 'Yes' : 'No');
          sheet.getRange(i + 1, COLUMNS.EMAIL_TIMESTAMP + 1).setValue(new Date());
          sheet.getRange(i + 1, COLUMNS.EMAIL_RECIPIENTS + 1).setValue(recipients.join(', '));
          sheet.getRange(i + 1, COLUMNS.STATUS + 1).setValue(emailSent ? 'Sent' : 'Generated');
          sheet.getRange(i + 1, COLUMNS.LAST_UPDATED + 1).setValue(new Date());

          logSafe('✅ Email status updated for: ' + chargeSheetId);
          return {success: true};
        }
      }

      // Charge sheet not found
      logSafe('⚠️ Charge sheet not found: ' + chargeSheetId);
      return {
        success: false,
        error: 'Charge sheet not found: ' + chargeSheetId
      };

    } catch (error) {
      safeLog('❌ ChargeSheetRepository.updateEmailStatus() - Error:', {error: error.toString()});
      return {
        success: false,
        error: 'Failed to update email status: ' + error.toString()
      };
    }
  }

  /**
   * Updates charge sheet status (e.g., when device is returned)
   *
   * @param {string} chargeSheetId - Charge sheet ID to update
   * @param {string} status - New status (Generated, Sent, Returned, Billed, Cancelled)
   * @param {string} notes - Optional resolution notes
   * @returns {Object} {success: boolean, error?: string}
   */
  function updateChargeSheetStatus(chargeSheetId, status, notes) {
    try {
      logSafe('ChargeSheetRepository.updateChargeSheetStatus() - Updating: ' + chargeSheetId + ' to ' + status);

      var sheet = getChargeSheetSheet();
      var data = sheet.getDataRange().getValues();

      // Find the charge sheet row
      for (var i = 1; i < data.length; i++) {
        if (data[i][COLUMNS.CHARGE_SHEET_ID] === chargeSheetId) {
          // Update status
          sheet.getRange(i + 1, COLUMNS.STATUS + 1).setValue(status);

          // If status is Returned, update return date
          if (status === 'Returned') {
            sheet.getRange(i + 1, COLUMNS.RETURN_DATE + 1).setValue(new Date());
          }

          // Add resolution notes if provided
          if (notes) {
            sheet.getRange(i + 1, COLUMNS.RESOLUTION_NOTES + 1).setValue(notes);
          }

          // Update last modified timestamp
          sheet.getRange(i + 1, COLUMNS.LAST_UPDATED + 1).setValue(new Date());

          logSafe('✅ Charge sheet status updated: ' + chargeSheetId + ' -> ' + status);
          return {success: true};
        }
      }

      // Charge sheet not found
      logSafe('⚠️ Charge sheet not found: ' + chargeSheetId);
      return {
        success: false,
        error: 'Charge sheet not found: ' + chargeSheetId
      };

    } catch (error) {
      safeLog('❌ ChargeSheetRepository.updateChargeSheetStatus() - Error:', {error: error.toString()});
      return {
        success: false,
        error: 'Failed to update charge sheet status: ' + error.toString()
      };
    }
  }

  /**
   * Gets charge sheet history for a specific asset tag
   *
   * @param {string} assetTag - 6-digit asset tag
   * @returns {Array} Array of charge sheet objects for this asset
   */
  function getChargeSheetHistory(assetTag) {
    try {
      logSafe('ChargeSheetRepository.getChargeSheetHistory() - Fetching history for: ' + assetTag);

      var sheet = getChargeSheetSheet();
      var data = sheet.getDataRange().getValues();
      var history = [];

      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        if (row[COLUMNS.ASSET_TAG] === assetTag) {
          history.push({
            chargeSheetId: row[COLUMNS.CHARGE_SHEET_ID],
            generationDate: row[COLUMNS.GENERATION_TIMESTAMP],
            studentEmail: row[COLUMNS.STUDENT_EMAIL],
            studentName: row[COLUMNS.STUDENT_NAME],
            deviceType: row[COLUMNS.DEVICE_TYPE],
            assetTag: row[COLUMNS.ASSET_TAG],
            serialNumber: row[COLUMNS.SERIAL_NUMBER],
            model: row[COLUMNS.MODEL],
            checkoutDate: row[COLUMNS.CHECKOUT_DATE],
            daysOverdue: row[COLUMNS.DAYS_OVERDUE],
            replacementCost: row[COLUMNS.REPLACEMENT_COST],
            emailSent: row[COLUMNS.EMAIL_SENT],
            emailTimestamp: row[COLUMNS.EMAIL_TIMESTAMP],
            status: row[COLUMNS.STATUS],
            returnDate: row[COLUMNS.RETURN_DATE],
            resolutionNotes: row[COLUMNS.RESOLUTION_NOTES]
          });
        }
      }

      // Sort by generation date descending (newest first)
      history.sort(function(a, b) {
        return b.generationDate - a.generationDate;
      });

      logSafe('ChargeSheetRepository.getChargeSheetHistory() - Found ' + history.length + ' charge sheets');
      return history;

    } catch (error) {
      safeLog('ChargeSheetRepository.getChargeSheetHistory() - Error:', {error: error.toString()});
      return [];
    }
  }

  /**
   * Checks if an active (unresolved) charge sheet already exists for a device
   * Prevents duplicate charge sheet generation for the same checkout
   *
   * FIXED: Now checks for ANY active charge sheet, not just today
   * Active statuses: Generated, Sent, Pending (NOT Returned, Billed, Cancelled)
   *
   * @param {string} assetTag - 6-digit asset tag
   * @returns {boolean} True if active charge sheet already exists
   */
  function chargeSheetExistsToday(assetTag) {
    try {
      var sheet = getChargeSheetSheet();
      var data = sheet.getDataRange().getValues();

      // Active statuses that should prevent new charge sheet generation
      var activeStatuses = ['Generated', 'Sent', 'Pending'];

      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var rowAssetTag = row[COLUMNS.ASSET_TAG];
        var status = row[COLUMNS.STATUS];

        // Check if same asset tag AND status is active (not resolved)
        if (rowAssetTag === assetTag && activeStatuses.indexOf(status) !== -1) {
          logSafe('ChargeSheetRepository: Duplicate prevented for ' + assetTag + ' (active charge sheet exists with status: ' + status + ')');
          return true;
        }
      }

      return false;

    } catch (error) {
      safeLog('ChargeSheetRepository.chargeSheetExistsToday() - Error:', {error: error.toString()});
      return false; // Safe default - allow generation if check fails
    }
  }

  /**
   * Gets the next charge sheet ID number for the current year
   * @returns {string} Next charge sheet ID (e.g., CS-2025-0001)
   */
  function getNextChargeSheetId() {
    try {
      var sheet = getChargeSheetSheet();
      var data = sheet.getDataRange().getValues();
      var currentYear = new Date().getFullYear();
      var prefix = CHARGE_SHEET_CONFIG.ID_PREFIX + '-' + currentYear + '-';
      var maxNumber = 0;

      // Find highest number for current year
      for (var i = 1; i < data.length; i++) {
        var chargeSheetId = data[i][COLUMNS.CHARGE_SHEET_ID];
        if (chargeSheetId && chargeSheetId.startsWith(prefix)) {
          var numberPart = chargeSheetId.substring(prefix.length);
          var number = parseInt(numberPart, 10);
          if (!isNaN(number) && number > maxNumber) {
            maxNumber = number;
          }
        }
      }

      // Generate next ID
      var nextNumber = maxNumber + 1;
      var nextId = prefix + String(nextNumber).padStart(4, '0');

      logSafe('ChargeSheetRepository.getNextChargeSheetId() - Generated: ' + nextId);
      return nextId;

    } catch (error) {
      safeLog('ChargeSheetRepository.getNextChargeSheetId() - Error:', {error: error.toString()});
      // Fallback: use timestamp-based ID
      return CHARGE_SHEET_CONFIG.ID_PREFIX + '-' + new Date().getTime();
    }
  }

  /**
   * Auto-updates charge sheet status when device is returned
   * Called from checkout processing when a device with active charge sheet is returned
   *
   * @param {string} assetTag - Asset tag of returned device
   * @returns {Object} {success: boolean, chargeSheetId?: string}
   */
  function autoResolveChargeSheet(assetTag) {
    try {
      logSafe('ChargeSheetRepository.autoResolveChargeSheet() - Checking for active charge sheets: ' + assetTag);

      var sheet = getChargeSheetSheet();
      var data = sheet.getDataRange().getValues();
      var resolved = [];

      // Find all active charge sheets for this asset
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var rowAssetTag = row[COLUMNS.ASSET_TAG];
        var status = row[COLUMNS.STATUS];

        // Update if asset tag matches and status is Generated or Sent
        if (rowAssetTag === assetTag && (status === 'Generated' || status === 'Sent')) {
          var chargeSheetId = row[COLUMNS.CHARGE_SHEET_ID];

          // Update to Returned status
          sheet.getRange(i + 1, COLUMNS.STATUS + 1).setValue('Returned');
          sheet.getRange(i + 1, COLUMNS.RETURN_DATE + 1).setValue(new Date());
          sheet.getRange(i + 1, COLUMNS.RESOLUTION_NOTES + 1).setValue('Auto-resolved: Device returned');
          sheet.getRange(i + 1, COLUMNS.LAST_UPDATED + 1).setValue(new Date());

          resolved.push(chargeSheetId);
          logSafe('✅ Auto-resolved charge sheet: ' + chargeSheetId);
        }
      }

      if (resolved.length > 0) {
        return {
          success: true,
          chargeSheetIds: resolved,
          count: resolved.length
        };
      } else {
        return {
          success: true,
          count: 0
        };
      }

    } catch (error) {
      safeLog('❌ ChargeSheetRepository.autoResolveChargeSheet() - Error:', {error: error.toString()});
      return {
        success: false,
        error: error.toString()
      };
    }
  }

  // Public API
  return {
    getChargeSheetSheet: getChargeSheetSheet,
    logChargeSheet: logChargeSheet,
    updateEmailStatus: updateEmailStatus,
    updateChargeSheetStatus: updateChargeSheetStatus,
    getChargeSheetHistory: getChargeSheetHistory,
    chargeSheetExistsToday: chargeSheetExistsToday,
    getNextChargeSheetId: getNextChargeSheetId,
    autoResolveChargeSheet: autoResolveChargeSheet
  };

})();

/**
 * TEST: Verify duplicate charge sheet prevention
 * Run this to test the fix
 */
function testChargeSheetDuplicatePrevention() {
  Logger.log('=== TESTING CHARGE SHEET DUPLICATE PREVENTION ===\n');

  // Get a test asset tag (use one from your charge sheet tracking)
  var sheet = ChargeSheetRepository.getChargeSheetSheet();
  var data = sheet.getDataRange().getValues();

  if (data.length < 2) {
    Logger.log('⚠️ No charge sheets found in tracking sheet. Generate one first.');
    return;
  }

  // Use the first charge sheet in the list
  var testAssetTag = data[1][5]; // Column F: Asset Tag
  var testStatus = data[1][14]; // Column O: Status

  Logger.log('Test Asset Tag: ' + testAssetTag);
  Logger.log('Current Status: ' + testStatus);
  Logger.log('');

  // Test 1: Check if duplicate is prevented
  var isDuplicate = ChargeSheetRepository.chargeSheetExistsToday(testAssetTag);

  Logger.log('--- Test 1: Duplicate Check ---');
  Logger.log('Asset Tag: ' + testAssetTag);
  Logger.log('Duplicate Found: ' + isDuplicate);

  if (testStatus === 'Generated' || testStatus === 'Sent' || testStatus === 'Pending') {
    Logger.log('Expected: TRUE (active charge sheet exists)');
    Logger.log('Result: ' + (isDuplicate ? '✅ PASS' : '❌ FAIL'));
  } else if (testStatus === 'Returned' || testStatus === 'Billed' || testStatus === 'Cancelled') {
    Logger.log('Expected: FALSE (charge sheet is resolved)');
    Logger.log('Result: ' + (!isDuplicate ? '✅ PASS' : '❌ FAIL'));
  }

  Logger.log('');
  Logger.log('--- How It Works ---');
  Logger.log('✅ PREVENTS duplicates for: Generated, Sent, Pending');
  Logger.log('✅ ALLOWS new charge sheets for: Returned, Billed, Cancelled');
  Logger.log('');
  Logger.log('--- Real-World Scenario ---');
  Logger.log('Day 3: Device 3 days overdue → Status: Generated → Duplicate check: TRUE ✅');
  Logger.log('Day 4: Same device → Status: Generated → Duplicate check: TRUE ✅ (no new charge sheet)');
  Logger.log('Day 5: Device returned → Status: Returned → Duplicate check: FALSE ✅');
  Logger.log('Day 10: Device overdue again → Status: Returned (old) → Duplicate check: FALSE ✅ (new charge sheet OK)');

  Logger.log('\n=== TEST COMPLETE ===');
}
