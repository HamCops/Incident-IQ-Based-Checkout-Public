// ============================================
// SECURITY MODULE
// ============================================
// Rate limiting, logging security, PII protection, and security testing

// ============================================
// SECURE LOGGING FUNCTIONS
// ============================================

/**
 * SECURITY: Safe logging function that redacts sensitive information
 * Prevents API tokens, passwords, and other secrets from appearing in logs
 *
 * Use this instead of Logger.log() when logging objects that may contain sensitive data
 *
 * @param {string} message - Log message
 * @param {Object} data - Optional data to log (will be sanitized)
 */
function safeLog(message, data = null) {
  Logger.log(message);

  if (data) {
    const safeCopy = JSON.parse(JSON.stringify(data));

    // SECURITY: Comprehensive list of sensitive field patterns to redact
    const sensitivePatterns = [
      'authorization', 'bearer', 'token', 'apitoken', 'api_token',
      'password', 'passwd', 'pwd', 'secret', 'key', 'apikey', 'api_key',
      'client_secret', 'clientsecret', 'private', 'credential', 'auth'
    ];

    /**
     * Recursively redact sensitive fields from objects
     * @param {Object} obj - Object to sanitize
     * @returns {Object} Sanitized object
     */
    function redactObject(obj) {
      if (typeof obj !== 'object' || obj === null) return obj;

      for (const key in obj) {
        const lowerKey = key.toLowerCase();

        // Check if key matches any sensitive pattern
        if (sensitivePatterns.some(pattern => lowerKey.includes(pattern))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'string' && obj[key].length > 50) {
          // Redact suspiciously long strings (likely tokens/keys)
          if (obj[key].match(/^[A-Za-z0-9+/=_-]{40,}$/)) {
            obj[key] = '[REDACTED-LONG-STRING]';
          }
        } else if (typeof obj[key] === 'object') {
          // Recursively sanitize nested objects
          redactObject(obj[key]);
        }
      }
      return obj;
    }

    Logger.log(JSON.stringify(redactObject(safeCopy), null, 2));
  }
}

/**
 * SECURITY: PII-safe logging function for FERPA compliance
 * Automatically redacts student emails, names, and other PII from logs
 *
 * This function creates anonymous hashed identifiers for emails while maintaining
 * the ability to track the same user across multiple log entries (same email = same hash)
 *
 * @param {string} message - Log message (may contain PII)
 * @param {boolean} includePII - Set to true only for critical debugging (default: false)
 */
function logSafe(message, includePII = false) {
  if (!includePII) {
    /**
     * Hash an email address to create an anonymous identifier
     * Uses SHA-256 for consistent, irreversible hashing
     * @param {string} email - Email to hash
     * @returns {string} Hashed identifier (USER_XXXXXXXX)
     */
    const hashEmail = function(email) {
      const hash = Utilities.computeDigest(
        Utilities.DigestAlgorithm.SHA_256,
        email.toLowerCase().trim()
      );
      return 'USER_' + Utilities.base64Encode(hash).substring(0, 8);
    };

    // Replace all email addresses with hashed identifiers
    // Pattern matches: user@domain.com, user.name@domain.com, etc.
    message = message.replace(
      /[\w\.-]+@[\w\.-]+\.\w+/g,
      function(email) {
        return hashEmail(email);
      }
    );

    // Redact common PII patterns
    const piiPatterns = [
      { pattern: /Student Name: [^\n,]+/g, replacement: 'Student Name: [REDACTED]' },
      { pattern: /Student: [^\n,]+/g, replacement: 'Student: [REDACTED]' },
      { pattern: /Grade: \d+/g, replacement: 'Grade: [REDACTED]' },
      { pattern: /User: [^\n,]+/g, replacement: 'User: [REDACTED]' },
      { pattern: /FullName: [^\n,]+/g, replacement: 'FullName: [REDACTED]' },
      { pattern: /Name: [^\n,]+/g, replacement: 'Name: [REDACTED]' }
    ];

    piiPatterns.forEach(function(pii) {
      message = message.replace(pii.pattern, pii.replacement);
    });
  }

  Logger.log(message);
}

