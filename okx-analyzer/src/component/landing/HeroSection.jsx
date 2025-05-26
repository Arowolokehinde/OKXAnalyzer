// components/sections/HeroSection.jsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import FloatingCoins from '../animations/FloatingCoins';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Container variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className="relative py-20 md:py-28 lg:py-32 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950/95"></div>
        <FloatingCoins />
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="flex flex-col items-center text-center"
        >
          {/* Animated Badge */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-r from-blue-900/30 to-teal-900/30 backdrop-blur-md border border-blue-500/20 rounded-full px-4 py-1.5 mb-8"
          >
            <span className="text-sm font-medium text-teal-400">Powered by OKX Chain</span>
          </motion.div>
          
          {/* Main Heading */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white max-w-5xl leading-tight"
          >
            Real-Time <span className="text-gradient">Token Analytics</span> for Smart Investors
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            variants={itemVariants}
            className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl"
          >
            Discover new tokens, track meme coins, and make data-driven trading decisions with our advanced OKX Chain analytics platform.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-slate-800/80 backdrop-blur-sm border border-slate-700 hover:border-teal-500/50 rounded-lg text-white font-medium"
            >
              Watch Demo
            </motion.button>
          </motion.div>
          
          {/* Scroll Indicator */}
          <motion.div 
            variants={itemVariants}
            className="mt-16 animate-bounce"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <div className="w-10 h-10 rounded-full border-2 border-teal-400/30 flex items-center justify-center">
              <div className="w-1.5 h-5 bg-gradient-to-b from-teal-400 to-teal-600 rounded-full"></div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;