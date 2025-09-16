/**
 * Quarantine Module
 * Handles quarantining of suspicious files
 */

/**
 * Quarantine suspicious file
 * @param {string} fileId - File ID
 * @param {Object} file - File object
 * @param {string} reason - Quarantine reason
 * @param {Map} quarantinedFiles - Quarantine storage
 */
export const quarantineFile = (fileId, file, reason, quarantinedFiles) => {
  quarantinedFiles.set(fileId, {
    file,
    reason,
    timestamp: Date.now(),
    reviewed: false,
    reviewer: null,
    reviewNotes: null
  });
};

/**
 * Get quarantine statistics
 * @param {Map} quarantinedFiles - Quarantine storage
 * @returns {Object} - Quarantine statistics
 */
export const getQuarantineStats = (quarantinedFiles) => {
  const now = Date.now();
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
  
  let totalQuarantined = 0;
  let recentQuarantined = 0;
  let weeklyQuarantined = 0;
  let unreviewed = 0;
  let reviewed = 0;

  quarantinedFiles.forEach((info, fileId) => {
    totalQuarantined++;
    
    if (info.timestamp > oneDayAgo) {
      recentQuarantined++;
    }
    
    if (info.timestamp > oneWeekAgo) {
      weeklyQuarantined++;
    }
    
    if (info.reviewed) {
      reviewed++;
    } else {
      unreviewed++;
    }
  });

  return {
    totalQuarantined,
    recentQuarantined,
    weeklyQuarantined,
    unreviewed,
    reviewed,
    reviewRate: totalQuarantined > 0 ? Math.round((reviewed / totalQuarantined) * 100) : 0
  };
};

/**
 * Review quarantined file
 * @param {string} fileId - File ID
 * @param {boolean} isSafe - Is file safe
 * @param {string} reviewer - Reviewer name
 * @param {string} notes - Review notes
 * @param {Map} quarantinedFiles - Quarantine storage
 * @returns {boolean} - Success status
 */
export const reviewQuarantinedFile = (fileId, isSafe, reviewer, notes, quarantinedFiles) => {
  const fileInfo = quarantinedFiles.get(fileId);
  
  if (!fileInfo) {
    return false;
  }

  fileInfo.reviewed = true;
  fileInfo.reviewer = reviewer;
  fileInfo.reviewNotes = notes;
  fileInfo.isSafe = isSafe;
  fileInfo.reviewTimestamp = Date.now();

  return true;
};

/**
 * Get quarantined file details
 * @param {string} fileId - File ID
 * @param {Map} quarantinedFiles - Quarantine storage
 * @returns {Object|null} - File details or null
 */
export const getQuarantinedFile = (fileId, quarantinedFiles) => {
  return quarantinedFiles.get(fileId) || null;
};

/**
 * List quarantined files
 * @param {Map} quarantinedFiles - Quarantine storage
 * @param {Object} options - Filter options
 * @returns {Array} - List of quarantined files
 */
export const listQuarantinedFiles = (quarantinedFiles, options = {}) => {
  const {
    reviewed = null,
    limit = 50,
    offset = 0
  } = options;

  const files = Array.from(quarantinedFiles.entries())
    .map(([fileId, info]) => ({
      fileId,
      ...info
    }))
    .filter(info => {
      if (reviewed !== null) {
        return info.reviewed === reviewed;
      }
      return true;
    })
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(offset, offset + limit);

  return files;
};

/**
 * Remove file from quarantine
 * @param {string} fileId - File ID
 * @param {Map} quarantinedFiles - Quarantine storage
 * @returns {boolean} - Success status
 */
export const removeFromQuarantine = (fileId, quarantinedFiles) => {
  return quarantinedFiles.delete(fileId);
};

/**
 * Clear quarantine (for testing or maintenance)
 * @param {Map} quarantinedFiles - Quarantine storage
 */
export const clearQuarantine = (quarantinedFiles) => {
  quarantinedFiles.clear();
};

/**
 * Clean old quarantined files
 * @param {Map} quarantinedFiles - Quarantine storage
 * @param {number} maxAge - Maximum age in milliseconds
 */
export const cleanOldQuarantinedFiles = (quarantinedFiles, maxAge = 30 * 24 * 60 * 60 * 1000) => {
  const now = Date.now();
  const cutoffTime = now - maxAge;

  const toRemove = [];
  quarantinedFiles.forEach((info, fileId) => {
    if (info.timestamp < cutoffTime) {
      toRemove.push(fileId);
    }
  });

  toRemove.forEach(fileId => {
    quarantinedFiles.delete(fileId);
  });

  return toRemove.length;
};