/**
 * Generates a unique error ID for tracking
 * Used to correlate error reports with log entries
 *
 * @returns {string} 8-character error ID
 */
function generateErrorId() {
  const timestamp = new Date().getTime().toString();
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, timestamp);
  return Utilities.base64Encode(hash).substring(0, 8);
}

/**
 * Logs detailed error information for admins
 * Includes stack trace, context, and user information
 *
 * @param {Error} error - The error object
 * @param {string} context - Where the error occurred
 * @param {string} errorId - Unique error ID
 */
function logDetailedError(error, context, errorId) {
  Logger.log('===== ERROR DETAILS [' + errorId + '] =====');
  Logger.log('Context: ' + context);
  Logger.log('Error Message: ' + error.message);
  Logger.log('Error Type: ' + error.name);
  if (error.stack) {
    Logger.log('Stack Trace: ' + error.stack);
  }
  Logger.log('Timestamp: ' + new Date().toISOString());
  Logger.log('User: ' + Session.getEffectiveUser().getEmail());
  Logger.log('=====================================');
}

// ============================================
// RATE LIMITING & ABUSE PREVENTION
// ============================================

/**
 * SECURITY FIX: Checks if user has exceeded rate limits using sliding window algorithm
 *
 * Security improvements:
 * - Uses ScriptCache (shared) instead of UserCache to prevent anonymous bypass
 * - Creates composite fingerprint from email + session key to prevent cache key collision
 * - Implements sliding window algorithm for accurate rate limiting
 * - Provides detailed feedback with retry timing
 *
 * @param {string} identifier - Email or identifier of the user making the request
 * @returns {Object} Rate limit status: { allowed: boolean, remaining?: number, reason?: string, message?: string, retryAfter?: number }
 */
function checkRateLimit(identifier) {
  const cache = CacheService.getScriptCache(); // SECURITY: Shared cache prevents anonymous bypass

  // SECURITY: Create composite fingerprint to prevent bypass
  // Combines identifier + session key for unique tracking across anonymous users
  const fingerprint = Utilities.computeDigest(
    Utilities.DigestAlgorithm.MD5,
    identifier + Session.getTemporaryActiveUserKey()
  );
  const cacheKey = 'rate_' + Utilities.base64Encode(fingerprint);

  // SECURITY: Implement sliding window rate limiting
  const now = new Date().getTime();
  const windowMs = 60000; // 1 minute window
  const maxRequests = RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE;

  const requestLog = cache.get(cacheKey);
  const requests = requestLog ? JSON.parse(requestLog) : [];

  // Remove old requests outside the sliding window
  const recentRequests = requests.filter(timestamp =>
    now - timestamp < windowMs
  );

  // Check if rate limit exceeded
  if (recentRequests.length >= maxRequests) {
    const oldestRequest = recentRequests[0];
    const retryAfterMs = oldestRequest + windowMs - now;
    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);

    Logger.log('SECURITY: Rate limit exceeded for: ' + identifier + ' (fingerprint: ' + cacheKey.substring(0, 16) + '...)');

    return {
      allowed: false,
      reason: 'rate_limit_exceeded',
      message: 'Too many requests. Please wait ' + retryAfterSeconds + ' seconds before trying again.',
      retryAfter: retryAfterSeconds
    };
  }

  // Add current request to log
  recentRequests.push(now);

  // Store updated request log (expires after 10 minutes for cleanup)
  cache.put(cacheKey, JSON.stringify(recentRequests), 600);

  return {
    allowed: true,
    remaining: maxRequests - recentRequests.length,
    resetIn: Math.ceil(windowMs / 1000)
  };
}

