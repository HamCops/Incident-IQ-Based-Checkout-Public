// ============================================
// CONFIGURATION MODULE
// ============================================
// Contains all configuration constants and settings for the Chromebook Checkout System

/**
 * Main performance and behavior configuration
 * Controls API pagination, caching, security limits, and timeouts
 */
var CONFIG = {
  VERIFICATION_DELAY_MS: 500,
  MAX_API_PAGES: 15,          // Increased back up for category filtering
  ASSET_TAG_LENGTH: 6,
  MAX_AUTOCOMPLETE_RESULTS: 10,
  API_PAGE_SIZE: 500,
  SEARCH_PAGE_SIZE: 1000,
  USER_SEARCH_SIZE: 100,

  // New caching configurations
  EXTENDED_CACHE_DURATION_MS: 15 * 60 * 1000,  // 15 minutes for asset cache
  USER_CACHE_DURATION_MS: 10 * 60 * 1000,      // 10 minutes for user cache
  SINGLE_ASSET_CACHE_MS: 2 * 60 * 1000,        // 2 minutes for individual assets
  MAX_USER_SEARCH_PAGES: null,     // null = unlimited (search all users until none remain)
  SAFETY_MAX_PAGES: 100,           // Safety limit to prevent infinite loops (50,000 users max)

  // Category filtering for targeted asset fetching
  DEVICE_CATEGORIES: ['Chromebook', 'Charger', 'Laptop', 'Technology'],  // Categories to include
  USE_CATEGORY_FILTER: true,   // Enable category-specific filtering
  FALLBACK_TO_VIEW: true,     // Fallback to view filter if category filter fails

  // Asset view configuration
  STOP_ON_EMPTY_PAGES: 3,      // Stop after 3 consecutive empty pages

  // SECURITY: Checkout limit configuration
  MAX_ACTIVE_CHECKOUTS: 1,     // Maximum devices a student can have checked out (one device at a time)

  // SECURITY: API timeout configuration
  API_TIMEOUT_MS: 30000,       // 30-second timeout for all IncidentIQ API calls

  // PERFORMANCE: High School User Filtering
  // Only search for high school students, staff, and IIQ admins
  // High school students have graduation year prefixes (e.g., 26.john.doe@...)
  ENABLE_HS_FILTERING: true,   // Enable high school filtering (massive performance boost)
  HS_GRAD_YEARS: [25, 26, 27, 28, 29], // Current high school class years (update annually)
  MAX_FILTERED_SEARCH_PAGES: 5 // Max pages when using filtered search (much faster than unlimited)
};

/**
 * Rate limiting configuration for security
 * Prevents automated attacks and abuse
 */
var RATE_LIMIT_CONFIG = {
  MAX_REQUESTS_PER_MINUTE: 10,      // Max requests per user per minute
  LOCKOUT_DURATION_MINUTES: 15      // How long to lock out abusive users
};

/**
 * Notification system configuration
 * Controls daily device retention alerts and auto-disable behavior
 *
 * TWICE-DAILY UPDATE SCHEDULE (reduces sheet operations by 93%):
 *   7:00 AM  - Morning dashboard update (overnight devices only - 1+ days overdue)
 *   2:20 PM  - Generate report + auto-disable overdue devices (runs with auto-disable)
 *   2:30 PM  - Send email + afternoon dashboard update (all overdue devices)
 *
 * For real-time status, IT staff should check "Active Checkouts" sheet
 */
var NOTIFICATION_CONFIG = {
  IT_STAFF_EMAILS: [
    'admin@example.com',              // TODO: Replace with your IT staff email addresses
    'tech@example.com'
  ],

  // DAILY SCHEDULE (3 time-based triggers)
  MORNING_UPDATE_TIME: '7:00 AM',   // Morning dashboard snapshot (overnight devices only)
  REPORT_TIME: '2:20 PM',           // Generate report + auto-disable overdue devices
  NOTIFICATION_TIME: '2:30 PM',     // Send email + afternoon dashboard snapshot (all overdue)

  SCHOOL_TIMEZONE: 'America/New_York',  // TODO: Update to your school's timezone
  CUTOFF_TIME: '2:20 PM',      // Devices checked out before this time must be returned same day
  WEEKDAYS_ONLY: true,
  EMAIL_FROM_NAME: 'Your School IT Department',  // TODO: Customize sender name
  EMAIL_SUBJECT: 'Daily Alert: Overnight Device Retention Report',

  // AUTO-DISABLE SETTINGS
  AUTO_DISABLE_ENABLED: true,  // Set to false to disable auto-disabling in IncidentIQ
  AUTO_DISABLE_TIME: '2:20 PM', // When to automatically disable overdue devices (runs with report generation)
  MISSING_STATUS_GUID: 'YOUR_MISSING_STATUS_GUID_HERE', // TODO: Get from IncidentIQ (Status: "Missing")

  // AUTO-ENABLE SETTINGS (Device Returns)
  IN_SERVICE_STATUS_GUID: 'YOUR_IN_SERVICE_STATUS_GUID_HERE' // TODO: Get from IncidentIQ (Status: "In Service")
};

