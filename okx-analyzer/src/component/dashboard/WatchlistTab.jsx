'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowUpRight, ArrowDownRight, Trash2, ExternalLink, Plus } from 'lucide-react';
import MiniChart from './MiniChart';

const WatchlistTab = ({ watchlistTokens }) => {
  const [tokens, setTokens] = useState(watchlistTokens || []);
  
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
  
  const removeFromWatchlist = (symbol) => {
    setTokens(tokens.filter(token => token.symbol !== symbol));
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
          <Star className="h-6 w-6 mr-2 text-amber-500" />
          Your Watchlist
        </h2>
        
        <button className="px-4 py-2 bg-amber-600/20 text-amber-400 rounded-lg hover:bg-amber-600/30 transition-colors flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Token
        </button>
      </motion.div>
      
      {tokens.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-12 text-center"
        >
          <p className="text-gray-400 mb-4">Your watchlist is empty.</p>
          <button className="px-4 py-2 bg-amber-600/20 text-amber-400 rounded-lg hover:bg-amber-600/30 transition-colors">
            Add Tokens to Watchlist
          </button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {tokens.map((token, index) => (
            <motion.div
              key={token.symbol}
              custom={index}
              variants={cardVariants}
              whileHover="hover"
              className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden hover:border-amber-500/30 transition-all duration-300"
            >
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
                    {token.symbol.substring(0, 2)}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-white font-medium">{token.name}</h3>
                    <p className="text-gray-400 text-sm">{token.symbol}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => removeFromWatchlist(token.symbol)}
                    className="p-1.5 rounded-md hover:bg-slate-700 transition-colors text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 rounded-md hover:bg-slate-700 transition-colors text-gray-400 hover:text-amber-400">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="px-4 pb-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="text-white text-xl font-bold">${token.price.toFixed(8)}</p>
                    <div className={`inline-flex items-center ${token.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {token.change >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                      {Math.abs(token.change).toFixed(1)}%
                    </div>
                  </div>
                  <div className="h-16 w-32">
                    <MiniChart data={token.chart} positive={token.change >= 0} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Volume (24h)</p>
                    <p className="text-white font-medium">${token.volume}</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Market Cap</p>
                    <p className="text-white font-medium">${token.marketCap}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default WatchlistTab;