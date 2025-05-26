'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, ChevronDown, Clock, TrendingUp, DollarSign, Users } from 'lucide-react';

const MemeCoinsFilters = ({ isInView, filters, setFilters }) => {
  const [isTimeRangeOpen, setIsTimeRangeOpen] = useState(false);
  const [isSortByOpen, setIsSortByOpen] = useState(false);
  const [isChainOpen, setIsChainOpen] = useState(false);
  
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
  
  // Time range options
  const timeRangeOptions = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: 'all', label: 'All Time' }
  ];
  
  // Sort by options
  const sortByOptions = [
    { value: 'trending', label: 'Trending', icon: <TrendingUp className="h-4 w-4 mr-2" /> },
    { value: 'marketCap', label: 'Market Cap', icon: <DollarSign className="h-4 w-4 mr-2" /> },
    { value: 'volume', label: 'Volume', icon: <Users className="h-4 w-4 mr-2" /> },
    { value: 'newest', label: 'Newest', icon: <Clock className="h-4 w-4 mr-2" /> }
  ];
  
  // Chain options
  const chainOptions = [
    { value: 'all', label: 'All Chains' },
    { value: 'Ethereum', label: 'Ethereum' },
    { value: 'Solana', label: 'Solana' },
    { value: 'OKX Chain', label: 'OKX Chain' },
    { value: 'Arbitrum', label: 'Arbitrum' },
    { value: 'Base', label: 'Base' },
    { value: 'BNB Chain', label: 'BNB Chain' }
  ];
  
  // Handle time range change
  const handleTimeRangeChange = (value) => {
    setFilters({ ...filters, timeRange: value });
    setIsTimeRangeOpen(false);
  };
  
  // Handle sort by change
  const handleSortByChange = (value) => {
    setFilters({ ...filters, sortBy: value });
    setIsSortByOpen(false);
  };
  
  // Handle chain change
  const handleChainChange = (value) => {
    setFilters({ ...filters, chain: value });
    setIsChainOpen(false);
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="mb-8 bg-slate-800/30 border border-slate-700/30 p-4 rounded-xl"
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center text-gray-400 mr-2">
          <Filter className="h-4 w-4 mr-1" />
          <span className="text-sm">Filters:</span>
        </div>
        
        {/* Time Range Filter */}
        <div className="relative">
          <button
            onClick={() => setIsTimeRangeOpen(!isTimeRangeOpen)}
            className="flex items-center px-3 py-2 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-sm text-white transition-colors"
          >
            <Clock className="h-4 w-4 mr-2 text-purple-400" />
            {timeRangeOptions.find(option => option.value === filters.timeRange)?.label}
            <ChevronDown className="h-4 w-4 ml-2" />
          </button>
          
          {isTimeRangeOpen && (
            <div className="absolute z-10 mt-1 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
              {timeRangeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleTimeRangeChange(option.value)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors ${
                    filters.timeRange === option.value ? 'bg-purple-500/20 text-purple-400' : 'text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Sort By Filter */}
        <div className="relative">
          <button
            onClick={() => setIsSortByOpen(!isSortByOpen)}
            className="flex items-center px-3 py-2 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-sm text-white transition-colors"
          >
            {sortByOptions.find(option => option.value === filters.sortBy)?.icon}
            {sortByOptions.find(option => option.value === filters.sortBy)?.label}
            <ChevronDown className="h-4 w-4 ml-2" />
          </button>
          
          {isSortByOpen && (
            <div className="absolute z-10 mt-1 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
              {sortByOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleSortByChange(option.value)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors ${
                    filters.sortBy === option.value ? 'bg-purple-500/20 text-purple-400' : 'text-white'
                  }`}
                >
                  <div className="flex items-center">
                    {option.icon}
                    {option.label}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Chain Filter */}
        <div className="relative">
          <button
            onClick={() => setIsChainOpen(!isChainOpen)}
            className="flex items-center px-3 py-2 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-sm text-white transition-colors"
          >
            Chain: {chainOptions.find(option => option.value === filters.chain)?.label}
            <ChevronDown className="h-4 w-4 ml-2" />
          </button>
          
          {isChainOpen && (
            <div className="absolute z-10 mt-1 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
              {chainOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleChainChange(option.value)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors ${
                    filters.chain === option.value ? 'bg-purple-500/20 text-purple-400' : 'text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MemeCoinsFilters;
