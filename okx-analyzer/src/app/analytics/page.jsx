// app/analytics/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, LineChart, ArrowRight } from 'lucide-react';

export default function Analytics() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
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
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center pt-16">
        <div className="text-center">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-16 h-16 rounded-full border-b-2 border-t-2 border-teal-500 mx-auto mb-6"
          ></motion.div>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent"
          >
            Loading Analytics
          </motion.h2>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Token Analytics</h1>
          <p className="text-gray-400">Comprehensive analytics for OKX Chain tokens</p>
        </motion.div>
        
        {/* Analytics Categories */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-blue-900/50 to-blue-700/30 p-6 rounded-xl border border-blue-700/30 hover:border-blue-500/50 transition-all duration-300"
          >
            <div className="h-12 w-12 rounded-lg bg-blue-600/30 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Market Overview</h3>
            <p className="text-gray-300 mb-4">Get a comprehensive view of the OKX Chain market</p>
            <button className="text-blue-400 font-medium flex items-center hover:text-blue-300 transition-colors">
              View Market Overview
              <ArrowRight className="ml-1 h-4 w-4" />
            </button>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-purple-900/50 to-purple-700/30 p-6 rounded-xl border border-purple-700/30 hover:border-purple-500/50 transition-all duration-300"
          >
            <div className="h-12 w-12 rounded-lg bg-purple-600/30 flex items-center justify-center mb-4">
              <LineChart className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Token Comparison</h3>
            <p className="text-gray-300 mb-4">Compare multiple tokens side by side</p>
            <button className="text-purple-400 font-medium flex items-center hover:text-purple-300 transition-colors">
              Compare Tokens
              <ArrowRight className="ml-1 h-4 w-4" />
            </button>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-teal-900/50 to-teal-700/30 p-6 rounded-xl border border-teal-700/30 hover:border-teal-500/50 transition-all duration-300"
          >
            <div className="h-12 w-12 rounded-lg bg-teal-600/30 flex items-center justify-center mb-4">
              <PieChart className="h-6 w-6 text-teal-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Volume Analysis</h3>
            <p className="text-gray-300 mb-4">Analyze trading volume patterns and trends</p>
            <button className="text-