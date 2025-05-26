'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Star, ExternalLink, Clock, Shield, Users, DollarSign } from 'lucide-react';
import Link from 'next/link';
import MiniChart from '@/component/charts/MiniChart';

const NewListingsGrid = ({ isInView, newTokens }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  
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
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };
  
  // Format numbers
  const formatNumber = (num, prefix = '$') => {
    if (num >= 1000000) {
      return `${prefix}${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
      return `${prefix}${(num / 1000).toFixed(2)}K`;
    }
    return `${prefix}${num.toFixed(2)}`;
  };
  
  // Format time ago
  const formatTimeAgo = (launchTime) => {
    if (launchTime < 1) {
      return `${Math.round(launchTime * 60)} mins ago`;
    }
    if (launchTime < 24) {
      return `${Math.round(launchTime)} hours ago`;
    }
    return `${Math.round(launchTime / 24)} days ago`;
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {newTokens.map((token) => (
        <motion.div
          key={token.id}
          variants={cardVariants}
          className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl overflow-hidden hover:border-blue-500/30 transition-all duration-300"
          onMouseEnter={() => setHoveredCard(token.id)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          {/* Card Header */}
          <div className="p-4 border-b border-slate-700/30 flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                <img 
                  src={token.logoUrl} 
                  alt={token.name} 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpath d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3'%3E%3C/path%3E%3Cline x1='12' y1='17' x2='12.01' y2='17'%3E%3C/line%3E%3C/svg%3E";
                  }}
                />
              </div>
              <div className="ml-3">
                <div className="flex items-center">
                  <h3 className="text-white font-medium">{token.name}</h3>
                  {token.verified && (
                    <Shield className="h-3.5 w-3.5 text-blue-400 ml-1" />
                  )}
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 text-sm">{token.symbol}</span>
                  <span className="mx-1.5 text-gray-600">•</span>
                  <span className="text-gray-400 text-sm">{token.chain}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-1">
              <button className="p-1.5 rounded-md hover:bg-slate-700 transition-colors text-gray-400 hover:text-blue-400">
                <Star className="h-4 w-4" />
              </button>
              <button className="p-1.5 rounded-md hover:bg-slate-700 transition-colors text-gray-400 hover:text-blue-400">
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Card Body */}
          <div className="p-4">
            <div className="flex justify-between mb-4">
              <div>
                <p className="text-gray-400 text-xs mb-1">Price</p>
                <p className="text-white font-medium">${token.price.toFixed(token.price < 0.01 ? 8 : 4)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Change (24h)</p>
                <div className={`inline-flex items-center ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {token.change24h >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {Math.abs(token.change24h).toFixed(2)}%
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Launch</p>
                <div className="inline-flex items-center text-gray-300">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTimeAgo(token.launchTime)}
                </div>
              </div>
            </div>
            
            {/* Middle Section */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-gray-400 text-xs mb-1">Liquidity</p>
                <p className="text-white font-medium">{formatNumber(token.liquidity)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Volume (24h)</p>
                <p className="text-white font-medium">{formatNumber(token.volume24h)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Holders</p>
                <div className="inline-flex items-center text-white font-medium">
                  <Users className="h-3 w-3 mr-1 text-gray-400" />
                  {token.holders.toLocaleString()}
                </div>
              </div>
            </div>
            
            {/* Chart Section */}
            <div className="h-16 mb-4">
              {token.chartData && (
                <div className={`h-full w-full ${hoveredCard === token.id ? 'opacity-100' : 'opacity-70'} transition-opacity`}>
                  <MiniChart 
                    data={token.chartData} 
                    positive={token.change24h >= 0} 
                    height={64} 
                    width="100%" 
                  />
                </div>
              )}
            </div>
            
            {/* Bottom Section */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-700/30">
              <div className="flex items-center text-xs text-gray-400">
                <DollarSign className="h-3 w-3 mr-1" />
                {token.trending && (
                  <span className="text-blue-400 font-medium">Trending</span>
                )}
                {!token.trending && (
                  <span>New Launch</span>
                )}
              </div>
              <Link 
                href={`/token/${token.id}`}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center"
              >
                View Details
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default NewListingsGrid;
