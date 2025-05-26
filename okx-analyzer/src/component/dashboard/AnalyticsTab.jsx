'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, LineChart, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react';

const AnalyticsTab = () => {
  const [timeRange, setTimeRange] = useState('7d');
  
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
  
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <h2 className="text-2xl font-bold text-white flex items-center">
          <BarChart3 className="h-6 w-6 mr-2 text-blue-500" />
          Market Analytics
        </h2>
        
        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          
          <button className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </motion.div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {[
          { title: 'New Tokens', value: '156', change: '+12%', icon: <LineChart className="h-5 w-5 text-blue-500" /> },
          { title: 'Average Volume', value: '$2.4M', change: '+8%', icon: <BarChart3 className="h-5 w-5 text-purple-500" /> },
          { title: 'Market Share', value: '32%', change: '+5%', icon: <PieChart className="h-5 w-5 text-teal-500" /> },
        ].map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">{stat.title}</p>
                <h3 className="text-white text-2xl font-bold mt-1">{stat.value}</h3>
                <p className="text-green-500 text-sm mt-1 flex items-center">
                  {stat.change}
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-slate-700 flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div
          variants={itemVariants}
          className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6"
        >
          <h3 className="text-lg font-medium text-white mb-4">Token Launches by Chain</h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-400">Chart placeholder - Token launches by blockchain</p>
          </div>
        </motion.div>
        
        <motion.div
          variants={itemVariants}
          className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6"
        >
          <h3 className="text-lg font-medium text-white mb-4">Volume Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-400">Chart placeholder - Volume distribution</p>
          </div>
        </motion.div>
      </div>
      
      <motion.div
        variants={itemVariants}
        className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6"
      >
        <h3 className="text-lg font-medium text-white mb-4">Market Trends</h3>
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-400">Chart placeholder - Market trends over time</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsTab;