// components/animations/AnimatedBackground.jsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = ({ variant = 'default' }) => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    // Generate random particles based on screen size
    const generateParticles = () => {
      const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
      
      // Determine number of particles based on screen size
      const count = windowWidth < 768 ? 15 : 30;
      
      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * windowWidth,
        y: Math.random() * windowHeight,
        size: Math.random() * 4 + 1, // 1-5px
        duration: Math.random() * 20 + 10, // 10-30s
        delay: Math.random() * 5,
        opacity: Math.random() * 0.3 + 0.1, // 0.1-0.4
        type: Math.random() > 0.7 ? 'circle' : 'square',
        color: getRandomColor(variant)
      }));
      
      setParticles(newParticles);
    };
    
    // Helper to get random color based on theme variant
    const getRandomColor = (variant) => {
      const colors = {
        default: ['bg-blue-500/10', 'bg-teal-500/10', 'bg-indigo-500/10'],
        blue: ['bg-blue-500/10', 'bg-blue-600/10', 'bg-sky-500/10'],
        green: ['bg-green-500/10', 'bg-teal-500/10', 'bg-emerald-500/10'],
        purple: ['bg-purple-500/10', 'bg-indigo-500/10', 'bg-violet-500/10'],
        mixed: ['bg-blue-500/10', 'bg-teal-500/10', 'bg-purple-500/10', 'bg-pink-500/10', 'bg-amber-500/10']
      };
      
      const colorSet = colors[variant] || colors.default;
      return colorSet[Math.floor(Math.random() * colorSet.length)];
    };
    
    generateParticles();
    
    // Regenerate particles on window resize
    const handleResize = () => {
      generateParticles();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [variant]);
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute ${particle.type === 'circle' ? 'rounded-full' : 'rounded-md rotate-45'} ${particle.color} backdrop-blur-sm`}
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.x,
            top: particle.y,
            opacity: particle.opacity,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, particle.id % 2 === 0 ? 30 : -30, 0],
            opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* Add some larger blurred gradient spots */}
      {Array.from({ length: 5 }).map((_, index) => (
        <motion.div
          key={`gradient-${index}`}
          className="absolute rounded-full bg-gradient-to-r from-blue-500/5 to-teal-500/5"
          style={{
            width: Math.random() * 300 + 200,
            height: Math.random() * 300 + 200,
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`,
            filter: 'blur(80px)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: Math.random() * 10 + 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;