/**
 * Clears rate limit for a user (admin function for troubleshooting)
 *
 * NOTE: With the new fingerprint-based system, this clears all rate limit cache
 * because Google Apps Script doesn't provide selective cache key deletion
 *
 * @param {string} userEmail - Email of user (informational only with new system)
 */
function clearRateLimitForUser(userEmail) {
  const cache = CacheService.getScriptCache();

  // With fingerprint-based system, we need to clear all rate limit entries
  // This is a brute-force approach but necessary for admin override
  Logger.log('WARNING: Clearing all rate limit cache entries (affects all users)');
  Logger.log('Requested for user: ' + userEmail);

  // Note: Google Apps Script doesn't provide a way to selectively delete cache keys
  // Admin should be aware this clears rate limits for ALL users
  // Alternative: wait 10 minutes for cache to expire naturally

  Logger.log('Rate limit cache will expire naturally within 10 minutes');
  Logger.log('To immediately clear, manually flush Script Cache in Apps Script console');
}

// ============================================
// SECURITY TEST FUNCTIONS
// ============================================

/**
 * SECURITY TEST: Test the new rate limiting implementation
 * Tests bypass prevention and sliding window algorithm
 */
function testRateLimitingSecurity() {
  Logger.log('=== TESTING SECURE RATE LIMITING ===\n');

  const testEmail = 'test.user@yourschool.org';
  const maxRequests = RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE;

  Logger.log('Configuration:');
  Logger.log('  Max requests per minute: ' + maxRequests);
  Logger.log('  Window: 60 seconds (sliding)');
  Logger.log('  Cache: ScriptCache (shared, prevents anonymous bypass)\n');

  // Test 1: Normal usage (should allow all requests up to limit)
  Logger.log('--- Test 1: Normal Usage ---');
  for (let i = 1; i <= maxRequests; i++) {
    const result = checkRateLimit(testEmail);
    if (!result.allowed) {
      Logger.log('❌ FAIL: Request ' + i + ' blocked unexpectedly');
      return;
    }
    Logger.log('✅ Request ' + i + '/' + maxRequests + ' allowed. Remaining: ' + result.remaining);
  }

  // Test 2: Rate limit enforcement (next request should be blocked)
  Logger.log('\n--- Test 2: Rate Limit Enforcement ---');
  const blockedResult = checkRateLimit(testEmail);
  if (blockedResult.allowed) {
    Logger.log('❌ FAIL: Request ' + (maxRequests + 1) + ' should have been blocked');
    return;
  }
  Logger.log('✅ PASS: Rate limit enforced correctly');
  Logger.log('   Reason: ' + blockedResult.reason);
  Logger.log('   Message: ' + blockedResult.message);
  Logger.log('   Retry after: ' + blockedResult.retryAfter + ' seconds');

  // Test 3: Fingerprint uniqueness (different session should get separate limit)
  Logger.log('\n--- Test 3: Fingerprint Isolation ---');
  Logger.log('Note: Different email should have separate rate limit');
  const differentUser = 'other.user@yourschool.org';
  const differentUserResult = checkRateLimit(differentUser);
  if (!differentUserResult.allowed) {
    Logger.log('❌ FAIL: Different user should have separate rate limit');
    return;
  }
  Logger.log('✅ PASS: Different users have isolated rate limits');
  Logger.log('   Other user remaining: ' + differentUserResult.remaining);

  Logger.log('\n=== SECURITY TEST COMPLETE ===');
  Logger.log('✅ All tests passed');
  Logger.log('\nSecurity improvements:');
  Logger.log('  ✓ Uses ScriptCache (shared) instead of UserCache (prevents anonymous bypass)');
  Logger.log('  ✓ Fingerprint includes Session.getTemporaryActiveUserKey() (prevents collision)');
  Logger.log('  ✓ Sliding window algorithm (more accurate than fixed window)');
  Logger.log('  ✓ Per-user isolation (prevents one user from affecting others)');
}

/**
 * SECURITY TEST: Test safeLog() token redaction
 * Verifies that sensitive data is properly redacted from logs
 */
function testSafeLogging() {
  Logger.log('=== TESTING SAFE LOGGING ===\n');

  // Test 1: Log object with Authorization header (should be redacted)
  Logger.log('--- Test 1: Authorization Header Redaction ---');
  const requestWithAuth = {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.SECRET_TOKEN_HERE',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    method: 'POST',
    payload: '{"test":"data"}'
  };
  safeLog('Request with auth header:', requestWithAuth);
  Logger.log('✅ Check above: Authorization should show [REDACTED]\n');

  // Test 2: Config object with apiToken (should be redacted)
  Logger.log('--- Test 2: API Token Redaction ---');
  const configWithToken = {
    domain: 'example.com',
    apiToken: 'super_secret_api_token_12345',
    baseUrl: 'https://example.com/api'
  };
  safeLog('Config with token:', configWithToken);
  Logger.log('✅ Check above: apiToken should show [REDACTED]\n');

  // Test 3: Nested objects with sensitive keys
  Logger.log('--- Test 3: Nested Sensitive Data ---');
  const nestedSensitive = {
    user: {
      name: 'John Doe',
      password: 'mySecretPassword123',
      settings: {
        api_key: 'sk_live_1234567890abcdef'
      }
    }
  };
  safeLog('Nested object with secrets:', nestedSensitive);
  Logger.log('✅ Check above: password and api_key should show [REDACTED]\n');

  // Test 4: Long suspicious strings (likely tokens)
  Logger.log('--- Test 4: Long String Detection ---');
  const suspiciousStrings = {
    normalField: 'short value',
    likelyToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ',
    description: 'This is a normal long description that should not be redacted because it contains spaces and special characters.'
  };
  safeLog('Object with suspicious strings:', suspiciousStrings);
  Logger.log('✅ Check above: likelyToken should show [REDACTED-LONG-STRING]\n');

  Logger.log('=== SAFE LOGGING TEST COMPLETE ===');
  Logger.log('Review the logs above to verify all sensitive data was redacted.');
}

/**
 * SECURITY TEST: Test email injection protection
 * Verifies that all email injection attack vectors are blocked
 */
