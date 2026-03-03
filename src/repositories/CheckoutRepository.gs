// ============================================
// CHECKOUT REPOSITORY - DATA ACCESS LAYER
// ============================================
// Phase 2 Refactoring: Repository Pattern
// Centralizes all Google Sheets data access
// Extracted from Main.gs for better testability and maintainability
//
// RESPONSIBILITIES:
// - Transaction logging (checkout/return)
// - Active checkout counting
// - Overdue device tracking
// - Transaction history retrieval
// - Sheet initialization and management
//
// BENEFITS:
// ✓ No more magic column indices (row[3])
// ✓ Single source of truth for data structure
// ✓ Easy to switch storage backends (SQL, NoSQL)
// ✓ Centralized data validation
// ============================================

/**
 * Checkout Repository - Google Sheets Data Access Layer
 * Abstracts all Sheets operations behind a clean interface
 */
var CheckoutRepository = (function() {

  // Column definitions - Single source of truth
  var COLUMNS = {
    TIMESTAMP: 0,
    STUDENT_EMAIL: 1,
    DEVICE_TYPE: 2,
    ASSET_TAG: 3,
    SERIAL_NUMBER: 4,
    MODEL: 5,
    ACTION: 6,
    STATUS: 7,
    INCIDENTIQ_UPDATED: 8
  };

  var SHEET_NAME = 'Checkouts';
  var OVERDUE_SHEET_NAME = 'Overdue Alerts';
  var LOG_SHEET_NAME = 'Notification Log';

  /**
   * Gets the checkout sheet, creates if doesn't exist
   * @returns {Sheet} Google Sheets Sheet object
   */
  function getCheckoutSheet() {
    var config = getIncidentIQConfig();
    var ss = SpreadsheetApp.openById(config.spreadsheetId);
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        'Timestamp',
        'Student Email',
        'Device Type',
        'Asset Tag',
        'Serial Number',
        'Model',
        'Action',
        'Status',
        'IncidentIQ Updated'
      ]);
      logSafe('CheckoutRepository: Created new Checkouts sheet with headers');
    }

    return sheet;
  }

  /**
   * Gets the overdue alerts sheet, creates if doesn't exist
   * @returns {Sheet} Google Sheets Sheet object
   */
  function getOverdueSheet() {
    var config = getIncidentIQConfig();
    var ss = SpreadsheetApp.openById(config.spreadsheetId);
    var sheet = ss.getSheetByName(OVERDUE_SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(OVERDUE_SHEET_NAME);
      logSafe('CheckoutRepository: Created new Overdue Alerts sheet');
    }

    return sheet;
  }

  /**
   * Gets the notification log sheet, creates if doesn't exist
   * @returns {Sheet} Google Sheets Sheet object
   */
  function getLogSheet() {
    var config = getIncidentIQConfig();
    var ss = SpreadsheetApp.openById(config.spreadsheetId);
    var sheet = ss.getSheetByName(LOG_SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(LOG_SHEET_NAME);
      logSafe('CheckoutRepository: Created new Notification Log sheet');
    }

    return sheet;
  }

  /**
   * Logs a checkout or return transaction
   *
   * @param {Object} transaction - Transaction data
   * @param {string} transaction.studentEmail - Student email
   * @param {string} transaction.deviceType - Chromebook or Charger
   * @param {string} transaction.assetTag - 6-digit asset tag
   * @param {string} transaction.serialNumber - Device serial number
   * @param {string} transaction.model - Device model
   * @param {string} transaction.action - "Check Out" or "Return"
   * @param {string} transaction.status - "Checked Out" or "Returned"
   * @param {boolean} transaction.incidentIQUpdated - Whether IncidentIQ was updated
   * @returns {Object} {success: boolean, error?: string}
   */
  function logTransaction(transaction) {
    try {
      logSafe('CheckoutRepository.logTransaction() - Logging transaction');

      // Write to Monthly History sheet only (old Checkouts sheet is now archive-only)
      var monthlyResult = logToMonthlyHistory(transaction);
      if (monthlyResult.success) {
        logSafe('✅ Logged to Monthly History: ' + monthlyResult.sheetName);
      } else {
        logSafe('❌ Monthly History write failed - ' + monthlyResult.error);
        // Fail the transaction if monthly write fails (this is our primary record now)
        return {
          success: false,
          error: 'Failed to log to Monthly History: ' + monthlyResult.error
        };
      }

      logSafe('CheckoutRepository.logTransaction() - Transaction logged successfully');
      return {success: true};

    } catch (error) {
      safeLog('CheckoutRepository.logTransaction() - Error:', {error: error.toString()});
      return {
        success: false,
        error: 'Failed to log transaction: ' + error.toString()
      };
    }
  }

  /**
   * Gets the count of active checkouts for a student
   * NEW: Reads from Active Checkouts sheet (much faster!)
   *
   * @param {string} studentEmail - Student email address
   * @returns {number} Count of currently checked out devices
   */
  function getActiveCheckoutCount(studentEmail) {
    try {
      logSafe('CheckoutRepository.getActiveCheckoutCount() - Counting for: ' + studentEmail);

      // NEW: Read from Active Checkouts sheet (small and fast)
      var sheet = getActiveCheckoutsSheet();
      var data = sheet.getDataRange().getValues();
      var count = 0;

      var emailLower = studentEmail.toLowerCase();

      // Count rows where email matches
      for (var i = 1; i < data.length; i++) {
        var rowEmail = (data[i][ACTIVE_COLUMNS.EMAIL] || '').toLowerCase();
        if (rowEmail === emailLower) {
          count++;
        }
      }

      logSafe('CheckoutRepository.getActiveCheckoutCount() - Found ' + count + ' active checkouts');
      return count;

    } catch (error) {
      safeLog('CheckoutRepository.getActiveCheckoutCount() - Error:', {error: error.toString()});
      return 0; // Safe default
    }
  }

  /**
   * Gets all overdue devices (checked out past cutoff time)
   * NEW: Reads from Active Checkouts sheet (much faster!)
   *
   * @returns {Array} Array of overdue device objects
   */
  function getOverdueDevices() {
    try {
      logSafe('CheckoutRepository.getOverdueDevices() - Fetching overdue devices');

      // NEW: Read from Active Checkouts sheet (small and fast)
      var sheet = getActiveCheckoutsSheet();
      var data = sheet.getDataRange().getValues();
      var cutoffTime = getCutoffDateTime();
      var overdueDevices = [];

      // Simply filter by checkout time - no need to build state map!
      for (var i = 1; i < data.length; i++) {
        var email = data[i][ACTIVE_COLUMNS.EMAIL];
        var deviceType = data[i][ACTIVE_COLUMNS.DEVICE_TYPE];
        var assetTag = data[i][ACTIVE_COLUMNS.ASSET_TAG];
        var serialNumber = data[i][ACTIVE_COLUMNS.SERIAL_NUMBER];
        var model = data[i][ACTIVE_COLUMNS.MODEL];
        var checkoutTime = data[i][ACTIVE_COLUMNS.CHECKOUT_TIME];

        if (!email || !assetTag || !checkoutTime) continue;

        // Check if overdue
        if (checkoutTime < cutoffTime) {
          var now = new Date();
          var daysOverdue = Math.floor((now - checkoutTime) / (1000 * 60 * 60 * 24));
          var hoursOverdue = Math.floor((now - checkoutTime) / (1000 * 60 * 60));

          // Calculate severity based on days overdue
          var severity = 'low';
          if (daysOverdue >= 3) {
            severity = 'high';
          } else if (daysOverdue >= 1) {
            severity = 'medium';
          }

          overdueDevices.push({
            studentEmail: email,
            deviceType: deviceType,
            assetTag: assetTag,
            serialNumber: serialNumber,
            model: model,
            timestamp: checkoutTime,
            checkoutTime: checkoutTime,
            daysOverdue: daysOverdue,
            hoursOverdue: hoursOverdue,
            severity: severity
          });
        }
      }

      logSafe('CheckoutRepository.getOverdueDevices() - Found ' + overdueDevices.length + ' overdue devices');
      return overdueDevices;

    } catch (error) {
      safeLog('CheckoutRepository.getOverdueDevices() - Error:', {error: error.toString()});
      return [];
    }
  }

  /**
   * Gets transaction history for a specific asset
   *
   * @param {string} assetTag - 6-digit asset tag
   * @returns {Array} Array of transaction objects for this asset
   */
  function getAssetHistory(assetTag) {
    try {
      logSafe('CheckoutRepository.getAssetHistory() - Fetching history for: ' + assetTag);

      var sheet = getCheckoutSheet();
      var data = sheet.getDataRange().getValues();
      var history = [];

      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var rowAssetTag = row[COLUMNS.ASSET_TAG];

        if (rowAssetTag === assetTag) {
          history.push({
            timestamp: row[COLUMNS.TIMESTAMP],
            studentEmail: row[COLUMNS.STUDENT_EMAIL],
            deviceType: row[COLUMNS.DEVICE_TYPE],
            serialNumber: row[COLUMNS.SERIAL_NUMBER],
            model: row[COLUMNS.MODEL],
            action: row[COLUMNS.ACTION],
            status: row[COLUMNS.STATUS],
            incidentIQUpdated: row[COLUMNS.INCIDENTIQ_UPDATED]
          });
        }
      }

      // Sort by timestamp descending (newest first)
      history.sort(function(a, b) {
        return b.timestamp - a.timestamp;
      });

      logSafe('CheckoutRepository.getAssetHistory() - Found ' + history.length + ' transactions');
      return history;

    } catch (error) {
      safeLog('CheckoutRepository.getAssetHistory() - Error:', {error: error.toString()});
      return [];
    }
  }

  /**
   * Updates the overdue alerts dashboard with enhanced formatting
   * NOW SUPPORTS: Morning mode (overnight only) vs Afternoon mode (all overdue)
   *
   * @param {Array} overdueDevices - Array of overdue device objects
   * @param {string} mode - 'MORNING' or 'AFTERNOON' (default AFTERNOON)
   * @returns {Object} {success: boolean, error?: string}
   */
  function updateOverdueDashboard(overdueDevices, mode) {
    try {
      mode = mode || 'AFTERNOON'; // Default to afternoon mode
      logSafe('CheckoutRepository.updateOverdueDashboard() - Updating dashboard (Mode: ' + mode + ')');

      var sheet = getOverdueSheet();
      sheet.clear();

      // Add header with timestamp
      var now = new Date();

      // Different headers based on mode
      var title, subtitle, policy;
      if (mode === 'MORNING') {
        title = 'Overdue Device Dashboard (Morning Snapshot)';
        subtitle = 'Last Updated: ' + now.toLocaleString('en-US', {timeZone: NOTIFICATION_CONFIG.SCHOOL_TIMEZONE});
        policy = '🌅 OVERNIGHT DEVICES - These were NOT returned yesterday';
      } else {
        title = 'Overdue Device Dashboard (Afternoon Snapshot)';
        subtitle = 'Last Updated: ' + now.toLocaleString('en-US', {timeZone: NOTIFICATION_CONFIG.SCHOOL_TIMEZONE});
        policy = '⚠️ ALL OVERDUE - Devices must be returned by 2:20 PM EST daily';
      }

      var headerData = [
        [title],
        [subtitle],
        [policy],
        ['⚠️ NOT REAL-TIME - Updates at 7:00 AM and 2:30 PM daily only'],
        ['For current status, check "Active Checkouts" sheet →'],
        [''], // Empty row
        ['Student Email', 'Device Type', 'Asset Tag', 'Serial Number', 'Checkout Time', 'Days Overdue', 'Hours Overdue', 'Priority']
      ];

      // Add header formatting
      for (var i = 0; i < headerData.length; i++) {
        sheet.getRange(i + 1, 1, 1, headerData[i].length).setValues([headerData[i]]);
      }

      // Format headers
      sheet.getRange(1, 1, 1, 8).setBackground('#ffd200').setFontWeight('bold').setFontSize(14);
      sheet.getRange(2, 1, 1, 8).setBackground('#f8f9fa').setFontStyle('italic').setFontSize(11);

      // Different color for morning vs afternoon policy line
      if (mode === 'MORNING') {
        sheet.getRange(3, 1, 1, 8).setBackground('#fff3cd').setFontSize(12).setFontColor('#856404').setFontWeight('bold');
      } else {
        sheet.getRange(3, 1, 1, 8).setBackground('#f8d7da').setFontSize(12).setFontColor('#721c24').setFontWeight('bold');
      }

      sheet.getRange(4, 1, 1, 8).setBackground('#d1ecf1').setFontSize(10).setFontStyle('italic');
      sheet.getRange(5, 1, 1, 8).setBackground('#d1ecf1').setFontSize(10).setFontStyle('italic');
      sheet.getRange(7, 1, 1, 8).setBackground('#e9ecef').setFontWeight('bold').setHorizontalAlignment('center');

      if (overdueDevices.length === 0) {
        // Add "All Clear" message
        var message = mode === 'MORNING' ?
          '✅ ALL CLEAR - No overnight devices! All devices from yesterday were returned.' :
          '✅ ALL CLEAR - No overdue devices! All devices returned on time.';

        sheet.getRange(8, 1, 1, 8).merge()
          .setValue(message)
          .setBackground('#d4edda')
          .setFontColor('#155724')
          .setFontWeight('bold')
          .setFontSize(16)
          .setHorizontalAlignment('center')
          .setVerticalAlignment('middle');
      } else {
        // Sort devices by severity (HIGH -> MEDIUM -> LOW)
        var severityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
        overdueDevices.sort(function(a, b) {
          return severityOrder[a.severity] - severityOrder[b.severity];
        });

        // Add overdue device data
        var dataRows = overdueDevices.map(function(device) {
          return [
            device.studentEmail,
            device.deviceType,
            device.assetTag,
            device.serialNumber,
            device.timestamp.toLocaleString('en-US', {timeZone: NOTIFICATION_CONFIG.SCHOOL_TIMEZONE}),
            device.daysOverdue,
            device.hoursOverdue,
            device.severity.toUpperCase()
          ];
        });

        var dataRange = sheet.getRange(8, 1, dataRows.length, 8);
        dataRange.setValues(dataRows);

        // Format Days Overdue and Hours Overdue columns as numbers (not dates)
        sheet.getRange(8, 6, dataRows.length, 2).setNumberFormat('0');

        // Apply conditional formatting based on severity
        for (var i = 0; i < dataRows.length; i++) {
          var row = i + 8;
          var severity = overdueDevices[i].severity;

          var backgroundColor, fontColor;
          if (severity === 'high') {
            backgroundColor = '#f8d7da';
            fontColor = '#721c24';
          } else if (severity === 'medium') {
            backgroundColor = '#fff3cd';
            fontColor = '#856404';
          } else {
            backgroundColor = '#d1ecf1';
            fontColor = '#0c5460';
          }

          sheet.getRange(row, 1, 1, 8)
            .setBackground(backgroundColor)
            .setFontColor(fontColor);
        }

        // Add summary stats at bottom
        sheet.getRange(8 + dataRows.length + 1, 1, 1, 8).merge()
          .setValue('Total: ' + overdueDevices.length + ' device' + (overdueDevices.length === 1 ? '' : 's') + ' overdue')
          .setBackground('#e9ecef')
          .setFontWeight('bold')
          .setHorizontalAlignment('center');
      }

      // Auto-resize columns
      sheet.autoResizeColumns(1, 8);

      // Freeze header rows
      sheet.setFrozenRows(7);

      logSafe('CheckoutRepository.updateOverdueDashboard() - Dashboard updated with ' + overdueDevices.length + ' devices (Mode: ' + mode + ')');
      return {success: true};

    } catch (error) {
      safeLog('CheckoutRepository.updateOverdueDashboard() - Error:', {error: error.toString()});
      return {
        success: false,
        error: 'Failed to update dashboard: ' + error.toString()
      };
    }
  }

  /**
   * Logs notification activity to tracking sheet
   *
   * @param {number} deviceCount - Number of overdue devices
   * @param {boolean} emailSuccess - Whether email was sent successfully
   * @returns {Object} {success: boolean, error?: string}
   */
  function logNotification(deviceCount, emailSuccess) {
    try {
      var sheet = getLogSheet();

      // Create header if sheet is new
      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          'Timestamp',
          'Day of Week',
          'Overdue Devices',
          'Email Sent',
          'Recipients',
          'Status'
        ]);
      }

      var now = new Date();
      var dayOfWeek = now.toLocaleDateString('en-US', {
        timeZone: NOTIFICATION_CONFIG.SCHOOL_TIMEZONE,
        weekday: 'long'
      });

      sheet.appendRow([
        now,
        dayOfWeek,
        deviceCount,
        emailSuccess ? 'Yes' : 'No',
        NOTIFICATION_CONFIG.IT_STAFF_EMAILS.join(', '),
        deviceCount === 0 ? 'All Clear' :
        deviceCount > 5 ? 'High Alert' :
        deviceCount > 2 ? 'Medium Alert' : 'Low Alert'
      ]);

      logSafe('CheckoutRepository.logNotification() - Activity logged');
      return {success: true};

    } catch (error) {
      safeLog('CheckoutRepository.logNotification() - Error:', {error: error.toString()});
      return {
        success: false,
        error: 'Failed to log notification: ' + error.toString()
      };
    }
  }

  // ============================================
  // ACTIVE CHECKOUTS FUNCTIONS (NEW)
  // ============================================

  var ACTIVE_SHEET_NAME = 'Active Checkouts';

  // Column definitions for Active Checkouts
  var ACTIVE_COLUMNS = {
    EMAIL: 0,
    DEVICE_TYPE: 1,
    ASSET_TAG: 2,
    SERIAL_NUMBER: 3,
    MODEL: 4,
    CHECKOUT_TIME: 5,
    DAYS_OUTSTANDING: 6  // Formula column
  };

  /**
   * Gets or creates the Active Checkouts sheet
   * @returns {Sheet} Active Checkouts sheet
   */
  function getActiveCheckoutsSheet() {
    var config = getIncidentIQConfig();
    var ss = SpreadsheetApp.openById(config.spreadsheetId);
    var sheet = ss.getSheetByName(ACTIVE_SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(ACTIVE_SHEET_NAME);

      // Set headers
      sheet.appendRow([
        'Email',
        'Device Type',
        'Asset Tag',
        'Serial Number',
        'Model',
        'Checkout Time',
        'Days Outstanding'
      ]);

      // Format header row
      var headerRange = sheet.getRange(1, 1, 1, 7);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4A90E2');
      headerRange.setFontColor('#FFFFFF');

      // Freeze header row
      sheet.setFrozenRows(1);

      // Set column widths
      sheet.setColumnWidth(1, 250); // Email
      sheet.setColumnWidth(2, 120); // Device Type
      sheet.setColumnWidth(3, 100); // Asset Tag
      sheet.setColumnWidth(4, 150); // Serial Number
      sheet.setColumnWidth(5, 200); // Model
      sheet.setColumnWidth(6, 180); // Checkout Time
      sheet.setColumnWidth(7, 150); // Days Outstanding

      logSafe('CheckoutRepository: Created Active Checkouts sheet');
    }

    return sheet;
  }

  /**
   * Adds a device to Active Checkouts
   * @param {Object} checkout - {email, deviceType, assetTag, serialNumber, model, checkoutTime}
   * @returns {Object} {success: boolean, error?: string}
   */
  function addToActiveCheckouts(checkout) {
    try {
      logSafe('CheckoutRepository.addToActiveCheckouts() - Adding: ' + checkout.assetTag);

      var sheet = getActiveCheckoutsSheet();

      // Check if already exists (shouldn't happen, but safety check)
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][ACTIVE_COLUMNS.ASSET_TAG] === checkout.assetTag) {
          logSafe('⚠️ Asset ' + checkout.assetTag + ' already in Active Checkouts, updating...');
          // Update existing row instead of adding duplicate
          sheet.getRange(i + 1, 1, 1, 6).setValues([[
            checkout.email,
            checkout.deviceType,
            checkout.assetTag,
            checkout.serialNumber,
            checkout.model,
            checkout.checkoutTime
          ]]);
          return { success: true, updated: true };
        }
      }

      // Add new row
      var newRow = sheet.getLastRow() + 1;
      sheet.getRange(newRow, 1, 1, 6).setValues([[
        checkout.email,
        checkout.deviceType,
        checkout.assetTag,
        checkout.serialNumber,
        checkout.model,
        checkout.checkoutTime
      ]]);

      // Add formula for Days Outstanding (column G)
      sheet.getRange(newRow, 7).setFormula('=INT(NOW()-F' + newRow + ')');

      // Apply conditional formatting to Days Outstanding
      var daysCell = sheet.getRange(newRow, 7);
      var rule = SpreadsheetApp.newConditionalFormatRule()
        .whenNumberGreaterThan(0)
        .setBackground('#fff3cd')
        .setRanges([daysCell])
        .build();
      var rules = sheet.getConditionalFormatRules();
      rules.push(rule);
      sheet.setConditionalFormatRules(rules);

      logSafe('✅ Added to Active Checkouts: ' + checkout.assetTag);
      return { success: true };

    } catch (error) {
      safeLog('CheckoutRepository.addToActiveCheckouts() - Error:', {error: error.toString()});
      return {
        success: false,
        error: 'Failed to add to Active Checkouts: ' + error.toString()
      };
    }
  }

  /**
   * Removes a device from Active Checkouts
   * @param {string} assetTag - Asset tag to remove
   * @returns {Object} {success: boolean, found: boolean, error?: string}
   */
  function removeFromActiveCheckouts(assetTag) {
    try {
      logSafe('CheckoutRepository.removeFromActiveCheckouts() - Removing: ' + assetTag);

      var sheet = getActiveCheckoutsSheet();
      var data = sheet.getDataRange().getValues();

      // Normalize the asset tag we're looking for
      var normalizedAssetTag = String(assetTag).trim();

      // Find row with this asset tag
      for (var i = 1; i < data.length; i++) {
        var rowAssetTag = String(data[i][ACTIVE_COLUMNS.ASSET_TAG]).trim();

        if (rowAssetTag === normalizedAssetTag) {
          sheet.deleteRow(i + 1);
          SpreadsheetApp.flush(); // Force Google Sheets to apply changes immediately
          logSafe('✅ Removed from Active Checkouts: ' + assetTag);
          return { success: true, found: true };
        }
      }

      // Debug: Log all asset tags if not found
      logSafe('⚠️ Asset ' + assetTag + ' not found in Active Checkouts');
      logSafe('Available asset tags: ' + data.slice(1).map(function(row) {
        return String(row[ACTIVE_COLUMNS.ASSET_TAG]).trim();
      }).join(', '));
      return { success: true, found: false };

    } catch (error) {
      safeLog('CheckoutRepository.removeFromActiveCheckouts() - Error:', {error: error.toString()});
      return {
        success: false,
        found: false,
        error: 'Failed to remove from Active Checkouts: ' + error.toString()
      };
    }
  }

  /**
   * Gets all active checkouts
   * @returns {Array} Array of active checkout objects
   */
  function getAllActiveCheckouts() {
    try {
      var sheet = getActiveCheckoutsSheet();
      var data = sheet.getDataRange().getValues();
      var checkouts = [];

      for (var i = 1; i < data.length; i++) {
        checkouts.push({
          email: data[i][ACTIVE_COLUMNS.EMAIL],
          deviceType: data[i][ACTIVE_COLUMNS.DEVICE_TYPE],
          assetTag: data[i][ACTIVE_COLUMNS.ASSET_TAG],
          serialNumber: data[i][ACTIVE_COLUMNS.SERIAL_NUMBER],
          model: data[i][ACTIVE_COLUMNS.MODEL],
          checkoutTime: data[i][ACTIVE_COLUMNS.CHECKOUT_TIME],
          daysOutstanding: data[i][ACTIVE_COLUMNS.DAYS_OUTSTANDING]
        });
      }

      return checkouts;

    } catch (error) {
      safeLog('CheckoutRepository.getAllActiveCheckouts() - Error:', {error: error.toString()});
      return [];
    }
  }

  // ============================================
  // MONTHLY HISTORY FUNCTIONS (NEW)
  // ============================================

  /**
   * Gets the monthly history sheet name for a given date
   * @param {Date} date - Date to get sheet name for
   * @returns {string} Sheet name like "History - November 2025"
   */
  function getMonthlySheetName(date) {
    var months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
    var monthName = months[date.getMonth()];
    var year = date.getFullYear();
    return 'History - ' + monthName + ' ' + year;
  }

  /**
   * Gets or creates a monthly history sheet
   * @param {Date} date - Date to get sheet for
   * @returns {Sheet} Monthly history sheet
   */
  function getMonthlyHistorySheet(date) {
    var config = getIncidentIQConfig();
    var ss = SpreadsheetApp.openById(config.spreadsheetId);
    var sheetName = getMonthlySheetName(date);
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);

      // Set headers (same as old Checkouts sheet)
      sheet.appendRow([
        'Timestamp',
        'Student Email',
        'Device Type',
        'Asset Tag',
        'Serial Number',
        'Model',
        'Action',
        'Status',
        'IncidentIQ Updated'
      ]);

      // Format header row
      var headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#28a745');
      headerRange.setFontColor('#FFFFFF');

      // Freeze header row
      sheet.setFrozenRows(1);

      logSafe('CheckoutRepository: Created monthly sheet: ' + sheetName);
    }

    return sheet;
  }

  /**
   * Logs a transaction to the monthly history sheet
   * @param {Object} transaction - Transaction data
   * @returns {Object} {success: boolean, error?: string}
   */
  function logToMonthlyHistory(transaction) {
    try {
      var sheet = getMonthlyHistorySheet(new Date());
      var sheetName = sheet.getName();

      sheet.appendRow([
        new Date(),
        transaction.studentEmail,
        transaction.deviceType,
        transaction.assetTag,
        transaction.serialNumber,
        transaction.model,
        transaction.action,
        transaction.status,
        transaction.incidentIQUpdated || true
      ]);

      return { success: true, sheetName: sheetName };

    } catch (error) {
      safeLog('CheckoutRepository.logToMonthlyHistory() - Error:', {error: error.toString()});
      return {
        success: false,
        error: 'Failed to log to monthly history: ' + error.toString()
      };
    }
  }

  /**
   * Creates all monthly history sheets for the next 12 months
   * Starting from November 2025
   */
  function createAllMonthlySheets() {
    try {
      logSafe('Creating monthly history sheets for next 12 months...');

      var startDate = new Date(2025, 10, 19); // November 19, 2025 (month is 0-indexed)
      var sheetsCreated = [];

      for (var i = 0; i < 12; i++) {
        var date = new Date(startDate);
        date.setMonth(startDate.getMonth() + i);

        var sheet = getMonthlyHistorySheet(date);
        sheetsCreated.push(getMonthlySheetName(date));
      }

      logSafe('✅ Created ' + sheetsCreated.length + ' monthly sheets');
      return { success: true, sheets: sheetsCreated };

    } catch (error) {
      safeLog('CheckoutRepository.createAllMonthlySheets() - Error:', {error: error.toString()});
      return {
        success: false,
        error: error.toString()
      };
    }
  }

  // Public API
  return {
    // Core operations
    logTransaction: logTransaction,
    getActiveCheckoutCount: getActiveCheckoutCount,
    getOverdueDevices: getOverdueDevices,
    getAssetHistory: getAssetHistory,

    // Dashboard operations
    updateOverdueDashboard: updateOverdueDashboard,
    logNotification: logNotification,

    // Sheet accessors (for advanced use)
    getCheckoutSheet: getCheckoutSheet,
    getOverdueSheet: getOverdueSheet,
    getLogSheet: getLogSheet,

    // NEW: Active Checkouts operations
    getActiveCheckoutsSheet: getActiveCheckoutsSheet,
    addToActiveCheckouts: addToActiveCheckouts,
    removeFromActiveCheckouts: removeFromActiveCheckouts,
    getAllActiveCheckouts: getAllActiveCheckouts,

    // NEW: Monthly History operations
    getMonthlyHistorySheet: getMonthlyHistorySheet,
    logToMonthlyHistory: logToMonthlyHistory,
    createAllMonthlySheets: createAllMonthlySheets,

    // Column definitions (for external reference)
    COLUMNS: COLUMNS,
    ACTIVE_COLUMNS: ACTIVE_COLUMNS
  };

})();

// ============================================
// HELPER FUNCTION WRAPPERS
// ============================================
// These functions are called by CheckoutRepository
// They exist in Main.gs and Utilities.gs
//
// Functions used:
// - getIncidentIQConfig() (Config.gs)
// - getCutoffDateTime() (Utilities.gs)
// - logSafe() (Security.gs)
// - safeLog() (Security.gs)
// ============================================
