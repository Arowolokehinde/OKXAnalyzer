// components/sections/TokenDiscoverySection.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Filter, Clock, RefreshCw, Sparkles } from 'lucide-react';
import TokenCard from '../ui/TokenCard';
import TokenGridBackground from '../animations/TokenGridBackgroundAnimation';

// Sample data for token cards - same as before
const sampleTokens = [
  {
    id: '1',
    name: 'MoonDoge',
    symbol: 'MDOGE',
    priceUSD: 0.00025,
    priceChangePercent: 145.2,
    volumeUSD: 78000,
    liquidityUSD: 124000,
    launchTime: Date.now() - 86400000 * 0.5, // 12 hours ago
    isPositive: true,
    logoUrl: 'https://via.placeholder.com/40'
  },
  {
    id: '2',
    name: 'PepeFrog',
    symbol: 'PFROG',
    priceUSD: 0.00067,
    priceChangePercent: 72.8,
    volumeUSD: 45000,
    liquidityUSD: 98000,
    launchTime: Date.now() - 86400000 * 1, // 1 day ago
    isPositive: true,
    logoUrl: 'https://via.placeholder.com/40'
  },
  {
    id: '3',
    name: 'SharkCoin',
    symbol: 'SHARK',
    priceUSD: 0.0032,
    priceChangePercent: -12.5,
    volumeUSD: 128000,
    liquidityUSD: 320000,
    launchTime: Date.now() - 86400000 * 2, // 2 days ago
    isPositive: false,
    logoUrl: 'https://via.placeholder.com/40'
  },
  {
    id: '4',
    name: 'RocketDao',
    symbol: 'RDAO',
    priceUSD: 0.085,
    priceChangePercent: 28.3,
    volumeUSD: 245000,
    liquidityUSD: 780000,
    launchTime: Date.now() - 86400000 * 1.5, // 1.5 days ago
    isPositive: true,
    logoUrl: 'https://via.placeholder.com/40'
  },
  {
    id: '5',
    name: 'MetaLand',
    symbol: 'MLAND',
    priceUSD: 0.0012,
    priceChangePercent: -5.7,
    volumeUSD: 67000,
    liquidityUSD: 135000,
    launchTime: Date.now() - 86400000 * 0.75, // 18 hours ago
    isPositive: false,
    logoUrl: 'https://via.placeholder.com/40'
  },
  {
    id: '6',
    name: 'CatPaw',
    symbol: 'CPAW',
    priceUSD: 0.00042,
    priceChangePercent: 92.1,
    volumeUSD: 88000,
    liquidityUSD: 145000,
    launchTime: Date.now() - 86400000 * 0.25, // 6 hours ago
    isPositive: true,
    logoUrl: 'https://via.placeholder.com/40'
  }
];

const TokenDiscoverySection = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [activeTimeFilter, setActiveTimeFilter] = useState('24h');
  const [isLoading, setIsLoading] = useState(false);
  
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  
  // Simulate loading effect when changing tabs or filters
  const handleTabChange = (tab) => {
    setIsLoading(true);
    setActiveTab(tab);
    setTimeout(() => setIsLoading(false), 800);
  };
  
  const handleTimeFilterChange = (filter) => {
    setIsLoading(true);
    setActiveTimeFilter(filter);
    setTimeout(() => setIsLoading(false), 800);
  };
  
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
  
  const tabVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section ref={ref} className="py-16 px-4 sm:px-6 lg:px-8 relative">
      {/* Background animation */}
      <div className="absolute inset-0 z-0 opacity-20">
        <TokenGridBackground />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <div className="flex items-center">
              <Sparkles className="text-teal-400 mr-2 h-5 w-5" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">Token Discovery</h2>
            </div>
            <p className="text-gray-400 mt-2">Find the newest and most promising tokens on OKX Chain</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg flex items-center"
            >
              <Filter size={16} className="mr-2" />
              Filters
            </motion.button>
            
            <select className="bg-slate-800 border border-slate-700 text-white rounded-lg py-2 px-4 appearance-none hover:border-teal-500/50 transition-colors">
              <option>Sort by Volume</option>
              <option>Sort by Age</option>
              <option>Sort by Liquidity</option>
              <option>Sort by Price Change</option>
            </select>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 800);
              }}
            >
              <motion.div
                animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
              >
                <RefreshCw size={16} />
              </motion.div>
            </motion.button>
          </div>
        </motion.div>
        
        {/* Tabs */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex overflow-x-auto hide-scrollbar pb-2 mb-6 border-b border-slate-800"
        >
          {['all', 'memes', 'defi', 'gamefi', 'new'].map((tab, index) => (
            <motion.button
              key={tab}
              variants={tabVariants}
              custom={index}
              onClick={() => handleTabChange(tab)}
              className={`px-5 py-2 whitespace-nowrap relative ${
                activeTab === tab
                  ? 'text-teal-400 font-medium' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              
              {/* Animated underline for active tab */}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-teal-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </motion.button>
          ))}
        </motion.div>
        
        {/* Time Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center overflow-x-auto hide-scrollbar space-x-2 mb-8"
        >
          <Clock size={16} className="text-gray-400 flex-shrink-0" />
          <span className="text-gray-400 mr-2 whitespace-nowrap">Launch Time:</span>
          
          {['24h', '7d', '30d', 'all'].map((timeFilter) => (
            <button
              key={timeFilter}
              onClick={() => handleTimeFilterChange(timeFilter)}
              className={`px-3 py-1 text-sm rounded-full whitespace-nowrap transition-all duration-300 ${
                activeTimeFilter === timeFilter
                  ? 'bg-gradient-to-r from-blue-600/80 to-teal-500/80 text-white shadow-lg shadow-blue-900/20' 
                  : 'bg-slate-800/80 text-gray-400 hover:bg-slate-700/80'
              }`}
            >
              {timeFilter}
            </button>
          ))}
        </motion.div>
        
        {/* Loading Indicator */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <motion.div 
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { repeat: Infinity, duration: 1, ease: "linear" },
                scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
              }}
              className="w-12 h-12 border-2 border-t-teal-500 border-blue-500/30 rounded-full"
            />
          </div>
        ) : (
          /* Token Cards Grid */
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {sampleTokens.map((token, index) => (
              <TokenCard 
                key={token.id} 
                token={token} 
                index={index}
                isVisible={isInView && !isLoading}
              />
            ))}
          </motion.div>
        )}
        
        {/* Load More Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center mt-12"
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-slate-800/80 backdrop-blur-sm border border-slate-700 hover:border-teal-500/50 rounded-lg text-white font-medium transition-all"
          >
            Load More Tokens
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default TokenDiscoverySection;