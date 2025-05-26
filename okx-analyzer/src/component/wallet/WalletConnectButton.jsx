// components/wallet/WalletConnectButton.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ChevronDown, LogOut } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import WalletModal from './WalletModal';

const WalletConnectButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isConnected, account, activeWallet, disconnect } = useWallet();
  
  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Handle disconnect
  const handleDisconnect = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    await disconnect();
  };
  
  return (
    <div className="relative">
      {isConnected ? (
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <div className={`w-2 h-2 rounded-full ${activeWallet === 'okx' ? 'bg-teal-500' : 'bg-purple-500'}`} />
            <span>{formatAddress(account)}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </motion.button>
          
          {/* Dropdown menu */}
          {isMenuOpen && (
            <motion.div 
              className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 z-10"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="py-1">
                <button
                  onClick={handleDisconnect}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white flex items-center"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect
                </button>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-teal-500 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
        >
          <Wallet className="h-4 w-4" />
          <span>Connect Wallet</span>
        </motion.button>
      )}
      
      {/* Wallet Connection Modal */}
      <WalletModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default WalletConnectButton;
