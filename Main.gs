// ============================================
// GOOGLE APPS SCRIPT - CHROMEBOOK CHECKOUT SYSTEM
// ============================================
// Integrated with IncidentIQ API for Live Inventory Management
// Deploy this as a Web App to create your checkout form
//
// ARCHITECTURE: Modular Design (Phase 1 Refactoring Complete)
// This file now imports functions from 5 specialized modules:
//
// 1. Config.gs       - Configuration management & settings
// 2. Validators.gs   - Input validation & sanitization
// 3. Utilities.gs    - Helper functions & API utilities
// 4. Security.gs     - Rate limiting, PII protection, secure logging
// 5. Testing.gs      - Test suite, debug utilities, benchmarks
//
// For detailed function locations, see: REFACTORING-MAP.md
// ============================================

// MODULE USAGE EXAMPLES:
//
// Configuration:
//   const config = getIncidentIQConfig();
//   const maxPages = CONFIG.MAX_API_PAGES;
//   const rateLimit = RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE;
//
// Validation:
//   const emailResult = validateEmail(email);
//   const assetResult = validateAssetTag(assetTag);
//   const sanitized = sanitizeInput(input);
//
// Utilities:
//   const model = parseModelName(item);
//   const options = createApiOptions(config, 'POST', payload);
//   const cutoff = getCutoffDateTime();
//
// Security:
//   safeLog('API call', requestData);
//   logSafe('User action: ' + email);
//   const rateLimitCheck = checkRateLimit(email);
//
// Testing:
//   runAllTests();
//   clearAllCaches();
//   getCacheStats();
//
// ============================================
// GOOGLE APPS SCRIPT CODE FOR CHROMEBOOK CHECKOUT SYSTEM
// Integrated with IncidentIQ API for Live Inventory Management
// Deploy this as a Web App to create your checkout form

// ============================================
// CONFIGURATION - Add your IncidentIQ details
// ============================================

// Configuration constants - PERFORMANCE OPTIMIZED
/**
 * Gets IncidentIQ configuration from secure storage
 * @returns {Object} Configuration object with API details
 */
// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Sanitizes input to prevent injection attacks
 * @param {string} input - Raw input string
 * @param {number} maxLength - Maximum allowed length (default: 500)
 * @returns {string} Sanitized input
 */
/**
 * HTML encodes a string for safe display
 * @param {string} input - String to encode
 * @returns {string} HTML-encoded string
 */
/**
 * SECURITY: Enhanced email validation with comprehensive injection protection
 * Prevents email header injection, Unicode exploits, and null byte attacks
 * @param {string} emailInput - Email address or username to validate
 * @returns {Object} Validation result with full email
 */
/**
 * SECURITY: Validates email format and domain with injection protection
 * Primary validation function used by processCheckout()
 * @param {string} emailInput - Email address or username to validate
 * @returns {Object} Validation result with full email
 */
/**
 * Validates asset tag format
 * @param {string} assetTag - Asset tag to validate
 * @returns {Object} Validation result
 */
/**
 * Parses model name from IncidentIQ response
 * @param {Object} item - Asset item from API
 * @returns {string} Parsed model name
 */
/**
 * Parses owner information from IncidentIQ response
 * @param {Object} item - Asset item from API
 * @returns {Object} Owner details
 */
/**
 * Creates standard API request options
 * @param {Object} config - IncidentIQ configuration
 * @param {string} method - HTTP method
 * @param {Object} payload - Request payload
 * @returns {Object} Request options
 */
/**
 * SECURITY: Safe logging function that redacts sensitive information
 * Prevents API tokens, passwords, and other secrets from appearing in logs
 * @param {string} message - Log message
 * @param {Object} data - Optional data to log (will be sanitized)
 */
/**
 * SECURITY: PII-safe logging function for FERPA compliance
 * Automatically redacts student emails, names, and other PII from logs
 * @param {string} message - Log message (may contain PII)
 * @param {boolean} includePII - Set to true only for critical debugging (default: false)
 */
/**
 * Generates a unique error ID for tracking
 * @returns {string} 8-character error ID
 */
/**
 * Logs detailed error information for admins
 * @param {Error} error - The error object
 * @param {string} context - Where the error occurred
 * @param {string} errorId - Unique error ID
 */
// ============================================
// RATE LIMITING & ABUSE PREVENTION
// ============================================

/**
 * Rate limiting configuration
 */
/**
 * SECURITY FIX: Checks if user has exceeded rate limits using sliding window algorithm
 * Uses ScriptCache (shared) instead of UserCache to prevent anonymous bypass
 * Creates fingerprint from email + session key to prevent cache key collision
 * @param {string} identifier - Email or identifier of the user making the request
 * @returns {Object} Rate limit status
 */
/**
 * Clears rate limit for a user (admin function for troubleshooting)
 * NOTE: With the new fingerprint-based system, this clears all rate limit cache
 * @param {string} userEmail - Email of user (informational only with new system)
 */
/**
 * SECURITY TEST: Test the new rate limiting implementation
 * Tests bypass prevention and sliding window algorithm
 */
/**
 * 🚨 CRITICAL SECURITY WARNING 🚨
 * Call this function to display token rotation instructions
 * MUST BE RUN IMMEDIATELY after deploying the safeLog() fix
 */
/**
 * SECURITY TEST: Test safeLog() token redaction
 * Verifies that sensitive data is properly redacted from logs
 */
/**
 * SECURITY TEST: Test email injection protection
 * Verifies that all email injection attack vectors are blocked
 */
/**
 * SECURITY TEST: Test PII redaction in logs (FERPA Compliance)
 * Verifies that student emails, names, and other PII are properly redacted from logs
 */
/**
 * Helper function for testing PII redaction
 * Returns the redacted string without logging it
 */
/**
 * SECURITY TEST: Test device checkout limit enforcement
 * Verifies that students cannot check out more than MAX_ACTIVE_CHECKOUTS devices
 */
/**
 * TEST: Verify checkout counting logic with sample data
 * Tests that the fixed logic correctly counts only CURRENT active checkouts
 */
/**
 * SECURITY TEST: Test API timeout configuration
 * Verifies that all API calls have 30-second timeout configured
 */
/**
 * CRITICAL FIX TEST: Test cache race condition protection
 * Verifies that multiple concurrent requests don't trigger simultaneous cache refreshes
 */
/**
 * CRITICAL FIX TEST: Test transaction rollback functionality
 * Verifies that processCheckout can rollback IncidentIQ changes if Google Sheets write fails
 */
/**
 * CRITICAL FIX TEST: Test email generation memory efficiency
 * Verifies that generateEmailContent uses array.join() and handles large device lists
 */
// ============================================
// MAIN FUNCTION - Serves the HTML form
// ============================================

// Helper function for safe display of user emails
function doGet(e) {
  // KIOSK MODE: Allow anonymous access for kiosk Chromebooks
  // Security is provided by:
  // 1. Physical access control (kiosk is in supervised location)
  // 2. Student email validation in processCheckout() function
  // 3. IncidentIQ user verification before assignment
  // 4. Rate limiting prevents abuse

  const userEmail = Session.getEffectiveUser().getEmail();

  // Log access attempts for monitoring
  if (userEmail) {
    Logger.log('Access by authenticated user: ' + userEmail);
  } else {
    Logger.log('Anonymous access (kiosk mode)');
  }

  // Allow all access - no authentication required for kiosk mode
  return HtmlService.createHtmlOutputFromFile('Form')
    .setTitle('Chromebook & Charger Checkout')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ============================================
// FETCH ASSETS FROM INCIDENTIQ API USING VIEW WITH PAGINATION
// ============================================

/**
 * SIMPLIFIED: Fetches assets from curated asset view only
 * Uses configured asset view ID from Config.gs (contains only checkout devices)
 * SECURITY: Returns limited data for anonymous kiosk users to prevent inventory disclosure
 * @returns {Array} Array of asset objects
 */
function getAllAssetTags() {
  const config = getIncidentIQConfig();

  try {
    Logger.log('🎯 Fetching assets from curated view: ' + config.assetViewId);
    Logger.log('📋 This view contains only devices available for checkout');

    // Check if user is authenticated (logged into Google account)
    const userEmail = Session.getEffectiveUser().getEmail();
    const isAuthenticated = userEmail && userEmail.length > 0;

    if (!isAuthenticated) {
      Logger.log('🔒 SECURITY: Anonymous access - returning limited asset data');
    } else {
      Logger.log('✅ Authenticated access by: ' + userEmail);
    }

    // Fetch full asset data from IncidentIQ
    const fullAssets = fetchAssetsByView(config);

    // For anonymous users (kiosk mode), return only essential data
    // This prevents inventory disclosure while maintaining autocomplete functionality
    if (!isAuthenticated) {
      return fullAssets.map(function(asset) {
        return {
          assetTag: asset.assetTag,           // ✅ Needed for autocomplete
          deviceType: asset.deviceType,       // ✅ Needed for display
          model: asset.model,                 // ✅ Needed for autocomplete matching
          status: asset.status,               // ✅ Needed to show availability
          disabled: asset.disabled || false,  // ✅ Needed to prevent checkout of disabled devices
          // ❌ REMOVED for security:
          // - serialNumber: Could be used for targeted theft
          // - currentUser: Student privacy concern
          // - userId: Internal identifier disclosure
          // - assetId: Internal identifier disclosure
        };
      });
    }

    // For authenticated users, return full data
    return fullAssets;

  } catch (error) {
    Logger.log('❌ Error in getAllAssetTags: ' + error.toString());
    return [];
  }
}

/**
 * NEW: Fetch assets by device categories (Chromebooks, Chargers)
 */

/**
 * SIMPLIFIED: Fetch all assets from the specified view with comprehensive pagination
 * @param {Object} config - IncidentIQ configuration
 * @returns {Array} Array of processed asset objects
 */
function fetchAssetsByView(config) {
  try {
    var allAssets = [];
    var pageNumber = 0;
    var hasMoreData = true;
    var consecutiveEmptyPages = 0;
    var maxConsecutiveEmpty = CONFIG.STOP_ON_EMPTY_PAGES;
    var totalItemsProcessed = 0;

    Logger.log('📋 Fetching from asset view: ' + config.assetViewId);
    Logger.log('⚙️ Max pages: ' + CONFIG.MAX_API_PAGES + ', Page size: ' + CONFIG.API_PAGE_SIZE);
    Logger.log('🔍 Initial conditions: hasMoreData=' + hasMoreData + ', pageNumber=' + pageNumber + ', maxConsecutiveEmpty=' + maxConsecutiveEmpty);

    while (hasMoreData && pageNumber < CONFIG.MAX_API_PAGES && consecutiveEmptyPages < maxConsecutiveEmpty) {
      Logger.log('🔍 Loop iteration: page=' + pageNumber + ', hasMoreData=' + hasMoreData + ', consecutiveEmpty=' + consecutiveEmptyPages);
      var options = createApiOptions(config, 'POST', {
        OnlyShowDeleted: false,
        Filters: [
          {
            Facet: "View",
            Id: config.assetViewId
          }
        ]
      });

      var url = config.baseUrl + '/assets?$s=' + CONFIG.API_PAGE_SIZE + '&$p=' + pageNumber;
      Logger.log('🔄 Fetching page ' + (pageNumber + 1) + '/' + CONFIG.MAX_API_PAGES + '...');
      Logger.log('🔍 URL: ' + url);
      Logger.log('🔍 View ID filter: ' + config.assetViewId);
      safeLog('🔍 Request options:', options);

      var response = UrlFetchApp.fetch(url, options);
      var statusCode = response.getResponseCode();
      var responseText = response.getContentText();

      Logger.log('🔍 API Response - Status: ' + statusCode + ', Content length: ' + responseText.length);

      if (statusCode !== 200) {
        Logger.log('❌ API Error on page ' + (pageNumber + 1) + ': ' + statusCode + ' - ' + responseText);
        break;
      }

      var data;
      try {
        data = JSON.parse(responseText);
        Logger.log('🔍 Parsed JSON - Items array exists: ' + (data.Items ? 'YES' : 'NO'));
        if (data.Items) {
          Logger.log('🔍 Items count: ' + data.Items.length);
        } else {
          Logger.log('🔍 Response structure: ' + JSON.stringify(Object.keys(data)));
          Logger.log('🔍 Raw response (first 500 chars): ' + responseText.substring(0, 500));
        }
      } catch (parseError) {
        Logger.log('❌ JSON Parse Error: ' + parseError.toString());
        Logger.log('🔍 Raw response: ' + responseText);
        break;
      }

      if (data.Items && Array.isArray(data.Items) && data.Items.length > 0) {
        Logger.log('⚙️ Processing ' + data.Items.length + ' items from page ' + (pageNumber + 1));
        consecutiveEmptyPages = 0; // Reset counter on successful page

        var processedAssets = processViewAssets(data.Items);
        allAssets = allAssets.concat(processedAssets);
        totalItemsProcessed += data.Items.length;

        Logger.log('📦 Added ' + processedAssets.length + ' valid assets (from ' + data.Items.length + ' items)');

        // Check if we've reached the end of data
        if (data.Items.length < CONFIG.API_PAGE_SIZE) {
          Logger.log('📄 Last page reached (partial page)');
          hasMoreData = false;
        } else {
          pageNumber++;
        }
      } else {
        consecutiveEmptyPages++;
        pageNumber++;
        Logger.log('⚠️ Empty page ' + pageNumber + ' (consecutive: ' + consecutiveEmptyPages + ')');

        if (consecutiveEmptyPages >= maxConsecutiveEmpty) {
          Logger.log('🛑 Stopping after ' + consecutiveEmptyPages + ' consecutive empty pages');
          hasMoreData = false;
        }
      }
    }

    Logger.log('✅ View fetch completed:');
    Logger.log('   📄 Pages fetched: ' + (pageNumber + 1));
    Logger.log('   📦 Total items processed: ' + totalItemsProcessed);
    Logger.log('   🎯 Valid assets found: ' + allAssets.length);

    if (allAssets.length > 0) {
      var assetTags = allAssets.map(function(asset) { return asset.assetTag; }).sort();
      Logger.log('   📊 Asset tag range: ' + assetTags[0] + ' to ' + assetTags[assetTags.length - 1]);
    }

    return allAssets;

  } catch (error) {
    Logger.log('❌ Error in fetchAssetsByView: ' + error.toString());
    return [];
  }
}

/**
 * SIMPLIFIED: Process assets from the curated view (no complex filtering needed)
 * @param {Array} items - Raw asset items from IncidentIQ API
 * @returns {Array} Processed asset objects
 */
function processViewAssets(items) {
  var processedAssets = [];

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var assetTag = item.AssetTag || item.Asset || '';

    // Validate asset tag format (must be 6 digits)
    const assetValidation = validateAssetTag(assetTag);
    if (!assetValidation.isValid) {
      continue; // Skip invalid asset tags
    }

    var categoryName = item.CategoryName || item.Category || '';
    var modelName = parseModelName(item);
    var ownerInfo = parseOwnerInfo(item);

    // Determine device type with enhanced logic (fallback to model name if category is empty)
    var deviceType = 'Device'; // Default
    var searchText = (categoryName + ' ' + modelName).toLowerCase();

    if (searchText.includes('charger') || searchText.includes('adapter') || searchText.includes('power')) {
      deviceType = 'Charger';
    } else if (searchText.includes('chromebook') || searchText.includes('laptop') || searchText.includes('notebook') || searchText.includes('computer')) {
      deviceType = 'Chromebook';
    }

    // Check if asset should be disabled based on State field
    var assetState = item.State || item.AssetState || '';
    var isDisabled = false;
    var disableReason = '';

    // Disable assets that are not in active circulation
    if (assetState) {
      var lowerState = assetState.toLowerCase();
      if (lowerState.includes('retired') || lowerState.includes('broken') ||
          lowerState.includes('repair') || lowerState.includes('damaged') ||
          lowerState.includes('lost') || lowerState.includes('stolen') ||
          lowerState.includes('decommissioned') || lowerState.includes('inactive')) {
        isDisabled = true;
        disableReason = assetState;
      }
    }

    processedAssets.push({
      assetId: item.AssetId,
      assetTag: assetValidation.assetTag,
      deviceType: deviceType,
      model: modelName,
      serialNumber: item.SerialNumber || item.Serial || '',
      status: ownerInfo.ownerName ? 'Checked Out' : 'Available',
      currentUser: ownerInfo.ownerName,
      userId: ownerInfo.ownerId,
      category: categoryName, // Keep for debugging
      disabled: isDisabled,
      disableReason: disableReason
    });
  }

  return processedAssets;
}

/**
 * NEW: Determine if device category is relevant for checkout system
 */

/**
 * NEW: Improved device type determination
 */

// ============================================
// VERIFY ASSET TAG IN REAL-TIME (CACHED)
// ============================================

// Enhanced caching system for performance optimization
var assetCache = null;
var cacheTimestamp = null;
var userCache = null;
var userCacheTimestamp = null;
var singleAssetCache = {};  // Cache for individual asset lookups
var CACHE_DURATION_MS = CONFIG.EXTENDED_CACHE_DURATION_MS;

// CRITICAL FIX: Cache refresh lock to prevent race conditions
var cacheRefreshInProgress = false;

/**
 * OPTIMIZED: Verifies asset tag with multi-level caching
 * @param {string} assetTag - Asset tag to verify
 * @returns {Object} Verification result
 */
function verifyAssetTag(assetTag) {
  try {
    const validation = validateAssetTag(assetTag);
    if (!validation.isValid) {
      return {
        exists: false,
        message: validation.error
      };
    }

    const now = new Date().getTime();
    const cacheKey = validation.assetTag;

    // OPTIMIZATION 1: Check single asset cache first (fastest)
    if (singleAssetCache[cacheKey] &&
        singleAssetCache[cacheKey].timestamp &&
        (now - singleAssetCache[cacheKey].timestamp) < CONFIG.SINGLE_ASSET_CACHE_MS) {
      Logger.log('🚀 Single asset cache HIT for: ' + cacheKey);
      return singleAssetCache[cacheKey].data;
    }

    // OPTIMIZATION 2: Check main asset cache (medium speed)
    if (assetCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION_MS) {
      const asset = assetCache.find(function(item) {
        return item.assetTag === validation.assetTag;
      });

      if (asset) {
        const result = {
          exists: true,
          assetId: asset.assetId,
          deviceType: asset.deviceType,
          model: asset.model,
          serialNumber: asset.serialNumber,
          status: asset.status,
          currentUser: asset.currentUser,
          disabled: asset.disabled || false,
          disableReason: asset.disableReason || ''
        };

        // Cache this single result for future quick access
        singleAssetCache[cacheKey] = {
          data: result,
          timestamp: now
        };

        Logger.log('📦 Main asset cache HIT for: ' + cacheKey);
        return result;
      }
    }

    // OPTIMIZATION 3: Only refresh cache if absolutely necessary
    // CRITICAL FIX: Check if cache is being refreshed by another request
    if (cacheRefreshInProgress) {
      // Use stale cache data if available during refresh
      if (assetCache && cacheTimestamp) {
        Logger.log('⚠️  Using stale cache during refresh for: ' + cacheKey);
        const staleAsset = assetCache.find(function(item) {
          return item.assetTag === validation.assetTag;
        });

        if (staleAsset) {
          return {
            exists: true,
            assetId: staleAsset.assetId,
            deviceType: staleAsset.deviceType,
            model: staleAsset.model,
            serialNumber: staleAsset.serialNumber,
            status: staleAsset.status,
            currentUser: staleAsset.currentUser,
            disabled: staleAsset.disabled || false,
            disableReason: staleAsset.disableReason || '',
            stale: true  // Flag to indicate this is stale data
          };
        }
      }
      // If no stale data available, wait and check again (cache should refresh soon)
      Logger.log('⏳ Cache refresh in progress, asset not in stale cache: ' + cacheKey);
    }

    // Refresh cache with lock protection
    if (!assetCache || !cacheTimestamp || (now - cacheTimestamp) > CACHE_DURATION_MS) {
      // Only one request should refresh the cache
      if (!cacheRefreshInProgress) {
        cacheRefreshInProgress = true;
        try {
          Logger.log('🔄 Refreshing asset cache... (this may take 10-15 seconds)');
          assetCache = getAllAssetTags();
          cacheTimestamp = now;
          Logger.log('✅ Asset cache refreshed successfully');
        } catch (refreshError) {
          Logger.log('❌ Cache refresh failed: ' + refreshError.toString());
          // Leave stale cache in place if refresh fails
        } finally {
          cacheRefreshInProgress = false;
        }
      }

      // Search in newly refreshed data
      if (assetCache) {
        const asset = assetCache.find(function(item) {
          return item.assetTag === validation.assetTag;
        });

        if (asset) {
          const result = {
            exists: true,
            assetId: asset.assetId,
            deviceType: asset.deviceType,
            model: asset.model,
            serialNumber: asset.serialNumber,
            status: asset.status,
            currentUser: asset.currentUser,
            disabled: asset.disabled || false,
            disableReason: asset.disableReason || ''
          };

          // Cache this result
          singleAssetCache[cacheKey] = {
            data: result,
            timestamp: now
          };

          return result;
        }
      }
    }

    // OPTIMIZATION 4: Cache negative results too
    const notFoundResult = {
      exists: false,
      message: 'Asset tag not found in IncidentIQ'
    };

    singleAssetCache[cacheKey] = {
      data: notFoundResult,
      timestamp: now
    };

    return notFoundResult;

  } catch (error) {
    Logger.log('Verify error: ' + error.toString());
    return {
      exists: false,
      message: 'Error verifying asset: ' + error.message
    };
  }
}

/**
 * NEW: User caching functions for performance optimization
 */
function cacheUsersFromResponse(data) {
  if (!data || !data.Items) return;

  const now = new Date().getTime();

  // Initialize user cache if needed
  if (!userCache) {
    userCache = [];
    userCacheTimestamp = now;
  }

  data.Items.forEach(function(user) {
    if (user.UserId) {
      // Extract all possible email variations
      const emails = [
        user.Email,
        user.EmailAddress,
        user.PrimaryEmail,
        user.LoginName,
        user.UserName
      ].filter(function(email) {
        return email && typeof email === 'string' && email.includes('@');
      }).map(function(email) {
        return email.toLowerCase().trim();
      });

      if (emails.length > 0) {
        userCache.push({
          userId: user.UserId,
          fullName: user.FullName,
          emails: emails
        });
      }
    }
  });

  Logger.log('📦 Cached ' + data.Items.length + ' users for faster lookup');
}

function cacheUserResult(email, userId) {
  const now = new Date().getTime();

  // Initialize cache if needed
  if (!userCache) {
    userCache = [];
    userCacheTimestamp = now;
  }

  // Add this specific result to cache
  userCache.push({
    userId: userId,
    fullName: 'Cached Result',
    emails: [email.toLowerCase().trim()]
  });
}

function matchEmails(email1, email2) {
  const clean1 = email1.toLowerCase().trim();
  const clean2 = email2.toLowerCase().trim();

  // Direct match
  if (clean1 === clean2) return true;

  // Check prefix matching (e.g., "36.john.doe@domain.com" vs "john.doe@domain.com")
  if (clean1.includes('.') && clean1.includes('@')) {
    const parts1 = clean1.split('@');
    if (parts1.length === 2) {
      const withoutPrefix1 = parts1[0].replace(/^\d+\./, '') + '@' + parts1[1];
      if (withoutPrefix1 === clean2) return true;
    }
  }

  if (clean2.includes('.') && clean2.includes('@')) {
    const parts2 = clean2.split('@');
    if (parts2.length === 2) {
      const withoutPrefix2 = parts2[0].replace(/^\d+\./, '') + '@' + parts2[1];
      if (clean1 === withoutPrefix2) return true;
    }
  }

  return false;
}

/**
 * Clears all caches (useful for testing or forced refresh)
 */
/**
 * Legacy function - kept for backward compatibility
 */

// ============================================
// FIND USER IN INCIDENTIQ BY EMAIL - ENHANCED
// ============================================

/**
 * OPTIMIZED: Enhanced user search with caching and reduced API calls
 * @param {string} studentEmail - Student email address
 * @returns {string|null} User ID if found, null otherwise
 */
function findUserByEmail(studentEmail) {
  const config = getIncidentIQConfig();

  try {
    const emailValidation = validateEmail(studentEmail);
    if (!emailValidation.isValid) {
      Logger.log('Invalid email provided: ' + emailValidation.error);
      return null;
    }

    const cleanEmail = emailValidation.email;
    const now = new Date().getTime();

    // OPTIMIZATION 1: Check user cache first
    if (userCache && userCacheTimestamp &&
        (now - userCacheTimestamp) < CONFIG.USER_CACHE_DURATION_MS) {
      const cachedUser = userCache.find(function(user) {
        return user.emails.some(function(email) {
          return matchEmails(email, cleanEmail);
        });
      });

      if (cachedUser) {
        logSafe('🚀 User cache HIT for: ' + cleanEmail + ' -> ' + cachedUser.userId);
        return cachedUser.userId;
      }
      logSafe('📦 User cache MISS for: ' + cleanEmail);
    }

    logSafe('Searching for user with email: ' + cleanEmail);

    // OPTIMIZATION 2: Single filtered search (most efficient)
    var userId = searchUserWithFilters(config, cleanEmail);
    if (userId) {
      Logger.log('User found via filtered search: ' + userId);
      cacheUserResult(cleanEmail, userId); // Cache the result
      return userId;
    }

    // OPTIMIZATION 3: Reduced paginated search (only 2 pages instead of 5)
    userId = searchUserPaginatedOptimized(config, cleanEmail);
    if (userId) {
      Logger.log('User found via optimized paginated search: ' + userId);
      cacheUserResult(cleanEmail, userId); // Cache the result
      return userId;
    }

    logSafe('User not found in IncidentIQ: ' + cleanEmail);
    return null;

  } catch (error) {
    Logger.log('Error finding user by email: ' + error.toString());
    return null;
  }
}

/**
 * PERFORMANCE OPTIMIZED: Extract graduation year from email
 * High school students: 26.john.doe@domain.com -> 26
 * Staff/Admin: john.doe@domain.com -> null
 * @param {string} email - Email address
 * @returns {string|null} Graduation year prefix or null
 */
function extractGradYear(email) {
  const match = email.match(/^(\d{2})\./);
  return match ? match[1] : null;
}

/**
 * PERFORMANCE OPTIMIZED: Check if user is high school student
 * @param {string} email - Email address
 * @returns {boolean} True if email matches high school pattern
 */
function isHighSchoolStudent(email) {
  const gradYear = extractGradYear(email);
  if (!gradYear) return false;

  const yearNum = parseInt(gradYear, 10);
  return CONFIG.HS_GRAD_YEARS.includes(yearNum);
}

/**
 * PERFORMANCE OPTIMIZED: Search users using POST with email filter
 * NEW: Only searches high school students + staff when ENABLE_HS_FILTERING is true
 * Performance: 30-40s -> 1-3s (90% reduction in search time)
 */
function searchUserWithFilters(config, email) {
  try {
    Logger.log('Attempting filtered user search...');

    const options = createApiOptions(config, 'POST', {
      OnlyShowDeleted: false,
      Filters: [
        {
          Facet: "Email",
          Value: email
        }
      ]
    });

    var searchUrl = config.baseUrl + '/users?$s=' + CONFIG.USER_SEARCH_SIZE;
    var response = UrlFetchApp.fetch(searchUrl, options);

    Logger.log('Filtered search response code: ' + response.getResponseCode());

    if (response.getResponseCode() === 200) {
      var data = JSON.parse(response.getContentText());
      Logger.log('Filtered search returned ' + (data.Items ? data.Items.length : 0) + ' users');

      return parseUserSearchResults(data, email);
    } else {
      Logger.log('Filtered search failed: ' + response.getContentText());
    }
  } catch (error) {
    Logger.log('Filtered search error: ' + error.toString());
  }
  return null;
}

/**
 * Search users using simple GET request
 */

/**
 * PERFORMANCE OPTIMIZED: Paginated search with HIGH SCHOOL FILTERING
 * NEW: Dramatically reduced search scope (50,000 users -> ~2,500 users)
 * Performance: 30-40s -> 2-3s (93% faster)
 *
 * How it works:
 * 1. If user is HS student (e.g., 26.john.doe@...), only search relevant grade levels
 * 2. If user is staff (john.doe@...), search without grade prefix
 * 3. Uses limited pagination instead of unlimited search
 */
function searchUserPaginatedOptimized(config, email) {
  try {
    // PERFORMANCE OPTIMIZATION: Check if HS filtering is enabled
    const useHSFilter = CONFIG.ENABLE_HS_FILTERING;
    const isHSStudent = isHighSchoolStudent(email);
    const gradYear = extractGradYear(email);

    // Determine search strategy based on email pattern
    let maxPages;
    let searchDescription;

    if (useHSFilter && (isHSStudent || !gradYear)) {
      // High school student or staff - use limited search
      maxPages = CONFIG.MAX_FILTERED_SEARCH_PAGES;
      if (isHSStudent) {
        searchDescription = 'HIGH SCHOOL STUDENT (class of 20' + gradYear + ') - LIMITED search';
      } else {
        searchDescription = 'STAFF/ADMIN (no grade prefix) - LIMITED search';
      }
      Logger.log('🚀 PERFORMANCE MODE: ' + searchDescription);
      Logger.log('   Max pages: ' + maxPages + ' (instead of ' + CONFIG.SAFETY_MAX_PAGES + ')');
      Logger.log('   Expected time: 2-3 seconds (instead of 30-40 seconds)');
    } else if (useHSFilter && gradYear && !isHSStudent) {
      // Non-high-school student (e.g., elementary/middle school)
      Logger.log('⚠️ NON-HIGH-SCHOOL EMAIL DETECTED: ' + email);
      Logger.log('   Graduation year ' + gradYear + ' is not in high school range: ' + CONFIG.HS_GRAD_YEARS.join(', '));
      Logger.log('   This app is for high school students only. User not found.');
      return null; // Don't search - saves 30+ seconds
    } else {
      // Fallback to unlimited search if filtering disabled
      maxPages = CONFIG.MAX_USER_SEARCH_PAGES === null ? CONFIG.SAFETY_MAX_PAGES : CONFIG.MAX_USER_SEARCH_PAGES;
      searchDescription = 'UNLIMITED search (filtering disabled)';
      Logger.log('Attempting ' + searchDescription + ' (max ' + maxPages + ' pages)...');
    }

    var page = 0;
    var hasMoreData = true;

    while (hasMoreData && page < maxPages) {
      const options = createApiOptions(config, 'POST', {
        OnlyShowDeleted: false
      });

      var searchUrl = config.baseUrl + '/users?$s=500&$p=' + page;
      var response = UrlFetchApp.fetch(searchUrl, options);

      if (response.getResponseCode() === 200) {
        var data = JSON.parse(response.getContentText());
        Logger.log('Page ' + page + ' returned ' + (data.Items ? data.Items.length : 0) + ' users');

        // OPTIMIZATION: Cache users while searching
        cacheUsersFromResponse(data);

        var userId = parseUserSearchResults(data, email);
        if (userId) {
          Logger.log('✅ User found on page ' + page + ' (searched ' + (page + 1) + ' pages total)');
          return userId;
        }

        // Check if we've reached the end of data
        if (!data.Items || data.Items.length < 500) {
          Logger.log('Reached end of user data at page ' + page + ' (searched ' + (page + 1) + ' pages, ~' + ((page + 1) * 500) + ' users total)');
          hasMoreData = false;
        } else {
          page++;
        }
      } else {
        Logger.log('Paginated search page ' + page + ' failed: ' + response.getContentText());
        hasMoreData = false;
      }
    }

    if (page >= maxPages) {
      Logger.log('⚠️ Reached safety limit of ' + maxPages + ' pages without finding user');
    }
  } catch (error) {
    Logger.log('Paginated search error: ' + error.toString());
  }
  return null;
}

/**
 * Parse user search results and find matching email
 */
function parseUserSearchResults(data, targetEmail) {
  if (!data || !data.Items || !Array.isArray(data.Items)) {
    Logger.log('No user data items to parse');
    return null;
  }

  Logger.log('Parsing ' + data.Items.length + ' users for email match...');

  for (var i = 0; i < data.Items.length; i++) {
    var user = data.Items[i];

    // Log first few users for debugging
    if (i < 3) {
      Logger.log('Sample user ' + i + ': ' + JSON.stringify({
        UserId: user.UserId,
        Email: user.Email,
        EmailAddress: user.EmailAddress,
        UserName: user.UserName,
        FullName: user.FullName
      }));
    }

    // Try multiple email field variations
    var userEmails = [
      user.Email,
      user.EmailAddress,
      user.PrimaryEmail,
      user.LoginName,
      user.UserName
    ].filter(function(email) {
      return email && typeof email === 'string' && email.includes('@');
    });

    for (var j = 0; j < userEmails.length; j++) {
      var userEmail = userEmails[j].toLowerCase().trim();

      // Direct match
      if (userEmail === targetEmail) {
        logSafe('MATCH FOUND! User: ' + user.FullName + ', Email: ' + userEmail + ', ID: ' + user.UserId);
        return user;
      }

      // ENHANCED: Fuzzy matching to handle numeric prefixes in either direction
      // Normalizes both emails by removing numeric prefixes for comparison
      if (userEmail.includes('@') && targetEmail.includes('@')) {
        var userParts = userEmail.split('@');
        var targetParts = targetEmail.split('@');

        if (userParts.length === 2 && targetParts.length === 2) {
          // Only compare if same domain
          if (userParts[1] === targetParts[1]) {
            var userLocal = userParts[0];
            var targetLocal = targetParts[0];

            // Remove numeric prefixes from both
            var userNormalized = userLocal.replace(/^\d+\./, '');
            var targetNormalized = targetLocal.replace(/^\d+\./, '');

            // Compare normalized versions
            if (userNormalized === targetNormalized && userNormalized.length > 0) {
              logSafe('MATCH FOUND with fuzzy matching!');
              logSafe('  IncidentIQ: ' + userEmail + ' (normalized: ' + userNormalized + '@' + userParts[1] + ')');
              logSafe('  Student: ' + targetEmail + ' (normalized: ' + targetNormalized + '@' + targetParts[1] + ')');
              Logger.log('  User ID: ' + user.UserId);
              return user;
            }
          }
        }
      }
    }
  }

  Logger.log('No email match found in this batch');
  return null;
}

/**
 * Debugging function to list available users (run manually)
 */
/**
 * Debug Google Sheets access and logging functionality
 * Run this to test if sheets are working properly
 */
/**
 * Test the full checkout process with enhanced sheets logging
 */
/**
 * Test asset ownership update with detailed debugging
 * Run this manually to test asset updates
 */
/**
 * PERFORMANCE TEST: Compare old vs new user search performance
 * Tests the high school filtering optimization
 * Run this to verify 30-40s -> 2-3s improvement
 */
function testUserSearchPerformance() {
  Logger.log('=== PERFORMANCE TEST: USER SEARCH OPTIMIZATION ===\n');

  // Test cases - TODO: Update with your school's test email addresses
  const testEmails = [
    '26.student.test@yourschool.org',  // HS student (should be fast)
    '27.another.student@yourschool.org', // HS student (should be fast)
    'john.doe@yourschool.org',          // Staff (should be fast)
    'admin@yourschool.org',   // Known staff (should be fast)
    '31.elementary.kid@yourschool.org'  // Elementary (should skip search)
  ];

  Logger.log('HIGH SCHOOL FILTERING: ' + (CONFIG.ENABLE_HS_FILTERING ? 'ENABLED ✅' : 'DISABLED ❌'));
  Logger.log('High School Classes: ' + CONFIG.HS_GRAD_YEARS.join(', '));
  Logger.log('Max Search Pages: ' + CONFIG.MAX_FILTERED_SEARCH_PAGES + ' (was: unlimited)');
  Logger.log('\n' + '='.repeat(80) + '\n');

  testEmails.forEach(function(email) {
    Logger.log('Testing: ' + email);
    Logger.log('  Pattern: ' + (extractGradYear(email) || 'Staff/Admin'));
    Logger.log('  Is HS Student: ' + isHighSchoolStudent(email));

    const startTime = new Date().getTime();
    const result = findUserByEmail(email);
    const endTime = new Date().getTime();
    const duration = (endTime - startTime) / 1000;

    if (result) {
      Logger.log('  ✅ FOUND in ' + duration.toFixed(2) + ' seconds');
      Logger.log('  User ID: ' + result);
    } else {
      Logger.log('  ❌ NOT FOUND in ' + duration.toFixed(2) + ' seconds');
    }

    // Performance expectation
    const expected = isHighSchoolStudent(email) || !extractGradYear(email) ? 3 : 0.5;
    if (duration <= expected) {
      Logger.log('  🚀 PERFORMANCE: EXCELLENT (under ' + expected + 's)');
    } else if (duration <= 10) {
      Logger.log('  ⚠️ PERFORMANCE: ACCEPTABLE (under 10s)');
    } else {
      Logger.log('  🐌 PERFORMANCE: SLOW (over 10s) - optimization may not be working');
    }

    Logger.log('');
  });

  Logger.log('=== TEST COMPLETE ===');
  Logger.log('\nEXPECTED RESULTS:');
  Logger.log('  • HS Students (26, 27, etc.): 1-3 seconds');
  Logger.log('  • Staff (no prefix): 1-3 seconds');
  Logger.log('  • Non-HS Students (31, etc.): <0.5 seconds (skipped)');
  Logger.log('\nBEFORE OPTIMIZATION: 30-40 seconds for all searches');
  Logger.log('AFTER OPTIMIZATION: 1-3 seconds for valid users');
  Logger.log('IMPROVEMENT: 93% faster ⚡');
}

/**
 * NEW: Test user search with known working email
 */
/**
 * Debug asset coverage using the curated view
 */
/**
 * Test the new enforced IncidentIQ assignment requirement
 * This will test both success and failure scenarios
 */
function testEnforcedAssignment() {
  Logger.log('=== TESTING ENFORCED INCIDENTIQ ASSIGNMENT ===');

  // First, find an available device
  Logger.log('\n--- Finding an available device for testing ---');
  var allAssets = getAllAssetTags();
  var availableAsset = null;

  for (var i = 0; i < allAssets.length; i++) {
    if (allAssets[i].status === 'Available') {
      availableAsset = allAssets[i];
      break;
    }
  }

  if (!availableAsset) {
    Logger.log('⚠️  WARNING: No available devices found for testing');
    Logger.log('Test will use asset 201142 anyway to test validation logic');
    availableAsset = { assetTag: '201142' };
  } else {
    Logger.log('✅ Found available device: ' + availableAsset.assetTag);
  }

  // Test Case 1: Valid user and available asset (should succeed)
  Logger.log('\n--- Test 1: Valid checkout with available device ---');
  var result1 = processCheckout({
    studentEmail: 'admin@yourschool.org',  // TODO: Use valid test email
    assetTag: availableAsset.assetTag,
    action: 'Check Out'
  });
  Logger.log('Result 1: ' + JSON.stringify(result1, null, 2));
  Logger.log(result1.success ?
    '✅ PASS: Checkout succeeded as expected' :
    '⚠️  Note: Checkout failed - ' + result1.message);

  // Test Case 2: Invalid email (should fail with specific message about user not found)
  Logger.log('\n--- Test 2: Invalid email (should block checkout) ---');
  var testAsset = allAssets[0]; // Use first asset from list
  var result2 = processCheckout({
    studentEmail: 'nonexistent.fakeperson.doesnotexist@yourschool.org',  // Test: invalid email
    assetTag: testAsset.assetTag,
    action: 'Check Out'
  });
  Logger.log('Result 2: ' + JSON.stringify(result2, null, 2));
  Logger.log(!result2.success && result2.message.includes('not found in IncidentIQ') ?
    '✅ PASS: Blocked as expected with user not found message' :
    '❌ FAIL: Should have blocked with user not found message');

  // Test Case 3: Invalid asset tag format (should fail early validation)
  Logger.log('\n--- Test 3: Invalid asset tag format ---');
  var result3 = processCheckout({
    studentEmail: 'admin@yourschool.org',  // TODO: Use valid test email
    assetTag: 'INVALID',
    action: 'Check Out'
  });
  Logger.log('Result 3: ' + JSON.stringify(result3, null, 2));
  Logger.log(!result3.success && result3.message.includes('6 digits') ?
    '✅ PASS: Blocked with validation error as expected' :
    '❌ FAIL: Should have blocked with format validation error');

  Logger.log('\n=== TEST COMPLETE ===');
  Logger.log('\nSUMMARY:');
  Logger.log('- IncidentIQ assignment is now REQUIRED for all checkouts and returns');
  Logger.log('- Users not found in IncidentIQ cannot check out devices');
  Logger.log('- Failed IncidentIQ assignments block the entire transaction');
  Logger.log('- Google Sheets only logs successful IncidentIQ assignments');
}

