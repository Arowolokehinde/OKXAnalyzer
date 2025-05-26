// components/sections/FeaturesSection.jsx
'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const features = [
  {
    title: 'Token Compare Tool',
    description: 'Compare metrics between different tokens side-by-side to identify the best opportunities.',
    icon: '📊',
    color: 'from-blue-500 to-indigo-600',
    delay: 0
  },
  {
    title: 'Meme Coin Tracker',
    description: 'Track trending meme coins and catch viral tokens before they explode in value.',
    icon: '🚀',
    color: 'from-teal-500 to-green-500',
    delay: 0.1
  },
  {
    title: 'Liquidity Analysis',
    description: 'Analyze token liquidity depth and trading patterns to avoid potential pitfalls.',
    icon: '💧',
    color: 'from-purple-500 to-pink-500',
    delay: 0.2
  },
  {
    title: 'Swap Simulator',
    description: 'Simulate swaps to predict slippage and price impact before making actual trades.',
    icon: '🔄',
    color: 'from-orange-500 to-red-500',
    delay: 0.3
  },
  {
    title: 'Custom Alerts',
    description: 'Set up custom alerts for price movements, volume spikes, and new token listings.',
    icon: '🔔',
    color: 'from-yellow-500 to-amber-500',
    delay: 0.4
  },
  {
    title: 'API Integration',
    description: 'Access our analytics through our API to build your own tools and dashboards.',
    icon: '⚙️',
    color: 'from-sky-500 to-blue-500',
    delay: 0.5
  }
];

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const featureVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (delay) => ({
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        delay: delay
      }
    })
  };
  
  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-900/50 to-slate-950/50"></div>
        
        {/* Grid pattern */}
        <svg width="100%" height="100%" className="absolute inset-0 opacity-10">
          <pattern id="grid-pattern" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M0 32V0h32" fill="none" stroke="rgba(45, 212, 191, 0.3)" strokeWidth="0.5"></path>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid-pattern)"></rect>
        </svg>
        
        {/* Floating elements */}
        {[...Array(5)].map((_, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full bg-gradient-to-r from-blue-500/10 to-teal-500/10"
            style={{
              width: Math.random() * 100 + 100,
              height: Math.random() * 100 + 100,
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
              filter: 'blur(40px)'
            }}
            animate={{
              x: [0, Math.random() * 50 - 25, 0],
              y: [0, Math.random() * 50 - 25, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">Advanced Analytics Tools</h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Leverage powerful data insights and tools to make informed decisions about OKX Chain tokens
          </p>
        </motion.div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              custom={feature.delay}
              variants={featureVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-teal-500/30 transition-all duration-300 relative group"
            >
              {/* Card content */}
              <div className="p-6">
                <div className={`h-16 w-16 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center text-3xl mb-4 shadow-lg shadow-${feature.color.split(' ')[1]}/20`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-teal-400 transition-colors">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
              
              {/* Highlight effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-teal-500/10 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                <div className={`absolute top-0 right-0 bg-gradient-to-bl ${feature.color} w-8 h-8 transform translate-x-1/2 -translate-y-1/2 rotate-45`}></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg text-white font-medium inline-flex items-center"
          >
            Explore All Features
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;