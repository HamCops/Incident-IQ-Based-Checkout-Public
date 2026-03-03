// ============================================
// CHARGE SHEET SERVICE - BUSINESS LOGIC LAYER
// ============================================
// Handles charge sheet generation, PDF creation, and business rules
// Part of the automatic charge sheet system for devices 3+ days overdue
//
// RESPONSIBILITIES:
// - Charge sheet generation (data collection, cost calculation)
// - PDF document creation from Google Docs template
// - Business rule validation (threshold checks, duplicate prevention)
// - Integration with IncidentIQ for student/device data
//
// INTEGRATION:
// - Uses CHARGE_SHEET_CONFIG from Config.gs
// - Calls IncidentIQService for user/asset data
// - Calls ChargeSheetRepository for data persistence
// - Uses existing security functions (logSafe, safeLog)
// ============================================

var ChargeSheetService = (function() {

  /**
   * Generates a charge sheet for an overdue device
   *
   * @param {Object} overdueDevice - Overdue device object from CheckoutRepository.getOverdueDevices()
   * @param {string} overdueDevice.studentEmail - Student email
   * @param {string} overdueDevice.assetTag - 6-digit asset tag
   * @param {string} overdueDevice.deviceType - Device type
   * @param {string} overdueDevice.model - Device model
   * @param {string} overdueDevice.serialNumber - Serial number
   * @param {Date} overdueDevice.checkoutTime - Checkout timestamp
   * @param {number} overdueDevice.daysOverdue - Days overdue
   * @param {number} overdueDevice.hoursOverdue - Hours overdue
   * @returns {Object} {success: boolean, data?: Object, error?: string}
   */
  function generateChargeSheet(overdueDevice) {
    try {
      logSafe('ChargeSheetService.generateChargeSheet() - Processing asset: ' + overdueDevice.assetTag);

      // 1. Check if charge sheet should be generated
      if (!shouldGenerateChargeSheet(overdueDevice)) {
        return {
          success: false,
          reason: 'Charge sheet generation skipped (threshold not met or duplicate exists)'
        };
      }

      // 2. Fetch student details from IncidentIQ
      var studentData = fetchStudentData(overdueDevice.studentEmail);

      // 3. Calculate costs
      var costData = calculateCosts(overdueDevice.deviceType, overdueDevice.model);

      // 4. Generate unique charge sheet ID
      var chargeSheetId = ChargeSheetRepository.getNextChargeSheetId();

      // 5. Calculate return deadline (2 business days from now)
      var returnDeadline = calculateReturnDeadline(CHARGE_SHEET_CONFIG.RETURN_DEADLINE_DAYS);

      // 6. Build charge sheet data object
      var chargeSheetData = {
        chargeSheetId: chargeSheetId,
        generationDate: new Date(),

        // Student information
        studentEmail: overdueDevice.studentEmail,
        studentName: studentData.name || 'Student',
        grade: studentData.grade || 'N/A',
        schoolName: CHARGE_SHEET_CONFIG.SCHOOL_CONTACT.name, // Uses configured school name

        // Device information
        deviceType: overdueDevice.deviceType,
        model: overdueDevice.model || 'Unknown Model',
        assetTag: overdueDevice.assetTag,
        serialNumber: overdueDevice.serialNumber || 'N/A',

        // Checkout/Overdue information
        checkoutDate: overdueDevice.checkoutTime,
        expectedReturnDate: calculateExpectedReturnDate(overdueDevice.checkoutTime),
        currentDate: new Date(),
        daysOverdue: overdueDevice.daysOverdue,
        hoursOverdue: overdueDevice.hoursOverdue,

        // Financial information
        deviceCost: costData.deviceCost,
        chargerCost: costData.chargerCost,
        totalCost: costData.totalCost,
        chargerIncluded: costData.chargerIncluded,
        lateFee: 0.00, // Currently disabled

        // Deadline and contact
        returnDeadline: returnDeadline,
        schoolContact: CHARGE_SHEET_CONFIG.SCHOOL_CONTACT,

        // Metadata
        isPartial: !studentData.fromIncidentIQ // Flag if student data couldn't be fetched
      };

      logSafe('✅ Charge sheet generated: ' + chargeSheetId);

      return {
        success: true,
        data: chargeSheetData
      };

    } catch (error) {
      safeLog('❌ ChargeSheetService.generateChargeSheet() - Error:', {error: error.toString()});
      return {
        success: false,
        error: 'Failed to generate charge sheet: ' + error.toString()
      };
    }
  }

  /**
   * Determines if a charge sheet should be generated for a device
   *
   * @param {Object} overdueDevice - Overdue device object
   * @returns {boolean} True if charge sheet should be generated
   */
  function shouldGenerateChargeSheet(overdueDevice) {
    try {
      // Check 1: System enabled
      if (!CHARGE_SHEET_CONFIG.ENABLED) {
        logSafe('Charge sheet system disabled');
        return false;
      }

      // Check 2: Threshold met (3+ days overdue)
      if (overdueDevice.daysOverdue < CHARGE_SHEET_CONFIG.THRESHOLD_DAYS) {
        logSafe('Device ' + overdueDevice.assetTag + ' not yet at threshold (' + overdueDevice.daysOverdue + ' < ' + CHARGE_SHEET_CONFIG.THRESHOLD_DAYS + ' days)');
        return false;
      }

      // Check 3: Duplicate prevention (no charge sheet already generated today)
      if (ChargeSheetRepository.chargeSheetExistsToday(overdueDevice.assetTag)) {
        logSafe('Charge sheet already generated today for: ' + overdueDevice.assetTag);
        return false;
      }

      // Check 4: Device still checked out (real-time verification)
      // This prevents generating charge sheets for devices returned between detection and generation
      if (!isDeviceStillCheckedOut(overdueDevice.assetTag)) {
        logSafe('Device ' + overdueDevice.assetTag + ' returned before charge sheet generated - skipping');
        return false;
      }

      return true;

    } catch (error) {
      safeLog('ChargeSheetService.shouldGenerateChargeSheet() - Error:', {error: error.toString()});
      return false; // Safe default - don't generate if check fails
    }
  }

  /**
   * Checks if a device is still checked out (real-time verification)
   *
   * @param {string} assetTag - Asset tag to check
   * @returns {boolean} True if device is still checked out
   */
  function isDeviceStillCheckedOut(assetTag) {
    try {
      var activeCheckouts = CheckoutRepository.getActiveCheckoutsSheet();
      var data = activeCheckouts.getDataRange().getValues();

      // Search Active Checkouts sheet for this asset tag
      for (var i = 1; i < data.length; i++) {
        var rowAssetTag = data[i][2]; // Column C: Asset Tag
        if (rowAssetTag === assetTag) {
          return true; // Found in Active Checkouts
        }
      }

      return false; // Not found - device has been returned

    } catch (error) {
      safeLog('ChargeSheetService.isDeviceStillCheckedOut() - Error:', {error: error.toString()});
      return true; // Safe default - assume still checked out if check fails
    }
  }

  /**
   * Fetches student data from IncidentIQ
   *
   * @param {string} studentEmail - Student email address
   * @returns {Object} {name: string, grade: string, fromIncidentIQ: boolean}
   */
  function fetchStudentData(studentEmail) {
    try {
      // Try to fetch from IncidentIQ using existing function
      var user = findUserByEmail(studentEmail);

      if (user && user.FullName) {
        // Clean up name - remove leading numbers (e.g., "26 Nevaeh Cooper" → "Nevaeh Cooper")
        var cleanName = cleanStudentName(user.FullName);

        return {
          name: cleanName,
          grade: extractGrade(user.FullName) || 'N/A', // Try to extract grade from name
          fromIncidentIQ: true
        };
      }

      // Fallback: use email local part as name
      var namePart = studentEmail.split('@')[0].replace(/\./g, ' ');
      return {
        name: toTitleCase(namePart),
        grade: 'N/A',
        fromIncidentIQ: false
      };

    } catch (error) {
      safeLog('ChargeSheetService.fetchStudentData() - Error:', {error: error.toString()});
      // Fallback on error
      var namePart = studentEmail.split('@')[0].replace(/\./g, ' ');
      return {
        name: toTitleCase(namePart),
        grade: 'N/A',
        fromIncidentIQ: false
      };
    }
  }

  /**
   * Removes leading numbers from student names
   * Example: "26 Nevaeh Cooper" → "Nevaeh Cooper"
   *          "26.Nevaeh Cooper" → "Nevaeh Cooper"
   *
   * @param {string} name - Student name from IncidentIQ
   * @returns {string} Cleaned name without leading numbers
   */
  function cleanStudentName(name) {
    if (!name) return 'Student';

    // Remove leading digits followed by space, dot, or dash
    // Examples: "26 Name", "26.Name", "26-Name", "26Name"
    var cleaned = name.replace(/^\d+[\s\.\-]*/g, '').trim();

    // If cleaning removed everything (unlikely), return original
    return cleaned || name;
  }

  /**
   * Calculates total costs for the device
   * Note: Chromebooks and Chargers are checked out separately (not bundled)
   *
   * @param {string} deviceType - "Chromebook", "Charger", etc.
   * @param {string} model - Device model (optional)
   * @returns {Object} {deviceCost, chargerCost, totalCost, chargerIncluded}
   */
  function calculateCosts(deviceType, model) {
    // Get device cost
    var deviceCost = CHARGE_SHEET_CONFIG.REPLACEMENT_COSTS[deviceType]
                     || CHARGE_SHEET_CONFIG.DEFAULT_COSTS[deviceType]
                     || 250.00; // Fallback default

    // Chromebooks and chargers are separate - no automatic bundling
    var chargerCost = 0;
    var chargerIncluded = false;

    // Total cost is just the device cost
    var totalCost = deviceCost;

    return {
      deviceCost: deviceCost,
      chargerCost: chargerCost,
      totalCost: totalCost,
      chargerIncluded: chargerIncluded
    };
  }

  /**
   * Calculates return deadline (N business days from now)
   *
   * @param {number} businessDays - Number of business days to add
   * @returns {Date} Return deadline date
   */
  function calculateReturnDeadline(businessDays) {
    var deadline = new Date();
    var daysAdded = 0;

    while (daysAdded < businessDays) {
      deadline.setDate(deadline.getDate() + 1);

      // Skip weekends (0 = Sunday, 6 = Saturday)
      var dayOfWeek = deadline.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysAdded++;
      }
    }

    return deadline;
  }

  /**
   * Calculates expected return date (end of same day as checkout)
   *
   * @param {Date} checkoutDate - Checkout date
   * @returns {Date} Expected return date (3:00 PM same day)
   */
  function calculateExpectedReturnDate(checkoutDate) {
    var expectedReturn = new Date(checkoutDate);
    expectedReturn.setHours(15, 0, 0, 0); // 3:00 PM
    return expectedReturn;
  }

  /**
   * Creates a PDF charge sheet from Google Docs template
   *
   * @param {Object} chargeSheetData - Complete charge sheet data object
   * @returns {Object} {success: boolean, pdfBlob?: Blob, fileName?: string, error?: string}
   */
  function createChargeSheetPDF(chargeSheetData) {
    try {
      logSafe('ChargeSheetService.createChargeSheetPDF() - Creating PDF for: ' + chargeSheetData.chargeSheetId);

      // Check if template is configured
      if (!CHARGE_SHEET_CONFIG.TEMPLATE_ID || CHARGE_SHEET_CONFIG.TEMPLATE_ID === '') {
        throw new Error('Template document ID not configured in CHARGE_SHEET_CONFIG.TEMPLATE_ID');
      }

      // 1. Get template document
      var template = DriveApp.getFileById(CHARGE_SHEET_CONFIG.TEMPLATE_ID);

      // 2. Create copy for this charge sheet
      var docName = 'ChargeSheet_' + chargeSheetData.chargeSheetId + '_' + chargeSheetData.assetTag;
      var docCopy = template.makeCopy(docName);
      var doc = DocumentApp.openById(docCopy.getId());
      var body = doc.getBody();

      // 3. Replace all placeholders
      replaceAllPlaceholders(body, chargeSheetData);

      // 4. Save and close
      doc.saveAndClose();

      // 5. Export as PDF
      var pdfBlob = docCopy.getAs('application/pdf');
      pdfBlob.setName(docName + '.pdf');

      // 6. Clean up - delete temporary document
      Utilities.sleep(1000); // Brief delay to ensure PDF is generated
      docCopy.setTrashed(true);

      logSafe('✅ PDF created successfully: ' + docName + '.pdf');

      return {
        success: true,
        pdfBlob: pdfBlob,
        fileName: docName + '.pdf'
      };

    } catch (error) {
      safeLog('❌ ChargeSheetService.createChargeSheetPDF() - Error:', {error: error.toString()});
      return {
        success: false,
        error: error.toString()
      };
    }
  }

  /**
   * Replaces all placeholders in the document body
   *
   * @param {Body} body - Google Docs body object
   * @param {Object} data - Charge sheet data
   */
  function replaceAllPlaceholders(body, data) {
    // Student Information
    body.replaceText('{{CHARGE_SHEET_ID}}', data.chargeSheetId);
    body.replaceText('{{GENERATION_DATE}}', formatDate(data.generationDate));
    body.replaceText('{{STUDENT_NAME}}', data.studentName);
    body.replaceText('{{ASSET_TAG}}', data.assetTag);
    body.replaceText('{{SCHOOL_NAME}}', data.schoolName);
    body.replaceText('{{GRADE}}', data.grade);

    // Device Information
    body.replaceText('{{DEVICE_TYPE}}', data.deviceType);
    body.replaceText('{{MODEL}}', data.model);
    body.replaceText('{{SERIAL_NUMBER}}', data.serialNumber);

    // Date Information
    body.replaceText('{{CHECKOUT_DATE}}', formatDate(data.checkoutDate));
    body.replaceText('{{EXPECTED_RETURN_DATE}}', formatDate(data.expectedReturnDate));
    body.replaceText('{{CURRENT_DATE}}', formatDate(data.currentDate));
    body.replaceText('{{DAYS_OVERDUE}}', String(data.daysOverdue));
    body.replaceText('{{HOURS_OVERDUE}}', String(data.hoursOverdue));

    // Financial Information
    body.replaceText('{{DEVICE_COST}}', data.deviceCost.toFixed(2));

    // Conditional charger line
    var chargerLine = data.chargerIncluded
      ? 'Chromebook Charger: $' + data.chargerCost.toFixed(2)
      : '';
    body.replaceText('{{CHARGER_LINE}}', chargerLine);

    body.replaceText('{{TOTAL_COST}}', data.totalCost.toFixed(2));

    // Deadline Information
    body.replaceText('{{RETURN_DEADLINE}}', formatDate(data.returnDeadline));

    // Tech/Admin Information
    body.replaceText('{{TECH_NAME}}', 'Automated System');
    body.replaceText('{{TECH_DATE}}', formatDate(new Date()));
    body.replaceText('{{IT_EMAIL}}', data.schoolContact.itEmail);
    body.replaceText('{{SCHOOL_PHONE}}', data.schoolContact.phone);
    body.replaceText('{{GENERATION_TIMESTAMP}}', formatDateTime(new Date()));
  }

  /**
   * Formats date for display (MM/DD/YYYY)
   *
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  function formatDate(date) {
    if (!date) return 'N/A';

    return Utilities.formatDate(date, NOTIFICATION_CONFIG.SCHOOL_TIMEZONE, 'MM/dd/yyyy');
  }

  /**
   * Formats date and time for display
   *
   * @param {Date} date - Date to format
   * @returns {string} Formatted date/time string
   */
  function formatDateTime(date) {
    if (!date) return 'N/A';

    return Utilities.formatDate(date, NOTIFICATION_CONFIG.SCHOOL_TIMEZONE, 'MM/dd/yyyy hh:mm a');
  }

  /**
   * Converts string to Title Case
   *
   * @param {string} str - String to convert
   * @returns {string} Title cased string
   */
  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  /**
   * Attempts to extract grade from student name (if format includes grade)
   *
   * @param {string} name - Student name
   * @returns {string|null} Grade if found, null otherwise
   */
  function extractGrade(name) {
    // This is a placeholder - grade extraction depends on IncidentIQ data format
    // May need to fetch from custom fields in IncidentIQ user profile
    return null;
  }

  // Public API
  return {
    generateChargeSheet: generateChargeSheet,
    shouldGenerateChargeSheet: shouldGenerateChargeSheet,
    createChargeSheetPDF: createChargeSheetPDF,
    calculateCosts: calculateCosts,
    calculateReturnDeadline: calculateReturnDeadline
  };

})();
