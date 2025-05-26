// components/animations/CountUpAnimation.jsx
'use client';

import { useState, useEffect } from 'react';
import { animate } from 'framer-motion';

const CountUpAnimation = ({ 
  start = 0, 
  end, 
  duration = 2, 
  delay = 0,
  decimals = 0,
  startOnView = true
}) => {
  const [value, setValue] = useState(start);
  
  useEffect(() => {
    if (startOnView) {
      // Add a small delay to ensure the animation starts after component is visible
      const timer = setTimeout(() => {
        const controls = animate(start, end, {
          duration,
          delay,
          onUpdate: (value) => {
            setValue(value);
          },
          ease: 'easeOut',
        });
        
        return () => controls.stop();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [start, end, duration, delay, startOnView]);
  
  return decimals ? value.toFixed(decimals) : Math.round(value);
};

export default CountUpAnimation;