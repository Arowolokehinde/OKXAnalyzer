'use client';

import { useState } from 'react';
import { motion, useTransform } from 'framer-motion';
import { 
  RefreshCw, 
  Clock, 
  ChevronDown 
} from 'lucide-react';

const DashboardHeader = ({ scrollYProgress, activeTab, setActiveTab, timeRange, setTimeRange }) => {
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  
  // Parallax effect for header - only create these if scrollYProgress is provided
  const headerOpacity = scrollYProgress ? useTransform(scrollYProgress, [0, 0.2], [1, 0]) : { current: 1 };
  const headerY = scrollYProgress ? useTransform(scrollYProgress, [0, 0.2], [0, -50]) : { current: 0 };
  
  return (
    <motion.div 
      style={{ opacity: headerOpacity, y: headerY }}
      className="relative bg-slate-900/50 backdrop-blur-md border-b border-slate-800/50 py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Token Analytics Dashboard</h1>
            <p className="text-gray-400 mt-1">Track new token launches and market trends</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-gray-300 px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </motion.button>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
              onClick={(e) => {
                e.stopPropagation();
                setShowTimeDropdown(!showTimeDropdown);
              }}
            >
              <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-gray-300 px-4 py-2 rounded-lg transition-colors">
                <Clock className="h-4 w-4" />
                <span>{timeRange}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showTimeDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Time range dropdown */}
              {showTimeDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 z-10"
                >
                  <div className="py-1">
                    {['1h', '24h', '7d', '30d', 'All'].map((time) => (
                      <button
                        key={time}
                        onClick={() => {
                          setTimeRange(time);
                          setShowTimeDropdown(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          timeRange === time ? 'bg-slate-700 text-white' : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
        
        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex space-x-1 mt-6 border-b border-slate-800/50 overflow-x-auto scrollbar-hide"
        >
          {['overview', 'trending', 'new launches', 'watchlist', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'text-teal-400 border-b-2 border-teal-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;
