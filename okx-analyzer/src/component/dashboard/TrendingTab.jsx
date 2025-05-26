'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Filter, Search, Star, ExternalLink, Plus } from 'lucide-react';
import MiniChart from './MiniChart';

const TrendingTab = ({ trendingTokens }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('volume');
  const [sortDirection, setSortDirection] = useState('desc');
  
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
  
  // Filter and sort tokens
  const filteredTokens = trendingTokens
    .filter(token => {
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return token.name.toLowerCase().includes(searchLower) || 
               token.symbol.toLowerCase().includes(searchLower);
      }
      
      // Apply category filter
      if (selectedCategory !== 'all') {
        return token.category === selectedCategory;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      let aValue, bValue;
      
      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'change':
          aValue = a.change;
          bValue = b.change;
          break;
        case 'volume':
          aValue = parseFloat(a.volume.replace(/[^0-9.]/g, ''));
          bValue = parseFloat(b.volume.replace(/[^0-9.]/g, ''));
          break;
        case 'marketCap':
          aValue = parseFloat(a.marketCap.replace(/[^0-9.]/g, ''));
          bValue = parseFloat(b.marketCap.replace(/[^0-9.]/g, ''));
          break;
        default:
          aValue = a.trendScore || 0;
          bValue = b.trendScore || 0;
      }
      
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
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
          <TrendingUp className="h-6 w-6 mr-2 text-teal-500" />
          Trending Tokens
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
              className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg bg-slate-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              placeholder="Search tokens..."
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center px-3 py-2 ${showFilters ? 'bg-teal-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'} rounded-lg transition-colors text-sm`}
          >
            <Filter className="h-4 w-4 mr-2" />
            <span>Filter</span>
          </button>
        </div>
      </motion.div>
      
      {/* Filter options */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Categories</option>
                <option value="meme">Meme Coins</option>
                <option value="defi">DeFi</option>
                <option value="gaming">Gaming</option>
                <option value="nft">NFT</option>
                <option value="layer1">Layer 1</option>
                <option value="layer2">Layer 2</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Sort By</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="trendScore">Trending Score</option>
                <option value="price">Price</option>
                <option value="change">24h Change</option>
                <option value="volume">Volume</option>
                <option value="marketCap">Market Cap</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Sort Direction</label>
              <select 
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="desc">Highest First</option>
                <option value="asc">Lowest First</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6"
      >
        <motion.div variants={itemVariants} className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-slate-700/50">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Token</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">24h Change</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Volume</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Market Cap</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Last 24h</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredTokens.map((token, index) => (
                <motion.tr 
                  key={token.symbol}
                  custom={index}
                  variants={tableRowVariants}
                  whileHover="hover"
                  className="cursor-pointer"
                >
                  <td className="px-4 py-4 whitespace-nowrap text-gray-300">
                    {index + 1}
                  </td>
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
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button className="p-1.5 rounded-md hover:bg-slate-700 transition-colors text-gray-400 hover:text-teal-400">
                        <Star className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-slate-700 transition-colors text-gray-400 hover:text-teal-400">
                        <Plus className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-slate-700 transition-colors text-gray-400 hover:text-teal-400">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
        
        {filteredTokens.length === 0 && (
          <motion.div 
            variants={itemVariants}
            className="py-12 text-center"
          >
            <p className="text-gray-400">No tokens found matching your criteria.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSortBy('volume');
                setSortDirection('desc');
              }}
              className="mt-4 px-4 py-2 bg-teal-600/20 text-teal-400 rounded-lg hover:bg-teal-600/30 transition-colors"
            >
              Reset Filters
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default TrendingTab;
