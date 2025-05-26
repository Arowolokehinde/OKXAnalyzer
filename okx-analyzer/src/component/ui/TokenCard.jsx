// components/cards/TokenCard.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, Eye, Plus, History } from 'lucide-react';

const TokenCard = ({ token, index = 0, isVisible = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  
  // Default values in case token prop isn't fully populated
  const {
    id = '1',
    name = 'Sample Token',
    symbol = 'TKN',
    priceUSD = 0.00025,
    priceChangePercent = 15.2,
    volumeUSD = 58000,
    liquidityUSD = 124000,
    launchTime = Date.now() - 86400000 * 2, // 2 days ago
    isPositive = true,
    logoUrl = 'https://via.placeholder.com/40'
  } = token || {};

  // Generate some fake price history data points
  const [priceHistory, setPriceHistory] = useState([]);
  
  useEffect(() => {
    // Generate random price history
    const points = 24;
    const volatility = Math.random() * 0.5 + 0.5; // 0.5 to 1.0
    
    const data = Array.from({ length: points }, (_, i) => {
      // Trend follows the overall price change direction
      const trend = isPositive ? 1 : -1;
      
      // Add some randomness to each point
      const random = (Math.random() - 0.5) * volatility;
      
      // Ensure newer points (higher i) have more impact on final price
      const weightedInfluence = (i / points) * trend;
      
      // Scale the point to match overall priceChangePercent
      const scaleFactor = 1 + (weightedInfluence + random) * (Math.abs(priceChangePercent) / 100);
      
      return scaleFactor;
    });
    
    setPriceHistory(data);
  }, [isPositive, priceChangePercent]);

  // Calculate time since launch
  const getTimeSinceLaunch = () => {
    const diffInHours = Math.floor((Date.now() - launchTime) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    }
  };

  // Format numbers
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        delay: index * 0.1 + 0.1
      } 
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-slate-800/60 backdrop-blur-lg rounded-xl overflow-hidden border border-slate-700/50 hover:border-teal-500/50 transition-all duration-300 relative"
    >
      <Link href={`/token/${id}`}>
        <div className="p-5">
          {/* Price History Spark Line (visible on hover) */}
          {isHovered && (
            <motion.div 
              className="absolute top-0 left-0 right-0 h-20 opacity-30 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ duration: 0.3 }}
            >
              <svg width="100%" height="100%" preserveAspectRatio="none" viewBox={`0 0 ${priceHistory.length} 100`}>
                <defs>
                  <linearGradient
                    id={`gradient-${id}`}
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor={isPositive ? "#10B981" : "#EF4444"}
                      stopOpacity="0.2"
                    />
                    <stop
                      offset="100%"
                      stopColor={isPositive ? "#10B981" : "#EF4444"}
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
                <path
                  d={`M0,${100 - priceHistory[0] * 50} ${priceHistory
                    .map((p, i) => `L${i},${100 - p * 50}`)
                    .join(" ")} V100 H0 Z`}
                  fill={`url(#gradient-${id})`}
                />
                <path
                  d={`M0,${100 - priceHistory[0] * 50} ${priceHistory
                    .map((p, i) => `L${i},${100 - p * 50}`)
                    .join(" ")}`}
                  fill="none"
                  strokeWidth="2"
                  stroke={isPositive ? "#10B981" : "#EF4444"}
                />
              </svg>
            </motion.div>
          )}

          {/* Token Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center shadow-lg shadow-slate-900/20">
                {/* Token logo with animated gradient background */}
                <div className="h-full w-full relative">
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-teal-500/30 to-purple-600/30 rounded-full"
                    animate={{ 
                      rotate: 360
                    }}
                    transition={{ 
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  <img src={logoUrl} alt={name} className="h-full w-full object-cover z-10 relative" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-white font-semibold">{name}</h3>
                <p className="text-gray-400 text-sm">{symbol}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Clock size={14} className="text-gray-400 mr-1" />
              <span className="text-gray-400 text-sm">{getTimeSinceLaunch()}</span>
            </div>
          </div>
          
          {/* Price Chart Toggle Button */}
          <div className="mb-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowPriceHistory(!showPriceHistory);
              }}
              className="flex items-center text-xs text-gray-400 hover:text-teal-400 transition-colors"
            >
              <History size={12} className="mr-1" />
              {showPriceHistory ? 'Hide chart' : 'Show price chart'}
            </button>
          </div>
          
          {/* Mini Price Chart (when toggled) */}
          {showPriceHistory && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 60, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 bg-slate-900/50 rounded-lg p-2 overflow-hidden"
            >
              <div className="h-full w-full relative">
                <svg width="100%" height="100%" preserveAspectRatio="none" viewBox={`0 0 ${priceHistory.length} 100`}>
                  <defs>
                    <linearGradient
                      id={`chart-gradient-${id}`}
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        stopColor={isPositive ? "#10B981" : "#EF4444"}
                        stopOpacity="0.3"
                      />
                      <stop
                        offset="100%"
                        stopColor={isPositive ? "#10B981" : "#EF4444"}
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M0,${100 - priceHistory[0] * 50} ${priceHistory
                      .map((p, i) => `L${i},${100 - p * 50}`)
                      .join(" ")} V100 H0 Z`}
                    fill={`url(#chart-gradient-${id})`}
                  />
                  <path
                    d={`M0,${100 - priceHistory[0] * 50} ${priceHistory
                      .map((p, i) => `L${i},${100 - p * 50}`)
                      .join(" ")}`}
                    fill="none"
                    strokeWidth="2"
                    stroke={isPositive ? "#10B981" : "#EF4444"}
                  />
                </svg>
                
                {/* Animated Dot for Current Price */}
                <motion.div 
                  className={`absolute top-0 w-2 h-2 rounded-full shadow-lg ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ 
                    right: '0px', 
                    top: `${100 - priceHistory[priceHistory.length - 1] * 50}%`,
                    transform: 'translate(50%, -50%)'
                  }}
                  animate={{ 
                    scale: [1, 1.5, 1] 
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity 
                  }}
                />
              </div>
            </motion.div>
          )}
          
          {/* Token Stats */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Price</span>
              <div className="flex items-center">
                <span className="text-white font-medium">${priceUSD.toFixed(8)}</span>
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className={`ml-2 py-0.5 px-2 rounded-full flex items-center text-xs ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                >
                  {isPositive ? <TrendingUp size={10} className="mr-1" /> : <TrendingDown size={10} className="mr-1" />}
                  {Math.abs(priceChangePercent).toFixed(1)}%
                </motion.div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Volume (24h)</span>
              <span className="text-white font-medium">{formatNumber(volumeUSD)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Liquidity</span>
              <span className="text-white font-medium">{formatNumber(liquidityUSD)}</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2 mt-5">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 py-2 px-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white flex items-center justify-center transition"
            >
              <Eye size={14} className="mr-1" />
              Details
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 py-2 px-3 bg-teal-600/20 hover:bg-teal-600/30 text-teal-400 rounded-lg text-sm flex items-center justify-center transition"
            >
              <Plus size={14} className="mr-1" />
              Watchlist
            </motion.button>
          </div>

          {/* Animated Gradient Border on Hover */}
          {isHovered && (
            <motion.div 
              className="absolute inset-0 z-[-1] rounded-xl bg-gradient-to-r from-blue-500/20 via-teal-500/20 to-purple-500/20 opacity-0"
              animate={{ 
                opacity: [0, 1, 0],
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ 
                opacity: { duration: 2, repeat: Infinity },
                backgroundPosition: { 
                  duration: 5, 
                  ease: 'linear',
                  repeat: Infinity 
                }
              }}
            />
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default TokenCard;