/**
 * Charge Sheet System Configuration
 * Controls automatic charge sheet generation for devices 3+ days overdue
 */
var CHARGE_SHEET_CONFIG = {
  // Enable/disable charge sheet system
  ENABLED: true,

  // Threshold for charge sheet generation (days overdue)
  THRESHOLD_DAYS: 3,

  // Replacement costs - TODO: Update with your school's device replacement costs
  REPLACEMENT_COSTS: {
    'Chromebook': 217.00,  // Standard Chromebook replacement cost
    'Charger': 140.00,     // Chromebook charger replacement cost
    'Laptop': 400.00,      // Laptop replacement cost (if applicable)
    'Tablet': 300.00       // Tablet replacement cost (if applicable)
  },

  // Default costs if device model not found
  DEFAULT_COSTS: {
    'Chromebook': 217.00,
    'Charger': 140.00,
    'Laptop': 400.00,
    'Tablet': 300.00
  },

  // Late fees (configure based on your school's policy)
  LATE_FEE_ENABLED: false,
  LATE_FEE_PER_DAY: 0.00,

  // Email configuration - TODO: Replace with your IT staff email addresses
  EMAIL_RECIPIENTS: [
    'admin@example.com',
    'billing@example.com'
  ],

  // Generation schedule
  GENERATION_TIME: '3:15 PM',
  WEEKDAYS_ONLY: true,

  // Google Docs template document ID
  // TODO: Create a charge sheet template in Google Docs and paste its ID here
  // Get ID from URL: https://docs.google.com/document/d/[DOCUMENT_ID]/edit
  TEMPLATE_ID: 'YOUR_GOOGLE_DOC_TEMPLATE_ID',

  // Charge sheet numbering
  ID_PREFIX: 'CS',           // Charge sheet ID prefix
  ID_YEAR_FORMAT: 'YYYY',    // Year format in ID

  // Return deadline (business days after charge sheet generation)
  RETURN_DEADLINE_DAYS: 2,

  // School contact information - TODO: Update with your school's information
  SCHOOL_CONTACT: {
    name: 'Your School Name',
    phone: '555-123-4567',
    email: 'info@example.com',
    address: '123 Main Street, City, ST 12345',
    itEmail: 'admin@example.com',
    itPhone: '555-123-4567'
  },

  // PDF options
  PDF_MAX_SIZE_KB: 500,

  // Batch processing limits
  MAX_CHARGE_SHEETS_PER_RUN: 50,
  BATCH_SIZE: 20,

  // Google Drive fallback for large email attachments
  DRIVE_FALLBACK_THRESHOLD_MB: 20,  // Use Drive if total attachments > 20MB
  DRIVE_FOLDER_NAME: 'Charge Sheets',

  // Email subject line
  EMAIL_SUBJECT: 'URGENT: Device Charge Sheets Generated - Devices 3+ Days Overdue',
  EMAIL_FROM_NAME: 'Your School - Device Checkout System'  // TODO: Customize sender name
};

/**
 * Gets IncidentIQ configuration from secure storage
 * API token is stored via PropertiesService for security (not hardcoded)
 *
 * SETUP INSTRUCTIONS:
 * 1. Get your IncidentIQ API token from: Administration → Developer Tools
 * 2. Run this function once in Apps Script editor to store the token securely:
 *
 * function setupApiToken() {
 *   const apiToken = 'YOUR_INCIDENTIQ_API_TOKEN_HERE';
 *   PropertiesService.getScriptProperties().setProperty('INCIDENTIQ_API_TOKEN', apiToken);
 *   Logger.log('API token configured successfully');
 * }
 *
 * 3. Update the configuration values below with your school's information
 *
 * @returns {Object} Configuration object with API details
 */
function getIncidentIQConfig() {
  const properties = PropertiesService.getScriptProperties();
  const apiToken = properties.getProperty('INCIDENTIQ_API_TOKEN');

  if (!apiToken) {
    throw new Error('IncidentIQ API token not configured. Please set INCIDENTIQ_API_TOKEN in Script Properties.');
  }

  // TODO: Update these values with your school's IncidentIQ configuration
  return {
    domain: 'YOUR_SCHOOL.incidentiq.com',                              // Your IncidentIQ domain
    apiToken: apiToken,                                                 // Retrieved from PropertiesService
    baseUrl: 'https://YOUR_SCHOOL.incidentiq.com/api/v1.0',           // Constructed API base URL
    siteId: 'YOUR_SITE_ID_GUID',                                       // Get from IncidentIQ settings or JWT
    assetViewId: 'YOUR_ASSET_VIEW_ID_GUID',                            // Create a view in IncidentIQ for checkout devices
    spreadsheetId: 'YOUR_GOOGLE_SPREADSHEET_ID'                        // Your Google Sheets ID
  };
}
