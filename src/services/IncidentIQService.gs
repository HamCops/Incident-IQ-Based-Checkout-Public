// ============================================
// INCIDENTIQ SERVICE - API COMMUNICATION LAYER
// ============================================
// Phase 2 Refactoring: Service Layer Pattern
// Centralizes all IncidentIQ API communication
// Extracted from Main.gs for better testability and maintainability
//
// RESPONSIBILITIES:
// - User search and retrieval
// - Asset search and retrieval
// - Device assignment/unassignment
// - Asset status updates
// - API request construction and error handling
//
// BENEFITS:
// ✓ Single source of truth for API communication
// ✓ Easy to mock for testing
// ✓ Consistent error handling
// ✓ Centralized logging
// ============================================

/**
 * IncidentIQ Service - API Communication Layer
 * All methods return standardized response objects: {success, data?, error?}
 */
var IncidentIQService = (function() {

  /**
   * Searches for a user by email address
   * Implements unlimited search with fuzzy email matching
   *
   * @param {string} email - Student email address
   * @returns {Object} {success: boolean, data?: {userId, fullName, email}, error?: string}
   */
  function findUser(email) {
    try {
      logSafe('IncidentIQService.findUser() - Searching for user: ' + email);

      // PERFORMANCE: Check cache first (10 minute TTL) - saves 1-3 seconds per lookup
      var cachedUser = CacheManager.getCachedUser(email);
      if (cachedUser) {
        logSafe('IncidentIQService.findUser() - Cache HIT (instant)');
        return {
          success: true,
          data: {
            userId: cachedUser.userId,
            fullName: cachedUser.fullName,
            email: cachedUser.email
          }
        };
      }

      var config = getIncidentIQConfig();

      // Strategy 1: Try filtered search first (faster)
      var filteredResult = searchUserWithFilters(config, email);
      if (filteredResult) {
        logSafe('IncidentIQService.findUser() - Found via filtered search');

        // Cache the result for next time
        CacheManager.cacheUser(email, filteredResult.UserId, filteredResult.FullName || filteredResult.Name || 'Unknown');

        return {
          success: true,
          data: {
            userId: filteredResult.UserId,
            fullName: filteredResult.FullName || filteredResult.Name || 'Unknown',
            email: filteredResult.Email
          }
        };
      }

      // Strategy 2: Unlimited paginated search with fuzzy matching
      logSafe('IncidentIQService.findUser() - Trying unlimited paginated search');
      var paginatedResult = searchUserPaginatedOptimized(config, email);

      if (paginatedResult) {
        logSafe('IncidentIQService.findUser() - Found via paginated search');

        // Cache the result for next time
        CacheManager.cacheUser(email, paginatedResult.UserId, paginatedResult.FullName || paginatedResult.Name || 'Unknown');

        return {
          success: true,
          data: {
            userId: paginatedResult.UserId,
            fullName: paginatedResult.FullName || paginatedResult.Name || 'Unknown',
            email: paginatedResult.Email
          }
        };
      }

      // User not found
      logSafe('IncidentIQService.findUser() - User not found in IncidentIQ');
      return {
        success: false,
        error: 'User not found in IncidentIQ'
      };

    } catch (error) {
      safeLog('IncidentIQService.findUser() - Error:', {error: error.toString()});
      return {
        success: false,
        error: 'Failed to search for user: ' + error.toString()
      };
    }
  }

  /**
   * Retrieves all assets from the configured asset view
   * Uses multi-level caching for performance
   *
   * @returns {Object} {success: boolean, data?: Array, error?: string}
   */
  function getAllAssets() {
    try {
      logSafe('IncidentIQService.getAllAssets() - Fetching assets');

      var assets = getAllAssetTags();

      if (!assets || assets.length === 0) {
        return {
          success: false,
          error: 'No assets found in configured view'
        };
      }

      logSafe('IncidentIQService.getAllAssets() - Found ' + assets.length + ' assets');
      return {
        success: true,
        data: assets
      };

    } catch (error) {
      safeLog('IncidentIQService.getAllAssets() - Error:', {error: error.toString()});
      return {
        success: false,
        error: 'Failed to fetch assets: ' + error.toString()
      };
    }
  }

  /**
   * Verifies a single asset by asset tag
   * Uses multi-level caching (2 min -> 15 min -> API)
   *
   * @param {string} assetTag - 6-digit asset tag
   * @returns {Object} {success: boolean, data?: {assetTag, serialNumber, model, owner, assetId}, error?: string}
   */
  function verifyAsset(assetTag) {
    try {
      logSafe('IncidentIQService.verifyAsset() - Verifying asset: ' + assetTag);

      var result = verifyAssetTag(assetTag);

      if (!result || !result.valid) {
        return {
          success: false,
          error: result ? result.message : 'Asset not found'
        };
      }

      return {
        success: true,
        data: {
          assetTag: result.assetTag,
          serialNumber: result.serialNumber,
          model: result.model,
          owner: result.owner,
          assetId: result.assetId
        }
      };

    } catch (error) {
      safeLog('IncidentIQService.verifyAsset() - Error:', {error: error.toString()});
      return {
        success: false,
        error: 'Failed to verify asset: ' + error.toString()
      };
    }
  }

  /**
   * Assigns a device to a user in IncidentIQ
   *
   * @param {string} assetId - IncidentIQ asset ID (GUID)
   * @param {string} userId - IncidentIQ user ID (GUID)
   * @returns {Object} {success: boolean, error?: string}
   */
  function assignDevice(assetId, userId) {
    try {
      logSafe('IncidentIQService.assignDevice() - Assigning device', {assetId: assetId, userId: userId});

      var result = updateAssetAssignment(assetId, userId, 'Check Out');

      if (result.success) {
        logSafe('IncidentIQService.assignDevice() - Device assigned successfully');
        return {success: true};
      } else {
        return {
          success: false,
          error: result.error || result.message || 'Failed to assign device'
        };
      }

    } catch (error) {
      safeLog('IncidentIQService.assignDevice() - Error:', {error: error.toString()});
      return {
        success: false,
        error: 'Failed to assign device: ' + error.toString()
      };
    }
  }

  /**
   * Unassigns a device from its current owner
   *
   * @param {string} assetId - IncidentIQ asset ID (GUID)
   * @returns {Object} {success: boolean, error?: string}
   */
  function unassignDevice(assetId) {
    try {
      logSafe('IncidentIQService.unassignDevice() - Unassigning device', {assetId: assetId});

      var result = updateAssetAssignment(assetId, null, 'Return');

      if (result.success) {
        logSafe('IncidentIQService.unassignDevice() - Device unassigned successfully');
        return {success: true};
      } else {
        return {
          success: false,
          error: result.message || 'Failed to unassign device'
        };
      }

    } catch (error) {
      safeLog('IncidentIQService.unassignDevice() - Error:', {error: error.toString()});
      return {
        success: false,
        error: 'Failed to unassign device: ' + error.toString()
      };
    }
  }

  /**
   * Updates the status of an asset in IncidentIQ
   * Used for auto-disable (Missing) and auto-enable (In Service)
   *
   * @param {string} assetTag - 6-digit asset tag
   * @param {string} statusGuid - IncidentIQ status type GUID
   * @returns {Object} {success: boolean, error?: string}
   */
  function updateStatus(assetTag, statusGuid) {
    try {
      logSafe('IncidentIQService.updateStatus() - Updating status', {assetTag: assetTag, statusGuid: statusGuid});

      var result = updateAssetStatus(assetTag, statusGuid);

      if (result.success) {
        logSafe('IncidentIQService.updateStatus() - Status updated successfully');
        return {success: true};
      } else {
        return {
          success: false,
          error: result.message || 'Failed to update status'
        };
      }

    } catch (error) {
      safeLog('IncidentIQService.updateStatus() - Error:', {error: error.toString()});
      return {
        success: false,
        error: 'Failed to update status: ' + error.toString()
      };
    }
  }

  /**
   * Performs a complete device checkout transaction
   * Assigns device to user AND updates status if needed
   *
   * @param {string} assetId - IncidentIQ asset ID (GUID)
   * @param {string} userId - IncidentIQ user ID (GUID)
   * @returns {Object} {success: boolean, error?: string, previousOwnerId?: string}
   */
  function checkoutDevice(assetId, userId) {
    try {
      logSafe('IncidentIQService.checkoutDevice() - Starting checkout transaction');

      // Get current owner for potential rollback
      var assetInfo = getAssetById(assetId);
      var previousOwnerId = assetInfo && assetInfo.ownerId ? assetInfo.ownerId : null;

      // Assign device
      var assignResult = assignDevice(assetId, userId);

      if (!assignResult.success) {
        return {
          success: false,
          error: assignResult.error
        };
      }

      return {
        success: true,
        previousOwnerId: previousOwnerId
      };

    } catch (error) {
      safeLog('IncidentIQService.checkoutDevice() - Error:', {error: error.toString()});
      return {
        success: false,
        error: 'Checkout transaction failed: ' + error.toString()
      };
    }
  }

  /**
   * Performs a complete device return transaction
   * Unassigns device AND sets status to "In Service"
   *
   * @param {string} assetId - IncidentIQ asset ID (GUID)
   * @param {string} assetTag - 6-digit asset tag (for status update)
   * @returns {Object} {success: boolean, error?: string, statusUpdated: boolean}
   */
  function returnDevice(assetId, assetTag) {
    try {
      logSafe('IncidentIQService.returnDevice() - Starting return transaction');

      // Step 1: Unassign owner
      var unassignResult = unassignDevice(assetId);

      if (!unassignResult.success) {
        return {
          success: false,
          error: unassignResult.error,
          statusUpdated: false
        };
      }

      // Step 2: Set status to "In Service" (triggers auto-enable in Google Workspace)
      var statusResult = updateStatus(assetTag, NOTIFICATION_CONFIG.IN_SERVICE_STATUS_GUID);

      if (!statusResult.success) {
        // Return still succeeds even if status update fails
        logSafe('IncidentIQService.returnDevice() - WARNING: Status update failed but device unassigned');
        return {
          success: true,
          statusUpdated: false,
          warning: 'Device returned but status update failed. Manual enable may be required.'
        };
      }

      return {
        success: true,
        statusUpdated: true
      };

    } catch (error) {
      safeLog('IncidentIQService.returnDevice() - Error:', {error: error.toString()});
      return {
        success: false,
        error: 'Return transaction failed: ' + error.toString(),
        statusUpdated: false
      };
    }
  }

  /**
   * Gets asset information by asset ID
   * Helper function for transaction rollback
   *
   * @param {string} assetId - IncidentIQ asset ID (GUID)
   * @returns {Object|null} Asset info or null if not found
   */
  function getAssetById(assetId) {
    try {
      var allAssets = getAllAssetTags();

      for (var i = 0; i < allAssets.length; i++) {
        if (allAssets[i].assetId === assetId) {
          return {
            assetId: allAssets[i].assetId,
            assetTag: allAssets[i].assetTag,
            ownerId: allAssets[i].ownerId || null
          };
        }
      }

      return null;

    } catch (error) {
      safeLog('IncidentIQService.getAssetById() - Error:', {error: error.toString()});
      return null;
    }
  }

  // Public API
  return {
    findUser: findUser,
    getAllAssets: getAllAssets,
    verifyAsset: verifyAsset,
    assignDevice: assignDevice,
    unassignDevice: unassignDevice,
    updateStatus: updateStatus,
    checkoutDevice: checkoutDevice,
    returnDevice: returnDevice,
    getAssetById: getAssetById
  };

})();

// ============================================
// HELPER FUNCTION WRAPPERS
// ============================================
// These functions are called by IncidentIQService
// They exist in Main.gs and will remain there for now
// (We're wrapping them, not duplicating them)
//
// Functions used:
// - getIncidentIQConfig()
// - searchUserWithFilters()
// - searchUserPaginatedOptimized()
// - getAllAssetTags()
// - verifyAssetTag()
// - updateAssetAssignment()
// - updateAssetStatus()
// - logSafe()
// - safeLog()
// ============================================
