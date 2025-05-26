// components/wallet/WalletConnectButton.jsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, LogOut, ExternalLink, Copy, Check, RefreshCw } from 'lucide-react';
import { useWalletConnect } from '../../hooks/useWalletConnect';
import { Tooltip } from '../ui/Tooltip';

const WalletConnectButton = () => {
  const {
    account,
    chainId,
    isConnecting,
    isConnected,
    connect,
    disconnect,
    switchChain,
    SUPPORTED_CHAINS
  } = useWalletConnect();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Truncate address for display
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  // Get network name from chain ID
  const getNetworkName = (id) => {
    const networks = {
      '1': 'Ethereum',
      '137': 'Polygon',
      '56': 'BSC',
      '42161': 'Arbitrum',
      '10': 'Optimism',
      '66': 'OKC'
    };
    
    return networks[id] || `Chain ${id}`;
  };
  
  // Get chain color
  const getChainColor = (id) => {
    const colors = {
      '1': 'bg-blue-500',
      '137': 'bg-purple-500',
      '56': 'bg-yellow-500',
      '42161': 'bg-blue-400',
      '10': 'bg-red-500',
      '66': 'bg-green-500'
    };
    
    return colors[id] || 'bg-gray-500';
  };
  
  // Copy address to clipboard
  const copyToClipboard = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };
  
  // Animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -5, height: 0 },
    visible: { 
      opacity: 1, 
      y: 0, 
      height: 'auto',
      transition: {
        duration: 0.2,
        when: "beforeChildren",
        staggerChildren: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      y: -5, 
      height: 0,
      transition: {
        duration: 0.2
      }
    }
  };
  
  const dropdownItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 }
  };
  
  // Close dropdown when clicking outside
  const handleClickOutside = () => {
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      {!isConnected ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={connect}
          disabled={isConnecting}
          className={`bg-gradient-to-r from-blue-600 to-teal-500 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ${
            isConnecting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          <Wallet className="h-4 w-4" />
          <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
        </motion.button>
      ) : (
        <>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
            }}
            className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <div className={`h-2 w-2 rounded-full mr-1 ${getChainColor(chainId)}`}></div>
            <span>{truncateAddress(account)}</span>
            <ChevronDown 
              className={`h-4 w-4 ml-1 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} 
            />
          </motion.button>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <>
                {/* Invisible overlay to detect outside clicks */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={handleClickOutside}
                ></div>
                
                <motion.div
                  className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-slate-800 border border-slate-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-4">
                    <motion.div variants={dropdownItemVariants} className="mb-3">
                      <p className="text-gray-400 text-xs mb-1">Connected to</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`h-2 w-2 rounded-full mr-2 ${getChainColor(chainId)}`}></div>
                          <span className="text-white font-medium">{getNetworkName(chainId)}</span>
                        </div>
                        <Tooltip content="Switch Network">
                          <button 
                            onClick={() => setIsDropdownOpen(false)}
                            className="text-gray-400 hover:text-teal-400 transition-colors"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        </Tooltip>
                      </div>
                    </motion.div>
                    
                    <motion.div variants={dropdownItemVariants} className="mb-4">
                      <p className="text-gray-400 text-xs mb-1">Address</p>
                      <div className="flex items-center justify-between bg-slate-900 rounded-md p-2">
                        <span className="text-white font-mono text-sm">{truncateAddress(account)}</span>
                        <Tooltip content={isCopied ? "Copied!" : "Copy Address"}>
                          <button
                            onClick={copyToClipboard}
                            className="text-gray-400 hover:text-teal-400 transition-colors"
                          >
                            {isCopied ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </Tooltip>
                      </div>
                    </motion.div>
                    
                    <motion.div variants={dropdownItemVariants} className="pt-3 border-t border-slate-700">
                      <button
                        onClick={() => {
                          disconnect();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-md transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Disconnect Wallet</span>
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default WalletConnectButton;