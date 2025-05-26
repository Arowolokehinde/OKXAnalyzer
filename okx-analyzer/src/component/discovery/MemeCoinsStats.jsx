'use client';

import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, BarChart3 } from 'lucide-react';

const MemeCoinsStats = ({ isInView, totalMemeCoins, totalMarketCap, totalVolume }) => {
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
  
  // Format numbers
  const formatNumber = (num) => {
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    }
    
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    }
    
    return `$${(num / 1000).toFixed(2)}K`;
  };
  
  // Stats data
  const stats = [
    {
      label: 'Total Meme Coins',
      value: totalMemeCoins,
      icon: <TrendingUp className="h-6 w-6 text-white" />,
      color: 'from-purple-600 to-purple-400',
      textColor: 'text-purple-400'
    },
    {
      label: 'Total Market Cap',
      value: formatNumber(totalMarketCap),
      icon: <DollarSign className="h-6 w-6 text-white" />,
      color: 'from-teal-600 to-teal-400',
      textColor: 'text-teal-400'
    },
    {
      label: 'Total Volume (24h)',
      value: formatNumber(totalVolume),
      icon: <BarChart3 className="h-6 w-6 text-white" />,
      color: 'from-blue-600 to-blue-400',
      textColor: 'text-blue-400'
    }
  ];
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible" // Always animate to visible to ensure content shows
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl overflow-hidden"
        >
          <div className="p-6">
            <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
              {stat.icon}
            </div>
            <div className="text-gray-400 mb-1">{stat.label}</div>
            <div className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</div>
          </div>
          <div className={`h-1 w-full bg-gradient-to-r ${stat.color}`}></div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MemeCoinsStats;