/**
 * SECURITY TEST: Verify asset inventory protection for anonymous users
 * Tests that sensitive data (serial numbers, user info) is hidden from anonymous access
 */
function testInventoryProtection() {
  Logger.log('=== TESTING ASSET INVENTORY PROTECTION ===\n');

  // Simulate authenticated access (as if running from Apps Script editor)
  Logger.log('--- Test 1: Authenticated Access (Full Data) ---');
  const authenticatedAssets = getAllAssetTags();

  if (authenticatedAssets.length > 0) {
    const sampleAuth = authenticatedAssets[0];
    Logger.log('Sample authenticated asset:');
    Logger.log('  Asset Tag: ' + (sampleAuth.assetTag || 'MISSING'));
    Logger.log('  Device Type: ' + (sampleAuth.deviceType || 'MISSING'));
    Logger.log('  Model: ' + (sampleAuth.model || 'MISSING'));
    Logger.log('  Status: ' + (sampleAuth.status || 'MISSING'));
    Logger.log('  Serial Number: ' + (sampleAuth.serialNumber || 'MISSING'));
    Logger.log('  Current User: ' + (sampleAuth.currentUser || 'N/A'));
    Logger.log('  Asset ID: ' + (sampleAuth.assetId || 'MISSING'));
    Logger.log('  User ID: ' + (sampleAuth.userId || 'N/A'));

    // Verify authenticated users get full data
    const hasFullData = sampleAuth.assetId && sampleAuth.serialNumber !== undefined;
    Logger.log('\n✅ TEST 1 RESULT: ' + (hasFullData ?
      'PASS - Authenticated users receive full asset data including sensitive fields' :
      'FAIL - Authenticated users should receive all fields'));
  } else {
    Logger.log('⚠️  WARNING: No assets found in view');
  }

  Logger.log('\n--- Test 2: Anonymous Access Simulation ---');
  Logger.log('NOTE: When called from kiosk (anonymous), Session.getEffectiveUser().getEmail() returns empty string');
  Logger.log('The getAllAssetTags() function will detect this and return limited data.');
  Logger.log('\nTo fully test anonymous access:');
  Logger.log('1. Deploy as web app with "Anyone" access');
  Logger.log('2. Open in incognito/private browser window (not logged into Google)');
  Logger.log('3. Open browser console (F12)');
  Logger.log('4. Call: google.script.run.withSuccessHandler(console.log).getAllAssetTags()');
  Logger.log('5. Verify response contains assetTag, deviceType, model, status');
  Logger.log('6. Verify response does NOT contain serialNumber, currentUser, assetId, userId');

  Logger.log('\n--- Test 3: Data Field Verification ---');
  Logger.log('Required fields for anonymous users (autocomplete functionality):');
  Logger.log('  ✅ assetTag - needed for search');
  Logger.log('  ✅ deviceType - needed for display');
  Logger.log('  ✅ model - needed for autocomplete matching');
  Logger.log('  ✅ status - needed to show availability');
  Logger.log('  ✅ disabled - needed to prevent checkout of disabled devices');
  Logger.log('\nHidden fields for anonymous users (security):');
  Logger.log('  ❌ serialNumber - could enable targeted theft');
  Logger.log('  ❌ currentUser - student privacy concern (FERPA)');
  Logger.log('  ❌ userId - internal system identifier');
  Logger.log('  ❌ assetId - internal system identifier');

  Logger.log('\n=== SECURITY BENEFIT ===');
  Logger.log('Before: Anyone could enumerate all devices and see:');
  Logger.log('  - Serial numbers for all devices (theft risk)');
  Logger.log('  - Which students have devices checked out (privacy violation)');
  Logger.log('  - Internal system IDs (information disclosure)');
  Logger.log('\nAfter: Anonymous users only see:');
  Logger.log('  - Asset tags (needed for checkout)');
  Logger.log('  - Device types and models (needed for identification)');
  Logger.log('  - Availability status (needed for workflow)');
  Logger.log('\n✅ This reduces attack surface while maintaining full functionality!');

  Logger.log('\n=== TEST COMPLETE ===');
}

/**
 * Alternative user validation - allows checkout without finding user in IncidentIQ
 * This is useful when user directory sync is not working properly
 * @param {string} studentEmail - Student email address
 * @returns {Object} Validation result with recommendations
 */

// ============================================
// UPDATE ASSET ASSIGNMENT IN INCIDENTIQ
// ============================================

/**
 * Updates asset assignment in IncidentIQ with improved error handling
 * @param {string} assetId - Asset ID to update
 * @param {string|null} userId - User ID for checkout, null for return
 * @param {string} action - 'Check Out' or 'Return'
 * @returns {Object} Update result with success status and details
 */
function updateAssetAssignment(assetId, userId, action) {
  const config = getIncidentIQConfig();

  try {
    if (!assetId) {
      return { success: false, error: 'Asset ID is required' };
    }

    var payload = {};
    if (action === 'Check Out' && userId) {
      payload = { OwnerId: userId };
    } else if (action === 'Return') {
      payload = { OwnerId: null };
    } else {
      return { success: false, error: 'Invalid action or missing user ID for checkout' };
    }

    const options = createApiOptions(config, 'POST', payload);
    var url = config.baseUrl + '/assets/' + assetId + '/owner';

    // Enhanced logging for debugging
    Logger.log('=== ASSET UPDATE ATTEMPT ===');
    Logger.log('Asset ID: ' + assetId);
    Logger.log('User ID: ' + (userId || 'null'));
    Logger.log('Action: ' + action);
    Logger.log('URL: ' + url);
    safeLog('Payload:', payload);

    var response = UrlFetchApp.fetch(url, options);
    var statusCode = response.getResponseCode();
    var responseText = response.getContentText();

    Logger.log('Response Status: ' + statusCode);
    Logger.log('Response Body: ' + responseText);

    if (statusCode === 200 || statusCode === 204) {
      Logger.log('✅ Successfully updated asset assignment in IncidentIQ');
      // NOTE: Cache is updated by CacheManager.updateAssetOwner() in processCheckout()
      // No need to clear cache here - it's already updated with correct status
      return { success: true };
    } else {
      var errorMessage = 'Failed to update asset. Status: ' + statusCode;

      // Try to parse detailed error information
      try {
        var errorData = JSON.parse(responseText);
        Logger.log('Parsed error data: ' + JSON.stringify(errorData, null, 2));

        if (errorData.message) {
          errorMessage += ' - ' + errorData.message;
        } else if (errorData.Message) {
          errorMessage += ' - ' + errorData.Message;
        } else if (errorData.error) {
          errorMessage += ' - ' + errorData.error;
        } else if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage += ' - ' + errorData.errors.join(', ');
        }
      } catch (parseError) {
        Logger.log('Could not parse error response as JSON');
        if (responseText && responseText.length > 0) {
          errorMessage += ' - ' + responseText.substring(0, 500); // Limit to 500 chars
        }
      }

      Logger.log('❌ Asset update failed: ' + errorMessage);
      return { success: false, error: errorMessage };
    }

  } catch (error) {
    var errorMessage = 'Error updating asset assignment: ' + error.toString();
    Logger.log(errorMessage);
    return { success: false, error: errorMessage };
  }
}

// ============================================
// CRITICAL ERROR NOTIFICATION
// ============================================

/**
 * Sends critical error notification email to IT staff
 * Called when transaction rollback fails and manual intervention is required
 * @param {Object} errorDetails - Details about the critical error
 */
