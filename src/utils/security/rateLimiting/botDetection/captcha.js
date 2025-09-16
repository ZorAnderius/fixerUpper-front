/**
 * CAPTCHA Module
 * Handles CAPTCHA generation and verification
 */

/**
 * Generate CAPTCHA challenge
 * @param {string} identifier - IP address
 * @returns {Object} - CAPTCHA challenge data
 */
export const generateCAPTCHA = (identifier) => {
  const challenge = {
    id: generateChallengeId(),
    type: 'math', // Simple math CAPTCHA
    question: generateMathQuestion(),
    timestamp: Date.now(),
    attempts: 0,
    maxAttempts: 3
  };

  return challenge;
};

/**
 * Verify CAPTCHA response
 * @param {Object} challenge - CAPTCHA challenge
 * @param {string} answer - User's answer
 * @returns {Object} - Verification result
 */
export const verifyCAPTCHA = (challenge, answer) => {
  if (!challenge) {
    return { valid: false, reason: 'No active challenge' };
  }

  if (challenge.attempts >= challenge.maxAttempts) {
    return { valid: false, reason: 'Max attempts exceeded' };
  }

  challenge.attempts++;

  const isCorrect = checkMathAnswer(challenge.question, answer);
  
  if (isCorrect) {
    return { valid: true, reason: 'Correct answer' };
  } else {
    return { 
      valid: false, 
      reason: 'Incorrect answer', 
      attempts: challenge.attempts 
    };
  }
};

/**
 * Generate math question for CAPTCHA
 * @returns {Object} - Math question
 */
export const generateMathQuestion = () => {
  const operations = ['+', '-', '*'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let a, b, answer;
  
  switch (operation) {
    case '+':
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      answer = a + b;
      break;
    case '-':
      a = Math.floor(Math.random() * 10) + 5;
      b = Math.floor(Math.random() * 5) + 1;
      answer = a - b;
      break;
    case '*':
      a = Math.floor(Math.random() * 5) + 1;
      b = Math.floor(Math.random() * 5) + 1;
      answer = a * b;
      break;
  }

  return {
    question: `${a} ${operation} ${b} = ?`,
    answer: answer
  };
};

/**
 * Check math answer
 * @param {Object} question - Math question
 * @param {string} answer - User's answer
 * @returns {boolean} - Is correct
 */
export const checkMathAnswer = (question, answer) => {
  const userAnswer = parseInt(answer);
  return !isNaN(userAnswer) && userAnswer === question.answer;
};

/**
 * Generate challenge ID
 * @returns {string} - Unique challenge ID
 */
export const generateChallengeId = () => {
  return 'captcha_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

/**
 * Validate CAPTCHA challenge
 * @param {Object} challenge - CAPTCHA challenge
 * @returns {boolean} - Is valid
 */
export const validateChallenge = (challenge) => {
  if (!challenge || !challenge.id || !challenge.question) {
    return false;
  }

  // Check if challenge is expired (5 minutes)
  const now = Date.now();
  const expiryTime = challenge.timestamp + (5 * 60 * 1000);
  
  return now < expiryTime;
};
