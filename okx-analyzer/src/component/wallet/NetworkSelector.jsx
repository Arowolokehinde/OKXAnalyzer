// components/wallet/NetworkSelector.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { useWalletConnect } from '../../hooks/useWalletConnect';

const NetworkSelector = () => {
  const { chainId, isConnected, switchChain, SUPPORTED_CHAINS } = useWalletConnect();
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const networks = [
    { id: '1', name: 'Ethereum', color: 'bg-blue-500', icon: '/icons/eth.svg' },
    { id: '137', name: 'Polygon', color: 'bg-purple-500', icon: '/icons/polygon.svg' },
    { id: '56', name: 'BSC', color: 'bg-yellow-500', icon: '/icons/bnb.svg' },
    { id: '42161', name: 'Arbitrum', color: 'bg-blue-400', icon: '/icons/arbitrum.svg' },
    { id: '10', name: 'Optimism', color: 'bg-red-500', icon: '/icons/optimism.svg' },
    { id: '66', name: 'OKC', color: 'bg-green-500', icon: '/icons/okc.svg' },
  ];

  const handleSwitchNetwork = async (id) => {
    if (id === chainId) {
      setIsOpen(false);
      return;
    }
    
    setSwitching(true);
    try {
      await switchChain(id);
    } finally {
      setSwitching(false);
      setIsOpen(false);
    }
  };

  // Find current network
  const currentNetwork = networks.find(net => net.id === chainId) || { 
    id: chainId, 
    name: `Chain ${chainId}`, 
    color: 'bg-gray-500', 
    icon: null 
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
  useEffect(() => {
    const handleClickOutside = () => {
      setIsOpen(false);
    };
    
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  if (!isConnected) {
    return null;
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={(e) => {
          e.stopPropagation();
          if (!switching) {
            setIsOpen(!isOpen);
          }
        }}
        disabled={switching}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-md ${
          switching ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-700'
        } bg-slate-800 text-white transition-colors`}
      >
        <div className="flex items-center">
          <div className={`h-3 w-3 rounded-full mr-2 ${currentNetwork.color}`}></div>
          <span className="font-medium text-sm">
            {switching ? 'Switching...' : currentNetwork.name}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-lg"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              {networks.map((network) => (
                <motion.div
                  key={network.id}
                  variants={dropdownItemVariants}
                  className={`flex items-center justify-between px-3 py-2 ${
                    network.id === chainId 
                      ? 'bg-slate-700' 
                      : 'hover:bg-slate-700 cursor-pointer'
                  } transition-colors`}
                  onClick={() => handleSwitchNetwork(network.id)}
                >
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-2 ${network.color}`}></div>
                    <span className="text-white text-sm">{network.name}</span>
                  </div>
                  {network.id === chainId && (
                    <Check className="h-4 w-4 text-teal-400" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NetworkSelector;
