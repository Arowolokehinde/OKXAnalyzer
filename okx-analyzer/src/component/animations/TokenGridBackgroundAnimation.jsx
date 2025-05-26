// components/animations/TokenGridBackground.jsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const TokenGridBackground = () => {
  const [gridPoints, setGridPoints] = useState([]);
  
  useEffect(() => {
    const generateGrid = () => {
      const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
      
      // Adjust grid density based on screen size
      const cols = windowWidth < 768 ? 8 : 16;
      const rows = windowWidth < 768 ? 12 : 24;
      
      const horizontalGap = windowWidth / cols;
      const verticalGap = windowHeight / rows;
      
      const points = [];
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          // Skip some points randomly for a more organic look
          if (Math.random() > 0.7) continue;
          
          points.push({
            id: `${i}-${j}`,
            x: i * horizontalGap,
            y: j * verticalGap,
            size: Math.random() * 3 + 1, // 1-4px
            duration: Math.random() * 2 + 2, // 2-4s
            delay: Math.random() * 2,
          });
        }
      }
      
      setGridPoints(points);
    };
    
    generateGrid();
    
    const handleResize = () => {
      generateGrid();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="absolute inset-0">
      {gridPoints.map((point) => (
        <motion.div
          key={point.id}
          className="absolute rounded-full bg-teal-400"
          style={{
            width: point.size,
            height: point.size,
            left: point.x,
            top: point.y,
          }}
          animate={{
            opacity: [0.1, 0.5, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: point.duration,
            delay: point.delay,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      ))}
      
      {/* Add some random lines connecting points */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.1)" />
            <stop offset="100%" stopColor="rgba(45, 212, 191, 0.1)" />
          </linearGradient>
        </defs>
        {gridPoints.slice(0, gridPoints.length / 3).map((point, index) => {
          // Connect to a random other point
          const targetPoint = gridPoints[(index + Math.floor(Math.random() * 5) + 1) % gridPoints.length];
          if (!targetPoint) return null;
          
          return (
            <motion.line
              key={`line-${point.id}`}
              x1={point.x}
              y1={point.y}
              x2={targetPoint.x}
              y2={targetPoint.y}
              stroke="url(#lineGradient)"
              strokeWidth="0.5"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.2, 0],
              }}
              transition={{
                duration: 4,
                delay: point.delay,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default TokenGridBackground;