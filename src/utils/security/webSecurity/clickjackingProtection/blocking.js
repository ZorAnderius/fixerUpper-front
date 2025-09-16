/**
 * Blocking Module
 * Handles blocking of clickjacking attempts
 */

/**
 * Block frame attempt
 * @param {string} identifier - IP address or user ID
 * @param {string} reason - Reason for blocking
 * @param {Map} blockedFrames - Blocked frames storage
 * @param {Map} frameAttempts - Frame attempts storage
 */
export const blockFrameAttempt = (identifier, reason, blockedFrames, frameAttempts) => {
  blockedFrames.add(identifier);
  
  if (!frameAttempts.has(identifier)) {
    frameAttempts.set(identifier, []);
  }
  
  frameAttempts.get(identifier).push({
    timestamp: Date.now(),
    reason
  });
};

/**
 * Check if frame is blocked
 * @param {string} identifier - IP address or user ID
 * @param {Set} blockedFrames - Blocked frames storage
 * @returns {boolean} - Is blocked
 */
export const isFrameBlocked = (identifier, blockedFrames) => {
  return blockedFrames.has(identifier);
};

/**
 * Get frame attempt history
 * @param {string} identifier - IP address or user ID
 * @param {Map} frameAttempts - Frame attempts storage
 * @returns {Array} - Attempt history
 */
export const getFrameAttemptHistory = (identifier, frameAttempts) => {
  return frameAttempts.get(identifier) || [];
};

/**
 * Unblock frame attempt
 * @param {string} identifier - IP address or user ID
 * @param {Set} blockedFrames - Blocked frames storage
 * @param {Map} frameAttempts - Frame attempts storage
 */
export const unblockFrameAttempt = (identifier, blockedFrames, frameAttempts) => {
  blockedFrames.delete(identifier);
  frameAttempts.delete(identifier);
};

/**
 * Get blocking statistics
 * @param {Set} blockedFrames - Blocked frames storage
 * @param {Map} frameAttempts - Frame attempts storage
 * @returns {Object} - Blocking statistics
 */
export const getBlockingStats = (blockedFrames, frameAttempts) => {
  const now = Date.now();
  const windowStart = now - (24 * 60 * 60 * 1000); // Last 24 hours

  let totalAttempts = 0;
  let blockedAttempts = 0;

  frameAttempts.forEach((attempts, identifier) => {
    const recentAttempts = attempts.filter(attempt => attempt.timestamp > windowStart);
    totalAttempts += recentAttempts.length;
    
    if (blockedFrames.has(identifier)) {
      blockedAttempts += recentAttempts.length;
    }
  });

  return {
    totalAttempts,
    blockedAttempts,
    blockedFrames: blockedFrames.size,
    blockRate: totalAttempts > 0 ? Math.round((blockedAttempts / totalAttempts) * 100) : 0
  };
};

/**
 * Clear frame attempts (for testing or maintenance)
 * @param {string} identifier - IP address or user ID (optional)
 * @param {Set} blockedFrames - Blocked frames storage
 * @param {Map} frameAttempts - Frame attempts storage
 */
export const clearFrameAttempts = (identifier, blockedFrames, frameAttempts) => {
  if (identifier) {
    blockedFrames.delete(identifier);
    frameAttempts.delete(identifier);
  } else {
    blockedFrames.clear();
    frameAttempts.clear();
  }
};
