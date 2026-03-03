// ============================================
// CACHE MANAGER - UNIFIED CACHE MANAGEMENT
// ============================================
// Phase 2 Refactoring: Strategy Pattern for Caching
// Centralizes all caching logic with multi-level strategies
// Extracted from Main.gs for better maintainability
//
// RESPONSIBILITIES:
// - Asset cache management (15-minute expiration)
// - User cache management (10-minute expiration)
// - Single asset cache (2-minute expiration)
// - Race condition protection
// - Cache invalidation and refresh
//
// BENEFITS:
// ✓ Consistent cache interface across all types
// ✓ Centralized expiration logic
// ✓ Easy to add new cache strategies
// ✓ Race condition protection built-in
// ============================================

/**
 * Cache Manager - Unified Cache Management
 * Multi-level caching with race condition protection
 */
var CacheManager = (function() {

  // Cache storage
  var assetCache = null;
  var assetCacheTimestamp = null;
  var userCache = null;
  var userCacheTimestamp = null;
  var singleAssetCache = {};

  // Race condition protection
  var cacheRefreshInProgress = false;

  /**
   * Gets all assets with multi-level caching
   * Level 1: Memory cache (15 minutes)
   * Level 2: Fresh API call
   *
   * @param {boolean} forceRefresh - Force cache refresh
   * @returns {Array} Array of asset objects
   */
  function getAssets(forceRefresh) {
    try {
      var now = new Date().getTime();
      var cacheDuration = CONFIG.EXTENDED_CACHE_DURATION_MS;

      // Check if cache is valid
      if (!forceRefresh && assetCache && assetCacheTimestamp &&
          (now - assetCacheTimestamp) < cacheDuration) {
        logSafe('CacheManager.getAssets() - Cache HIT (' + assetCache.length + ' assets)');
        return assetCache;
      }

      // CRITICAL: Race condition protection
      if (cacheRefreshInProgress) {
        logSafe('CacheManager.getAssets() - Cache refresh in progress, serving stale cache');
        return assetCache || [];
      }

      // Refresh cache
      try {
        cacheRefreshInProgress = true;
        logSafe('CacheManager.getAssets() - Cache MISS, refreshing...');

        var freshAssets = getAllAssetTags();

        if (freshAssets && freshAssets.length > 0) {
          assetCache = freshAssets;
          assetCacheTimestamp = new Date().getTime();
          logSafe('CacheManager.getAssets() - Cache refreshed (' + freshAssets.length + ' assets)');
        }

        return assetCache || [];

      } finally {
        cacheRefreshInProgress = false;
      }

    } catch (error) {
      safeLog('CacheManager.getAssets() - Error:', {error: error.toString()});
      cacheRefreshInProgress = false;
      return assetCache || [];
    }
  }

  /**
   * Verifies a single asset with 3-level caching
   * Level 1: Single asset cache (2 minutes) - fastest
   * Level 2: Main asset cache (15 minutes) - fast
   * Level 3: Fresh API call - slowest
   *
   * @param {string} assetTag - 6-digit asset tag
   * @returns {Object} Asset verification result
   */
  function verifyAsset(assetTag) {
    try {
      var now = new Date().getTime();
      var cacheKey = assetTag;

      // Level 1: Single asset cache (2 minutes)
      if (singleAssetCache[cacheKey] &&
          singleAssetCache[cacheKey].timestamp &&
          (now - singleAssetCache[cacheKey].timestamp) < CONFIG.SINGLE_ASSET_CACHE_MS) {
        logSafe('CacheManager.verifyAsset() - Single asset cache HIT for: ' + cacheKey);
        return singleAssetCache[cacheKey].data;
      }

      // Level 2: Main asset cache (15 minutes)
      if (assetCache && assetCacheTimestamp &&
          (now - assetCacheTimestamp) < CONFIG.EXTENDED_CACHE_DURATION_MS) {
        var asset = assetCache.find(function(item) {
          return item.assetTag === assetTag;
        });

        if (asset) {
          logSafe('CacheManager.verifyAsset() - Main cache HIT for: ' + assetTag);

          // Cache in single asset cache for faster next lookup
          var result = {
            exists: true,
            valid: true,
            assetTag: asset.assetTag,
            serialNumber: asset.serialNumber,
            model: asset.model,
            owner: asset.currentUser || asset.owner,
            status: asset.status || (asset.currentUser ? 'Checked Out' : 'Available'),
            currentUser: asset.currentUser || asset.owner || null,
            assetId: asset.assetId,
            disabled: asset.disabled || false,
            disableReason: asset.disableReason || null
          };

          singleAssetCache[cacheKey] = {
            data: result,
            timestamp: now
          };

          return result;
        }
      }

      // Level 3: Cache miss - refresh and search
      logSafe('CacheManager.verifyAsset() - Cache MISS, refreshing for: ' + assetTag);
      getAssets(true); // Force refresh

      // Search again in refreshed cache
      if (assetCache) {
        var foundAsset = assetCache.find(function(item) {
          return item.assetTag === assetTag;
        });

        if (foundAsset) {
          var result = {
            exists: true,
            valid: true,
            assetTag: foundAsset.assetTag,
            serialNumber: foundAsset.serialNumber,
            model: foundAsset.model,
            owner: foundAsset.currentUser || foundAsset.owner,
            status: foundAsset.status || (foundAsset.currentUser ? 'Checked Out' : 'Available'),
            currentUser: foundAsset.currentUser || foundAsset.owner || null,
            assetId: foundAsset.assetId,
            disabled: foundAsset.disabled || false,
            disableReason: foundAsset.disableReason || null
          };

          singleAssetCache[cacheKey] = {
            data: result,
            timestamp: now
          };

          return result;
        }
      }

      // Asset not found
      return {
        exists: false,
        message: 'Asset tag not found in IncidentIQ'
      };

    } catch (error) {
      safeLog('CacheManager.verifyAsset() - Error:', {error: error.toString()});
      return {
        exists: false,
        message: 'Error verifying asset: ' + error.toString()
      };
    }
  }

  /**
   * Caches a user result
   *
   * @param {string} email - User email
   * @param {string} userId - IncidentIQ user ID
   * @param {string} fullName - User full name
   */
  function cacheUser(email, userId, fullName) {
    try {
      if (!userCache) {
        userCache = {};
      }

      var cacheKey = email.toLowerCase();
      userCache[cacheKey] = {
        userId: userId,
        fullName: fullName,
        email: email
      };

      userCacheTimestamp = new Date().getTime();
      logSafe('CacheManager.cacheUser() - Cached user: ' + email);

    } catch (error) {
      safeLog('CacheManager.cacheUser() - Error:', {error: error.toString()});
    }
  }

  /**
   * Gets a cached user
   *
   * @param {string} email - User email
   * @returns {Object|null} User object or null if not cached/expired
   */
  function getCachedUser(email) {
    try {
      var now = new Date().getTime();
      var cacheDuration = CONFIG.USER_CACHE_DURATION_MS;

      if (!userCache || !userCacheTimestamp ||
          (now - userCacheTimestamp) > cacheDuration) {
        return null;
      }

      var cacheKey = email.toLowerCase();
      var cached = userCache[cacheKey];

      if (cached) {
        logSafe('CacheManager.getCachedUser() - Cache HIT for: ' + email);
        return cached;
      }

      return null;

    } catch (error) {
      safeLog('CacheManager.getCachedUser() - Error:', {error: error.toString()});
      return null;
    }
  }

  /**
   * CRITICAL FIX: Updates asset owner in cache immediately after assignment
   * This prevents stale cache issues when checking out then returning quickly
   *
   * @param {string} assetTag - 6-digit asset tag
   * @param {string} userId - User ID (or null for unassignment)
   * @param {string} userEmail - User email (for display)
   */
  function updateAssetOwner(assetTag, userId, userEmail) {
    try {
      var now = new Date().getTime();

      logSafe('CacheManager.updateAssetOwner() - Updating cached owner for: ' + assetTag);

      // Update main asset cache if it exists
      if (assetCache && Array.isArray(assetCache)) {
        for (var i = 0; i < assetCache.length; i++) {
          if (assetCache[i].assetTag === assetTag) {
            assetCache[i].userId = userId;
            assetCache[i].currentUser = userId ? userEmail : null;
            assetCache[i].status = userId ? 'Checked Out' : 'Available';
            assetCache[i].owner = userId ? userEmail : null;
            logSafe('CacheManager.updateAssetOwner() - Updated main cache');
            break;
          }
        }
      }

      // Update single asset cache if this asset is cached
      var cacheKey = assetTag;
      if (singleAssetCache[cacheKey]) {
        var cachedData = singleAssetCache[cacheKey].data;
        cachedData.userId = userId;
        cachedData.currentUser = userId ? userEmail : null;
        cachedData.status = userId ? 'Checked Out' : 'Available';
        cachedData.owner = userId ? userEmail : null;
        singleAssetCache[cacheKey].timestamp = now; // Refresh timestamp
        logSafe('CacheManager.updateAssetOwner() - Updated single asset cache');
      }

      logSafe('CacheManager.updateAssetOwner() - Cache updated successfully');

    } catch (error) {
      safeLog('CacheManager.updateAssetOwner() - Error:', {error: error.toString()});
      // Non-fatal error - clear caches to force refresh on next request
      clearAssetCache();
    }
  }

  /**
   * Clears all caches
   */
  function clearAll() {
    assetCache = null;
    assetCacheTimestamp = null;
    userCache = null;
    userCacheTimestamp = null;
    singleAssetCache = {};
    cacheRefreshInProgress = false;

    logSafe('CacheManager.clearAll() - All caches cleared');
  }

  /**
   * Clears asset caches only
   */
  function clearAssetCache() {
    assetCache = null;
    assetCacheTimestamp = null;
    singleAssetCache = {};

    logSafe('CacheManager.clearAssetCache() - Asset caches cleared');
  }

  /**
   * Clears user cache only
   */
  function clearUserCache() {
    userCache = null;
    userCacheTimestamp = null;

    logSafe('CacheManager.clearUserCache() - User cache cleared');
  }

  /**
   * Gets cache statistics
   *
   * @returns {Object} Cache stats
   */
  function getStats() {
    var now = new Date().getTime();

    var stats = {
      assetCache: {
        valid: assetCache && assetCacheTimestamp &&
               (now - assetCacheTimestamp) < CONFIG.EXTENDED_CACHE_DURATION_MS,
        itemCount: assetCache ? assetCache.length : 0,
        ageMinutes: assetCacheTimestamp ?
                    Math.floor((now - assetCacheTimestamp) / 60000) : null,
        expiresInMinutes: assetCacheTimestamp ?
                          Math.floor((CONFIG.EXTENDED_CACHE_DURATION_MS - (now - assetCacheTimestamp)) / 60000) : null
      },
      userCache: {
        valid: userCache && userCacheTimestamp &&
               (now - userCacheTimestamp) < CONFIG.USER_CACHE_DURATION_MS,
        itemCount: userCache ? Object.keys(userCache).length : 0,
        ageMinutes: userCacheTimestamp ?
                    Math.floor((now - userCacheTimestamp) / 60000) : null,
        expiresInMinutes: userCacheTimestamp ?
                          Math.floor((CONFIG.USER_CACHE_DURATION_MS - (now - userCacheTimestamp)) / 60000) : null
      },
      singleAssetCache: {
        itemCount: Object.keys(singleAssetCache).length
      },
      refreshLock: {
        locked: cacheRefreshInProgress
      }
    };

    return stats;
  }

  /**
   * Checks if cache refresh is in progress
   * @returns {boolean}
   */
  function isRefreshInProgress() {
    return cacheRefreshInProgress;
  }

  /**
   * Sets the cache refresh lock state
   * WARNING: Use with caution, prefer using getAssets() which handles locking
   * @param {boolean} locked
   */
  function setRefreshLock(locked) {
    cacheRefreshInProgress = locked;
    logSafe('CacheManager.setRefreshLock() - Lock set to: ' + locked);
  }

  // Public API
  return {
    // Asset caching
    getAssets: getAssets,
    verifyAsset: verifyAsset,
    updateAssetOwner: updateAssetOwner,

    // User caching
    cacheUser: cacheUser,
    getCachedUser: getCachedUser,

    // Cache management
    clearAll: clearAll,
    clearAssetCache: clearAssetCache,
    clearUserCache: clearUserCache,

    // Cache stats
    getStats: getStats,
    isRefreshInProgress: isRefreshInProgress,
    setRefreshLock: setRefreshLock
  };

})();

// ============================================
// HELPER FUNCTION WRAPPERS
// ============================================
// These functions are called by CacheManager
// They exist in Main.gs, Config.gs, and Security.gs
//
// Functions used:
// - getAllAssetTags() (Main.gs)
// - CONFIG.* (Config.gs)
// - logSafe() (Security.gs)
// - safeLog() (Security.gs)
// ============================================
