// ============================================
// CHARGE SHEET EMAIL SERVICE
// ============================================
// Handles email notification generation and delivery for charge sheets
// Part of the automatic charge sheet system for devices 3+ days overdue
//
// RESPONSIBILITIES:
// - Email content generation (HTML formatting)
// - PDF attachment handling
// - Google Drive fallback for large attachments
// - Email delivery with error handling
//
// INTEGRATION:
// - Uses CHARGE_SHEET_CONFIG from Config.gs
// - Receives charge sheet data from ChargeSheetService
// - Uses existing security functions (logSafe, safeLog)
// ============================================

var ChargeSheetEmail = (function() {

  /**
   * Sends charge sheet notification email to IT staff
   *
   * @param {Array<Object>} chargeSheets - Array of charge sheet data objects
   * @param {Array<Blob>} pdfBlobs - Array of PDF blobs (one per charge sheet)
   * @returns {Object} {success: boolean, recipientCount?: number, method?: string, error?: string}
   */
  function sendChargeSheetEmail(chargeSheets, pdfBlobs) {
    try {
      logSafe('ChargeSheetEmail.sendChargeSheetEmail() - Sending email for ' + chargeSheets.length + ' charge sheets');

      if (chargeSheets.length === 0) {
        logSafe('No charge sheets to send');
        return {success: true, recipientCount: 0};
      }

      // 1. Generate email content
      var emailHtml = generateEmailContent(chargeSheets);

      // 2. Check total attachment size
      var totalSizeBytes = calculateTotalSize(pdfBlobs);
      var totalSizeMB = totalSizeBytes / (1024 * 1024);

      logSafe('Total PDF attachment size: ' + totalSizeMB.toFixed(2) + ' MB');

      // 3. Decide delivery method based on size
      if (totalSizeMB > CHARGE_SHEET_CONFIG.DRIVE_FALLBACK_THRESHOLD_MB) {
        logSafe('Attachments exceed ' + CHARGE_SHEET_CONFIG.DRIVE_FALLBACK_THRESHOLD_MB + 'MB threshold - using Google Drive');
        return sendViaGoogleDrive(chargeSheets, pdfBlobs, emailHtml);
      } else {
        return sendViaEmail(chargeSheets, pdfBlobs, emailHtml);
      }

    } catch (error) {
      safeLog('❌ ChargeSheetEmail.sendChargeSheetEmail() - Error:', {error: error.toString()});
      return {
        success: false,
        error: error.toString()
      };
    }
  }

  /**
   * Sends email with PDF attachments
   *
   * @param {Array<Object>} chargeSheets - Charge sheet data
   * @param {Array<Blob>} pdfBlobs - PDF blobs
   * @param {string} emailHtml - Email HTML content
   * @returns {Object} Result object
   */
  function sendViaEmail(chargeSheets, pdfBlobs, emailHtml) {
    try {
      var recipients = CHARGE_SHEET_CONFIG.EMAIL_RECIPIENTS.join(',');
      var subject = CHARGE_SHEET_CONFIG.EMAIL_SUBJECT + ' - ' + chargeSheets.length + ' Device(s) - ' + formatDate(new Date());

      // Send email with attachments
      MailApp.sendEmail({
        to: recipients,
        subject: subject,
        htmlBody: emailHtml,
        attachments: pdfBlobs,
        name: CHARGE_SHEET_CONFIG.EMAIL_FROM_NAME
      });

      logSafe('✅ Email sent successfully to: ' + recipients);

      return {
        success: true,
        recipientCount: CHARGE_SHEET_CONFIG.EMAIL_RECIPIENTS.length,
        attachmentCount: pdfBlobs.length,
        method: 'email'
      };

    } catch (error) {
      safeLog('❌ sendViaEmail() - Error:', {error: error.toString()});

      // Retry logic - attempt up to 3 times
      for (var attempt = 1; attempt <= 3; attempt++) {
        try {
          logSafe('Retry attempt ' + attempt + '/3...');
          Utilities.sleep(2000 * attempt); // Exponential backoff

          MailApp.sendEmail({
            to: CHARGE_SHEET_CONFIG.EMAIL_RECIPIENTS.join(','),
            subject: CHARGE_SHEET_CONFIG.EMAIL_SUBJECT + ' - ' + chargeSheets.length + ' Device(s)',
            htmlBody: emailHtml,
            attachments: pdfBlobs,
            name: CHARGE_SHEET_CONFIG.EMAIL_FROM_NAME
          });

          logSafe('✅ Email sent on retry attempt ' + attempt);
          return {
            success: true,
            recipientCount: CHARGE_SHEET_CONFIG.EMAIL_RECIPIENTS.length,
            method: 'email',
            retries: attempt
          };
        } catch (retryError) {
          logSafe('Retry attempt ' + attempt + ' failed: ' + retryError.toString());
        }
      }

      // All retries failed - try Google Drive fallback
      logSafe('All email attempts failed - falling back to Google Drive');
      return sendViaGoogleDrive(chargeSheets, pdfBlobs, emailHtml);
    }
  }

  /**
   * Sends email with Google Drive links (fallback for large attachments)
   *
   * @param {Array<Object>} chargeSheets - Charge sheet data
   * @param {Array<Blob>} pdfBlobs - PDF blobs
   * @param {string} emailHtml - Email HTML content
   * @returns {Object} Result object
   */
  function sendViaGoogleDrive(chargeSheets, pdfBlobs, emailHtml) {
    try {
      logSafe('ChargeSheetEmail.sendViaGoogleDrive() - Creating Drive folder');

      // 1. Create folder for today's charge sheets
      var folderName = CHARGE_SHEET_CONFIG.DRIVE_FOLDER_NAME + ' - ' + formatDate(new Date());
      var folder = DriveApp.createFolder(folderName);

      // 2. Upload PDFs to folder
      var fileLinks = [];
      for (var i = 0; i < pdfBlobs.length; i++) {
        var file = folder.createFile(pdfBlobs[i]);
        fileLinks.push({
          name: file.getName(),
          url: file.getUrl()
        });
      }

      // 3. Share folder with IT staff
      for (var j = 0; j < CHARGE_SHEET_CONFIG.EMAIL_RECIPIENTS.length; j++) {
        folder.addEditor(CHARGE_SHEET_CONFIG.EMAIL_RECIPIENTS[j]);
      }

      // 4. Get folder link
      var folderLink = folder.getUrl();

      // 5. Modify email to include Drive link
      var driveEmailHtml = emailHtml.replace(
        '<!-- DRIVE_LINK_PLACEHOLDER -->',
        '<div style="background: #d1ecf1; padding: 20px; margin: 20px 0; border-left: 5px solid #0c5460;">' +
        '<h3>📁 Charge Sheets Available in Google Drive</h3>' +
        '<p>Due to the size of attachments, charge sheets have been uploaded to Google Drive:</p>' +
        '<p><strong><a href="' + folderLink + '" style="color: #0c5460; font-size: 16px;">Open Charge Sheets Folder</a></strong></p>' +
        '<p>Folder contains ' + fileLinks.length + ' PDF file(s). You have been granted Editor access.</p>' +
        '</div>'
      );

      // 6. Send email with Drive link
      MailApp.sendEmail({
        to: CHARGE_SHEET_CONFIG.EMAIL_RECIPIENTS.join(','),
        subject: CHARGE_SHEET_CONFIG.EMAIL_SUBJECT + ' - ' + chargeSheets.length + ' Device(s) - Google Drive',
        htmlBody: driveEmailHtml,
        name: CHARGE_SHEET_CONFIG.EMAIL_FROM_NAME
      });

      logSafe('✅ Email sent with Google Drive link: ' + folderLink);

      return {
        success: true,
        recipientCount: CHARGE_SHEET_CONFIG.EMAIL_RECIPIENTS.length,
        method: 'google_drive',
        folderLink: folderLink,
        fileCount: fileLinks.length
      };

    } catch (error) {
      safeLog('❌ sendViaGoogleDrive() - Error:', {error: error.toString()});
      return {
        success: false,
        error: error.toString()
      };
    }
  }

  /**
   * Generates HTML email content
   *
   * @param {Array<Object>} chargeSheets - Array of charge sheet data objects
   * @param {string} driveLink - Optional Google Drive folder link
   * @returns {string} HTML email content
   */
  function generateEmailContent(chargeSheets, driveLink) {
    var totalCost = 0;
    var deviceRows = '';

    // Build device table rows
    for (var i = 0; i < chargeSheets.length; i++) {
      var sheet = chargeSheets[i];
      totalCost += sheet.totalCost;

      deviceRows += '<tr>' +
        '<td>' + sheet.chargeSheetId + '</td>' +
        '<td>' + sheet.studentName + '</td>' +
        '<td>' + sheet.deviceType + '</td>' +
        '<td>' + sheet.assetTag + '</td>' +
        '<td><strong>' + sheet.daysOverdue + '</strong></td>' +
        '<td>$' + sheet.totalCost.toFixed(2) + '</td>' +
        '</tr>';
    }

    // Get spreadsheet URL for quick links
    var config = getIncidentIQConfig();
    var spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/' + config.spreadsheetId;

    // Build email HTML
    var html = '<!DOCTYPE html>' +
      '<html>' +
      '<head>' +
      '<style>' +
      'body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }' +
      '.header { background: #ffd200; padding: 20px; text-align: center; }' +
      '.header h1 { margin: 0; color: #000; }' +
      '.alert { background: #f8d7da; color: #721c24; padding: 15px; margin: 20px 0; border-left: 5px solid #d32f2f; }' +
      '.summary { background: #f8f9fa; padding: 15px; margin: 20px 0; }' +
      '.summary ul { margin: 10px 0; }' +
      'table { width: 100%; border-collapse: collapse; margin: 20px 0; }' +
      'th { background: #e9ecef; padding: 12px; text-align: left; border-bottom: 2px solid #adb5bd; }' +
      'td { padding: 10px; border-bottom: 1px solid #ddd; }' +
      'tr:hover { background: #f8f9fa; }' +
      '.action-required { background: #fff3cd; padding: 15px; margin: 20px 0; border-left: 5px solid #ffc107; }' +
      '.action-required ol { margin: 10px 0; }' +
      '.footer { font-size: 12px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }' +
      'a { color: #007bff; text-decoration: none; }' +
      'a:hover { text-decoration: underline; }' +
      '</style>' +
      '</head>' +
      '<body>' +

      '<div class="header">' +
      '<h1>🚨 DEVICE CHARGE SHEETS GENERATED 🚨</h1>' +
      '<p>' + CHARGE_SHEET_CONFIG.SCHOOL_CONTACT.name + ' - IT Department</p>' +
      '</div>' +

      '<div class="alert">' +
      '<strong>⚠️ URGENT ACTION REQUIRED</strong><br>' +
      chargeSheets.length + ' device(s) are now 3+ days overdue and require immediate follow-up.<br>' +
      'Charge sheets have been automatically generated for accountability purposes.' +
      '</div>' +

      '<!-- DRIVE_LINK_PLACEHOLDER -->' +

      '<div class="summary">' +
      '<h2>📊 Summary</h2>' +
      '<ul>' +
      '<li><strong>Total Devices:</strong> ' + chargeSheets.length + '</li>' +
      '<li><strong>Total Potential Charges:</strong> $' + totalCost.toFixed(2) + '</li>' +
      '<li><strong>Generated:</strong> ' + formatDateTime(new Date()) + '</li>' +
      '<li><strong>Attached PDFs:</strong> ' + chargeSheets.length + ' charge sheet(s)</li>' +
      '</ul>' +
      '</div>' +

      '<h2>📋 Device Details</h2>' +
      '<table>' +
      '<thead>' +
      '<tr>' +
      '<th>Charge Sheet ID</th>' +
      '<th>Student</th>' +
      '<th>Device Type</th>' +
      '<th>Asset Tag</th>' +
      '<th>Days Overdue</th>' +
      '<th>Est. Cost</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody>' +
      deviceRows +
      '</tbody>' +
      '</table>' +

      '<div class="action-required">' +
      '<h3>📋 Recommended Next Steps:</h3>' +
      '<ol>' +
      '<li><strong>Review Attached Charge Sheets:</strong> One PDF per overdue device (or access via Drive link)</li>' +
      '<li><strong>Contact Students/Parents:</strong> Email or phone call for immediate return</li>' +
      '<li><strong>Set Return Deadline:</strong> Students have 2 business days to return devices</li>' +
      '<li><strong>Document Communication:</strong> Log all contact attempts in tracking sheet</li>' +
      '<li><strong>Monitor Returns:</strong> Check "Active Checkouts" sheet for real-time status</li>' +
      '<li><strong>Update Status:</strong> Mark charge sheets as "Returned" when devices come back</li>' +
      '<li><strong>Escalate if Needed:</strong> Involve administration for non-compliance</li>' +
      '</ol>' +
      '</div>' +

      '<div class="summary">' +
      '<h3>📊 Quick Links:</h3>' +
      '<ul>' +
      '<li><a href="' + spreadsheetUrl + '/edit#gid=' + getSheetIdByName('Overdue Alerts') + '">View Overdue Alerts Dashboard</a></li>' +
      '<li><a href="' + spreadsheetUrl + '/edit#gid=' + getSheetIdByName('Active Checkouts') + '">View Active Checkouts</a></li>' +
      '<li><a href="' + spreadsheetUrl + '/edit#gid=' + getSheetIdByName('Charge Sheet Tracking') + '">View Charge Sheet Tracking</a></li>' +
      '</ul>' +
      '</div>' +

      '<div class="footer">' +
      '<p><strong>Note:</strong> Charges will be waived if devices are returned by the specified deadline.</p>' +
      '<p>This is an automated notification from the Chromebook Checkout System.</p>' +
      '<p><strong>Generated:</strong> ' + formatDateTime(new Date()) + '</p>' +
      '<p><strong>Contact:</strong> ' + CHARGE_SHEET_CONFIG.SCHOOL_CONTACT.itEmail + ' | ' + CHARGE_SHEET_CONFIG.SCHOOL_CONTACT.phone + '</p>' +
      '</div>' +

      '</body>' +
      '</html>';

    return html;
  }

  /**
   * Calculates total size of PDF blobs in bytes
   *
   * @param {Array<Blob>} pdfBlobs - Array of PDF blobs
   * @returns {number} Total size in bytes
   */
  function calculateTotalSize(pdfBlobs) {
    var totalSize = 0;
    for (var i = 0; i < pdfBlobs.length; i++) {
      totalSize += pdfBlobs[i].getBytes().length;
    }
    return totalSize;
  }

  /**
   * Gets sheet ID (gid) by sheet name for quick link generation
   *
   * @param {string} sheetName - Name of the sheet
   * @returns {string} Sheet ID or empty string if not found
   */
  function getSheetIdByName(sheetName) {
    try {
      var config = getIncidentIQConfig();
      var ss = SpreadsheetApp.openById(config.spreadsheetId);
      var sheet = ss.getSheetByName(sheetName);
      return sheet ? sheet.getSheetId() : '';
    } catch (error) {
      return '';
    }
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

  // Public API
  return {
    sendChargeSheetEmail: sendChargeSheetEmail,
    generateEmailContent: generateEmailContent
  };

})();
