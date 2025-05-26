// app/discovery/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, Zap, Rocket } from 'lucide-react';

export default function Discovery() {
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
            Loading Token Discovery
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
          <h1 className="text-3xl font-bold text-white mb-2">Token Discovery</h1>
          <p className="text-gray-400">Find new and trending tokens on OKX Chain</p>
        </motion.div>
        
        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-6 flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-lg bg-slate-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Search tokens by name or address..."
            />
          </div>
          <button className="flex items-center justify-center px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
            <Filter className="h-5 w-5 mr-2" />
            <span>Filters</span>
          </button>
        </motion.div>
        
        {/* Discovery Categories */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-blue-900/50 to-blue-700/30 p-6 rounded-xl border border-blue-700/30 hover:border-blue-500/50 transition-all duration-300"
          >
            <div className="h-12 w-12 rounded-lg bg-blue-600/30 flex items-center justify-center mb-4">
              <Rocket className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">New Listings</h3>
            <p className="text-gray-300 mb-4">Discover the newest tokens launched on OKX Chain</p>
            <button className="text-blue-400 font-medium flex items-center hover:text-blue-300 transition-colors">
              Explore New Listings
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-purple-900/50 to-purple-700/30 p-6 rounded-xl border border-purple-700/30 hover:border-purple-500/50 transition-all duration-300"
          >
            <div className="h-12 w-12 rounded-lg bg-purple-600/30 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Trending Tokens</h3>
            <p className="text-gray-300 mb-4">See which tokens are gaining traction right now</p>
            <button className="text-purple-400 font-medium flex items-center hover:text-purple-300 transition-colors">
              View Trending
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-teal-900/50 to-teal-700/30 p-6 rounded-xl border border-teal-700/30 hover:border-teal-500/50 transition-all duration-300"
          >
            <div className="h-12 w-12 rounded-lg bg-teal-600/30 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-teal-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Meme Coins</h3>
            <p className="text-gray-300 mb-4">Explore popular meme coins with high growth potential</p>
            <button className="text-teal-400 font-medium flex items-center hover:text-teal-300 transition-colors">
              Discover Memes
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
        
        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-16 text-center py-10 px-6 bg-slate-800/30 border border-slate-700/50 rounded-xl"
        >
          <h2 className="text-2xl font-bold text-white mb-3">Advanced Discovery Features Coming Soon</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We're working on AI-powered token discovery, social sentiment analysis, and cross-chain token tracking.
            Stay tuned for updates!
          </p>
        </motion.div>
      </div>
    </div>
  );
}