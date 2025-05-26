'use client';

import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Star, 
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import MiniChart from './MiniChart';

const OverviewTab = ({ trendingTokens, recentLaunches, watchlistTokens }) => {
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
  
  const tableRowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        delay: i * 0.05,
        duration: 0.3
      }
    }),
    hover: { 
      backgroundColor: 'rgba(15, 118, 110, 0.05)',
      transition: { duration: 0.2 }
    }
  };
  
  return (
    <div>
      {/* Stats Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {[
          { title: 'Total Tokens Tracked', value: '2,456', icon: <BarChart3 className="h-5 w-5 text-blue-500" />, change: '+12%', color: 'from-blue-500 to-blue-600' },
          { title: 'New Launches (24h)', value: '38', icon: <Zap className="h-5 w-5 text-teal-500" />, change: '+8%', color: 'from-teal-500 to-teal-600' },
          { title: 'Trending Meme Coins', value: '156', icon: <TrendingUp className="h-5 w-5 text-purple-500" />, change: '+24%', color: 'from-purple-500 to-purple-600' },
          { title: 'Watchlist Tokens', value: '12', icon: <Star className="h-5 w-5 text-amber-500" />, change: '+2', color: 'from-amber-500 to-amber-600' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-teal-500/30 transition-all duration-300"
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
              <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Trending Tokens */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <motion.h2 variants={itemVariants} className="text-xl font-bold text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-teal-500" />
            Trending Tokens
          </motion.h2>
          <motion.button 
            variants={itemVariants}
            className="text-teal-500 text-sm hover:text-teal-400 transition-colors"
          >
            View All
          </motion.button>
        </div>
        
        <motion.div variants={itemVariants} className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-slate-700/50">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Token</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">24h Change</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Volume</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Market Cap</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Last 24h</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {trendingTokens.map((token, index) => (
                <motion.tr 
                  key={token.symbol}
                  custom={index}
                  variants={tableRowVariants}
                  whileHover="hover"
                  className="cursor-pointer"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                        {token.symbol.substring(0, 2)}
                      </div>
                      <div className="ml-3">
                        <p className="text-white font-medium">{token.name}</p>
                        <p className="text-gray-400 text-sm">{token.symbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <p className="text-white font-medium">${token.price.toFixed(8)}</p>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className={`inline-flex items-center ${token.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {token.change >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                      {Math.abs(token.change).toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-white">${token.volume}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-white">${token.marketCap}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <MiniChart data={token.chart} positive={token.change >= 0} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </motion.div>
      
      {/* Recent Launches & Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Launches */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <motion.h2 variants={itemVariants} className="text-xl font-bold text-white flex items-center">
              <Zap className="h-5 w-5 mr-2 text-purple-500" />
              Recent Launches
            </motion.h2>
            <motion.button 
              variants={itemVariants}
              className="text-purple-500 text-sm hover:text-purple-400 transition-colors"
            >
              View All
            </motion.button>
          </div>
          
          <motion.div variants={itemVariants} className="space-y-4">
            {recentLaunches.map((token, index) => (
              <motion.div 
                key={token.symbol}
                custom={index}
                variants={tableRowVariants}
                className="p-3 rounded-lg hover:bg-slate-700/20 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                      {token.symbol.substring(0, 2)}
                    </div>
                    <div className="ml-3">
                      <p className="text-white font-medium">{token.name}</p>
                      <p className="text-gray-400 text-sm">{token.launchTime}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">${token.currentPrice.toFixed(8)}</p>
                    <div className={`inline-flex items-center ${token.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {token.change >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                      {Math.abs(token.change).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        
        {/* Watchlist */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <motion.h2 variants={itemVariants} className="text-xl font-bold text-white flex items-center">
              <Star className="h-5 w-5 mr-2 text-amber-500" />
              Your Watchlist
            </motion.h2>
            <motion.button 
              variants={itemVariants}
              className="text-amber-500 text-sm hover:text-amber-400 transition-colors"
            >
              Manage
            </motion.button>
          </div>
          
          {watchlistTokens.length > 0 ? (
            <motion.div variants={itemVariants} className="space-y-4">
              {watchlistTokens.map((token, index) => (
                <motion.div 
                  key={token.symbol}
                  custom={index}
                  variants={tableRowVariants}
                  className="p-3 rounded-lg hover:bg-slate-700/20 cursor-pointer transition-colors flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                      {token.symbol.substring(0, 2)}
                    </div>
                    <div className="ml-3">
                      <p className="text-white font-medium">{token.name}</p>
                      <p className="text-gray-400 text-sm">{token.symbol}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-white font-medium">${token.price.toFixed(8)}</p>
                      <div className={`inline-flex items-center ${token.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {token.change >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                        {Math.abs(token.change).toFixed(1)}%
                      </div>
                    </div>
                    <MiniChart data={token.chart} positive={token.change >= 0} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              variants={itemVariants}
              className="text-center py-8"
            >
              <p className="text-gray-400">No tokens in your watchlist yet.</p>
              <button className="mt-4 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors">
                Add Tokens
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OverviewTab;