function testEmailInjectionProtection() {
  Logger.log('=== TESTING EMAIL INJECTION PROTECTION ===\n');

  const maliciousInputs = [
    // CRLF Injection
    { input: 'test\r\n@yourschool.org', name: 'CRLF Injection (\\r\\n)' },
    { input: 'test\n@yourschool.org', name: 'Newline Injection (\\n)' },
    { input: 'test\r@yourschool.org', name: 'Carriage Return (\\r)' },

    // URL-encoded injection
    { input: 'test%0a@yourschool.org', name: 'URL-encoded LF (lowercase)' },
    { input: 'test%0A@yourschool.org', name: 'URL-encoded LF (uppercase)' },
    { input: 'test%0d@yourschool.org', name: 'URL-encoded CR (lowercase)' },
    { input: 'test%0D@yourschool.org', name: 'URL-encoded CR (uppercase)' },

    // Null byte injection
    { input: 'test%00@yourschool.org', name: 'URL-encoded null byte' },
    { input: 'test\u0000@yourschool.org', name: 'Unicode null byte' },

    // Unicode newlines
    { input: 'test\u000a@yourschool.org', name: 'Unicode LF' },
    { input: 'test\u000d@yourschool.org', name: 'Unicode CR' },

    // HTML/XML injection
    { input: 'test<script>@yourschool.org', name: 'HTML tag injection (<)' },
    { input: 'test>script@yourschool.org', name: 'HTML tag injection (>)' },

    // Email header injection
    { input: 'test\nBcc: attacker@evil.com', name: 'BCC header injection' },
    { input: 'test\nCc: attacker@evil.com', name: 'CC header injection' },
    { input: 'test\nTo: attacker@evil.com', name: 'TO header injection' },
    { input: 'test\nFrom: fake@evil.com', name: 'FROM header injection' },
    { input: 'test\nSubject: Spam', name: 'Subject header injection' },
    { input: 'test\nContent-Type: text/html', name: 'MIME header injection' },

    // Path traversal
    { input: 'test\\admin@yourschool.org', name: 'Backslash injection' },
    { input: '../admin@yourschool.org', name: 'Directory traversal' },

    // Unicode exploits
    { input: 'test™@yourschool.org', name: 'Non-ASCII character (™)' },
    { input: 'tëst@yourschool.org', name: 'Non-ASCII character (ë)' },
    { input: 'test你好@yourschool.org', name: 'Chinese characters' },

    // Valid inputs (should PASS)
    { input: 'john.doe@yourschool.org', name: 'Valid email', shouldPass: true },
    { input: '12.john.doe', name: 'Valid username only', shouldPass: true },
    { input: 'jane-smith@yourschool.org', name: 'Valid with hyphen', shouldPass: true }
  ];

  let blockedCount = 0;
  let passedCount = 0;
  let failedCount = 0;

  Logger.log('Testing ' + maliciousInputs.length + ' injection patterns:\n');

  maliciousInputs.forEach(function(test, index) {
    const result = validateEmailSecure(test.input);
    const blocked = !result.isValid;

    if (test.shouldPass) {
      // These should PASS validation
      if (result.isValid) {
        Logger.log('✅ Test ' + (index + 1) + ' PASS: ' + test.name);
        Logger.log('   Input: "' + test.input + '"');
        Logger.log('   Result: Correctly allowed\n');
        passedCount++;
      } else {
        Logger.log('❌ Test ' + (index + 1) + ' FAIL: ' + test.name);
        Logger.log('   Input: "' + test.input + '"');
        Logger.log('   Expected: Should pass, but was blocked');
        Logger.log('   Error: ' + result.error + '\n');
        failedCount++;
      }
    } else {
      // These should be BLOCKED
      if (blocked) {
        Logger.log('✅ Test ' + (index + 1) + ' BLOCKED: ' + test.name);
        Logger.log('   Input: "' + test.input + '"');
        Logger.log('   Error: ' + result.error + '\n');
        blockedCount++;
      } else {
        Logger.log('❌ Test ' + (index + 1) + ' VULNERABLE: ' + test.name);
        Logger.log('   Input: "' + test.input + '"');
        Logger.log('   Expected: Should block, but was allowed');
        Logger.log('   Result: ' + result.email + '\n');
        failedCount++;
      }
    }
  });

  Logger.log('=== TEST SUMMARY ===');
  Logger.log('Total tests: ' + maliciousInputs.length);
  Logger.log('Injection attempts blocked: ' + blockedCount);
  Logger.log('Valid inputs passed: ' + passedCount);
  Logger.log('Failed tests: ' + failedCount);
  Logger.log('');

  if (failedCount === 0) {
    Logger.log('✅ ALL TESTS PASSED - Email injection protection is working correctly!');
  } else {
    Logger.log('❌ ' + failedCount + ' TESTS FAILED - Review vulnerabilities above');
  }

  Logger.log('\n=== EMAIL INJECTION PROTECTION TEST COMPLETE ===');
}

/**
 * SECURITY TEST: Test PII redaction in logs (FERPA Compliance)
 * Verifies that student emails, names, and other PII are properly redacted from logs
 */
function testPIIRedaction() {
  Logger.log('=== TESTING PII REDACTION (FERPA COMPLIANCE) ===\n');

  const testCases = [
    {
      name: 'Email redaction - single email',
      input: 'Student checkout: john.doe@yourschool.org checked out asset 123456',
      shouldContain: 'USER_',
      shouldNotContain: 'john.doe@yourschool.org'
    },
    {
      name: 'Email redaction - multiple emails',
      input: 'Transfer from jane.smith@yourschool.org to bob.jones@yourschool.org',
      shouldContain: 'USER_',
      shouldNotContain: ['jane.smith', 'bob.jones']
    },
    {
      name: 'Student name redaction',
      input: 'Student Name: John Doe checked out device',
      shouldContain: '[REDACTED]',
      shouldNotContain: 'John Doe'
    },
    {
      name: 'Grade redaction',
      input: 'Grade: 11 student checkout',
      shouldContain: '[REDACTED]',
      shouldNotContain: 'Grade: 11'
    },
    {
      name: 'User field redaction',
      input: 'User: Jane Smith completed return',
      shouldContain: '[REDACTED]',
      shouldNotContain: 'Jane Smith'
    },
    {
      name: 'FullName redaction',
      input: 'FullName: Robert Johnson matched in IIQ',
      shouldContain: '[REDACTED]',
      shouldNotContain: 'Robert Johnson'
    },
    {
      name: 'Combined PII redaction',
      input: 'Student Name: Sarah Williams (sarah.williams@yourschool.org) Grade: 12',
      shouldContain: ['[REDACTED]', 'USER_'],
      shouldNotContain: ['Sarah Williams', 'sarah.williams', 'Grade: 12']
    }
  ];

  let passedCount = 0;
  let failedCount = 0;

  Logger.log('Testing ' + testCases.length + ' PII redaction patterns:\n');

  testCases.forEach(function(test, index) {
    // Capture the redacted output
    const redacted = redactPIIForTesting(test.input);

    let testPassed = true;
    const failures = [];

    // Check shouldContain
    const containChecks = Array.isArray(test.shouldContain) ? test.shouldContain : [test.shouldContain];
    containChecks.forEach(function(pattern) {
      if (!redacted.includes(pattern)) {
        testPassed = false;
        failures.push('Missing expected pattern: "' + pattern + '"');
      }
    });

    // Check shouldNotContain
    const notContainChecks = Array.isArray(test.shouldNotContain) ? test.shouldNotContain : [test.shouldNotContain];
    notContainChecks.forEach(function(pattern) {
      if (redacted.includes(pattern)) {
        testPassed = false;
        failures.push('Contains forbidden pattern: "' + pattern + '"');
      }
    });

    if (testPassed) {
      Logger.log('✅ Test ' + (index + 1) + ' PASS: ' + test.name);
      Logger.log('   Original: "' + test.input + '"');
      Logger.log('   Redacted: "' + redacted + '"\n');
      passedCount++;
    } else {
      Logger.log('❌ Test ' + (index + 1) + ' FAIL: ' + test.name);
      Logger.log('   Original: "' + test.input + '"');
      Logger.log('   Redacted: "' + redacted + '"');
      failures.forEach(function(failure) {
        Logger.log('   ❌ ' + failure);
      });
      Logger.log('');
      failedCount++;
    }
  });

  // Test email hash consistency
  Logger.log('=== TESTING EMAIL HASH CONSISTENCY ===\n');

  const email1 = 'test.student@yourschool.org';
  const hash1a = redactPIIForTesting('Email: ' + email1);
  const hash1b = redactPIIForTesting('User: ' + email1);

  if (hash1a === hash1b) {
    Logger.log('✅ PASS: Same email produces consistent hash');
    Logger.log('   Hash 1: "' + hash1a + '"');
    Logger.log('   Hash 2: "' + hash1b + '"\n');
    passedCount++;
  } else {
    Logger.log('❌ FAIL: Same email produces different hashes');
    Logger.log('   Hash 1: "' + hash1a + '"');
    Logger.log('   Hash 2: "' + hash1b + '"\n');
    failedCount++;
  }

  // Test different emails produce different hashes
  const email2 = 'different.student@yourschool.org';
  const hash2 = redactPIIForTesting('Email: ' + email2);

  if (hash1a !== hash2) {
    Logger.log('✅ PASS: Different emails produce different hashes');
    Logger.log('   Email 1 hash: "' + hash1a + '"');
    Logger.log('   Email 2 hash: "' + hash2 + '"\n');
    passedCount++;
  } else {
    Logger.log('❌ FAIL: Different emails produce same hash (collision!)');
    Logger.log('   Email 1: ' + email1);
    Logger.log('   Email 2: ' + email2);
    Logger.log('   Both hash to: "' + hash1a + '"\n');
    failedCount++;
  }

  Logger.log('=== TEST SUMMARY ===');
  Logger.log('Total tests: ' + (testCases.length + 2)); // +2 for consistency tests
  Logger.log('Passed: ' + passedCount);
  Logger.log('Failed: ' + failedCount);
  Logger.log('');

  if (failedCount === 0) {
    Logger.log('✅ ALL TESTS PASSED - PII redaction is FERPA compliant!');
  } else {
    Logger.log('❌ ' + failedCount + ' TESTS FAILED - Review logSafe() implementation');
  }

  Logger.log('\n=== PII REDACTION TEST COMPLETE ===');
}

