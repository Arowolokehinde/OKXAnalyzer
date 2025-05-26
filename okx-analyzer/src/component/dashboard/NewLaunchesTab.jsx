'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowUpRight, ArrowDownRight, Filter, Search, Star, ExternalLink, Clock } from 'lucide-react';
import MiniChart from './MiniChart';

const NewLaunchesTab = ({ newTokens }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('24h');
  
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
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        delay: i * 0.05,
        duration: 0.3
      }
    }),
    hover: { 
      y: -5,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.2 }
    }
  };
  
  // Filter tokens based on search and time
  const filteredTokens = newTokens
    .filter(token => {
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return token.name.toLowerCase().includes(searchLower) || 
               token.symbol.toLowerCase().includes(searchLower);
      }
      
      // Apply time filter
      const launchTime = new Date(token.launchTime);
      const now = new Date();
      const hoursDiff = (now - launchTime) / (1000 * 60 * 60);
      
      switch (timeFilter) {
        case '1h':
          return hoursDiff <= 1;
        case '24h':
          return hoursDiff <= 24;
        case '7d':
          return hoursDiff <= 168; // 7 * 24
        case '30d':
          return hoursDiff <= 720; // 30 * 24
        default:
          return true;
      }
    });
  
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Zap className="h-6 w-6 mr-2 text-purple-500" />
          New Token Launches
        </h2>
        
        <div className="flex space-x-3 w-full sm:w-auto">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg bg-slate-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              placeholder="Search tokens..."
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="appearance-none block w-full pl-10 pr-8 py-2 border border-slate-700 rounded-lg bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              <option value="1h">Last 1h</option>
              <option value="24h">Last 24h</option>
              <option value="7d">Last 7d</option>
              <option value="30d">Last 30d</option>
              <option value="all">All Time</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
      </motion.div>
      
      {filteredTokens.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-12 text-center"
        >
          <p className="text-gray-400 mb-4">No tokens found matching your criteria.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setTimeFilter('24h');
            }}
            className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors"
          >
            Reset Filters
          </button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTokens.map((token, index) => (
            <motion.div
              key={token.symbol}
              custom={index}
              variants={cardVariants}
              whileHover="hover"
              className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden hover:border-purple-500/30 transition-all duration-300"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                    {token.symbol.substring(0, 2)}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-white font-medium">{token.name}</h3>
                    <p className="text-gray-400 text-sm">{token.symbol}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button className="p-1.5 rounded-md hover:bg-slate-700 transition-colors text-gray-400 hover:text-purple-400">
                    <Star className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 rounded-md hover:bg-slate-700 transition-colors text-gray-400 hover:text-purple-400">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-4">
                <div className="flex justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Current Price</p>
                    <p className="text-white font-medium">${token.currentPrice.toFixed(8)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Initial Price</p>
                    <p className="text-white font-medium">${token.initialPrice.toFixed(8)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Change</p>
                    <div className={`inline-flex items-center ${token.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {token.change >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                      {Math.abs(token.change).toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                {/* Mini Chart */}
                <div className="h-20 mb-4">
                  <MiniChart data={token.chart || []} positive={token.change >= 0} />
                </div>
                
                {/* Token Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Liquidity</p>
                    <p className="text-white font-medium">${token.liquidity || '0'}</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Volume (24h)</p>
                    <p className="text-white font-medium">${token.volume24h || '0'}</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Holders</p>
                    <p className="text-white font-medium">{token.holders || '0'}</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Launch Time</p>
                    <p className="text-white font-medium">{token.launchTime}</p>
                  </div>
                </div>
              </div>
              
              {/* Card Footer */}
              <div className="p-4 border-t border-slate-700/50">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium flex items-center justify-center"
                >
                  View Details
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default NewLaunchesTab;