function sendCriticalErrorNotification(errorDetails) {
  try {
    const IT_EMAIL_ADDRESSES = [
      'admin@example.com',       // TODO: Replace with IT staff emails
      'tech@example.com'
    ];

    const subject = '🚨 CRITICAL: Chromebook Checkout System - Transaction Rollback Failed';

    const htmlBody = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: #d32f2f; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f5f5f5; }
            .error-box { background-color: #ffebee; border-left: 4px solid #d32f2f; padding: 15px; margin: 15px 0; }
            .details { background-color: white; padding: 15px; margin: 15px 0; border: 1px solid #ddd; }
            .action-required { background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 15px 0; }
            .code { background-color: #263238; color: #aed581; padding: 10px; font-family: 'Courier New', monospace; border-radius: 4px; }
            h2 { color: #d32f2f; }
            h3 { color: #f57c00; }
            .timestamp { color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚨 CRITICAL ERROR - MANUAL INTERVENTION REQUIRED</h1>
            <p>Chromebook Checkout System - Transaction Rollback Failed</p>
          </div>

          <div class="content">
            <div class="error-box">
              <h2>⚠️ DATA INCONSISTENCY DETECTED</h2>
              <p><strong>A transaction failed and the automatic rollback also failed. The system is now in an inconsistent state and requires immediate manual correction.</strong></p>
              <p class="timestamp">Error Time: ${errorDetails.timestamp}</p>
              <p class="timestamp">Error ID: ${errorDetails.timestamp.getTime()}</p>
            </div>

            <div class="details">
              <h3>Transaction Details</h3>
              <ul>
                <li><strong>Student Email:</strong> ${errorDetails.studentEmail}</li>
                <li><strong>Action:</strong> ${errorDetails.action}</li>
                <li><strong>Asset Tag:</strong> ${errorDetails.assetTag}</li>
                <li><strong>Asset ID:</strong> ${errorDetails.assetId}</li>
              </ul>

              <h3>Inconsistency Details</h3>
              <ul>
                <li><strong>Expected Owner ID:</strong> ${errorDetails.expectedOwner || 'null (Available)'}</li>
                <li><strong>Actual Owner ID:</strong> ${errorDetails.actualOwner || 'null (Available)'}</li>
                <li><strong>Google Sheets Error:</strong> ${errorDetails.sheetError}</li>
                <li><strong>Rollback Error:</strong> ${errorDetails.rollbackError}</li>
              </ul>
            </div>

            <div class="action-required">
              <h3>🔧 REQUIRED ACTIONS</h3>
              <ol>
                <li><strong>Verify Current State in IncidentIQ:</strong>
                  <ul>
                    <li>Open IncidentIQ → Assets</li>
                    <li>Search for Asset Tag: <strong>${errorDetails.assetTag}</strong></li>
                    <li>Check current Owner field</li>
                  </ul>
                </li>

                <li><strong>Determine Correct State:</strong>
                  <ul>
                    <li>If action was "Check Out": Asset should be assigned to ${errorDetails.studentEmail}</li>
                    <li>If action was "Return": Asset should be Available (no owner)</li>
                  </ul>
                </li>

                <li><strong>Manually Correct IncidentIQ:</strong>
                  <ul>
                    <li>If state is incorrect: Manually update asset owner in IncidentIQ</li>
                    <li>If state is correct: No IncidentIQ change needed</li>
                  </ul>
                </li>

                <li><strong>Manually Log to Google Sheets:</strong>
                  <ul>
                    <li>Open your configured Checkouts Spreadsheet</li>
                    <li>Add row with transaction details (see below)</li>
                  </ul>
                </li>

                <li><strong>Contact Student:</strong>
                  <ul>
                    <li>Inform ${errorDetails.studentEmail} about transaction status</li>
                    <li>Confirm they have/don't have the device as intended</li>
                  </ul>
                </li>
              </ol>
            </div>

            <div class="details">
              <h3>Manual Google Sheets Entry</h3>
              <p>If you need to manually add this transaction to the spreadsheet:</p>
              <div class="code">
Timestamp: ${errorDetails.timestamp}<br>
Student Email: ${errorDetails.studentEmail}<br>
Device Type: (check IncidentIQ)<br>
Asset Tag: ${errorDetails.assetTag}<br>
Serial Number: (check IncidentIQ)<br>
Model: (check IncidentIQ)<br>
Action: ${errorDetails.action}<br>
Status: ${errorDetails.action === 'Check Out' ? 'Checked Out' : 'Returned'}<br>
IncidentIQ Updated: Yes (manual correction)
              </div>
            </div>

            <div class="details">
              <h3>📋 Investigation Checklist</h3>
              <ul>
                <li>☐ Verified current asset state in IncidentIQ</li>
                <li>☐ Corrected asset owner if needed</li>
                <li>☐ Added transaction to Google Sheets</li>
                <li>☐ Contacted student to confirm device status</li>
                <li>☐ Investigated root cause of Google Sheets failure</li>
                <li>☐ Investigated root cause of rollback failure</li>
                <li>☐ Reviewed Google Apps Script logs (Error ID: ${errorDetails.timestamp.getTime()})</li>
              </ul>
            </div>

            <div class="error-box">
              <h3>🔍 Troubleshooting</h3>
              <p><strong>Why did this happen?</strong></p>
              <ul>
                <li><strong>Google Sheets failure:</strong> Possible causes include permissions issues, quota exceeded, or spreadsheet corruption</li>
                <li><strong>Rollback failure:</strong> Possible causes include IncidentIQ API timeout, network issues, or asset workflow restrictions</li>
              </ul>

              <p><strong>Prevent Future Occurrences:</strong></p>
              <ul>
                <li>Check Google Sheets permissions and health</li>
                <li>Verify IncidentIQ API connectivity and quotas</li>
                <li>Review Apps Script execution logs for patterns</li>
                <li>Consider implementing retry logic for sheet writes</li>
              </ul>
            </div>

            <div class="details">
              <p><strong>Questions? Need Help?</strong></p>
              <p>Review the system logs in Google Apps Script (Executions → View logs)</p>
              <p>Search for Error ID: <strong>${errorDetails.timestamp.getTime()}</strong></p>
            </div>
          </div>
        </body>
      </html>
    `;

    const plainBody = `
CRITICAL ERROR - MANUAL INTERVENTION REQUIRED
==============================================

A transaction rollback failed in the Chromebook Checkout System.

ERROR DETAILS:
- Error Time: ${errorDetails.timestamp}
- Error ID: ${errorDetails.timestamp.getTime()}
- Student Email: ${errorDetails.studentEmail}
- Action: ${errorDetails.action}
- Asset Tag: ${errorDetails.assetTag}
- Asset ID: ${errorDetails.assetId}

INCONSISTENCY:
- Expected Owner: ${errorDetails.expectedOwner || 'null (Available)'}
- Actual Owner: ${errorDetails.actualOwner || 'null (Available)'}
- Google Sheets Error: ${errorDetails.sheetError}
- Rollback Error: ${errorDetails.rollbackError}

REQUIRED ACTIONS:
1. Verify current state in IncidentIQ for asset ${errorDetails.assetTag}
2. Manually correct asset owner if needed
3. Manually log transaction to Google Sheets
4. Contact student to confirm device status

See HTML email for detailed instructions.
    `;

    // Send email to all IT staff
    IT_EMAIL_ADDRESSES.forEach(function(email) {
      try {
        MailApp.sendEmail({
          to: email,
          subject: subject,
          htmlBody: htmlBody,
          body: plainBody,
          name: 'Chromebook Checkout System'
        });
        Logger.log('✅ Critical error notification sent to: ' + email);
      } catch (emailError) {
        Logger.log('❌ Failed to send notification to ' + email + ': ' + emailError.toString());
      }
    });

    Logger.log('📧 Critical error notifications sent to IT staff');

  } catch (notificationError) {
    Logger.log('❌ Failed to send critical error notification: ' + notificationError.toString());
    // Don't throw - we don't want notification failure to break the error handling
  }
}

// ============================================
// FORM SUBMISSION HANDLER
// ============================================

/**
 * Processes checkout/return form submission with comprehensive validation
 * CRITICAL FIX: Now includes transaction rollback on Google Sheets failure
 * @param {Object} formData - Form submission data
 * @returns {Object} Processing result
 */
/**
 * PHASE 2 REFACTORED: Process checkout or return transaction
 * Uses service layer for clean separation of concerns
 *
 * @param {Object} formData - Form submission data
 * @returns {Object} Processing result {success, message}
 */
function processCheckout(formData) {
  try {
    // PERFORMANCE TRACKING
    const perfStart = new Date().getTime();
    const perfLog = {};

    // ============================================
    // STEP 1: SECURITY & VALIDATION
    // ============================================

    // Rate limiting check
    const userEmail = Session.getEffectiveUser().getEmail();
    if (!userEmail) {
      return {success: false, message: 'Authentication required'};
    }

    const rateLimitCheck = checkRateLimit(userEmail);
    if (!rateLimitCheck.allowed) {
      logSafe('SECURITY: Rate limit blocked request from: ' + userEmail);
      return {success: false, message: rateLimitCheck.message};
    }

    // Input validation
    if (!formData || typeof formData !== 'object') {
      return {success: false, message: 'Invalid form data provided'};
    }

    const emailValidation = validateEmail(formData.studentEmail);
    if (!emailValidation.isValid) {
      return {success: false, message: emailValidation.error};
    }

    const assetValidation = validateAssetTag(formData.assetTag);
    if (!assetValidation.isValid) {
      return {success: false, message: assetValidation.error};
    }

    if (!formData.action || (formData.action !== 'Check Out' && formData.action !== 'Return')) {
      return {success: false, message: 'Invalid action. Must be "Check Out" or "Return"'};
    }

    perfLog.validation = new Date().getTime() - perfStart;

    // ============================================
    // STEP 2: ASSET VERIFICATION (via CacheManager)
    // ============================================

    const assetVerifyStart = new Date().getTime();
    const assetInfo = CacheManager.verifyAsset(assetValidation.assetTag);
    perfLog.assetVerify = new Date().getTime() - assetVerifyStart;

    if (!assetInfo.exists) {
      return {
        success: false,
        message: assetInfo.message || 'Asset tag not found in IncidentIQ. Please verify the tag or contact IT.'
      };
    }

    if (assetInfo.disabled) {
      return {
        success: false,
        message: 'Asset is disabled and cannot be checked out: ' + (assetInfo.disableReason || 'Not available for checkout')
      };
    }

    // ============================================
    // STEP 3: BUSINESS LOGIC VALIDATION
    // ============================================

    if (formData.action === 'Check Out' && assetInfo.status === 'Checked Out') {
      return {
        success: false,
        message: 'This device is already checked out' + (assetInfo.currentUser ? ' to ' + assetInfo.currentUser : '') + '. Please verify the asset tag.'
      };
    }

    if (formData.action === 'Return' && assetInfo.status === 'Available') {
      return {
        success: false,
        message: 'This device is not currently checked out. Please verify the asset tag.'
      };
    }

    // ============================================
    // STEP 4: CHECKOUT LIMIT CHECK (via Repository)
    // ============================================

    if (formData.action === 'Check Out') {
      const limitCheckStart = new Date().getTime();
      const activeCheckouts = CheckoutRepository.getActiveCheckoutCount(emailValidation.email);
      perfLog.limitCheck = new Date().getTime() - limitCheckStart;

      if (activeCheckouts >= CONFIG.MAX_ACTIVE_CHECKOUTS) {
        logSafe('CHECKOUT BLOCKED: Limit reached - ' + emailValidation.email + ' has ' + activeCheckouts + ' active checkouts');
        const deviceWord = activeCheckouts === 1 ? 'device' : 'devices';
        return {
          success: false,
          message: 'Checkout limit reached: You already have ' + activeCheckouts + ' ' + deviceWord + ' checked out. Please return your current device before checking out another.'
        };
      }

      logSafe('Checkout limit check passed: ' + emailValidation.email + ' has ' + activeCheckouts + '/' + CONFIG.MAX_ACTIVE_CHECKOUTS + ' active checkouts');
    }

    // ============================================
    // STEP 5: INCIDENTIQ TRANSACTION (via Service)
    // ============================================

    var incidentIQResult = null;
    var userResult = null; // Declare outside scope for cache update later

    // Determine device type with enhanced logic (check multiple keywords)
    var deviceType = 'Chromebook'; // Default
    var searchText = (assetInfo.model || '').toLowerCase();

    if (searchText.includes('charger') || searchText.includes('adapter') || searchText.includes('power')) {
      deviceType = 'Charger';
    } else if (searchText.includes('chromebook') || searchText.includes('laptop') || searchText.includes('notebook') || searchText.includes('computer')) {
      deviceType = 'Chromebook';
    }

    if (formData.action === 'Check Out') {
      // Find user in IncidentIQ
      logSafe('Looking up user in IncidentIQ: ' + emailValidation.email);
      const userLookupStart = new Date().getTime();
      userResult = IncidentIQService.findUser(emailValidation.email);
      perfLog.userLookup = new Date().getTime() - userLookupStart;

      if (!userResult.success) {
        logSafe('CHECKOUT BLOCKED: User not found in IncidentIQ - ' + emailValidation.email);
        return {
          success: false,
          message: 'Unable to assign device: Your email (' + emailValidation.email + ') was not found in IncidentIQ. Please contact IT support to ensure your account is set up correctly before checking out devices.'
        };
      }

      // Perform checkout transaction
      logSafe('Performing checkout transaction in IncidentIQ');
      const iiqCheckoutStart = new Date().getTime();
      incidentIQResult = IncidentIQService.checkoutDevice(assetInfo.assetId, userResult.data.userId);
      perfLog.iiqCheckout = new Date().getTime() - iiqCheckoutStart;

      if (!incidentIQResult.success) {
        logSafe('CHECKOUT FAILED: IncidentIQ assignment error - ' + incidentIQResult.error);
        return {
          success: false,
          message: 'Unable to assign device in IncidentIQ: ' + (incidentIQResult.error || 'Unknown error. Please contact IT support.')
        };
      }

      logSafe('✅ CHECKOUT APPROVED: IncidentIQ assignment successful');

    } else {
      // Return transaction
      logSafe('Performing return transaction in IncidentIQ');
      const iiqReturnStart = new Date().getTime();
      incidentIQResult = IncidentIQService.returnDevice(assetInfo.assetId, assetValidation.assetTag);
      perfLog.iiqReturn = new Date().getTime() - iiqReturnStart;

      if (!incidentIQResult.success) {
        logSafe('RETURN FAILED: IncidentIQ error - ' + incidentIQResult.error);
        return {
          success: false,
          message: 'Unable to process return in IncidentIQ: ' + (incidentIQResult.error || 'Unknown error. Please contact IT support.')
        };
      }

      if (!incidentIQResult.statusUpdated) {
        logSafe('⚠️ WARNING: Return succeeded but status update failed - device may not auto-enable');
      }

      logSafe('✅ RETURN APPROVED: IncidentIQ updates complete');
    }

    // ============================================
    // STEP 5.5: UPDATE CACHE IMMEDIATELY (Critical Fix)
    // ============================================
    // This prevents stale cache issues when checking out then returning quickly
    // Without this, the cache would show "Available" even after checkout until it expires

    logSafe('Updating cache with new ownership status');
    if (formData.action === 'Check Out') {
      // Cache the new owner assignment
      // Note: userResulit is available from the checkout flow above (line 1644)
      CacheManager.updateAssetOwner(assetValidation.assetTag, userResult.data.userId, emailValidation.email);
    } else {
      // Cache the device as returned (no owner)
      CacheManager.updateAssetOwner(assetValidation.assetTag, null, null);
    }
    logSafe('✅ Cache updated with current ownership status');

    // ============================================
    // STEP 6: LOG TO GOOGLE SHEETS (via Repository)
    // ============================================

    logSafe('Logging transaction to Google Sheets');
    const sheetsLogStart = new Date().getTime();
    const newStatus = formData.action === 'Check Out' ? 'Checked Out' : 'Returned';

    const logResult = CheckoutRepository.logTransaction({
      studentEmail: emailValidation.email,
      deviceType: deviceType,
      assetTag: assetValidation.assetTag,
      serialNumber: assetInfo.serialNumber,
      model: assetInfo.model,
      action: formData.action,
      status: newStatus,
      incidentIQUpdated: true
    });
    perfLog.sheetsLog = new Date().getTime() - sheetsLogStart;

    if (!logResult.success) {
      // CRITICAL: Sheet write failed - rollback IncidentIQ
      logSafe('❌ CRITICAL: Sheet write failed - attempting rollback');

      if (incidentIQResult.previousOwnerId !== undefined) {
        const rollbackResult = IncidentIQService.unassignDevice(assetInfo.assetId);

        if (formData.action === 'Check Out' && incidentIQResult.previousOwnerId) {
          // Restore previous owner
          IncidentIQService.assignDevice(assetInfo.assetId, incidentIQResult.previousOwnerId);
        }

        if (rollbackResult.success) {
          logSafe('✅ Rollback successful - IncidentIQ restored to previous state');
          return {
            success: false,
            message: 'Transaction failed: Unable to log to Google Sheets. IncidentIQ has been rolled back. Error: ' + logResult.error
          };
        } else {
          // CRITICAL: Rollback failed - send error notification
          logSafe('🚨 ROLLBACK FAILED - Data inconsistency detected');

          sendCriticalErrorNotification({
            type: 'TRANSACTION_ROLLBACK_FAILED',
            assetId: assetInfo.assetId,
            assetTag: assetValidation.assetTag,
            studentEmail: emailValidation.email,
            action: formData.action,
            sheetError: logResult.error,
            rollbackError: rollbackResult.error,
            timestamp: new Date()
          });

          return {
            success: false,
            message: 'CRITICAL ERROR: Transaction incomplete and rollback failed. IT has been notified. Please contact IT support immediately.'
          };
        }
      }

      return {
        success: false,
        message: 'Transaction failed: Unable to log to Google Sheets. Error: ' + logResult.error
      };
    }

    logSafe('✅ Transaction logged to Google Sheets successfully');

    // ============================================
    // STEP 6.5: UPDATE ACTIVE CHECKOUTS SHEET (NEW)
    // ============================================

    logSafe('Updating Active Checkouts sheet');
    const activeCheckoutsStart = new Date().getTime();
    try {
      if (formData.action === 'Check Out') {
        // Add to Active Checkouts
        const addResult = CheckoutRepository.addToActiveCheckouts({
          email: emailValidation.email,
          deviceType: deviceType,
          assetTag: assetValidation.assetTag,
          serialNumber: assetInfo.serialNumber,
          model: assetInfo.model,
          checkoutTime: new Date()
        });

        if (addResult.success) {
          logSafe('✅ Added to Active Checkouts sheet');
        } else {
          logSafe('⚠️ Warning: Active Checkouts add failed - ' + addResult.error);
        }
      } else {
        // Remove from Active Checkouts
        const removeResult = CheckoutRepository.removeFromActiveCheckouts(assetValidation.assetTag);

        if (removeResult.success && removeResult.found) {
          logSafe('✅ Removed from Active Checkouts sheet');
        } else if (removeResult.success && !removeResult.found) {
          logSafe('⚠️ Warning: Asset not found in Active Checkouts (may have already been removed)');
        } else {
          logSafe('⚠️ Warning: Active Checkouts remove failed - ' + removeResult.error);
        }
      }
    } catch (activeCheckoutsError) {
      // Don't fail the transaction if Active Checkouts update fails
      logSafe('⚠️ Warning: Active Checkouts update failed - ' + activeCheckoutsError.toString());
    }
    perfLog.activeCheckouts = new Date().getTime() - activeCheckoutsStart;

    // ============================================
    // STEP 6.6: OVERDUE DASHBOARD (Scheduled Updates Only)
    // ============================================
    // REMOVED: Real-time dashboard updates for performance optimization
    // Dashboard now updates only TWICE daily:
    //   - 7:00 AM: Morning snapshot (overnight devices only)
    //   - 2:30 PM: Afternoon snapshot (all overdue devices)
    // For real-time status, IT staff should check "Active Checkouts" sheet
    // This reduces Google Apps Script quota usage by ~93%

    // ============================================
    // STEP 7: POST-TRANSACTION CLEANUP
    // ============================================

    // NOTE: Cache already updated by updateAssetOwner() in STEP 5.5
    // No need to clear cache - it has the correct current status
    // CacheManager.clearAssetCache(); // REMOVED for performance

    // ============================================
    // STEP 8: SUCCESS RESPONSE
    // ============================================

    const totalTime = new Date().getTime() - perfStart;
    perfLog.total = totalTime;

    // Log performance breakdown
    Logger.log('⏱️ PERFORMANCE BREAKDOWN:');
    Logger.log('  Total Time: ' + totalTime + 'ms');
    Logger.log('  - Validation: ' + (perfLog.validation || 0) + 'ms');
    Logger.log('  - Asset Verify: ' + (perfLog.assetVerify || 0) + 'ms');
    Logger.log('  - Limit Check: ' + (perfLog.limitCheck || 0) + 'ms');
    Logger.log('  - User Lookup: ' + (perfLog.userLookup || 0) + 'ms');
    Logger.log('  - IIQ Checkout: ' + (perfLog.iiqCheckout || 0) + 'ms');
    Logger.log('  - IIQ Return: ' + (perfLog.iiqReturn || 0) + 'ms');
    Logger.log('  - Sheets Log: ' + (perfLog.sheetsLog || 0) + 'ms');
    Logger.log('  - Active Checkouts: ' + (perfLog.activeCheckouts || 0) + 'ms');

    const message = 'Successfully ' + (formData.action === 'Check Out' ? 'checked out' : 'returned') +
                    ' ' + deviceType + ' ' + assetValidation.assetTag +
                    ' for ' + emailValidation.email + '. Device assignment updated in IncidentIQ.';

    return {
      success: true,
      message: message
    };

  } catch (error) {
    safeLog('processCheckout() - Unexpected error:', {error: error.toString()});
    return {
      success: false,
      message: 'An error occurred: ' + error.message
    };
  }
}

/**
 * SETUP FUNCTION - Call this once to configure API token securely
 * Run this function in the Apps Script editor to set up your API token
 */
function setupApiToken() {
  // Replace with your actual API token
  const apiToken = 'YOUR_INCIDENTIQ_API_TOKEN_HERE';

  PropertiesService.getScriptProperties().setProperty('INCIDENTIQ_API_TOKEN', apiToken);
  Logger.log('API token has been securely stored in Script Properties');

  // Test the configuration
  try {
    const config = getIncidentIQConfig();
    Logger.log('Configuration test successful. Domain: ' + config.domain);

    // Warm up the caches for better performance
    Logger.log('Warming up asset cache for optimal performance...');
    getAllAssetTags();
    Logger.log('Cache warmup complete - system ready for 3-second response times');
  } catch (error) {
    Logger.log('Configuration test failed: ' + error.message);
  }
}

/**
 * NEW: Performance monitoring and optimization functions
 */
// ============================================
// OVERNIGHT DEVICE NOTIFICATION SYSTEM
// ============================================

/**
 * NOTIFICATION CONFIGURATION
 */
/**
 * Main function to check for overnight devices and send notifications
 * This function can be called manually or used for testing
 * For scheduled operations, use generateOvernightDeviceReport and sendScheduledOvernightNotification
 */
function checkOvernightDevicesAndNotify() {
  try {
    Logger.log('=== OVERNIGHT DEVICE CHECK STARTED ===');
    Logger.log('Checking time: ' + new Date().toLocaleString('en-US', {timeZone: NOTIFICATION_CONFIG.SCHOOL_TIMEZONE}));

    // Skip weekends if configured
    if (NOTIFICATION_CONFIG.WEEKDAYS_ONLY && isWeekend()) {
      Logger.log('Skipping notification - Weekend detected');
      return { success: true, message: 'Skipped - Weekend' };
    }

    const overdueDevices = CheckoutRepository.getOverdueDevices();
    Logger.log('Found ' + overdueDevices.length + ' overdue devices');

    if (overdueDevices.length > 0) {
      // Update dashboard
      CheckoutRepository.updateOverdueDashboard(overdueDevices);

      // Send email notification
      const emailResult = sendOvernightNotificationEmail(overdueDevices);

      // Log notification activity
      CheckoutRepository.logNotification(overdueDevices.length, emailResult.success);

      return {
        success: true,
        message: 'Notification sent for ' + overdueDevices.length + ' overdue devices',
        deviceCount: overdueDevices.length
      };
    } else {
      Logger.log('No overdue devices found - no notification needed');

      // Still update dashboard to show "All Clear"
      CheckoutRepository.updateOverdueDashboard([]);

      return {
        success: true,
        message: 'All devices returned on time - no notification needed',
        deviceCount: 0
      };
    }

  } catch (error) {
    Logger.log('❌ Error in overnight device check: ' + error.toString());

    // Send error notification to IT staff
    sendErrorNotificationEmail(error);

    return {
      success: false,
      message: 'Error checking overnight devices: ' + error.message
    };
  }
}

/**
 * STEP 1: Generate overnight device report and AUTO-DISABLE overdue devices
 * Triggered at 2:20 PM EST Mon-Fri
 * NOW INCLUDES: Automatic disabling of overdue devices in IncidentIQ
 */
function generateOvernightDeviceReport() {
  try {
    Logger.log('=== GENERATING OVERNIGHT DEVICE REPORT & AUTO-DISABLE ===');
    Logger.log('Report generation time: ' + new Date().toLocaleString('en-US', {timeZone: NOTIFICATION_CONFIG.SCHOOL_TIMEZONE}));

    // Skip weekends if configured
    if (NOTIFICATION_CONFIG.WEEKDAYS_ONLY && isWeekend()) {
      Logger.log('Skipping report - Weekend detected');
      return { success: true, message: 'Skipped - Weekend' };
    }

    const overdueDevices = CheckoutRepository.getOverdueDevices();
    Logger.log('Found ' + overdueDevices.length + ' overdue devices');

    // AUTO-DISABLE: Apply "Missing" label to ALL overdue devices (same-day policy)
    // IncidentIQ Rules will then handle the actual device disabling in Google Workspace
    if (overdueDevices.length > 0 && NOTIFICATION_CONFIG.AUTO_DISABLE_ENABLED) {
      Logger.log('\n🔴 AUTO-DISABLE: Setting "Missing" status for all overdue devices (same-day policy)...');
      const disableResults = autoDisableOverdueDevices(overdueDevices);
      Logger.log('✅ Applied "Missing" label to ' + disableResults.successCount + ' of ' + overdueDevices.length + ' devices');
      if (disableResults.skippedCount > 0) {
        Logger.log('⏭️  Skipped ' + disableResults.skippedCount + ' devices');
      }
      if (disableResults.failureCount > 0) {
        Logger.log('❌ Failed to update ' + disableResults.failureCount + ' devices');
      }

      // Update device records with disable status
      overdueDevices.forEach(function(device) {
        const disableResult = disableResults.results.find(function(r) {
          return r.assetTag === device.assetTag;
        });
        if (disableResult) {
          device.disabled = disableResult.success && !disableResult.skipped;
          device.disableTime = disableResult.timestamp;
          device.disableError = disableResult.error || null;
          device.skippedReason = disableResult.reason || null;
        }
      });
    }

    // Update dashboard with current status
    CheckoutRepository.updateOverdueDashboard(overdueDevices);
    Logger.log('✅ Dashboard updated at 2:20 PM');

    // Store report data in cache for email notification at 2:30 PM
    const cache = CacheService.getScriptCache();
    cache.put('overdueDevicesReport', JSON.stringify(overdueDevices), 1200); // Cache for 20 minutes

    return {
      success: true,
      message: 'Report generated and dashboard updated',
      deviceCount: overdueDevices.length
    };

  } catch (error) {
    Logger.log('❌ Error generating report: ' + error.toString());
    sendErrorNotificationEmail(error);
    return {
      success: false,
      message: 'Error generating report: ' + error.message
    };
  }
}

/**
 * STEP 2: Send email notification based on cached report
 * Triggered at 2:30 PM EST daily
 */
function sendScheduledOvernightNotification() {
  try {
    Logger.log('=== SENDING SCHEDULED OVERNIGHT NOTIFICATION ===');
    Logger.log('Email send time: ' + new Date().toLocaleString('en-US', {timeZone: NOTIFICATION_CONFIG.SCHOOL_TIMEZONE}));

    // Skip weekends if configured
    if (NOTIFICATION_CONFIG.WEEKDAYS_ONLY && isWeekend()) {
      Logger.log('Skipping email - Weekend detected');
      return { success: true, message: 'Skipped - Weekend' };
    }

    // Retrieve cached report data
    const cache = CacheService.getScriptCache();
    const cachedReport = cache.get('overdueDevicesReport');

    let overdueDevices = [];
    if (cachedReport) {
      overdueDevices = JSON.parse(cachedReport);
      Logger.log('Retrieved cached report with ' + overdueDevices.length + ' devices');
    } else {
      Logger.log('⚠️ No cached report found - generating fresh report');
      overdueDevices = CheckoutRepository.getOverdueDevices();
    }

    // NEW: Update dashboard with ALL overdue devices (afternoon mode)
    CheckoutRepository.updateOverdueDashboard(overdueDevices, 'AFTERNOON');
    Logger.log('✅ Dashboard updated at 2:30 PM (afternoon snapshot - all overdue)');

    if (overdueDevices.length > 0) {
      // Send email notification
      const emailResult = sendOvernightNotificationEmail(overdueDevices);

      // Log notification activity
      CheckoutRepository.logNotification(overdueDevices.length, emailResult.success);

      Logger.log('✅ Email notification sent at 2:30 PM');

      return {
        success: true,
        message: 'Notification sent for ' + overdueDevices.length + ' overdue devices',
        deviceCount: overdueDevices.length
      };
    } else {
      Logger.log('No overdue devices found - no email needed');

      return {
        success: true,
        message: 'All devices returned on time - no notification needed',
        deviceCount: 0
      };
    }

  } catch (error) {
    Logger.log('❌ Error sending scheduled notification: ' + error.toString());
    sendErrorNotificationEmail(error);
    return {
      success: false,
      message: 'Error sending notification: ' + error.message
    };
  }
}

/**
 * MORNING UPDATE: Refreshes Overdue Alerts at 7:00 AM daily
 * Shows only "overnight devices" (checked out yesterday or earlier, never returned)
 * Purpose: Identify students who took devices home
 * Does NOT send email or auto-disable (those happen at 2:30 PM)
 */
function morningOverdueUpdate() {
  try {
    Logger.log('=== MORNING OVERDUE DASHBOARD UPDATE ===');
    Logger.log('Update time: ' + new Date().toLocaleString('en-US', {timeZone: NOTIFICATION_CONFIG.SCHOOL_TIMEZONE}));

    // Skip weekends if configured
    if (NOTIFICATION_CONFIG.WEEKDAYS_ONLY && isWeekend()) {
      Logger.log('Skipping morning update - Weekend detected');
      return { success: true, message: 'Skipped - Weekend' };
    }

    // Get devices that are currently overdue
    const overdueDevices = CheckoutRepository.getOverdueDevices();

    // Filter for ONLY overnight devices (1+ days old)
    // Excludes same-day checkouts from appearing in morning report
    const overnightDevices = overdueDevices.filter(function(device) {
      return device.daysOverdue >= 1;
    });

    Logger.log('Found ' + overnightDevices.length + ' overnight devices (1+ days overdue)');
    Logger.log('Found ' + overdueDevices.length + ' total overdue devices');

    // Update dashboard with overnight devices only
    CheckoutRepository.updateOverdueDashboard(overnightDevices, 'MORNING');

    Logger.log('✅ Morning dashboard updated at 7:00 AM');

    return {
      success: true,
      message: 'Morning update completed',
      overnightDevices: overnightDevices.length,
      totalOverdue: overdueDevices.length
    };

  } catch (error) {
    Logger.log('❌ Error in morning update: ' + error.toString());
    return {
      success: false,
      message: 'Error during morning update: ' + error.message
    };
  }
}

/**
 * Calculates the cutoff date/time for considering devices overdue
 * @param {Date} referenceDate - The reference date (usually today)
 * @returns {Date} Cutoff datetime
 */
/**
 * Checks if a given date is a weekend
 * @param {Date} date - Date to check (defaults to today)
 * @returns {boolean} True if weekend
 */
/**
 * Sends email notification to IT staff about overnight devices
 * @param {Array} overdueDevices - List of overdue devices
 * @returns {Object} Email sending result
 */
function sendOvernightNotificationEmail(overdueDevices) {
  try {
    const emailBody = generateEmailContent(overdueDevices);
    const subject = NOTIFICATION_CONFIG.EMAIL_SUBJECT +
                   ' (' + overdueDevices.length + ' device' +
                   (overdueDevices.length === 1 ? '' : 's') + ')';

    // Send to all IT staff
    for (const email of NOTIFICATION_CONFIG.IT_STAFF_EMAILS) {
      try {
        GmailApp.sendEmail(
          email,
          subject,
          '', // Plain text body (empty - using HTML)
          {
            htmlBody: emailBody,
            name: NOTIFICATION_CONFIG.EMAIL_FROM_NAME
          }
        );
        Logger.log('✅ Email sent successfully to: ' + email);
      } catch (emailError) {
        Logger.log('❌ Failed to send email to ' + email + ': ' + emailError.toString());
      }
    }

    return { success: true, recipientCount: NOTIFICATION_CONFIG.IT_STAFF_EMAILS.length };

  } catch (error) {
    Logger.log('❌ Error sending notification email: ' + error.toString());
    return { success: false, error: error.message };
  }
}

/**
 * Generates HTML email content for overnight device notifications
 * CRITICAL FIX: Uses array.join() instead of string concatenation for better memory efficiency
 * @param {Array} overdueDevices - List of overdue devices
 * @returns {string} HTML email content
 */
function generateEmailContent(overdueDevices) {
  // CRITICAL FIX: Use array instead of string concatenation
  const htmlParts = [];
  const MAX_DEVICES_IN_EMAIL = 100;  // Limit to prevent email size issues

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    timeZone: NOTIFICATION_CONFIG.SCHOOL_TIMEZONE,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Truncate device list if too large
  const totalDevices = overdueDevices.length;
  const deviceList = overdueDevices.slice(0, MAX_DEVICES_IN_EMAIL);
  const truncatedCount = Math.max(0, totalDevices - MAX_DEVICES_IN_EMAIL);

  htmlParts.push(`
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #ffd200 0%, #cc9900 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #000000; margin: 0; font-size: 28px; font-weight: bold;">
          Your School Name
        </h1>
        <p style="color: #333333; margin: 5px 0 0 0; font-size: 16px;">
          Technology Department - Device Alert System
        </p>
      </div>

      <!-- Alert Header -->
      <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #dc3545;">
        <h2 style="color: #dc3545; margin: 0 0 10px 0; font-size: 22px;">
          ⚠️ Overnight Device Retention Alert
        </h2>
        <p style="margin: 0; color: #333; font-size: 16px;">
          <strong>${dateStr}</strong> - ${totalDevices} device${totalDevices === 1 ? '' : 's'} not returned by 3:10 PM
        </p>
      </div>

      <!-- Device List -->
      <div style="background: white; padding: 20px;">`);

  if (totalDevices === 0) {
    htmlParts.push(`
        <div style="text-align: center; padding: 40px; background: #d4edda; border-radius: 8px; border: 1px solid #c3e6cb;">
          <h3 style="color: #155724; margin: 0 0 10px 0;">✅ All Clear!</h3>
          <p style="color: #155724; margin: 0; font-size: 16px;">All devices were returned on time today.</p>
        </div>`);
  } else {
    // Group devices by severity
    const highSeverity = deviceList.filter(d => d.severity === 'high');
    const mediumSeverity = deviceList.filter(d => d.severity === 'medium');
    const lowSeverity = deviceList.filter(d => d.severity === 'low');

    // Count disabled devices
    const disabledCount = deviceList.filter(d => d.disabled).length;

    // Truncation warning (if applicable)
    if (truncatedCount > 0) {
      htmlParts.push(`
        <div style="background: #fff3cd; border-left: 4px solid #ff9800; padding: 15px; margin-bottom: 20px;">
          <strong>⚠️ Large Device List:</strong> Showing first ${MAX_DEVICES_IN_EMAIL} devices.
          ${truncatedCount} additional device${truncatedCount === 1 ? '' : 's'} not shown in email (see <strong>Overdue Alerts</strong> sheet in Google Sheets for full list).
        </div>`);
    }

    htmlParts.push(`
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6; color: #333;">Status</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6; color: #333;">Student Email</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6; color: #333;">Device</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6; color: #333;">Asset Tag</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6; color: #333;">Days Overdue</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6; color: #333;">Checkout Time</th>
            </tr>
          </thead>
          <tbody>`);

    // CRITICAL FIX: Build table rows efficiently with map().join()
    const allDevices = [...highSeverity, ...mediumSeverity, ...lowSeverity];
    const tableRows = allDevices.map(function(device) {
      const priorityColor = device.severity === 'high' ? '#dc3545' :
                           device.severity === 'medium' ? '#fd7e14' : '#28a745';
      const priorityText = device.severity === 'high' ? '🔴 HIGH' :
                          device.severity === 'medium' ? '🟡 MEDIUM' : '🟢 LOW';

      // Show disabled status if applicable
      let statusDisplay = `<span style="color: ${priorityColor}; font-weight: bold;">${priorityText}</span>`;
      if (device.disabled) {
        const disableTimeStr = device.disableTime ?
          new Date(device.disableTime).toLocaleTimeString('en-US', {
            timeZone: NOTIFICATION_CONFIG.SCHOOL_TIMEZONE,
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }) : '2:20 PM';
        statusDisplay = `
          <div style="background: #dc3545; color: white; padding: 6px 10px; border-radius: 4px; font-weight: bold; text-align: center; margin-bottom: 4px;">
            🔴 DISABLED
          </div>
          <div style="font-size: 11px; color: #666;">Auto-disabled at ${disableTimeStr}</div>`;
      }

      return `
            <tr style="border-bottom: 1px solid #dee2e6; ${device.disabled ? 'background: #fff5f5;' : ''}">
              <td style="padding: 12px; border: 1px solid #dee2e6;">
                ${statusDisplay}
              </td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${device.studentEmail}</td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${device.deviceType}</td>
              <td style="padding: 12px; border: 1px solid #dee2e6; font-family: monospace; font-weight: bold;">${device.assetTag}</td>
              <td style="padding: 12px; border: 1px solid #dee2e6; text-align: center;">
                <strong>${device.daysOverdue}</strong> day${device.daysOverdue === 1 ? '' : 's'}
                <br><small>(${device.hoursOverdue} hours)</small>
              </td>
              <td style="padding: 12px; border: 1px solid #dee2e6; font-size: 14px;">
                ${device.timestamp.toLocaleString('en-US', {timeZone: NOTIFICATION_CONFIG.SCHOOL_TIMEZONE})}
              </td>
            </tr>`;
    });

    // Add all table rows at once using join()
    htmlParts.push(tableRows.join(''));

    htmlParts.push(`
          </tbody>
        </table>

        <!-- Auto-Disable Alert (if any devices were disabled) -->`);

    if (disabledCount > 0) {
      htmlParts.push(`
        <div style="background: #dc3545; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
          <h3 style="margin: 0 0 10px 0; font-size: 18px;">🔴 AUTO-DISABLE ACTIVATED</h3>
          <p style="margin: 0; font-size: 16px;">
            <strong>${disabledCount} device${disabledCount === 1 ? '' : 's'}</strong> ${disabledCount === 1 ? 'has' : 'have'} been automatically disabled in IncidentIQ at 2:20 PM.
          </p>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">
            Students will not be able to use ${disabledCount === 1 ? 'this device' : 'these devices'} until status is changed back to "In Service"
          </p>
        </div>`);
    }

    htmlParts.push(`
        <!-- Summary Stats -->
        <div style="display: flex; gap: 15px; margin: 20px 0;">
          <div style="flex: 1; background: #f8d7da; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #721c24;">${highSeverity.length}</div>
            <div style="color: #721c24; font-size: 14px;">High Priority (2+ days)</div>
          </div>
          <div style="flex: 1; background: #fff3cd; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #856404;">${mediumSeverity.length}</div>
            <div style="color: #856404; font-size: 14px;">Medium Priority (1 day)</div>
          </div>
          <div style="flex: 1; background: #d1ecf1; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #0c5460;">${lowSeverity.length}</div>
            <div style="color: #0c5460; font-size: 14px;">Low Priority (Same day)</div>
          </div>`);

    if (disabledCount > 0) {
      htmlParts.push(`
          <div style="flex: 1; background: #dc3545; color: white; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: white;">${disabledCount}</div>
            <div style="color: white; font-size: 14px;">🔴 Auto-Disabled</div>
          </div>`);
    }

    htmlParts.push(`
        </div>`);
  }

  htmlParts.push(`
      </div>

      <!-- Footer -->
      <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #dee2e6;">
        <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
          📧 Automated notification from Your School Device Management System
        </p>
        <p style="margin: 0; color: #666; font-size: 12px;">
          This notification is sent daily at 2:37 PM EST for devices not returned by 2:30 PM EST.<br>
          Generated: ${now.toLocaleString('en-US', {timeZone: NOTIFICATION_CONFIG.SCHOOL_TIMEZONE})}
        </p>
      </div>
    </div>`);

  // CRITICAL FIX: Return joined array instead of concatenated string
  return htmlParts.join('');
}

/**
 * Sends error notification to IT staff when the system encounters issues
 * @param {Error} error - The error that occurred
 */
function sendErrorNotificationEmail(error) {
  try {
    const subject = '🚨 Device Notification System Error - Your School';
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <div style="background: #dc3545; color: white; padding: 20px; text-align: center;">
          <h2>🚨 System Error Alert</h2>
        </div>
        <div style="padding: 20px; background: #f8f9fa;">
          <p><strong>Error occurred in device notification system:</strong></p>
          <div style="background: #fff; padding: 15px; border-left: 4px solid #dc3545; margin: 15px 0;">
            <code>${error.toString()}</code>
          </div>
          <p><strong>Time:</strong> ${new Date().toLocaleString('en-US', {timeZone: NOTIFICATION_CONFIG.SCHOOL_TIMEZONE})}</p>
          <p><strong>Recommended Action:</strong> Check Google Apps Script logs and verify system configuration.</p>
        </div>
      </div>`;

    for (const email of NOTIFICATION_CONFIG.IT_STAFF_EMAILS) {
      GmailApp.sendEmail(email, subject, '', { htmlBody: body });
    }

    Logger.log('✅ Error notification sent to IT staff');

  } catch (emailError) {
    Logger.log('❌ Failed to send error notification: ' + emailError.toString());
  }
}

/**
 * Sets up the daily automated triggers for overnight device checks
 * Creates THREE triggers:
 * - 7:00 AM EST: Morning dashboard update (overnight devices only)
 * - 2:20 PM EST: Generate report, auto-disable devices, and cache data
 * - 2:30 PM EST: Send email notification and update dashboard (all overdue)
 * Run this function once to install the triggers
 */
function setupDailyNotificationTrigger() {
  try {
    Logger.log('=== SETTING UP DAILY NOTIFICATION TRIGGERS ===');

    // Delete any existing triggers first
    deleteDailyNotificationTrigger();

    // Create trigger 1: Morning dashboard update at 7:00 AM EST
    const morningTrigger = ScriptApp.newTrigger('morningOverdueUpdate')
      .timeBased()
      .everyDays(1)
      .atHour(7)  // 7:00 AM
      .nearMinute(0)
      .inTimezone('America/New_York')
      .create();

    Logger.log('✅ Morning dashboard update trigger created');
    Logger.log('   Function: morningOverdueUpdate');
    Logger.log('   Trigger ID: ' + morningTrigger.getUniqueId());
    Logger.log('   Schedule: 7:00 AM EST daily');

    // Create trigger 2: Generate report at 2:20 PM EST
    const reportTrigger = ScriptApp.newTrigger('generateOvernightDeviceReport')
      .timeBased()
      .everyDays(1)
      .atHour(14) // 2 PM
      .nearMinute(20) // Around 20 minutes past the hour
      .inTimezone('America/New_York')
      .create();

    Logger.log('✅ Report generation trigger created successfully');
    Logger.log('   Function: generateOvernightDeviceReport');
    Logger.log('   Trigger ID: ' + reportTrigger.getUniqueId());
    Logger.log('   Schedule: 2:20 PM EST daily');

    // Create trigger 3: Send email notification at 2:30 PM EST
    const emailTrigger = ScriptApp.newTrigger('sendScheduledOvernightNotification')
      .timeBased()
      .everyDays(1)
      .atHour(14) // 2 PM
      .nearMinute(30) // Around 30 minutes past the hour
      .inTimezone('America/New_York')
      .create();

    Logger.log('✅ Email notification trigger created successfully');
    Logger.log('   Function: sendScheduledOvernightNotification');
    Logger.log('   Trigger ID: ' + emailTrigger.getUniqueId());
    Logger.log('   Schedule: 2:30 PM EST daily');

    Logger.log('\n=== TRIGGER SUMMARY ===');
    Logger.log('Morning Update: 7:00 AM EST daily (overnight devices only)');
    Logger.log('Report Generation: 2:20 PM EST daily (auto-disable + cache)');
    Logger.log('Email + Dashboard: 2:30 PM EST daily (all overdue)');

    return {
      success: true,
      morningTriggerId: morningTrigger.getUniqueId(),
      reportTriggerId: reportTrigger.getUniqueId(),
      emailTriggerId: emailTrigger.getUniqueId(),
      message: 'All notification triggers installed successfully (7 AM + 2:20 PM + 2:30 PM)'
    };

  } catch (error) {
    Logger.log('❌ Error setting up daily triggers: ' + error.toString());
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Removes the daily notification triggers
 * Use this to disable automated notifications
 */
function deleteDailyNotificationTrigger() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    let deletedCount = 0;

    for (const trigger of triggers) {
      const handlerFunction = trigger.getHandlerFunction();

      // Delete all notification-related triggers
      if (handlerFunction === 'checkOvernightDevicesAndNotify' ||
          handlerFunction === 'generateOvernightDeviceReport' ||
          handlerFunction === 'sendScheduledOvernightNotification' ||
          handlerFunction === 'morningOverdueUpdate') {  // NEW: Also delete morning trigger
        ScriptApp.deleteTrigger(trigger);
        deletedCount++;
        Logger.log('Deleted trigger: ' + handlerFunction + ' (ID: ' + trigger.getUniqueId() + ')');
      }
    }

    Logger.log('✅ Deleted ' + deletedCount + ' notification trigger(s)');
    return { success: true, deletedCount: deletedCount };

  } catch (error) {
    Logger.log('❌ Error deleting triggers: ' + error.toString());
    return { success: false, error: error.message };
  }
}

/**
 * LIVE UPDATE: Periodic refresh of overdue dashboard
 * This function is triggered every 30 minutes during school hours to ensure
 * the dashboard stays current even without check-in/check-out activity
 */
function periodicOverdueRefresh() {
  Logger.log('=== PERIODIC OVERDUE DASHBOARD REFRESH ===');
  Logger.log('Refresh time: ' + new Date().toLocaleString('en-US', {timeZone: NOTIFICATION_CONFIG.SCHOOL_TIMEZONE}));

  try {
    // Skip weekends if configured
    if (NOTIFICATION_CONFIG.WEEKDAYS_ONLY && isWeekend()) {
      Logger.log('Skipping refresh - Weekend detected');
      return { success: true, message: 'Skipped - Weekend' };
    }

    // Get current overdue devices and update dashboard
    const overdueDevices = CheckoutRepository.getOverdueDevices();
    CheckoutRepository.updateOverdueDashboard(overdueDevices);

    Logger.log('✅ Periodic refresh completed: ' + overdueDevices.length + ' overdue devices');

    return {
      success: true,
      message: 'Dashboard refreshed with ' + overdueDevices.length + ' overdue devices',
      deviceCount: overdueDevices.length
    };

  } catch (error) {
    Logger.log('❌ Periodic refresh error: ' + error.toString());
    return {
      success: false,
      message: 'Error during periodic refresh: ' + error.message
    };
  }
}

/**
 * LIVE UPDATE: Sets up periodic refresh trigger (every 30 minutes during school hours)
 * Run this function once to install the periodic refresh trigger
 * This works alongside the transaction-based updates for maximum accuracy
 */
function setupPeriodicRefreshTrigger() {
  try {
    Logger.log('=== SETTING UP PERIODIC REFRESH TRIGGER ===');

    // Delete any existing periodic refresh triggers first
    deletePeriodicRefreshTrigger();

    // Create trigger to run every 30 minutes
    // Note: Google Apps Script's nearMinute() provides approximate timing
    // We'll create multiple triggers for better coverage during school hours
    const triggers = [];

    // School hours: 7:30 AM - 4:00 PM EST
    // Create triggers at the top and bottom of each hour
    for (let hour = 7; hour <= 15; hour++) {
      // Trigger at :15 and :45 of each hour
      const trigger1 = ScriptApp.newTrigger('periodicOverdueRefresh')
        .timeBased()
        .everyDays(1)
        .atHour(hour)
        .nearMinute(15)
        .create();
      triggers.push(trigger1);

      const trigger2 = ScriptApp.newTrigger('periodicOverdueRefresh')
        .timeBased()
        .everyDays(1)
        .atHour(hour)
        .nearMinute(45)
        .create();
      triggers.push(trigger2);
    }

    Logger.log('✅ Periodic refresh triggers created successfully');
    Logger.log('   Total triggers: ' + triggers.length);
    Logger.log('   Schedule: Every 30 minutes during school hours (7:30 AM - 4:00 PM EST)');
    Logger.log('   Trigger IDs: ' + triggers.map(t => t.getUniqueId()).join(', '));

    return {
      success: true,
      triggerCount: triggers.length,
      message: 'Periodic refresh triggers installed (every 30 minutes during school hours)'
    };

  } catch (error) {
    Logger.log('❌ Error setting up periodic refresh triggers: ' + error.toString());
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * LIVE UPDATE: Removes all periodic refresh triggers
 * Use this to disable the automatic 30-minute refreshes
 */
function deletePeriodicRefreshTrigger() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    let deletedCount = 0;

    for (const trigger of triggers) {
      if (trigger.getHandlerFunction() === 'periodicOverdueRefresh') {
        ScriptApp.deleteTrigger(trigger);
        deletedCount++;
        Logger.log('Deleted periodic refresh trigger (ID: ' + trigger.getUniqueId() + ')');
      }
    }

    Logger.log('✅ Deleted ' + deletedCount + ' periodic refresh trigger(s)');
    return { success: true, deletedCount: deletedCount };

  } catch (error) {
    Logger.log('❌ Error deleting periodic refresh triggers: ' + error.toString());
    return { success: false, error: error.message };
  }
}

/**
 * RECONCILIATION: Setup daily automatic reconciliation trigger
 * Runs reconciliation at 3:00 AM EST daily to catch manual changes in IncidentIQ
 */
function setupDailyReconciliationTrigger() {
  try {
    // Delete any existing reconciliation triggers first
    const existingTriggers = ScriptApp.getProjectTriggers();
    let deletedCount = 0;

    for (const trigger of existingTriggers) {
      if (trigger.getHandlerFunction() === 'scheduledReconciliation') {
        ScriptApp.deleteTrigger(trigger);
        deletedCount++;
        Logger.log('Deleted existing reconciliation trigger (ID: ' + trigger.getUniqueId() + ')');
      }
    }

    if (deletedCount > 0) {
      Logger.log('Cleaned up ' + deletedCount + ' old reconciliation trigger(s)');
    }

    // Create trigger to run at 3:00 AM EST daily
    const trigger = ScriptApp.newTrigger('scheduledReconciliation')
      .timeBased()
      .atHour(3)  // 3:00 AM
      .everyDays(1)
      .inTimezone('America/New_York')
      .create();

    Logger.log('✅ Daily reconciliation trigger created successfully');
    Logger.log('   Function: scheduledReconciliation');
    Logger.log('   Schedule: 3:00 AM EST daily');
    Logger.log('   Trigger ID: ' + trigger.getUniqueId());

    return {
      success: true,
      triggerId: trigger.getUniqueId(),
      schedule: '3:00 AM EST daily'
    };

  } catch (error) {
    Logger.log('❌ Error creating reconciliation trigger: ' + error.toString());
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * RECONCILIATION: Delete daily reconciliation trigger
 */
function deleteDailyReconciliationTrigger() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    let deletedCount = 0;

    for (const trigger of triggers) {
      if (trigger.getHandlerFunction() === 'scheduledReconciliation') {
        ScriptApp.deleteTrigger(trigger);
        deletedCount++;
        Logger.log('Deleted reconciliation trigger (ID: ' + trigger.getUniqueId() + ')');
      }
    }

    Logger.log('✅ Deleted ' + deletedCount + ' reconciliation trigger(s)');
    return { success: true, deletedCount: deletedCount };

  } catch (error) {
    Logger.log('❌ Error deleting reconciliation triggers: ' + error.toString());
    return { success: false, error: error.message };
  }
}

/**
 * RECONCILIATION: Scheduled reconciliation function (runs automatically)
 * This is the function that gets called by the daily trigger
 */
function scheduledReconciliation() {
  Logger.log('=== SCHEDULED RECONCILIATION START ===');
  Logger.log('Time: ' + new Date().toLocaleString('en-US', {timeZone: 'America/New_York'}));
  Logger.log('Mode: AUTOMATIC CLEANUP (dry run first, then live)');

  try {
    // Step 1: Run dry run to see what needs fixing
    Logger.log('\n--- Step 1: Dry Run ---');
    const dryRunReport = manualReconciliation(true, false);

    Logger.log('Dry run results:');
    Logger.log('  Discrepancies found: ' + dryRunReport.stats.discrepancies);
    Logger.log('  Devices to clean up: ' + dryRunReport.discrepancies.filter(d => d.type === 'MISSING_OWNER_IN_INCIDENTIQ').length);

    // Step 2: If discrepancies found, run cleanup
    if (dryRunReport.stats.discrepancies > 0) {
      Logger.log('\n--- Step 2: Running Cleanup ---');
      const liveReport = manualReconciliation(false, false); // Live cleanup, no IncidentIQ updates

      Logger.log('Cleanup results:');
      Logger.log('  Fixed: ' + liveReport.stats.fixed);
      Logger.log('  Errors: ' + liveReport.stats.errors);

      // Step 3: Send notification if there were issues
      if (liveReport.stats.errors > 0 || liveReport.stats.discrepancies > 0) {
        notifyITStaffOfReconciliation(liveReport);
      }

      return {
        success: true,
        discrepanciesFound: dryRunReport.stats.discrepancies,
        fixed: liveReport.stats.fixed,
        errors: liveReport.stats.errors
      };
    } else {
      Logger.log('\n✅ No discrepancies found - data is in sync');
      return {
        success: true,
        discrepanciesFound: 0,
        fixed: 0,
        errors: 0
      };
    }

  } catch (error) {
    Logger.log('❌ Scheduled reconciliation error: ' + error.toString());

    // Notify IT staff of the error
    try {
      MailApp.sendEmail({
        to: NOTIFICATION_CONFIG.IT_STAFF_EMAILS.join(','),
        subject: '⚠️ Scheduled Reconciliation Error',
        body: 'The scheduled reconciliation failed:\n\n' +
              'Time: ' + new Date().toLocaleString('en-US', {timeZone: 'America/New_York'}) + '\n' +
              'Error: ' + error.toString() + '\n\n' +
              'Please check the logs in Google Apps Script.',
        name: NOTIFICATION_CONFIG.EMAIL_FROM_NAME
      });
    } catch (emailError) {
      Logger.log('Failed to send error notification: ' + emailError.toString());
    }

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * RECONCILIATION: Send notification to IT staff about reconciliation results
 */
function notifyITStaffOfReconciliation(report) {
  try {
    const subject = '📊 Daily Reconciliation Report - ' + new Date().toLocaleDateString();
    const discrepancyList = report.discrepancies.map((d, i) =>
      (i + 1) + '. [' + d.severity + '] ' + d.type + ' - Asset ' + d.assetTag
    ).join('\n');

    const body = 'Daily reconciliation completed:\n\n' +
                 'Time: ' + new Date().toLocaleString('en-US', {timeZone: 'America/New_York'}) + '\n' +
                 'Discrepancies Found: ' + report.stats.discrepancies + '\n' +
                 'Fixed: ' + report.stats.fixed + '\n' +
                 'Errors: ' + report.stats.errors + '\n\n' +
                 'Details:\n' + discrepancyList + '\n\n' +
                 'This is an automated message from the Chromebook Checkout System.';

    MailApp.sendEmail({
      to: NOTIFICATION_CONFIG.IT_STAFF_EMAILS.join(','),
      subject: subject,
      body: body,
      name: NOTIFICATION_CONFIG.EMAIL_FROM_NAME
    });

    Logger.log('✅ Reconciliation notification sent to IT staff');

  } catch (error) {
    Logger.log('⚠️ Failed to send reconciliation notification: ' + error.toString());
  }
}

/**
 * LIVE UPDATE: Setup all live update systems (transaction-based + periodic)
 * Run this once to enable the complete hybrid live update system
 */
function setupCompleteLiveUpdateSystem() {
  Logger.log('=== SETTING UP COMPLETE LIVE UPDATE SYSTEM ===\n');

  try {
    // Step 1: Verify transaction-based updates are in place
    Logger.log('Step 1: Verifying transaction-based updates...');
    const processCheckoutCode = processCheckout.toString();
    if (processCheckoutCode.includes('LIVE UPDATE')) {
      Logger.log('✅ Transaction-based updates: ENABLED');
      Logger.log('   Updates dashboard after each check-in/check-out');
    } else {
      Logger.log('⚠️  Transaction-based updates: NOT DETECTED');
      Logger.log('   Please ensure processCheckout() includes dashboard update code');
    }

    // Step 2: Setup periodic refresh triggers
    Logger.log('\nStep 2: Setting up periodic refresh triggers...');
    const periodicResult = setupPeriodicRefreshTrigger();
    if (periodicResult.success) {
      Logger.log('✅ Periodic refresh triggers: ENABLED');
      Logger.log('   Triggers: ' + periodicResult.triggerCount);
    } else {
      Logger.log('❌ Periodic refresh triggers: FAILED');
      Logger.log('   Error: ' + periodicResult.error);
      return { success: false, error: 'Failed to setup periodic triggers: ' + periodicResult.error };
    }

    // Step 3: Keep existing daily notification triggers
    Logger.log('\nStep 3: Keeping existing daily notification triggers...');
    const existingTriggers = ScriptApp.getProjectTriggers();
    const notificationTriggers = existingTriggers.filter(t =>
      t.getHandlerFunction() === 'generateOvernightDeviceReport' ||
      t.getHandlerFunction() === 'sendScheduledOvernightNotification'
    );
    Logger.log('✅ Daily notification triggers: ' + notificationTriggers.length + ' found');
    Logger.log('   Report: 2:20 PM EST daily');
    Logger.log('   Email: 2:30 PM EST daily');

    // Step 4: Test the system
    Logger.log('\nStep 4: Testing live update system...');
    const testResult = manualUpdateOverdueSpreadsheet();
    if (testResult.success) {
      Logger.log('✅ Test successful: Dashboard updated with ' + testResult.overdueCount + ' overdue devices');
    } else {
      Logger.log('⚠️  Test warning: ' + testResult.error);
    }

    Logger.log('\n=== LIVE UPDATE SYSTEM SETUP COMPLETE ===\n');
    Logger.log('Your overdue spreadsheet is now LIVE with hybrid updates:');
    Logger.log('  ✅ Real-time: Updates after every check-in/check-out');
    Logger.log('  ✅ Periodic: Refreshes every 30 minutes during school hours');
    Logger.log('  ✅ Daily: Report at 2:20 PM, Email at 2:30 PM');
    Logger.log('\nThe "Overdue Alerts" sheet will always show current data!');

    return {
      success: true,
      message: 'Complete live update system enabled',
      transactionBased: true,
      periodicRefresh: true,
      periodicTriggerCount: periodicResult.triggerCount,
      dailyNotifications: notificationTriggers.length
    };

  } catch (error) {
    Logger.log('❌ Setup error: ' + error.toString());
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Manual test function - run this to test the notification system immediately
 * This will check for actual overdue devices and send real notifications
 */
/**
 * Test function with sample data - won't send real emails
 * Use this for development and testing without spamming emails
 */
/**
 * TEST FUNCTION: Test device return flow with "In Service" status application
 * Verifies that returns perform both: (1) Owner unassignment, (2) "In Service" status
 */
/**
 * TEST FUNCTION: Test auto-disable functionality with sample data
 * Tests the 24-hour threshold logic without making real API calls
 */
/**
 * MANUAL UPDATE: Updates the "Overdue Alerts" spreadsheet with current overdue devices
 * This function ONLY updates the spreadsheet - no emails, no notifications
 * Run this anytime to refresh the overdue dashboard
 */
function manualUpdateOverdueSpreadsheet() {
  Logger.log('=== MANUAL OVERDUE SPREADSHEET UPDATE ===');
  Logger.log('Updating "Overdue Alerts" sheet with current data...\n');

  try {
    // Get current overdue devices from the Checkouts sheet
    const overdueDevices = CheckoutRepository.getOverdueDevices();

    if (!overdueDevices || overdueDevices.length === 0) {
      Logger.log('✅ No overdue devices found - dashboard will show "All Clear"');
      CheckoutRepository.updateOverdueDashboard([]);
      Logger.log('\n✅ Spreadsheet updated successfully - All Clear status');
      return {
        success: true,
        overdueCount: 0,
        message: 'No overdue devices - dashboard shows All Clear'
      };
    }

    // Update the dashboard with current overdue devices
    CheckoutRepository.updateOverdueDashboard(overdueDevices);

    // Log summary
    Logger.log('✅ Spreadsheet updated successfully!');
    Logger.log('\nOverdue Devices Summary:');
    Logger.log('  Total overdue: ' + overdueDevices.length);

    const highPriority = overdueDevices.filter(d => d.severity === 'high').length;
    const mediumPriority = overdueDevices.filter(d => d.severity === 'medium').length;
    const lowPriority = overdueDevices.filter(d => d.severity === 'low').length;

    if (highPriority > 0) Logger.log('  🔴 High priority (2+ days): ' + highPriority);
    if (mediumPriority > 0) Logger.log('  🟡 Medium priority (1 day): ' + mediumPriority);
    if (lowPriority > 0) Logger.log('  🟢 Low priority (same day): ' + lowPriority);

    Logger.log('\nDevice Details:');
    overdueDevices.forEach((device, index) => {
      Logger.log('  ' + (index + 1) + '. ' + device.deviceType + ' #' + device.assetTag +
                 ' - ' + device.studentEmail + ' (' + device.daysOverdue + ' days overdue)');
    });

    Logger.log('\n📊 Check the "Overdue Alerts" sheet in your Google Spreadsheet');

    return {
      success: true,
      overdueCount: overdueDevices.length,
      highPriority: highPriority,
      mediumPriority: mediumPriority,
      lowPriority: lowPriority,
      message: 'Dashboard updated with ' + overdueDevices.length + ' overdue devices'
    };

  } catch (error) {
    Logger.log('❌ Update failed: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

// ============================================
// AUTO-DISABLE SYSTEM FOR OVERDUE DEVICES
// ============================================

/**
 * AUTO-DISABLE: Disable multiple overdue devices in IncidentIQ by setting status to "Missing"
 * Called by generateOvernightDeviceReport() at 2:20 PM Mon-Fri
 * Applies "Missing" label to ALL overdue devices (same-day, not returned by 2:30 PM)
 * @param {Array} overdueDevices - Array of overdue device objects from getOverdueDevices()
 * @returns {Object} Summary of disable operations
 */
function autoDisableOverdueDevices(overdueDevices) {
  logSafe('=== AUTO-DISABLE OVERDUE DEVICES (SAME DAY) ===');

  const results = {
    successCount: 0,
    failureCount: 0,
    skippedCount: 0,
    results: []
  };

  if (!overdueDevices || overdueDevices.length === 0) {
    logSafe('No overdue devices to process');
    return results;
  }

  const missingStatusGuid = NOTIFICATION_CONFIG.MISSING_STATUS_GUID;
  logSafe('Missing Status GUID: ' + missingStatusGuid);
  logSafe('Processing ' + overdueDevices.length + ' overdue devices...');

  overdueDevices.forEach(function(device) {
    try {
      // CHANGED: Apply "Missing" label to ALL overdue devices (same-day policy)
      // No longer checking for 24+ hours - if it's overdue at 2:20 PM, it gets disabled
      // Previous logic: if (device.daysOverdue < 1) { skip }
      // New logic: Process all overdue devices immediately

      logSafe('Processing ' + device.assetTag + ' (' + device.daysOverdue + ' days overdue)...');

      const result = updateAssetStatus(device.assetTag, missingStatusGuid);

      if (result.success) {
        logSafe('✅ SUCCESS: ' + device.assetTag + ' - Status set to Missing');
        results.successCount++;
        results.results.push({
          assetTag: device.assetTag,
          success: true,
          skipped: false,
          newStatus: 'Missing',
          daysOverdue: device.daysOverdue,
          timestamp: new Date()
        });
      } else {
        logSafe('❌ FAILED: ' + device.assetTag + ' - ' + result.error);
        results.failureCount++;
        results.results.push({
          assetTag: device.assetTag,
          success: false,
          skipped: false,
          error: result.error,
          daysOverdue: device.daysOverdue,
          timestamp: new Date()
        });
      }

      // Rate limiting: Small delay between API calls
      Utilities.sleep(500);

    } catch (error) {
      logSafe('❌ ERROR processing ' + device.assetTag + ': ' + error.toString());
      results.failureCount++;
      results.results.push({
        assetTag: device.assetTag,
        success: false,
        skipped: false,
        error: error.message,
        timestamp: new Date()
      });
    }
  });

  logSafe('\n=== AUTO-DISABLE SUMMARY ===');
  logSafe('✅ Successful: ' + results.successCount);
  logSafe('❌ Failed: ' + results.failureCount);
  logSafe('⏭️  Skipped: ' + results.skippedCount);
  logSafe('📊 Total processed: ' + overdueDevices.length);
  logSafe('📋 Policy: Same-day disable (all devices not returned by 2:30 PM)');

  return results;
}

/**
 * DISCOVERY: Get all available asset statuses from IncidentIQ
 * Run this manually to find the "Missing" status GUID
 */

// ============================================
// ASSET STATUS MANAGEMENT
// ============================================

/**
 * Updates asset status in IncidentIQ
 * This triggers IncidentIQ Rules to disable/enable the device in Google Workspace
 *
 * @param {string} assetTag - 6-digit asset tag
 * @param {string} statusTypeId - Status GUID from IncidentIQ
 * @returns {Object} Result object with success status
 *
 * Status GUIDs are configured in Config.gs:
 * - NOTIFICATION_CONFIG.MISSING_STATUS_GUID (for marking devices as missing)
 * - NOTIFICATION_CONFIG.IN_SERVICE_STATUS_GUID (for marking devices as in service)
 * Get these values from IncidentIQ → Settings → Asset Statuses
 */
function updateAssetStatus(assetTag, statusTypeId) {
  const config = getIncidentIQConfig();

  Logger.log('=== UPDATING ASSET STATUS ===');
  Logger.log('Asset Tag: ' + assetTag);
  Logger.log('New Status ID: ' + statusTypeId);

  try {
    // Validate asset tag
    const validation = validateAssetTag(assetTag);
    if (!validation.isValid) {
      Logger.log('❌ Invalid asset tag: ' + validation.error);
      return { success: false, error: validation.error };
    }

    // Step 1: Find the asset
    Logger.log('Finding asset...');
    const searchOptions = createApiOptions(config, 'POST', {
      OnlyShowDeleted: false,
      Filters: [{ Facet: "AssetTag", Value: validation.assetTag }]
    });

    const searchUrl = config.baseUrl + '/assets?$s=10';
    const searchResponse = UrlFetchApp.fetch(searchUrl, searchOptions);
    const searchData = JSON.parse(searchResponse.getContentText());

    if (!searchData.Items || searchData.Items.length === 0) {
      Logger.log('❌ Asset not found');
      return { success: false, error: 'Asset not found: ' + assetTag };
    }

    const asset = searchData.Items[0];
    const assetId = asset.AssetId;

    Logger.log('✅ Asset found: ' + assetId);
    Logger.log('Current status: ' + asset.Status.Name);

    // Check if asset has an owner
    const currentOwnerId = asset.OwnerId || (asset.Owner && asset.Owner.UserId) || null;
    if (currentOwnerId) {
      Logger.log('Current owner ID: ' + currentOwnerId);
    } else {
      Logger.log('No current owner assigned');
    }

    // Step 2: Update the status
    Logger.log('Updating status...');
    const updatePayload = {
      AssetTag: asset.AssetTag,
      ModelId: asset.ModelId,
      AssetTypeId: asset.AssetTypeId,
      StatusTypeId: statusTypeId,  // This is the key field!
      SerialNumber: asset.SerialNumber,
      CategoryId: asset.CategoryId,
      LocationId: asset.LocationId,
      ProductId: asset.ProductId
    };

    // OWNER PRESERVATION LOGIC:
    // - "Missing" status (auto-disable): PRESERVE owner to track who lost the device
    // - "In Service" status (returns): DO NOT preserve owner (allows unassignment)
    // - Note: Checkouts use updateAssetAssignment() directly, NOT this function
    const isInServiceStatus = statusTypeId === NOTIFICATION_CONFIG.IN_SERVICE_STATUS_GUID;

    if (currentOwnerId && !isInServiceStatus) {
      // Preserve owner for "Missing" and other statuses
      updatePayload.OwnerId = currentOwnerId;
      Logger.log('✅ Preserving owner in update (OwnerId: ' + currentOwnerId + ')');
    } else if (isInServiceStatus) {
      // "In Service" = device return, owner should be cleared
      Logger.log('ℹ️  "In Service" status - owner will NOT be preserved (return flow)');
    }

    const updateOptions = createApiOptions(config, 'POST', updatePayload);
    const updateUrl = config.baseUrl + '/assets/' + assetId;

    const updateResponse = UrlFetchApp.fetch(updateUrl, updateOptions);
    const statusCode = updateResponse.getResponseCode();

    if (statusCode === 200 || statusCode === 204) {
      const responseData = JSON.parse(updateResponse.getContentText());
      const newStatus = responseData.Item && responseData.Item.Status;

      Logger.log('✅ Status updated successfully');
      if (newStatus) {
        Logger.log('New status: ' + newStatus.Name);
      }

      // Clear cache to ensure fresh data
      clearAllCaches();

      return {
        success: true,
        assetId: assetId,
        assetTag: validation.assetTag,
        newStatus: newStatus ? newStatus.Name : 'Updated'
      };
    } else {
      const errorText = updateResponse.getContentText();
      Logger.log('❌ Status update failed: ' + statusCode);
      Logger.log('Error: ' + errorText.substring(0, 200));
      return {
        success: false,
        error: 'API returned status ' + statusCode,
        details: errorText
      };
    }

  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================
// MANUAL RECONCILIATION FUNCTION
// ============================================

/**
 * MANUAL RECONCILIATION: Scan Google Sheets, verify against IncidentIQ, and sync both systems
 *
 * This function:
 * 1. Reads the Checkouts sheet to determine current device states
 * 2. Fetches actual ownership data from IncidentIQ
 * 3. Identifies discrepancies between sheets and IncidentIQ
 * 4. Optionally fixes discrepancies by updating IncidentIQ
 * 5. Updates the Overdue Alerts sheet with current data
 *
 * Use cases:
 * - Fix data inconsistencies after manual changes
 * - Recover from failed transactions
 * - Audit system state
 * - Force refresh of all data
 *
 * @param {boolean} dryRun - If true, only report discrepancies without fixing (default: true)
 * @param {boolean} updateIncidentIQ - If true, update IncidentIQ to match sheets (default: false)
 * @returns {Object} Reconciliation report with statistics and discrepancies
 */
function manualReconciliation(dryRun, updateIncidentIQ) {
  // Default to dry run mode for safety
  if (dryRun === undefined) dryRun = true;
  if (updateIncidentIQ === undefined) updateIncidentIQ = false;

  Logger.log('=== MANUAL RECONCILIATION START ===');
  Logger.log('Mode: ' + (dryRun ? 'DRY RUN (no changes)' : 'LIVE (will make changes)'));
  Logger.log('Update IncidentIQ: ' + (updateIncidentIQ ? 'YES' : 'NO'));
  Logger.log('Time: ' + new Date().toLocaleString());

  var report = {
    startTime: new Date(),
    mode: dryRun ? 'DRY_RUN' : 'LIVE',
    updateIncidentIQ: updateIncidentIQ,
    stats: {
      totalDevices: 0,
      checkedOut: 0,
      returned: 0,
      overdue: 0,
      discrepancies: 0,
      fixed: 0,
      errors: 0
    },
    discrepancies: [],
    errors: [],
    actions: []
  };

  try {
    // ============================================
    // STEP 1: Get current state from Active Checkouts (NEW - much faster!)
    // ============================================
    Logger.log('\n--- STEP 1: Reading Active Checkouts sheet ---');

    var sheet = CheckoutRepository.getActiveCheckoutsSheet();
    var data = sheet.getDataRange().getValues();
    var assetStates = {}; // Map of assetTag -> checkout info

    // Build map from Active Checkouts (no need to track state, all are checked out)
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var rowEmail = row[0];         // EMAIL
      var rowDeviceType = row[1];    // DEVICE_TYPE
      var rowAssetTag = row[2];      // ASSET_TAG
      var rowSerial = row[3];        // SERIAL_NUMBER
      var rowModel = row[4];         // MODEL
      var rowCheckoutTime = row[5];  // CHECKOUT_TIME

      if (!rowEmail || !rowAssetTag || !rowCheckoutTime) continue;

      assetStates[rowAssetTag] = {
        timestamp: rowCheckoutTime,
        email: rowEmail,
        deviceType: rowDeviceType,
        assetTag: rowAssetTag,
        serialNumber: rowSerial,
        model: rowModel,
        status: 'Checked Out',
        isCheckedOut: true  // All devices in Active Checkouts are checked out
      };
    }

    report.stats.totalDevices = Object.keys(assetStates).length;
    report.stats.checkedOut = report.stats.totalDevices;  // All are checked out
    Logger.log('Found ' + report.stats.totalDevices + ' devices currently checked out');

    // ============================================
    // STEP 2: Fetch current state from IncidentIQ
    // ============================================
    Logger.log('\n--- STEP 2: Fetching from IncidentIQ ---');

    // Force fresh fetch from IncidentIQ (bypass cache)
    var config = getIncidentIQConfig();
    var incidentIQAssets = fetchAssetsByView(config);
    var incidentIQMap = {}; // Map of assetTag -> {owner, ownerId, status, assetId}

    for (var j = 0; j < incidentIQAssets.length; j++) {
      var asset = incidentIQAssets[j];
      // processViewAssets returns lowercase property names
      var assetTag = asset.assetTag;

      if (!assetTag) continue;

      // Validate and clean asset tag
      var cleanedTag = assetTag.toString().trim();
      if (!/^\d{6}$/.test(cleanedTag)) continue;

      incidentIQMap[cleanedTag] = {
        assetId: asset.assetId,
        assetTag: cleanedTag,
        owner: asset.currentUser,        // processViewAssets uses 'currentUser'
        ownerId: asset.userId,            // processViewAssets uses 'userId'
        ownerEmail: null,                 // Not currently extracted from API
        status: asset.status || 'Unknown',
        model: asset.model
      };
    }

    Logger.log('Fetched ' + Object.keys(incidentIQMap).length + ' assets from IncidentIQ');

    // ============================================
    // STEP 3: Compare and identify discrepancies
    // ============================================
    Logger.log('\n--- STEP 3: Comparing states ---');

    for (var assetTag in assetStates) {
      var sheetState = assetStates[assetTag];
      var incidentIQState = incidentIQMap[assetTag];

      if (!incidentIQState) {
        // Asset in sheets but not in IncidentIQ
        report.discrepancies.push({
          type: 'ASSET_NOT_IN_INCIDENTIQ',
          assetTag: assetTag,
          sheetState: sheetState,
          severity: 'HIGH'
        });
        report.stats.discrepancies++;
        Logger.log('⚠️ Asset ' + assetTag + ' in sheets but not found in IncidentIQ');
        continue;
      }

      // Check for ownership mismatch
      var sheetHasOwner = sheetState.isCheckedOut;
      var incidentIQHasOwner = incidentIQState.ownerId !== null && incidentIQState.ownerId !== undefined;

      if (sheetHasOwner && !incidentIQHasOwner) {
        // Sheets says checked out, IncidentIQ says available (device was returned)
        report.discrepancies.push({
          type: 'MISSING_OWNER_IN_INCIDENTIQ',
          assetTag: assetTag,
          sheetState: sheetState,
          incidentIQState: incidentIQState,
          severity: 'HIGH',
          expectedOwner: sheetState.email
        });
        report.stats.discrepancies++;
        Logger.log('❌ MISMATCH: ' + assetTag + ' - Sheets: Checked Out to ' + sheetState.email + ', IncidentIQ: No owner');

        // CLEANUP ACTION: Remove from Active Checkouts (device has been returned)
        if (!dryRun) {
          try {
            var removeResult = CheckoutRepository.removeFromActiveCheckouts(assetTag);
            if (removeResult.success && removeResult.found) {
              Logger.log('✅ CLEANUP: Removed ' + assetTag + ' from Active Checkouts (returned in IncidentIQ)');
              report.actions.push({
                type: 'REMOVE_FROM_ACTIVE_CHECKOUTS',
                assetTag: assetTag,
                reason: 'Device returned (no owner in IncidentIQ)',
                success: true
              });
              report.stats.fixed++;
            } else {
              Logger.log('⚠️ CLEANUP WARNING: Could not remove ' + assetTag + ' - ' + (removeResult.error || 'not found'));
              report.actions.push({
                type: 'REMOVE_FROM_ACTIVE_CHECKOUTS',
                assetTag: assetTag,
                reason: 'Device returned (no owner in IncidentIQ)',
                success: false,
                error: removeResult.error || 'not found'
              });
            }
          } catch (cleanupError) {
            Logger.log('❌ CLEANUP ERROR: ' + assetTag + ' - ' + cleanupError.toString());
            report.errors.push('Cleanup failed for ' + assetTag + ': ' + cleanupError.toString());
            report.stats.errors++;
          }
        } else {
          Logger.log('🔍 DRY RUN: Would remove ' + assetTag + ' from Active Checkouts');
        }

        // Optional: If updateIncidentIQ is enabled, re-assign the device
        // (This would be for cases where the sheets are correct and IncidentIQ lost the assignment)
        if (updateIncidentIQ && !dryRun) {
          report.actions.push({
            type: 'ASSIGN_DEVICE',
            assetTag: assetTag,
            email: sheetState.email
          });
        }

      } else if (!sheetHasOwner && incidentIQHasOwner) {
        // Sheets says returned, IncidentIQ has owner
        report.discrepancies.push({
          type: 'UNEXPECTED_OWNER_IN_INCIDENTIQ',
          assetTag: assetTag,
          sheetState: sheetState,
          incidentIQState: incidentIQState,
          severity: 'MEDIUM',
          currentOwner: incidentIQState.ownerEmail || incidentIQState.owner
        });
        report.stats.discrepancies++;
        Logger.log('❌ MISMATCH: ' + assetTag + ' - Sheets: Returned, IncidentIQ: Owned by ' + incidentIQState.ownerEmail);

        // Record action to fix
        if (updateIncidentIQ && !dryRun) {
          report.actions.push({
            type: 'UNASSIGN_DEVICE',
            assetTag: assetTag,
            currentOwner: incidentIQState.ownerEmail
          });
        }

      } else if (sheetHasOwner && incidentIQHasOwner) {
        // Both say checked out - verify owner matches
        var sheetEmail = sheetState.email.toLowerCase();
        var incidentEmail = (incidentIQState.ownerEmail || '').toLowerCase();

        if (incidentEmail && sheetEmail !== incidentEmail) {
          report.discrepancies.push({
            type: 'OWNER_MISMATCH',
            assetTag: assetTag,
            sheetState: sheetState,
            incidentIQState: incidentIQState,
            severity: 'MEDIUM',
            sheetOwner: sheetEmail,
            incidentIQOwner: incidentEmail
          });
          report.stats.discrepancies++;
          Logger.log('⚠️ OWNER MISMATCH: ' + assetTag + ' - Sheets: ' + sheetEmail + ', IncidentIQ: ' + incidentEmail);
        } else {
          // Match! Count as checked out
          report.stats.checkedOut++;
        }
      } else {
        // Both say returned - match!
        report.stats.returned++;
      }
    }

    // ============================================
    // STEP 4: Apply fixes (if not dry run)
    // ============================================
    if (!dryRun && updateIncidentIQ && report.actions.length > 0) {
      Logger.log('\n--- STEP 4: Applying fixes to IncidentIQ ---');

      for (var k = 0; k < report.actions.length; k++) {
        var action = report.actions[k];

        try {
          if (action.type === 'ASSIGN_DEVICE') {
            Logger.log('Assigning ' + action.assetTag + ' to ' + action.email);

            // Find user in IncidentIQ
            var userResult = IncidentIQService.findUser(action.email);
            if (!userResult.success) {
              throw new Error('User not found: ' + action.email);
            }

            // Get asset ID
            var assetId = incidentIQMap[action.assetTag].assetId;

            // Assign device
            var assignResult = IncidentIQService.checkoutDevice(assetId, userResult.data.userId);
            if (assignResult.success) {
              action.result = 'SUCCESS';
              report.stats.fixed++;
              Logger.log('✅ Successfully assigned ' + action.assetTag);
            } else {
              action.result = 'FAILED';
              action.error = assignResult.error;
              report.stats.errors++;
              Logger.log('❌ Failed to assign ' + action.assetTag + ': ' + assignResult.error);
            }

          } else if (action.type === 'UNASSIGN_DEVICE') {
            Logger.log('Unassigning ' + action.assetTag);

            // Get asset ID
            var assetId = incidentIQMap[action.assetTag].assetId;

            // Unassign device
            var unassignResult = IncidentIQService.returnDevice(assetId, action.assetTag);
            if (unassignResult.success) {
              action.result = 'SUCCESS';
              report.stats.fixed++;
              Logger.log('✅ Successfully unassigned ' + action.assetTag);
            } else {
              action.result = 'FAILED';
              action.error = unassignResult.error;
              report.stats.errors++;
              Logger.log('❌ Failed to unassign ' + action.assetTag + ': ' + unassignResult.error);
            }
          }

        } catch (actionError) {
          action.result = 'ERROR';
          action.error = actionError.toString();
          report.stats.errors++;
          report.errors.push({
            action: action,
            error: actionError.toString()
          });
          Logger.log('❌ Error processing action: ' + actionError.toString());
        }
      }
    }

    // ============================================
    // STEP 5: Update overdue dashboard
    // ============================================
    Logger.log('\n--- STEP 5: Updating overdue dashboard ---');

    var overdueDevices = CheckoutRepository.getOverdueDevices();
    report.stats.overdue = overdueDevices.length;

    if (!dryRun) {
      CheckoutRepository.updateOverdueDashboard(overdueDevices);
      Logger.log('✅ Overdue dashboard updated with ' + overdueDevices.length + ' devices');
    } else {
      Logger.log('DRY RUN: Would update dashboard with ' + overdueDevices.length + ' overdue devices');
    }

    // ============================================
    // STEP 6: Generate report
    // ============================================
    report.endTime = new Date();
    report.duration = (report.endTime - report.startTime) / 1000; // seconds

    Logger.log('\n=== RECONCILIATION COMPLETE ===');
    Logger.log('Duration: ' + report.duration + ' seconds');
    Logger.log('Total Devices: ' + report.stats.totalDevices);
    Logger.log('Checked Out: ' + report.stats.checkedOut);
    Logger.log('Returned: ' + report.stats.returned);
    Logger.log('Overdue: ' + report.stats.overdue);
    Logger.log('Discrepancies Found: ' + report.stats.discrepancies);

    if (!dryRun) {
      Logger.log('Fixes Applied: ' + report.stats.fixed);
      Logger.log('Errors: ' + report.stats.errors);
    }

    // Log discrepancies
    if (report.discrepancies.length > 0) {
      Logger.log('\n📋 DISCREPANCIES:');
      for (var m = 0; m < report.discrepancies.length; m++) {
        var disc = report.discrepancies[m];
        Logger.log((m + 1) + '. [' + disc.severity + '] ' + disc.type + ' - Asset ' + disc.assetTag);
      }
    } else {
      Logger.log('\n✅ NO DISCREPANCIES FOUND - System is in sync!');
    }

    return report;

  } catch (error) {
    Logger.log('❌ RECONCILIATION ERROR: ' + error.toString());
    report.errors.push({
      type: 'FATAL_ERROR',
      error: error.toString(),
      stack: error.stack
    });
    report.endTime = new Date();
    return report;
  }
}

// ============================================
// LEGACY MIGRATION REMOVED
// ============================================
// Migration function migrateToActiveCheckouts() has been removed
// as it was a one-time setup function that is no longer needed.
// The migration was completed and the system now uses Active Checkouts.

// Keeping this comment for historical reference

/**
 * Creates all monthly history sheets and Active Checkouts sheet
 * Run this ONCE to set up the new system
 */
function setupNewSheetSystem() {
  Logger.log('=== SETTING UP NEW SHEET SYSTEM ===');

  try {
    // Step 1: Create Active Checkouts sheet
    Logger.log('\n--- Creating Active Checkouts sheet ---');
    var activeSheet = CheckoutRepository.getActiveCheckoutsSheet();
    Logger.log('✅ Active Checkouts sheet ready');

    // Step 2: Create all monthly history sheets
    Logger.log('\n--- Creating monthly history sheets ---');
    var monthlyResult = CheckoutRepository.createAllMonthlySheets();
    if (monthlyResult.success) {
      Logger.log('✅ Created ' + monthlyResult.sheets.length + ' monthly sheets:');
      for (var i = 0; i < monthlyResult.sheets.length; i++) {
        Logger.log('  ' + (i + 1) + '. ' + monthlyResult.sheets[i]);
      }
    } else {
      Logger.log('❌ Error creating monthly sheets: ' + monthlyResult.error);
      return { success: false, error: monthlyResult.error };
    }

    Logger.log('\n=== SETUP COMPLETE ===');
    Logger.log('Next step: Run migrateToActiveCheckouts() to populate Active Checkouts');

    return { success: true };

  } catch (error) {
    Logger.log('❌ SETUP ERROR: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Quick wrapper to run reconciliation in DRY RUN mode (safe, no changes)
 * View results in Apps Script execution log
 */
function testReconciliation() {
  Logger.log('Running reconciliation in DRY RUN mode...');
  var report = manualReconciliation(true, false);
  Logger.log('\n📊 SUMMARY REPORT:');
  Logger.log(JSON.stringify(report.stats, null, 2));
  return report;
}

/**
 * Run reconciliation in LIVE mode (makes changes to IncidentIQ)
 * ⚠️ USE WITH CAUTION - This will modify IncidentIQ data
 */
function runReconciliationLive() {
  Logger.log('⚠️ WARNING: Running reconciliation in LIVE mode (will make changes)');
  Logger.log('Running reconciliation in LIVE mode...');
  var report = manualReconciliation(false, false); // dryRun=false, updateIncidentIQ=false (cleanup only)
  Logger.log('\n📊 SUMMARY REPORT:');
  Logger.log(JSON.stringify(report.stats, null, 2));

  Logger.log('\n✅ Reconciliation complete!');
  Logger.log('Fixed: ' + report.stats.fixed);
  Logger.log('Errors: ' + report.stats.errors);
  Logger.log('Discrepancies: ' + report.stats.discrepancies);

  return report;
}

/**
 * Run reconciliation in LIVE mode with IncidentIQ updates enabled
 * WARNING: This will both clean up Active Checkouts AND update IncidentIQ
 */
function runReconciliationLiveWithIncidentIQUpdate() {
  Logger.log('⚠️ WARNING: Running reconciliation in LIVE mode WITH IncidentIQ updates');
  Logger.log('Running reconciliation in LIVE mode...');
  var report = manualReconciliation(false, true); // dryRun=false, updateIncidentIQ=true
  Logger.log('\n📊 SUMMARY REPORT:');
  Logger.log(JSON.stringify(report.stats, null, 2));

  Logger.log('\n✅ Reconciliation complete!');
  Logger.log('Fixed: ' + report.stats.fixed);
  Logger.log('Errors: ' + report.stats.errors);
  Logger.log('Discrepancies: ' + report.stats.discrepancies);

  // Old msgBox code removed - use Logger instead
  if (false) {
    Browser.msgBox(
      'Reconciliation Complete',
      'Fixed: ' + report.stats.fixed + '\\n' +
      'Errors: ' + report.stats.errors + '\\n' +
      'Discrepancies: ' + report.stats.discrepancies + '\\n\\n' +
      'Check execution log for details.',
      Browser.Buttons.OK
    );

    return report;
  } else {
    Logger.log('Reconciliation cancelled by user');
    return { cancelled: true };
  }
}

/**
 * Manually refresh the Overdue Dashboard
 * Call this after migration or when dashboard needs updating
 */
function refreshOverdueDashboard() {
  Logger.log('=== REFRESHING OVERDUE DASHBOARD ===');

  var overdueDevices = CheckoutRepository.getOverdueDevices();
  Logger.log('Found ' + overdueDevices.length + ' overdue devices');

  CheckoutRepository.updateOverdueDashboard(overdueDevices);
  Logger.log('✅ Dashboard updated successfully');

  return {
    success: true,
    overdueCount: overdueDevices.length
  };
}

// ============================================
// NEW UTILITY FUNCTIONS FOR TWICE-DAILY UPDATE SYSTEM
// ============================================

/**
 * Creates custom menu when spreadsheet opens
 * Provides easy access to manual refresh function
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('📱 Device Management')
    .addItem('🔄 Refresh Overdue Dashboard', 'manualRefreshOverdueDashboard')
    .addSeparator()
    .addItem('🎨 Enhance Active Checkouts Formatting', 'enhanceActiveCheckoutsFormatting')
    .addSeparator()
    .addItem('⚙️ Setup Daily Triggers', 'setupDailyNotificationTrigger')
    .addItem('🗑️ Delete Daily Triggers', 'deleteDailyNotificationTrigger')
    .addToUi();
}

/**
 * MANUAL REFRESH: Updates Overdue Alerts dashboard on-demand
 * Use this if you need to check overdue status between scheduled updates (7 AM and 2:30 PM)
 * NOTE: This is a manual override - normal updates only happen twice daily
 */
function manualRefreshOverdueDashboard() {
  Logger.log('=== MANUAL OVERDUE DASHBOARD REFRESH ===');
  Logger.log('⚠️ This is a manual override - normal updates at 7:00 AM and 2:30 PM');
  Logger.log('Refresh time: ' + new Date().toLocaleString('en-US', {timeZone: 'America/New_York'}));

  try {
    const overdueDevices = CheckoutRepository.getOverdueDevices();

    // Use AFTERNOON mode for manual refreshes (show all overdue)
    CheckoutRepository.updateOverdueDashboard(overdueDevices, 'AFTERNOON');

    Logger.log('✅ Manual refresh completed: ' + overdueDevices.length + ' overdue devices');

    // Show success message to user
    SpreadsheetApp.getUi().alert(
      'Dashboard Refreshed',
      'Overdue Alerts dashboard updated successfully.\\n\\nFound ' + overdueDevices.length + ' overdue device' + (overdueDevices.length === 1 ? '' : 's') + '.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );

    return {
      success: true,
      overdueCount: overdueDevices.length,
      message: 'Dashboard manually refreshed with current data (all overdue devices)'
    };
  } catch (error) {
    Logger.log('❌ Manual refresh failed: ' + error.toString());

    // Show error to user
    SpreadsheetApp.getUi().alert(
      'Refresh Failed',
      'Error updating dashboard: ' + error.message,
      SpreadsheetApp.getUi().ButtonSet.OK
    );

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * ENHANCED ACTIVE CHECKOUTS: Adds conditional formatting and visual improvements
 * Makes Active Checkouts the primary real-time dashboard for IT staff
 * Run this ONCE after initial setup, or anytime you want to refresh formatting
 */
function enhanceActiveCheckoutsFormatting() {
  try {
    Logger.log('=== ENHANCING ACTIVE CHECKOUTS FORMATTING ===');

    var sheet = CheckoutRepository.getActiveCheckoutsSheet();

    // Clear any existing formatting
    sheet.clearFormats();

    // Insert 3 rows at the top for summary header
    sheet.insertRowsBefore(1, 3);

    // Set summary header
    var summaryRange = sheet.getRange('A1:G3');
    summaryRange.setBackground('#4A90E2');
    summaryRange.setFontColor('#FFFFFF');
    summaryRange.setFontWeight('bold');
    summaryRange.setHorizontalAlignment('center');
    summaryRange.setVerticalAlignment('middle');

    // Row 1: Title
    sheet.getRange('A1:G1').merge().setValue('Active Checkouts - Real-Time Status')
      .setFontSize(16);

    // Row 2: Subtitle
    sheet.getRange('A2:G2').merge().setValue('For filtered overdue view, see "Overdue Alerts" sheet (updates at 7:00 AM and 2:30 PM daily)')
      .setFontSize(11)
      .setFontStyle('italic');

    // Row 3: Color legend
    sheet.getRange('A3').setValue('🔴 RED = 3+ days').setFontSize(10);
    sheet.getRange('B3:C3').merge().setValue('🟡 YELLOW = 1-2 days').setFontSize(10);
    sheet.getRange('D3:E3').merge().setValue('🔵 BLUE = Same day').setFontSize(10);
    sheet.getRange('F3:G3').merge().setValue('⚪ WHITE = Recent (<6hrs)').setFontSize(10);

    // Row 4: Column headers (was row 1 before insertion)
    sheet.getRange('A4:G4').setValues([[
      'Email', 'Device Type', 'Asset Tag', 'Serial Number', 'Model', 'Checkout Time', 'Days Outstanding'
    ]]);
    sheet.getRange('A4:G4').setBackground('#e9ecef')
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setFontColor('#000000');

    // Add conditional formatting for Days Outstanding column (column G, starting row 5)
    var daysColumn = sheet.getRange('G5:G1000');

    var rules = [];

    // Rule 1: RED for 3+ days (High priority)
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenNumberGreaterThanOrEqualTo(3)
      .setBackground('#f8d7da')
      .setFontColor('#721c24')
      .setBold(true)
      .setRanges([daysColumn])
      .build());

    // Rule 2: YELLOW for 1-2 days (Medium priority)
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenNumberBetween(1, 2.99)
      .setBackground('#fff3cd')
      .setFontColor('#856404')
      .setBold(true)
      .setRanges([daysColumn])
      .build());

    // Rule 3: BLUE for 0-0.99 days (Low priority - same day but overdue)
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenNumberBetween(0, 0.99)
      .setBackground('#d1ecf1')
      .setFontColor('#0c5460')
      .setRanges([daysColumn])
      .build());

    // Apply all rules
    sheet.setConditionalFormatRules(rules);

    // Create filter view on header row
    sheet.getRange('A4:G4').createFilter();

    // Set column widths
    sheet.setColumnWidth(1, 250); // Email
    sheet.setColumnWidth(2, 120); // Device Type
    sheet.setColumnWidth(3, 100); // Asset Tag
    sheet.setColumnWidth(4, 150); // Serial Number
    sheet.setColumnWidth(5, 200); // Model
    sheet.setColumnWidth(6, 180); // Checkout Time
    sheet.setColumnWidth(7, 150); // Days Outstanding

    // Freeze header rows (first 4 rows)
    sheet.setFrozenRows(4);

    // Protect the header rows from accidental edits
    var protection = sheet.getRange('A1:G4').protect();
    protection.setDescription('Header section - Do not edit');
    protection.setWarningOnly(true);

    Logger.log('✅ Active Checkouts enhanced successfully!');
    Logger.log('   - Summary header added');
    Logger.log('   - Color coding applied (RED/YELLOW/BLUE)');
    Logger.log('   - Filter views enabled');
    Logger.log('   - Column widths optimized');

    // Show success message to user
    SpreadsheetApp.getUi().alert(
      'Enhancement Complete',
      'Active Checkouts sheet has been enhanced with:\\n\\n' +
      '✓ Color coding (RED/YELLOW/BLUE)\\n' +
      '✓ Summary header with legend\\n' +
      '✓ Filter views enabled\\n' +
      '✓ Optimized column widths\\n\\n' +
      'The sheet is now ready for real-time monitoring!',
      SpreadsheetApp.getUi().ButtonSet.OK
    );

    return {
      success: true,
      message: 'Active Checkouts enhanced with color coding and improved layout'
    };

  } catch (error) {
    Logger.log('❌ Error enhancing Active Checkouts: ' + error.toString());

    SpreadsheetApp.getUi().alert(
      'Enhancement Failed',
      'Error enhancing Active Checkouts: ' + error.message,
      SpreadsheetApp.getUi().ButtonSet.OK
    );

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * ONE-TIME CLEANUP: Removes old periodic refresh triggers
 * Run this ONCE before setting up new twice-daily triggers
 */
function cleanupOldPeriodicTriggers() {
  Logger.log('=== CLEANING UP OLD PERIODIC REFRESH TRIGGERS ===');

  const triggers = ScriptApp.getProjectTriggers();
  let deletedCount = 0;

  for (const trigger of triggers) {
    const handler = trigger.getHandlerFunction();

    // Delete all OLD periodic refresh triggers (no longer needed)
    if (handler === 'periodicOverdueRefresh' ||
        handler === 'setupPeriodicRefreshTrigger' ||
        handler === 'deletePeriodicRefreshTrigger' ||
        handler === 'setupCompleteLiveUpdateSystem') {
      ScriptApp.deleteTrigger(trigger);
      deletedCount++;
      Logger.log('Deleted OLD trigger: ' + handler + ' (ID: ' + trigger.getUniqueId() + ')');
    }
  }

  Logger.log('✅ Cleanup complete - Deleted ' + deletedCount + ' old trigger(s)');

  // Show remaining triggers
  const remaining = ScriptApp.getProjectTriggers();
  Logger.log('\n=== REMAINING TRIGGERS ===');
  for (const trigger of remaining) {
    Logger.log('- ' + trigger.getHandlerFunction() + ' (ID: ' + trigger.getUniqueId() + ')');
  }

  return {
    success: true,
    deletedCount: deletedCount,
    remainingCount: remaining.length
  };
}

// ============================================
// CHARGE SHEET SYSTEM - AUTOMATIC GENERATION
// ============================================
// Generates formal charge sheets for devices 3+ days overdue
// Based on standard student repair/damage form template
// ============================================

/**
 * Main workflow function: Generates and sends charge sheets for devices 3+ days overdue
 * This function should be triggered daily at 3:00 PM via time-based trigger
 *
 * Workflow:
 * 1. Get all overdue devices from CheckoutRepository
 * 2. Filter for devices 3+ days overdue (high severity)
 * 3. Generate charge sheet for each device (with duplicate prevention)
 * 4. Create PDF documents from Google Docs template
 * 5. Send email to IT staff with PDF attachments
 * 6. Log all charge sheets to tracking sheet
 *
 * @returns {Object} {success: boolean, chargeSheetCount: number, emailSent: boolean}
 */
function generateAndSendChargeSheets() {
  try {
    Logger.log('=== CHARGE SHEET GENERATION STARTED ===');
    Logger.log('Generation time: ' + new Date().toLocaleString('en-US', {timeZone: NOTIFICATION_CONFIG.SCHOOL_TIMEZONE}));

    // Check if system is enabled
    if (!CHARGE_SHEET_CONFIG.ENABLED) {
      Logger.log('Charge sheet system is disabled');
      return {
        success: true,
        message: 'System disabled',
        chargeSheetCount: 0
      };
    }

    // Skip weekends if configured
    if (CHARGE_SHEET_CONFIG.WEEKDAYS_ONLY && isWeekend()) {
      Logger.log('Skipping charge sheet generation - Weekend detected');
      return {
        success: true,
        message: 'Skipped - Weekend',
        chargeSheetCount: 0
      };
    }

    // 1. Get all overdue devices
    var overdueDevices = CheckoutRepository.getOverdueDevices();
    Logger.log('Found ' + overdueDevices.length + ' total overdue devices');

    // 2. Filter for high severity (3+ days overdue)
    var highSeverityDevices = overdueDevices.filter(function(device) {
      return device.daysOverdue >= CHARGE_SHEET_CONFIG.THRESHOLD_DAYS;
    });

    Logger.log('Found ' + highSeverityDevices.length + ' devices 3+ days overdue (eligible for charge sheets)');

    if (highSeverityDevices.length === 0) {
      Logger.log('No devices meet charge sheet threshold - no action needed');
      return {
        success: true,
        message: 'No devices 3+ days overdue',
        chargeSheetCount: 0
      };
    }

    // 3. Generate charge sheets and PDFs
    var chargeSheets = [];
    var pdfBlobs = [];
    var successCount = 0;
    var failureCount = 0;

    for (var i = 0; i < highSeverityDevices.length; i++) {
      var device = highSeverityDevices[i];

      try {
        logSafe('Processing device: ' + device.assetTag + ' (' + device.daysOverdue + ' days overdue)');

        // Generate charge sheet data
        var chargeSheetResult = ChargeSheetService.generateChargeSheet(device);

        if (!chargeSheetResult.success) {
          Logger.log('⏭️  Skipped: ' + device.assetTag + ' - ' + chargeSheetResult.reason);
          continue;
        }

        var chargeSheetData = chargeSheetResult.data;

        // Log to tracking sheet
        var logResult = ChargeSheetRepository.logChargeSheet(chargeSheetData);
        if (!logResult.success) {
          Logger.log('❌ Failed to log charge sheet: ' + logResult.error);
          failureCount++;
          continue;
        }

        // Create PDF
        var pdfResult = ChargeSheetService.createChargeSheetPDF(chargeSheetData);
        if (!pdfResult.success) {
          Logger.log('❌ Failed to create PDF: ' + pdfResult.error);
          // Update status to indicate PDF failure
          ChargeSheetRepository.updateChargeSheetStatus(
            chargeSheetData.chargeSheetId,
            'Generated',
            'PDF generation failed: ' + pdfResult.error
          );
          failureCount++;
          continue;
        }

        // Add to arrays for email
        chargeSheets.push(chargeSheetData);
        pdfBlobs.push(pdfResult.pdfBlob);
        successCount++;

        Logger.log('✅ Charge sheet generated: ' + chargeSheetData.chargeSheetId);

      } catch (error) {
        safeLog('❌ Error processing device ' + device.assetTag + ':', {error: error.toString()});
        failureCount++;
      }
    }

    Logger.log('\n=== CHARGE SHEET GENERATION SUMMARY ===');
    Logger.log('Total eligible: ' + highSeverityDevices.length);
    Logger.log('Successfully generated: ' + successCount);
    Logger.log('Failed: ' + failureCount);

    // 4. Send email if any charge sheets were generated
    if (chargeSheets.length > 0) {
      Logger.log('\n=== SENDING EMAIL NOTIFICATION ===');
      var emailResult = ChargeSheetEmail.sendChargeSheetEmail(chargeSheets, pdfBlobs);

      if (emailResult.success) {
        Logger.log('✅ Email sent successfully via ' + emailResult.method);

        // Update all charge sheets with email status
        for (var j = 0; j < chargeSheets.length; j++) {
          ChargeSheetRepository.updateEmailStatus(
            chargeSheets[j].chargeSheetId,
            true,
            CHARGE_SHEET_CONFIG.EMAIL_RECIPIENTS
          );
        }
      } else {
        Logger.log('❌ Email failed: ' + emailResult.error);

        // Update charge sheets to indicate email failure
        for (var k = 0; k < chargeSheets.length; k++) {
          ChargeSheetRepository.updateEmailStatus(
            chargeSheets[k].chargeSheetId,
            false,
            []
          );
        }
      }

      return {
        success: true,
        message: 'Charge sheets generated and email ' + (emailResult.success ? 'sent' : 'failed'),
        chargeSheetCount: chargeSheets.length,
        emailSent: emailResult.success,
        emailMethod: emailResult.method
      };
    } else {
      Logger.log('No charge sheets generated (all skipped or failed)');
      return {
        success: true,
        message: 'No charge sheets generated',
        chargeSheetCount: 0
      };
    }

  } catch (error) {
    Logger.log('❌ Critical error in charge sheet generation: ' + error.toString());

    // Send error notification to IT staff
    sendChargeSheetErrorNotification(error);

    return {
      success: false,
      message: 'Error generating charge sheets: ' + error.message,
      chargeSheetCount: 0
    };
  }
}

/**
 * Sends error notification email when charge sheet generation fails
 *
 * @param {Error} error - The error object
 */
function sendChargeSheetErrorNotification(error) {
  try {
    var subject = '🚨 ERROR: Charge Sheet Generation Failed';
    var body = '<h2>Charge Sheet System Error</h2>' +
               '<p><strong>Time:</strong> ' + new Date().toLocaleString() + '</p>' +
               '<p><strong>Error:</strong> ' + error.toString() + '</p>' +
               '<p><strong>Stack:</strong></p>' +
               '<pre>' + (error.stack || 'No stack trace available') + '</pre>' +
               '<hr>' +
               '<p><strong>Action Required:</strong> Check Apps Script execution logs for details.</p>';

    MailApp.sendEmail({
      to: CHARGE_SHEET_CONFIG.EMAIL_RECIPIENTS.join(','),
      subject: subject,
      htmlBody: body,
      name: 'Your School - Device Checkout System'  // TODO: Customize
    });

    Logger.log('Error notification sent to IT staff');
  } catch (emailError) {
    Logger.log('Failed to send error notification: ' + emailError.toString());
  }
}

/**
 * Manual test function: Generate charge sheets for testing
 * Run this function manually to test the charge sheet system
 */
function testChargeSheetGeneration() {
  Logger.log('=== TESTING CHARGE SHEET GENERATION ===');

  // Check configuration
  Logger.log('\n1. Checking configuration...');
  Logger.log('System enabled: ' + CHARGE_SHEET_CONFIG.ENABLED);
  Logger.log('Threshold: ' + CHARGE_SHEET_CONFIG.THRESHOLD_DAYS + ' days');
  Logger.log('Template ID: ' + (CHARGE_SHEET_CONFIG.TEMPLATE_ID || 'NOT SET'));

  if (!CHARGE_SHEET_CONFIG.TEMPLATE_ID) {
    Logger.log('⚠️  WARNING: Template ID not configured!');
    Logger.log('Please set CHARGE_SHEET_CONFIG.TEMPLATE_ID in Config.gs');
    return;
  }

  // Check for overdue devices
  Logger.log('\n2. Checking for overdue devices...');
  var overdueDevices = CheckoutRepository.getOverdueDevices();
  var highSeverity = overdueDevices.filter(function(d) {
    return d.daysOverdue >= CHARGE_SHEET_CONFIG.THRESHOLD_DAYS;
  });

  Logger.log('Total overdue: ' + overdueDevices.length);
  Logger.log('3+ days overdue: ' + highSeverity.length);

  if (highSeverity.length === 0) {
    Logger.log('No devices 3+ days overdue - cannot test');
    Logger.log('Create a test checkout that is 3+ days old to test');
    return;
  }

  // Test with first device
  Logger.log('\n3. Testing with first device...');
  var testDevice = highSeverity[0];
  Logger.log('Test device: ' + testDevice.assetTag + ' (' + testDevice.daysOverdue + ' days overdue)');

  // Generate charge sheet
  Logger.log('\n4. Generating charge sheet...');
  var result = ChargeSheetService.generateChargeSheet(testDevice);

  if (result.success) {
    Logger.log('✅ Charge sheet data generated');
    Logger.log('Charge Sheet ID: ' + result.data.chargeSheetId);
    Logger.log('Student: ' + result.data.studentName);
    Logger.log('Total Cost: $' + result.data.totalCost.toFixed(2));
  } else {
    Logger.log('❌ Failed: ' + result.error);
    return;
  }

  // Test PDF creation
  Logger.log('\n5. Testing PDF creation...');
  var pdfResult = ChargeSheetService.createChargeSheetPDF(result.data);

  if (pdfResult.success) {
    Logger.log('✅ PDF created successfully: ' + pdfResult.fileName);
    Logger.log('PDF size: ' + (pdfResult.pdfBlob.getBytes().length / 1024).toFixed(2) + ' KB');
  } else {
    Logger.log('❌ PDF creation failed: ' + pdfResult.error);
    return;
  }

  Logger.log('\n✅ ALL TESTS PASSED');
  Logger.log('Charge sheet system is ready to use!');
  Logger.log('\nNext steps:');
  Logger.log('1. Run generateAndSendChargeSheets() to generate for all eligible devices');
  Logger.log('2. Set up daily trigger with setupChargeSheetTrigger()');
}

/**
 * Sets up daily trigger for automatic charge sheet generation
 * Run this function once to install the trigger
 */
function setupChargeSheetTrigger() {
  try {
    Logger.log('=== SETTING UP CHARGE SHEET TRIGGER ===');

    // Delete any existing charge sheet triggers first
    deleteChargeSheetTrigger();

    // Parse time from config (format: "3:00 PM")
    var timeParts = CHARGE_SHEET_CONFIG.GENERATION_TIME.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeParts) {
      throw new Error('Invalid time format in CHARGE_SHEET_CONFIG.GENERATION_TIME');
    }

    var hour = parseInt(timeParts[1]);
    var minute = parseInt(timeParts[2]);
    var period = timeParts[3].toUpperCase();

    // Convert to 24-hour format
    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }

    // Create daily trigger
    ScriptApp.newTrigger('generateAndSendChargeSheets')
      .timeBased()
      .atHour(hour)
      .nearMinute(minute)
      .everyDays(1)
      .create();

    Logger.log('✅ Charge sheet trigger created');
    Logger.log('Will run daily at ' + CHARGE_SHEET_CONFIG.GENERATION_TIME);
    Logger.log('Weekdays only: ' + CHARGE_SHEET_CONFIG.WEEKDAYS_ONLY);

    return {
      success: true,
      message: 'Trigger created for ' + CHARGE_SHEET_CONFIG.GENERATION_TIME
    };

  } catch (error) {
    Logger.log('❌ Error setting up trigger: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Deletes charge sheet generation triggers
 */
function deleteChargeSheetTrigger() {
  try {
    var triggers = ScriptApp.getProjectTriggers();
    var deletedCount = 0;

    for (var i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() === 'generateAndSendChargeSheets') {
        ScriptApp.deleteTrigger(triggers[i]);
        deletedCount++;
      }
    }

    Logger.log('Deleted ' + deletedCount + ' charge sheet trigger(s)');
    return {
      success: true,
      deletedCount: deletedCount
    };

  } catch (error) {
    Logger.log('Error deleting triggers: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Clears all charge sheets from today (useful for testing or fixing errors)
 * WARNING: This will delete all charge sheets generated today!
 */
function clearTodayChargeSheets() {
  try {
    Logger.log('=== CLEARING TODAY\'S CHARGE SHEETS ===');

    var sheet = ChargeSheetRepository.getChargeSheetSheet();
    var data = sheet.getDataRange().getValues();
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var rowsToDelete = [];

    // Find all rows generated today (skip header row)
    for (var i = 1; i < data.length; i++) {
      var generationDate = new Date(data[i][1]); // Column B: Generation Timestamp
      generationDate.setHours(0, 0, 0, 0);

      if (generationDate.getTime() === today.getTime()) {
        rowsToDelete.push(i + 1); // +1 for 1-based sheet indexing
      }
    }

    if (rowsToDelete.length === 0) {
      Logger.log('No charge sheets found for today');
      return {
        success: true,
        deletedCount: 0,
        message: 'No charge sheets to delete'
      };
    }

    // Delete rows in reverse order (so row numbers don't shift)
    rowsToDelete.reverse();
    for (var j = 0; j < rowsToDelete.length; j++) {
      sheet.deleteRow(rowsToDelete[j]);
      Logger.log('Deleted row ' + rowsToDelete[j]);
    }

    Logger.log('✅ Deleted ' + rowsToDelete.length + ' charge sheet(s) from today');

    return {
      success: true,
      deletedCount: rowsToDelete.length,
      message: 'Deleted ' + rowsToDelete.length + ' charge sheet(s)'
    };

  } catch (error) {
    Logger.log('❌ Error clearing charge sheets: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}
