/**
 * Upload Rate Limiting Module
 * Handles upload rate limiting and quotas
 */

/**
 * Check upload limits
 * @param {string} identifier - IP address or user ID
 * @param {Object} config - Configuration options
 * @param {Map} uploadHistory - Upload history storage
 * @returns {Object} - Limit check result
 */
export const checkUploadLimits = (identifier, config, uploadHistory) => {
  const result = {
    allowed: true,
    errors: []
  };

  if (!uploadHistory.has(identifier)) {
    uploadHistory.set(identifier, {
      hourly: [],
      daily: []
    });
  }

  const history = uploadHistory.get(identifier);
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  const oneDayAgo = now - (24 * 60 * 60 * 1000);

  // Clean old entries
  history.hourly = history.hourly.filter(timestamp => timestamp > oneHourAgo);
  history.daily = history.daily.filter(timestamp => timestamp > oneDayAgo);

  // Check hourly limit
  if (history.hourly.length >= config.maxFilesPerHour) {
    result.allowed = false;
    result.errors.push(`Hourly upload limit of ${config.maxFilesPerHour} files exceeded`);
  }

  // Check daily limit
  if (history.daily.length >= config.maxFilesPerDay) {
    result.allowed = false;
    result.errors.push(`Daily upload limit of ${config.maxFilesPerDay} files exceeded`);
  }

  return result;
};

/**
 * Record successful upload
 * @param {string} identifier - IP address or user ID
 * @param {Map} uploadHistory - Upload history storage
 */
export const recordUpload = (identifier, uploadHistory) => {
  if (!uploadHistory.has(identifier)) {
    uploadHistory.set(identifier, {
      hourly: [],
      daily: []
    });
  }

  const history = uploadHistory.get(identifier);
  const now = Date.now();
  
  history.hourly.push(now);
  history.daily.push(now);
};

/**
 * Get upload statistics for identifier
 * @param {string} identifier - IP address or user ID
 * @param {Map} uploadHistory - Upload history storage
 * @returns {Object} - Upload statistics
 */
export const getUploadStats = (identifier, uploadHistory) => {
  if (!uploadHistory.has(identifier)) {
    return {
      hourly: 0,
      daily: 0,
      total: 0
    };
  }

  const history = uploadHistory.get(identifier);
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  const oneDayAgo = now - (24 * 60 * 60 * 1000);

  const hourly = history.hourly.filter(timestamp => timestamp > oneHourAgo).length;
  const daily = history.daily.filter(timestamp => timestamp > oneDayAgo).length;
  const total = history.daily.length;

  return {
    hourly,
    daily,
    total
  };
};

/**
 * Clear upload history for identifier
 * @param {string} identifier - IP address or user ID
 * @param {Map} uploadHistory - Upload history storage
 */
export const clearUploadHistory = (identifier, uploadHistory) => {
  uploadHistory.delete(identifier);
};

/**
 * Get global upload statistics
 * @param {Map} uploadHistory - Upload history storage
 * @returns {Object} - Global statistics
 */
export const getGlobalUploadStats = (uploadHistory) => {
  const now = Date.now();
  const oneDayAgo = now - (24 * 60 * 60 * 1000);

  let totalUsers = 0;
  let totalUploads = 0;
  let activeUsers = 0;

  uploadHistory.forEach((history, identifier) => {
    totalUsers++;
    totalUploads += history.daily.length;
    
    const recentUploads = history.daily.filter(timestamp => timestamp > oneDayAgo);
    if (recentUploads.length > 0) {
      activeUsers++;
    }
  });

  return {
    totalUsers,
    totalUploads,
    activeUsers,
    averageUploadsPerUser: totalUsers > 0 ? Math.round(totalUploads / totalUsers) : 0
  };
};
