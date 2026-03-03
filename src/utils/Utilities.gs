// ============================================
// UTILITIES MODULE
// ============================================
// Helper functions for parsing, formatting, and API request creation

/**
 * Parses model name from IncidentIQ API response
 * Handles multiple response formats (object or string)
 *
 * @param {Object} item - Asset item from IncidentIQ API
 * @returns {string} Parsed model name or 'Unknown' if not found
 */
function parseModelName(item) {
  if (item.Model) {
    if (typeof item.Model === 'object') {
      return item.Model.Name || item.Model.ModelName || 'Unknown';
    } else if (typeof item.Model === 'string') {
      return item.Model;
    }
  }
  return item.ModelName || 'Unknown';
}

/**
 * Parses owner information from IncidentIQ API response
 * Handles multiple response formats (object or string)
 *
 * @param {Object} item - Asset item from IncidentIQ API
 * @returns {Object} Owner details: { ownerName: string, ownerId: string|null }
 */
function parseOwnerInfo(item) {
  let ownerName = '';
  let ownerId = null;

  if (item.Owner) {
    if (typeof item.Owner === 'object') {
      ownerName = item.Owner.FullName || item.Owner.Name || '';
      ownerId = item.Owner.UserId || item.OwnerId;
    } else if (typeof item.Owner === 'string') {
      ownerName = item.Owner;
    }
  } else if (item.OwnerName) {
    ownerName = item.OwnerName;
    ownerId = item.OwnerId;
  }

  return { ownerName, ownerId };
}

/**
 * Creates standard API request options for IncidentIQ API calls
 * Includes all required headers and security timeout
 *
 * @param {Object} config - IncidentIQ configuration from getIncidentIQConfig()
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} payload - Request payload (for POST/PUT requests)
 * @returns {Object} Request options for UrlFetchApp.fetch()
 */
function createApiOptions(config, method = 'GET', payload = null) {
  const options = {
    method: method.toLowerCase(),
    headers: {
      'Authorization': 'Bearer ' + config.apiToken,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'SiteId': config.siteId,
      'Client': 'ApiClient'
    },
    muteHttpExceptions: true,
    // SECURITY: 30-second timeout prevents hanging requests and DoS attacks
    timeout: CONFIG.API_TIMEOUT_MS
  };

  if (payload && (method.toLowerCase() === 'post' || method.toLowerCase() === 'put')) {
    options.payload = JSON.stringify(payload);
  }

  return options;
}

/**
 * Gets cutoff date/time for device return checking
 * Devices checked out before this time must be returned same day
 * Handles weekend logic (Friday cutoff applies through Monday)
 *
 * @param {Date} referenceDate - Reference date for calculation (defaults to now)
 * @returns {Date} Cutoff date/time (3:10 PM EST on appropriate day)
 */
function getCutoffDateTime(referenceDate = new Date()) {
  const cutoffDate = new Date(referenceDate);

  // Set to today at 3:10 PM EST (configured via NOTIFICATION_CONFIG.CUTOFF_TIME)
  const cutoffParts = NOTIFICATION_CONFIG.CUTOFF_TIME.split(':');
  const hours = parseInt(cutoffParts[0]);
  const minutes = parseInt(cutoffParts[1].split(' ')[0]);
  const isPM = cutoffParts[1].includes('PM');

  cutoffDate.setHours(isPM && hours !== 12 ? hours + 12 : hours, minutes, 0, 0);

  // If it's weekend, adjust to Friday
  if (isWeekend(cutoffDate)) {
    // Go back to Friday
    const daysToSubtract = cutoffDate.getDay() === 0 ? 2 : 1; // Sunday = 2 days, Saturday = 1 day
    cutoffDate.setDate(cutoffDate.getDate() - daysToSubtract);
  }

  return cutoffDate;
}

/**
 * Checks if a given date is a weekend (Saturday or Sunday)
 *
 * @param {Date} date - Date to check (defaults to today)
 * @returns {boolean} True if weekend (Saturday=6 or Sunday=0)
 */
function isWeekend(date = new Date()) {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

/**
 * Formats a date as a readable string for display
 *
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string (e.g., "Jan 16, 2025 3:45 PM")
 */
function formatDateTime(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  return date.toLocaleString('en-US', {
    timeZone: NOTIFICATION_CONFIG.SCHOOL_TIMEZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Calculates the number of days between two dates
 *
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Number of days between dates (rounded down)
 */
function daysBetween(startDate, endDate) {
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
  const diffDays = Math.floor((endDate - startDate) / oneDay);
  return diffDays;
}

/**
 * Sanitizes email for display purposes (redacts full email)
 * Used in notifications to reduce PII exposure
 *
 * @param {string} email - Email address to sanitize
 * @returns {string} Sanitized email (e.g., "USER_A1B2C3D4" hash)
 */
function sanitizeForDisplay(email) {
  // Generate consistent hash for the email
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, email);
  const hash = digest.map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('').substring(0, 8).toUpperCase();
  return 'USER_' + hash;
}
