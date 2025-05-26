// components/ui/Tooltip.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Tooltip = ({ children, content, position = 'top', delay = 300 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const timeoutRef = useRef(null);
  const triggerRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    if (!shouldRender) {
      setShouldRender(true);
    }
    // Add delay before showing tooltip
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
    // Delay removing the DOM element for animation to complete
    timeoutRef.current = setTimeout(() => {
      setShouldRender(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const tooltipVariants = {
    hidden: { 
      opacity: 0,
      y: position === 'top' ? 10 : -10,
      x: position === 'left' ? 10 : position === 'right' ? -10 : 0,
      scale: 0.95,
    },
    visible: { 
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0,
      y: position === 'top' ? 5 : -5,
      x: position === 'left' ? 5 : position === 'right' ? -5 : 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={triggerRef}
    >
      {children}
      
      {shouldRender && (
        <AnimatePresence>
          {isVisible && (
            <motion.div
              className={`absolute ${getPositionStyles()} z-50 whitespace-nowrap`}
              variants={tooltipVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="px-2 py-1 text-xs font-medium text-white bg-slate-900 rounded-md shadow-lg border border-slate-700">
                {content}
              </div>
              {/* Triangle pointer */}
              <div 
                className={`absolute ${
                  position === 'top' 
                    ? 'top-full left-1/2 -translate-x-1/2 border-t-slate-900' 
                    : position === 'bottom'
                    ? 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900'
                    : position === 'left'
                    ? 'left-full top-1/2 -translate-y-1/2 border-l-slate-900'
                    : 'right-full top-1/2 -translate-y-1/2 border-r-slate-900'
                } w-0 h-0 border-4 border-transparent ${
                  position === 'top' ? 'border-t-slate-900' : 
                  position === 'bottom' ? 'border-b-slate-900' : 
                  position === 'left' ? 'border-l-slate-900' : 
                  'border-r-slate-900'
                }`}
              ></div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default Tooltip;