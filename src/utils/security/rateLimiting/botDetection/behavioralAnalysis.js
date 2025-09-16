/**
 * Behavioral Analysis Module
 * Analyzes user behavior patterns for bot detection
 */

/**
 * Analyze behavioral patterns
 * @param {string} identifier - IP address
 * @param {Object} behaviorData - Behavioral data
 * @returns {Object} - Analysis result
 */
export const analyzeBehavior = (identifier, behaviorData) => {
  const analysis = { score: 0, reasons: [] };
  const { mouseMovements = [], keystrokeTiming = [], timing = {} } = behaviorData;

  // Mouse movement analysis
  if (mouseMovements.length > 0) {
    const mouseAnalysis = analyzeMouseMovements(mouseMovements);
    analysis.score += mouseAnalysis.score;
    analysis.reasons.push(...mouseAnalysis.reasons);
  } else if (timing.pageLoad) {
    // No mouse movements but page loaded - suspicious
    analysis.score += 1;
    analysis.reasons.push('No mouse movements detected');
  }

  // Keystroke timing analysis
  if (keystrokeTiming.length > 0) {
    const keystrokeAnalysis = analyzeKeystrokeTiming(keystrokeTiming);
    analysis.score += keystrokeAnalysis.score;
    analysis.reasons.push(...keystrokeAnalysis.reasons);
  }

  // Timing analysis
  if (timing.pageLoad && timing.pageLoad < 100) {
    analysis.score += 0.5;
    analysis.reasons.push('Suspiciously fast page load');
  }

  if (timing.timeOnPage && timing.timeOnPage < 1000) {
    analysis.score += 0.5;
    analysis.reasons.push('Very short time on page');
  }

  return analysis;
};

/**
 * Analyze mouse movements
 * @param {Array} movements - Mouse movement data
 * @returns {Object} - Analysis result
 */
export const analyzeMouseMovements = (movements) => {
  const analysis = { score: 0, reasons: [] };

  if (movements.length < 5) {
    analysis.score += 1;
    analysis.reasons.push('Too few mouse movements');
    return analysis;
  }

  // Analyze movement patterns
  const speeds = [];
  const directions = [];

  for (let i = 1; i < movements.length; i++) {
    const prev = movements[i - 1];
    const curr = movements[i];
    
    const distance = Math.sqrt(
      Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
    );
    const time = curr.timestamp - prev.timestamp;
    
    if (time > 0) {
      speeds.push(distance / time);
      directions.push(Math.atan2(curr.y - prev.y, curr.x - prev.x));
    }
  }

  // Check for unnatural movement patterns
  const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  const speedVariance = speeds.reduce((sum, speed) => sum + Math.pow(speed - avgSpeed, 2), 0) / speeds.length;

  if (avgSpeed > 1000) { // Very fast movements
    analysis.score += 0.5;
    analysis.reasons.push('Unnaturally fast mouse movements');
  }

  if (speedVariance < 10) { // Too consistent
    analysis.score += 0.5;
    analysis.reasons.push('Unnaturally consistent mouse speed');
  }

  // Check for straight-line movements
  const straightLineMovements = detectStraightLineMovements(movements);
  if (straightLineMovements > 0.8) {
    analysis.score += 1;
    analysis.reasons.push('Too many straight-line movements');
  }

  return analysis;
};

/**
 * Analyze keystroke timing
 * @param {Array} keystrokes - Keystroke timing data
 * @returns {Object} - Analysis result
 */
export const analyzeKeystrokeTiming = (keystrokes) => {
  const analysis = { score: 0, reasons: [] };

  if (keystrokes.length < 3) {
    analysis.score += 0.5;
    analysis.reasons.push('Too few keystrokes for analysis');
    return analysis;
  }

  // Calculate timing intervals
  const intervals = [];
  for (let i = 1; i < keystrokes.length; i++) {
    intervals.push(keystrokes[i].timestamp - keystrokes[i - 1].timestamp);
  }

  // Check for unnaturally consistent timing
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;

  if (variance < 10) { // Too consistent
    analysis.score += 1;
    analysis.reasons.push('Unnaturally consistent keystroke timing');
  }

  // Check for too fast typing
  if (avgInterval < 50) {
    analysis.score += 0.5;
    analysis.reasons.push('Unnaturally fast typing');
  }

  return analysis;
};

/**
 * Detect straight-line movements
 * @param {Array} movements - Mouse movements
 * @returns {number} - Ratio of straight-line movements
 */
export const detectStraightLineMovements = (movements) => {
  if (movements.length < 3) return 0;

  let straightMovements = 0;
  const threshold = 0.1; // 0.1 radians (~5.7 degrees)

  for (let i = 2; i < movements.length; i++) {
    const p1 = movements[i - 2];
    const p2 = movements[i - 1];
    const p3 = movements[i];

    const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
    
    const angleDiff = Math.abs(angle1 - angle2);
    const normalizedDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);
    
    if (normalizedDiff < threshold) {
      straightMovements++;
    }
  }

  return straightMovements / (movements.length - 2);
};
