'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle, ExternalLink, Heart } from 'lucide-react';

const MemeCoinsGrid = ({ isInView, memeCoins }) => {
  const [favorites, setFavorites] = useState([]);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
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
  const formatNumber = (num, digits = 2) => {
    if (num === undefined || num === null) return '0';
    
    if (num < 0.00001) {
      return num.toExponential(digits);
    }
    
    if (num < 1) {
      return num.toFixed(6);
    }
    
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(digits)}B`;
    }
    
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(digits)}M`;
    }
    
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(digits)}K`;
    }
    
    return `$${num.toFixed(digits)}`;
  };
  
  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Toggle favorite
  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };
  
  // Render price chart (simplified)
  const renderChart = (data, isPositive) => {
    if (!data || data.length === 0) return null;
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    
    return (
      <div className="h-10 flex items-end space-x-[2px]">
        {data.map((value, index) => {
          const height = range === 0 ? 50 : ((value - min) / range) * 100;
          return (
            <div 
              key={index}
              style={{ height: `${height}%` }}
              className={`w-1 rounded-t-sm ${
                isPositive ? 'bg-green-500/70' : 'bg-red-500/70'
              }`}
            />
          );
        })}
      </div>
    );
  };
  
  // If no meme coins, show a message
  if (!memeCoins || memeCoins.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No meme coins found. Try adjusting your filters.</p>
      </div>
    );
  }
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible" // Always animate to visible to ensure content shows
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {memeCoins.map((coin) => (
        <motion.div
          key={coin.id}
          variants={itemVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 hover:border-purple-500/30 rounded-xl overflow-hidden transition-all duration-300"
        >
          <div className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="relative h-10 w-10 mr-3 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center">
                  <img 
                    src={coin.logoUrl}
                    alt={coin.name}
                    className="w-full h-auto"
                  />
                </div>
                <div>
                  <div className="flex items-center">
                    <h3 className="font-semibold text-white">{coin.name}</h3>
                    {coin.verified && (
                      <CheckCircle className="h-4 w-4 text-teal-400 ml-1" />
                    )}
                    {coin.trending && (
                      <div className="ml-2 px-1.5 py-0.5 bg-purple-500/20 rounded text-[10px] text-purple-400 font-medium flex items-center">
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                        HOT
                      </div>
                    )}
                  </div>
                  <div className="text-gray-400 text-sm">{coin.symbol}</div>
                </div>
              </div>
              <button 
                onClick={() => toggleFavorite(coin.id)}
                className="text-gray-400 hover:text-pink-500 transition-colors"
              >
                <Heart 
                  className={`h-5 w-5 ${favorites.includes(coin.id) ? 'fill-pink-500 text-pink-500' : ''}`} 
                />
              </button>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Price</div>
                <div className="font-medium text-white">${coin.price.toFixed(coin.price < 0.01 ? 8 : 4)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">24h Change</div>
                <div className={`font-medium ${coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Market Cap</div>
                <div className="font-medium text-white">{formatNumber(coin.marketCap)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Volume (24h)</div>
                <div className="font-medium text-white">{formatNumber(coin.volume24h)}</div>
              </div>
            </div>
            
            {/* Bottom Section */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 mb-1">Chain</div>
                <div className="text-sm font-medium text-white">{coin.chain}</div>
              </div>
              <div className="w-24">
                {renderChart(coin.chartData, coin.change24h >= 0)}
              </div>
            </div>
            
            {/* Launch Date */}
            <div className="mt-3 pt-3 border-t border-slate-700/30 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Launched: <span className="text-gray-400">{formatDate(coin.launchDate)}</span>
              </div>
              <a 
                href="#" 
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center"
              >
                View <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MemeCoinsGrid;