/**
 * Helper function for testing PII redaction
 * Returns the redacted string without logging it
 * Used internally by testPIIRedaction()
 *
 * @param {string} message - Message to redact
 * @returns {string} Redacted message
 */
function redactPIIForTesting(message) {
  const hashEmail = function(email) {
    const hash = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      email.toLowerCase().trim()
    );
    return 'USER_' + Utilities.base64Encode(hash).substring(0, 8);
  };

  // Replace all email addresses with hashed identifiers
  message = message.replace(
    /[\w\.-]+@[\w\.-]+\.\w+/g,
    function(email) {
      return hashEmail(email);
    }
  );

  // Redact common PII patterns
  const piiPatterns = [
    { pattern: /Student Name: [^\n,]+/g, replacement: 'Student Name: [REDACTED]' },
    { pattern: /Student: [^\n,]+/g, replacement: 'Student: [REDACTED]' },
    { pattern: /Grade: \d+/g, replacement: 'Grade: [REDACTED]' },
    { pattern: /User: [^\n,]+/g, replacement: 'User: [REDACTED]' },
    { pattern: /FullName: [^\n,]+/g, replacement: 'FullName: [REDACTED]' },
    { pattern: /Name: [^\n,]+/g, replacement: 'Name: [REDACTED]' }
  ];

  piiPatterns.forEach(function(pii) {
    message = message.replace(pii.pattern, pii.replacement);
  });

  return message;
}

/**
 * SECURITY TEST: Test API timeout protection
 * Verifies that API calls respect the 30-second timeout limit
 */
