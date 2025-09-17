import { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

/**
 * Hook for managing animation states and triggers
 */
export const useAnimation = (options = {}) => {
  const {
    trigger = 'onMount',
    delay = 0,
    duration = 0.5,
    repeat = false,
    repeatDelay = 0,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    let timeoutId;

    const triggerAnimation = () => {
      if (delay > 0) {
        timeoutId = setTimeout(() => {
          setIsVisible(true);
          setIsAnimating(true);
        }, delay);
      } else {
        setIsVisible(true);
        setIsAnimating(true);
      }
    };

    switch (trigger) {
      case 'onMount':
        triggerAnimation();
        break;
      case 'onScroll':
        if (isInView) {
          triggerAnimation();
        }
        break;
      case 'onHover':
        // Will be handled by hover events
        break;
      case 'onClick':
        // Will be handled by click events
        break;
      default:
        triggerAnimation();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [trigger, delay, isInView]);

  const startAnimation = () => {
    setIsVisible(true);
    setIsAnimating(true);
  };

  const stopAnimation = () => {
    setIsVisible(false);
    setIsAnimating(false);
  };

  const resetAnimation = () => {
    setIsVisible(false);
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(true);
      setIsAnimating(true);
    }, 100);
  };

  return {
    ref,
    isVisible,
    isAnimating,
    startAnimation,
    stopAnimation,
    resetAnimation,
    isInView,
  };
};

/**
 * Hook for staggered animations
 */
export const useStaggeredAnimation = (itemCount, options = {}) => {
  const {
    staggerDelay = 0.1,
    initialDelay = 0,
    trigger = 'onMount',
  } = options;

  const [visibleItems, setVisibleItems] = useState(new Set());
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (trigger === 'onMount' || (trigger === 'onScroll' && isInView)) {
      const timeouts = [];

      for (let i = 0; i < itemCount; i++) {
        const delay = initialDelay + (i * staggerDelay * 1000);
        const timeoutId = setTimeout(() => {
          setVisibleItems(prev => new Set([...prev, i]));
        }, delay);
        timeouts.push(timeoutId);
      }

      return () => {
        timeouts.forEach(clearTimeout);
      };
    }
  }, [itemCount, staggerDelay, initialDelay, trigger, isInView]);

  const isItemVisible = (index) => visibleItems.has(index);

  const resetAnimation = () => {
    setVisibleItems(new Set());
  };

  return {
    ref,
    isItemVisible,
    resetAnimation,
    isInView,
  };
};

/**
 * Hook for scroll-triggered animations
 */
export const useScrollAnimation = (options = {}) => {
  const {
    threshold = 0.3,
    rootMargin = '0px',
    triggerOnce = true,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(entry.target);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
};

/**
 * Hook for hover animations
 */
export const useHoverAnimation = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return {
    isHovered,
    handleMouseEnter,
    handleMouseLeave,
  };
};

/**
 * Hook for click animations
 */
export const useClickAnimation = () => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 150);
  };

  return {
    isClicked,
    handleClick,
  };
};

/**
 * Hook for loading animations
 */
export const useLoadingAnimation = (isLoading) => {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShowLoader(true);
    } else {
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 300); // Delay to prevent flicker

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return showLoader;
};

/**
 * Hook for counter animations
 */
export const useCounterAnimation = (targetValue, duration = 2000) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (targetValue === 0) {
      setCurrentValue(0);
      return;
    }

    setIsAnimating(true);
    const startTime = Date.now();
    const startValue = currentValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const newValue = Math.round(startValue + (targetValue - startValue) * easeOut);
      setCurrentValue(newValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue, duration]);

  return { currentValue, isAnimating };
};













