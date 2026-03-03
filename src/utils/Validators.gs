// ============================================
// VALIDATORS MODULE
// ============================================
// Input validation and sanitization functions

/**
 * Sanitizes input to prevent injection attacks
 * Removes dangerous characters and limits length
 *
 * @param {string} input - Raw input string
 * @param {number} maxLength - Maximum allowed length (default: 500)
 * @returns {string} Sanitized input
 */
function sanitizeInput(input, maxLength = 500) {
  if (typeof input !== 'string') return '';

  // Remove dangerous characters and limit length
  return input.toString()
    .trim()
    .replace(/[<>"'&`(){}[\]\\]/g, '') // Expanded dangerous character set
    .replace(/javascript:/gi, '')       // Remove javascript: protocol
    .replace(/on\w+=/gi, '')           // Remove event handlers (onclick=, onerror=, etc)
    .substring(0, maxLength);          // Enforce length limit
}

/**
 * HTML encodes a string for safe display
 * Prevents XSS attacks by encoding special characters
 *
 * @param {string} input - String to encode
 * @returns {string} HTML-encoded string
 */
function htmlEncode(input) {
  if (typeof input !== 'string') return '';

  return input.replace(/[&<>"']/g, function(char) {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return entities[char];
  });
}

/**
 * SECURITY: Enhanced email validation with comprehensive injection protection
 * Prevents email header injection, Unicode exploits, and null byte attacks
 *
 * This is the primary validation function used throughout the system.
 * It includes protection against 15+ attack vectors:
 * - CRLF injection
 * - URL-encoded attacks
 * - Null byte injection
 * - Unicode exploits
 * - HTML/XML injection
 * - Email header injection (BCC/CC/TO/FROM/Subject)
 * - Path traversal
 * - Non-ASCII characters
 *
 * @param {string} emailInput - Email address or username to validate
 * @returns {Object} Validation result: { isValid: boolean, email?: string, error?: string }
 */
function validateEmailSecure(emailInput) {
  const sanitized = sanitizeInput(emailInput, 100).toLowerCase();

  // SECURITY: Comprehensive email injection protection patterns
  const injectionPatterns = [
    /[\r\n]/,           // Newline characters (CRLF injection)
    /%0[ad]/i,          // URL-encoded newlines (uppercase or lowercase)
    /%00/i,             // Null byte injection
    /\u0000/,           // Unicode null byte
    /[\u000a\u000d]/,   // Unicode newlines
    /[<>]/,             // HTML/XML injection
    /bcc:/i,            // Email header injection (BCC)
    /cc:/i,             // Email header injection (CC)
    /to:/i,             // Email header injection (TO)
    /from:/i,           // Email header injection (FROM)
    /subject:/i,        // Email header injection (Subject)
    /content-type:/i,   // MIME header injection
    /\\/,               // Backslash (path traversal)
    /\.\./,             // Directory traversal
    /[^\x00-\x7F]/      // Non-ASCII characters (prevents Unicode exploits)
  ];

  // Check for injection patterns
  for (const pattern of injectionPatterns) {
    if (pattern.test(sanitized)) {
      Logger.log('SECURITY: Email injection attempt blocked - Pattern: ' + pattern);
      return { isValid: false, error: 'Invalid characters detected in email address' };
    }
  }

  // Handle both full email and username-only input
  let fullEmail;

  if (sanitized.includes('@')) {
    fullEmail = sanitized;
    // TODO: Update '@yourschool.org' to match your school's email domain
    if (!fullEmail.includes('@yourschool.org')) {
      return { isValid: false, error: 'Must use school email domain (@yourschool.org)' };
    }
  } else {
    if (!sanitized || sanitized.trim() === '') {
      return { isValid: false, error: 'Email username cannot be empty' };
    }

    // Validate username format (allow numbers, letters, dots, hyphens only)
    const usernameRegex = /^[0-9]*\.?[a-z][a-z0-9\.\-]*$/;
    if (!usernameRegex.test(sanitized)) {
      return { isValid: false, error: 'Invalid username format. Use format like: 12.firstname.lastname' };
    }

    // TODO: Update '@yourschool.org' to match your school's email domain
    fullEmail = sanitized + '@yourschool.org';
  }

  // Validate final email format (strict RFC 5322 subset)
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  if (!emailRegex.test(fullEmail)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Additional length checks (RFC 5322 limits)
  if (fullEmail.length > 100) {
    return { isValid: false, error: 'Email address too long' };
  }

  // Validate email parts separately
  const [localPart, domain] = fullEmail.split('@');
  if (localPart.length > 64 || domain.length > 255) {
    return { isValid: false, error: 'Email address component too long' };
  }

  return { isValid: true, email: fullEmail };
}

/**
 * SECURITY: Validates email format and domain with injection protection
 * This is the primary validation function used by processCheckout()
 * Delegates to validateEmailSecure() for comprehensive protection
 *
 * @param {string} emailInput - Email address or username to validate
 * @returns {Object} Validation result: { isValid: boolean, email?: string, error?: string }
 */
function validateEmail(emailInput) {
  // Use the comprehensive secure validation
  return validateEmailSecure(emailInput);
}

/**
 * Validates asset tag format
 * Ensures asset tag is exactly 6 digits (configurable via CONFIG.ASSET_TAG_LENGTH)
 *
 * @param {string|number} assetTag - Asset tag to validate (accepts string or number)
 * @returns {Object} Validation result: { isValid: boolean, assetTag?: string, error?: string }
 */
function validateAssetTag(assetTag) {
  // Convert to string first (handles both string and number inputs)
  const assetTagStr = String(assetTag);
  const sanitized = sanitizeInput(assetTagStr);
  const pattern = new RegExp(`^\\d{${CONFIG.ASSET_TAG_LENGTH}}$`);

  if (!pattern.test(sanitized)) {
    return {
      isValid: false,
      error: `Invalid asset tag format. Must be exactly ${CONFIG.ASSET_TAG_LENGTH} digits (e.g., 123456)`
    };
  }

  return { isValid: true, assetTag: sanitized };
}
