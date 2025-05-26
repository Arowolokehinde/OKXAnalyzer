'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, ChevronDown, X } from 'lucide-react';

const NewListingsFilters = ({ isInView, filters, setFilters }) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  const expandVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { 
      height: 'auto', 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };
  
  // Time range options
  const timeRangeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: 'all', label: 'All Time' }
  ];
  
  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'liquidity', label: 'Highest Liquidity' },
    { value: 'volume', label: 'Highest Volume' },
    { value: 'holders', label: 'Most Holders' },
    { value: 'gainers', label: 'Top Gainers' }
  ];
  
  // Chain options
  const chainOptions = [
    { value: 'all', label: 'All Chains' },
    { value: 'ethereum', label: 'Ethereum' },
    { value: 'solana', label: 'Solana' },
    { value: 'okx', label: 'OKX Chain' },
    { value: 'arbitrum', label: 'Arbitrum' },
    { value: 'base', label: 'Base' },
    { value: 'bnb', label: 'BNB Chain' }
  ];
  
  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };
  
  // Format liquidity value for display
  const formatLiquidity = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="mb-8"
    >
      {/* Basic Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Filter */}
          <div className="relative">
            <select
              value={filters.timeRange}
              onChange={(e) => handleFilterChange('timeRange', e.target.value)}
              className="appearance-none bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          
          {/* Sort By Filter */}
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="appearance-none bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          
          {/* Chain Filter */}
          <div className="relative">
            <select
              value={filters.chain}
              onChange={(e) => handleFilterChange('chain', e.target.value)}
              className="appearance-none bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {chainOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
        
        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-lg transition-colors"
        >
          <Filter className="h-4 w-4" />
          <span>Advanced Filters</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      {/* Advanced Filters */}
      <motion.div
        variants={expandVariants}
        initial="hidden"
        animate={isFiltersOpen ? "visible" : "hidden"}
        className="overflow-hidden"
      >
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-5 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-medium">Advanced Filters</h3>
            <button
              onClick={() => setIsFiltersOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Liquidity Range */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Liquidity Range</label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500">Min</span>
                  <span className="text-xs text-gray-500">{formatLiquidity(filters.minLiquidity)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="10000"
                  value={filters.minLiquidity}
                  onChange={(e) => handleFilterChange('minLiquidity', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500">Max</span>
                  <span className="text-xs text-gray-500">{formatLiquidity(filters.maxLiquidity)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000000"
                  step="100000"
                  value={filters.maxLiquidity}
                  onChange={(e) => handleFilterChange('maxLiquidity', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>
          
          {/* Additional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Verified Only */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="verifiedOnly"
                checked={filters.verifiedOnly || false}
                onChange={(e) => handleFilterChange('verifiedOnly', e.target.checked)}
                className="h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-slate-700"
              />
              <label htmlFor="verifiedOnly" className="ml-2 text-gray-300">
                Verified Projects Only
              </label>
            </div>
            
            {/* Exclude Low Holders */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="excludeLowHolders"
                checked={filters.excludeLowHolders || false}
                onChange={(e) => handleFilterChange('excludeLowHolders', e.target.checked)}
                className="h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-slate-700"
              />
              <label htmlFor="excludeLowHolders" className="ml-2 text-gray-300">
                Exclude Low Holders (&lt;100)
              </label>
            </div>
            
            {/* Has Website */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasWebsite"
                checked={filters.hasWebsite || false}
                onChange={(e) => handleFilterChange('hasWebsite', e.target.checked)}
                className="h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-slate-700"
              />
              <label htmlFor="hasWebsite" className="ml-2 text-gray-300">
                Has Website/Socials
              </label>
            </div>
          </div>
          
          {/* Reset Filters */}
          <div className="mt-5 flex justify-end">
            <button
              onClick={() => setFilters({
                timeRange: '24h',
                sortBy: 'newest',
                minLiquidity: 0,
                maxLiquidity: 10000000,
                chain: 'all',
                verifiedOnly: false,
                excludeLowHolders: false,
                hasWebsite: false
              })}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Reset to Default
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NewListingsFilters;
