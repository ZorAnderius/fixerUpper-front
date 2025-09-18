/**
 * Animation transition utilities
 */

// Common transition presets
export const transitions = {
  // Smooth transitions
  smooth: {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.3,
  },
  
  // Spring transitions
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },
  
  // Bounce transitions
  bounce: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
  },
  
  // Quick transitions
  quick: {
    type: 'tween',
    ease: 'easeOut',
    duration: 0.2,
  },
  
  // Slow transitions
  slow: {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.6,
  },
  
  // Anticipate transitions
  anticipate: {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4,
  },
  
  // Back transitions
  back: {
    type: 'tween',
    ease: 'backOut',
    duration: 0.5,
  },
};

// Easing functions
export const easing = {
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  easeInCubic: [0.4, 0, 0.6, 1],
  easeOutCubic: [0, 0, 0.2, 1],
  easeInOutCubic: [0.4, 0, 0.2, 1],
  easeInQuart: [0.5, 0, 0.7, 1],
  easeOutQuart: [0, 0, 0.2, 1],
  easeInOutQuart: [0.5, 0, 0.2, 1],
  easeInQuint: [0.6, 0, 0.8, 1],
  easeOutQuint: [0, 0, 0.2, 1],
  easeInOutQuint: [0.6, 0, 0.2, 1],
  easeInSine: [0.1, 0, 0.6, 1],
  easeOutSine: [0, 0, 0.4, 1],
  easeInOutSine: [0.1, 0, 0.4, 1],
  easeInExpo: [0.7, 0, 0.8, 1],
  easeOutExpo: [0, 0, 0.2, 1],
  easeInOutExpo: [0.7, 0, 0.2, 1],
  easeInCirc: [0.6, 0, 0.7, 1],
  easeOutCirc: [0, 0, 0.3, 1],
  easeInOutCirc: [0.6, 0, 0.3, 1],
};

// Stagger delays
export const staggerDelays = {
  fast: 0.05,
  normal: 0.1,
  slow: 0.2,
  slower: 0.3,
};

// Animation durations
export const durations = {
  instant: 0,
  fast: 0.1,
  quick: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
  slowest: 1.2,
};

// Spring configurations
export const springs = {
  gentle: {
    type: 'spring',
    stiffness: 120,
    damping: 20,
  },
  wobbly: {
    type: 'spring',
    stiffness: 180,
    damping: 12,
  },
  stiff: {
    type: 'spring',
    stiffness: 210,
    damping: 20,
  },
  slow: {
    type: 'spring',
    stiffness: 280,
    damping: 60,
  },
  molasses: {
    type: 'spring',
    stiffness: 280,
    damping: 120,
  },
};

// Custom transition creators
export const createTransition = (duration = 0.3, ease = 'easeInOut', delay = 0) => ({
  type: 'tween',
  ease,
  duration,
  delay,
});

export const createSpring = (stiffness = 300, damping = 30, mass = 1) => ({
  type: 'spring',
  stiffness,
  damping,
  mass,
});

export const createStagger = (staggerChildren = 0.1, delayChildren = 0) => ({
  staggerChildren,
  delayChildren,
});

// Viewport-based animations
export const viewportOptions = {
  once: true,
  amount: 0.3,
  margin: '-100px',
};

export const viewportOptionsFull = {
  once: true,
  amount: 1,
  margin: '0px',
};

// Hover animations
export const hoverScale = {
  scale: 1.05,
  transition: transitions.quick,
};

export const hoverLift = {
  y: -5,
  transition: transitions.quick,
};

export const hoverGlow = {
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
  transition: transitions.quick,
};

// Tap animations
export const tapScale = {
  scale: 0.95,
  transition: transitions.quick,
};

export const tapPress = {
  scale: 0.98,
  transition: transitions.quick,
};

// Loading animations
export const loadingPulse = {
  scale: [1, 1.1, 1],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const loadingRotate = {
  rotate: 360,
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'linear',
  },
};

export const loadingBounce = {
  y: [0, -20, 0],
  transition: {
    duration: 0.6,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// Entrance animations
export const entranceFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: transitions.smooth,
};

export const entranceSlideUp = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  transition: transitions.smooth,
};

export const entranceSlideDown = {
  initial: { opacity: 0, y: -50 },
  animate: { opacity: 1, y: 0 },
  transition: transitions.smooth,
};

export const entranceSlideLeft = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  transition: transitions.smooth,
};

export const entranceSlideRight = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  transition: transitions.smooth,
};

// Exit animations
export const exitFade = {
  exit: { opacity: 0 },
  transition: transitions.quick,
};

export const exitSlideUp = {
  exit: { opacity: 0, y: -50 },
  transition: transitions.quick,
};

export const exitSlideDown = {
  exit: { opacity: 0, y: 50 },
  transition: transitions.quick,
};

export const exitSlideLeft = {
  exit: { opacity: 0, x: -50 },
  transition: transitions.quick,
};

export const exitSlideRight = {
  exit: { opacity: 0, x: 50 },
  transition: transitions.quick,
};














