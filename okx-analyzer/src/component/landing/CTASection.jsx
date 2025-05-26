// components/sections/CTASection.jsx
'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Play, CheckCircle } from 'lucide-react';

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  const benefits = [
    'Real-time token launch analytics',
    'Early access to trending meme coins',
    'Comprehensive market insights',
    'Customizable watchlists and alerts'
  ];
  
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
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 } 
    }
  };

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950"></div>
        
        {/* Animated gradient background */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-teal-900/20 to-purple-900/20 opacity-40"
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear'
          }}
        />
        
        {/* Animated Particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, index) => (
            <motion.div
              key={index}
              className="absolute rounded-full bg-teal-500/20"
              style={{
                width: Math.random() * 80 + 40,
                height: Math.random() * 80 + 40,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="flex-1"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
            >
              Ready to Discover Your Next <span className="text-gradient">Big Token</span> Opportunity?
            </motion.h2>
            
            <motion.p 
              variants={itemVariants}
              className="text-gray-300 text-lg mb-8"
            >
              Join thousands of traders who are already using OKX Launch Analytics to find early opportunities
              and make data-driven decisions.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="space-y-3 mb-8"
            >
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-teal-400 mr-3 flex-shrink-0" />
                  <p className="text-gray-300">{benefit}</p>
                </div>
              ))}
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30"
              >
                Get Started for Free
                <ArrowRight className="h-5 w-5" />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-slate-800/80 backdrop-blur-sm border border-slate-700 hover:border-teal-500/50 rounded-lg text-white font-medium flex items-center justify-center gap-2"
              >
                <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center">
                  <Play className="h-3 w-3 text-slate-900 ml-0.5" />
                </div>
                Watch Demo
              </motion.button>
            </motion.div>
          </motion.div>
          
          {/* Right Visual Element */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex-1 relative"
          >
            {/* Dashboard Mockup */}
            <div className="relative mx-auto max-w-md lg:max-w-lg">
              <div className="bg-slate-800/90 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-2xl shadow-blue-900/20 overflow-hidden">
                {/* Dashboard Header */}
                <div className="border-b border-slate-700/50 p-4">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                    <div className="w-60 mx-auto bg-slate-700/50 h-6 rounded-md"></div>
                  </div>
                </div>
                
                {/* Dashboard Content */}
                <div className="p-6 space-y-4">
                  {/* Chart Area */}
                  <div className="h-40 bg-slate-700/30 rounded-lg overflow-hidden relative">
                    {/* Simplified Chart Visualization */}
                    <svg className="w-full h-full" viewBox="0 0 100 40">
                      <path 
                        d="M0,30 C10,28 20,32 30,20 C40,8 50,15 60,14 C70,13 80,5 90,10 L90,40 L0,40 Z" 
                        fill="url(#chart-gradient)" 
                        strokeWidth="2"
                        stroke="#3B82F6"
                      />
                      <defs>
                        <linearGradient id="chart-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Animated point on the chart */}
                      <motion.circle 
                        cx="60" 
                        cy="14" 
                        r="2"
                        fill="#fff"
                        animate={{ 
                          r: [2, 4, 2],
                          opacity: [0.6, 1, 0.6]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity
                        }}
                      />
                    </svg>
                  </div>
                  
                  {/* Dashboard Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="bg-slate-700/30 p-3 rounded-lg">
                        <div className="h-3 w-20 bg-slate-600 rounded-full mb-2"></div>
                        <div className="h-5 w-12 bg-teal-500/30 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Token List */}
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="bg-slate-700/30 p-3 rounded-lg flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-500/30 mr-3"></div>
                          <div>
                            <div className="h-3 w-16 bg-slate-600 rounded-full mb-1"></div>
                            <div className="h-2 w-10 bg-slate-600 rounded-full"></div>
                          </div>
                        </div>
                        <div className="h-4 w-14 bg-green-500/30 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Glowing effect behind the dashboard */}
              <div className="absolute -inset-4 bg-blue-500/20 rounded-xl blur-3xl -z-10"></div>
              
              {/* Decorative elements */}
              <motion.div 
                className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              />
              <motion.div 
                className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-r from-teal-500/30 to-blue-500/30 blur-xl"
                animate={{ 
                  scale: [1, 1.3, 1],
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;