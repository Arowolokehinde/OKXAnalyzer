// components/wallet/WalletConnectButton.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, LogOut, ExternalLink, Copy, Check } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import WalletModal from './WalletModal';
import NetworkSelector from './NetworkSelector';

const WalletConnectButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);
  const { isConnected, account, activeWallet, disconnect, chainId } = useWallet();
  
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

  // Copy address to clipboard
  const copyToClipboard = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get wallet icon based on active wallet
  const getWalletIcon = () => {
    if (activeWallet === 'okx') {
      return "/wallets/okx-wallet.png";
    } else if (activeWallet === 'phantom') {
      return "/wallets/phantom-wallet.png";
    }
    return null;
  };

  // Get wallet color based on active wallet
  const getWalletColor = () => {
    if (activeWallet === 'okx') {
      return 'bg-teal-500';
    } else if (activeWallet === 'phantom') {
      return 'bg-purple-500';
    }
    return 'bg-blue-500';
  };
  
  return (
    <div className="relative" ref={menuRef}>
      {isConnected ? (
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <div className="relative w-5 h-5 rounded-full overflow-hidden mr-1">
              <img 
                src={getWalletIcon()} 
                alt={activeWallet} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 12V7H5a2 2 0 0 1 0-4h14v4'/%3E%3Cpath d='M3 5v14a2 2 0 0 0 2 2h16v-5'/%3E%3Cpath d='M18 12a2 2 0 0 0 0 4h4v-4Z'/%3E%3C/svg%3E";
                }}
              />
              <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${getWalletColor()} border border-slate-800`} />
            </div>
            <span>{formatAddress(account)}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </motion.button>
          
          {/* Dropdown menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 z-10 border border-slate-700"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-3 border-b border-slate-700">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2 bg-slate-700">
                      <img 
                        src={getWalletIcon()} 
                        alt={activeWallet} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 12V7H5a2 2 0 0 1 0-4h14v4'/%3E%3Cpath d='M3 5v14a2 2 0 0 0 2 2h16v-5'/%3E%3Cpath d='M18 12a2 2 0 0 0 0 4h4v-4Z'/%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Connected with {activeWallet.toUpperCase()}</div>
                      <div className="flex items-center">
                        <span className="text-white font-medium">{formatAddress(account)}</span>
                        <button 
                          onClick={copyToClipboard}
                          className="ml-1 p-1 text-gray-400 hover:text-white rounded-full hover:bg-slate-700 transition-colors"
                        >
                          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Network selector */}
                  <div className="mt-2">
                    <NetworkSelector />
                  </div>
                </div>
                
                <div className="py-1">
                  <a
                    href={`https://${chainId === 'solana' ? 'solscan.io/account/' : 'etherscan.io/address/'}${account}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white flex items-center"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Explorer
                  </a>
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
          </AnimatePresence>
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
