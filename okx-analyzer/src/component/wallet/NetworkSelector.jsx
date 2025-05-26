// components/wallet/NetworkSelector.jsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';

const NetworkSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { chainId, switchChain, isConnected, activeWallet } = useWallet();
  
  // Network options
  const networks = [
    { id: '1', name: 'Ethereum', color: 'bg-blue-500' },
    { id: '56', name: 'BSC', color: 'bg-yellow-500' },
    { id: '137', name: 'Polygon', color: 'bg-purple-500' },
    { id: '42161', name: 'Arbitrum', color: 'bg-blue-400' },
    { id: '10', name: 'Optimism', color: 'bg-red-500' },
    { id: '66', name: 'OKC', color: 'bg-teal-500' },
    { id: 'solana', name: 'Solana', color: 'bg-gradient-to-r from-purple-500 to-pink-500' }
  ];
  
  // Get current network
  const currentNetwork = networks.find(net => net.id === chainId) || networks[0];
  
  // Handle network change
  const handleNetworkChange = async (network) => {
    setIsOpen(false);
    if (network.id !== chainId) {
      await switchChain(network.id);
    }
  };
  
  // Only show Solana for Phantom wallet
  const filteredNetworks = activeWallet === 'phantom' 
    ? networks.filter(net => net.id === 'solana')
    : networks.filter(net => net.id !== 'solana');

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        disabled={!isConnected}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-md ${
          isConnected 
            ? 'bg-slate-800 text-white hover:bg-slate-700' 
            : 'bg-slate-800/50 text-gray-500 cursor-not-allowed'
        } transition-colors`}
      >
        <div className="flex items-center">
          <div className={`h-3 w-3 rounded-full mr-2 ${currentNetwork.color}`}></div>
          <span className="font-medium text-sm">{currentNetwork.name}</span>
        </div>
        {isConnected && (
          <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </motion.button>
      
      {/* Network dropdown */}
      <AnimatePresence>
        {isOpen && isConnected && (
          <motion.div
            className="absolute top-full left-0 mt-1 w-full bg-slate-800 rounded-md shadow-lg z-10 border border-slate-700"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <div className="py-1">
              {filteredNetworks.map((network, index) => (
                <motion.button
                  key={network.id}
                  className={`flex
                    items-center
                    w-full
                    px-4
                    py-2
                    text-left
                    text-sm
                    hover:bg-slate-700
                    transition-colors
                    ${!isConnected && 'cursor-not-allowed'}
                  `}
                  onClick={() => handleNetworkChange(network)}
                  disabled={!isConnected}
                >
                  <div className={`h-3 w-3 rounded-full mr-2 ${network.color}`}></div>
                  <span className="font-medium">{network.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NetworkSelector;