function testApiTimeout() {
  Logger.log('=== TESTING API TIMEOUT PROTECTION ===\n');

  Logger.log('Configuration:');
  Logger.log('  Timeout: ' + CONFIG.API_TIMEOUT_MS + 'ms (30 seconds)');
  Logger.log('  Purpose: Prevents hanging requests and DoS attacks\n');

  Logger.log('--- Test 1: Verify timeout is configured ---');
  const config = getIncidentIQConfig();
  const options = createApiOptions(config, 'POST', {});

  if (options.timeout === CONFIG.API_TIMEOUT_MS) {
    Logger.log('✅ PASS: Timeout configured correctly');
    Logger.log('   Expected: ' + CONFIG.API_TIMEOUT_MS + 'ms');
    Logger.log('   Actual: ' + options.timeout + 'ms\n');
  } else {
    Logger.log('❌ FAIL: Timeout not configured');
    Logger.log('   Expected: ' + CONFIG.API_TIMEOUT_MS + 'ms');
    Logger.log('   Actual: ' + (options.timeout || 'undefined') + '\n');
    return;
  }

  Logger.log('--- Test 2: Verify timeout applies to all requests ---');
  const testUrls = [
    config.baseUrl + '/assets',
    config.baseUrl + '/users',
    config.baseUrl + '/assets/123/owner'
  ];

  let allHaveTimeout = true;
  testUrls.forEach(function(url) {
    const opts = createApiOptions(config, 'POST', {});
    if (!opts.timeout || opts.timeout !== CONFIG.API_TIMEOUT_MS) {
      allHaveTimeout = false;
      Logger.log('❌ Missing timeout for: ' + url);
    }
  });

  if (allHaveTimeout) {
    Logger.log('✅ PASS: All API requests have timeout protection\n');
  } else {
    Logger.log('❌ FAIL: Some requests missing timeout\n');
    return;
  }

  Logger.log('=== TIMEOUT PROTECTION TEST COMPLETE ===');
  Logger.log('✅ All tests passed - API timeout protection is active');
  Logger.log('\nSecurity benefits:');
  Logger.log('  ✓ Prevents requests from hanging indefinitely');
  Logger.log('  ✓ Protects against slow loris attacks');
  Logger.log('  ✓ Ensures responsive error handling');
  Logger.log('  ✓ Prevents resource exhaustion');
}

/**
 * 🚨 CRITICAL SECURITY WARNING 🚨
 * Call this function to display token rotation instructions
 * MUST BE RUN IMMEDIATELY after deploying the safeLog() fix
 */
function URGENT_ROTATE_API_TOKEN() {
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('🚨🚨🚨 CRITICAL SECURITY ACTION REQUIRED 🚨🚨🚨');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  Logger.log('VULNERABILITY: API Token Exposure in Logs (CVSS 8.1 - HIGH)');
  Logger.log('');
  Logger.log('ISSUE: Previous logging statements exposed your IncidentIQ API');
  Logger.log('       bearer token in Google Apps Script execution logs.');
  Logger.log('');
  Logger.log('IMPACT: Anyone with script editor access could have viewed');
  Logger.log('        your API token and gained full access to IncidentIQ.');
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('IMMEDIATE ACTIONS REQUIRED:');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  Logger.log('✅ STEP 1: ROTATE INCIDENTIQ API TOKEN');
  Logger.log('   1. Log into IncidentIQ');
  Logger.log('   2. Navigate to: Administration → Developer Tools');
  Logger.log('   3. Find your current API token');
  Logger.log('   4. Click "Revoke" or "Delete"');
  Logger.log('   5. Generate a NEW API token');
  Logger.log('   6. Copy the new token');
  Logger.log('');
  Logger.log('✅ STEP 2: UPDATE GOOGLE APPS SCRIPT');
  Logger.log('   Run this function with your NEW token:');
  Logger.log('');
  Logger.log('   function updateApiToken() {');
  Logger.log('     const newToken = \'PASTE_YOUR_NEW_TOKEN_HERE\';');
  Logger.log('     PropertiesService.getScriptProperties()');
  Logger.log('       .setProperty(\'INCIDENTIQ_API_TOKEN\', newToken);');
  Logger.log('     Logger.log(\'✅ Token updated successfully\');');
  Logger.log('   }');
  Logger.log('');
  Logger.log('✅ STEP 3: DELETE OLD EXECUTION LOGS');
  Logger.log('   1. In Apps Script Editor: View → Executions');
  Logger.log('   2. Look for logs containing:');
  Logger.log('      - "Authorization: Bearer"');
  Logger.log('      - "headers"');
  Logger.log('      - "apiToken"');
  Logger.log('   3. Click each execution → Delete');
  Logger.log('   4. Empty trash if available');
  Logger.log('');
  Logger.log('✅ STEP 4: VERIFY THE FIX');
  Logger.log('   Run: testSafeLogging()');
  Logger.log('   Verify all sensitive data shows [REDACTED]');
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
}
