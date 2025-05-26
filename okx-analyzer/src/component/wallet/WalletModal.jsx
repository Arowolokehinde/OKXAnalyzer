// components/wallet/WalletModal.jsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, AlertCircle } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';

const WalletModal = ({ isOpen, onClose }) => {
  const { connect, isConnecting, WALLET_TYPES } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [error, setError] = useState(null);
  
  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } }
  };
  
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { 
        type: 'spring', 
        damping: 25, 
        stiffness: 300 
      } 
    },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
  };

  const walletOptionVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: i => ({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        delay: i * 0.1,
        duration: 0.3
      } 
    }),
    hover: { 
      scale: 1.03,
      backgroundColor: 'rgba(15, 118, 110, 0.1)',
      transition: { duration: 0.2 }
    }
  };

  const handleConnect = async (walletType) => {
    try {
      setSelectedWallet(walletType);
      setError(null);
      await connect(walletType);
      onClose();
    } catch (err) {
      setError(`Failed to connect: ${err.message}`);
    }
  };

  const resetState = () => {
    setSelectedWallet(null);
    setError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={() => {
              resetState();
              onClose();
            }}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div
              className="bg-slate-900 rounded-xl border border-slate-700 shadow-xl w-full max-w-md pointer-events-auto"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <h3 className="text-lg font-medium text-white">Connect Wallet</h3>
                <button
                  onClick={() => {
                    resetState();
                    onClose();
                  }}
                  className="rounded-full p-1 text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-5">
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                )}
                
                <p className="text-gray-300 mb-4">
                  Connect your wallet to access the OKX Token Launch Analytics Dashboard.
                </p>
                
                {/* Wallet options */}
                <div className="space-y-3">
                  {/* OKX Wallet */}
                  <motion.button
                    className={`w-full p-4 rounded-lg border ${
                      selectedWallet === WALLET_TYPES.OKX 
                        ? 'border-teal-500 bg-teal-500/10' 
                        : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800'
                    } transition-colors flex items-center justify-between`}
                    onClick={() => handleConnect(WALLET_TYPES.OKX)}
                    disabled={isConnecting && selectedWallet !== WALLET_TYPES.OKX}
                    variants={walletOptionVariants}
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    whileHover={selectedWallet !== WALLET_TYPES.OKX ? "hover" : undefined}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 mr-3 rounded-full overflow-hidden flex items-center justify-center bg-slate-700">
                        {/* Placeholder for wallet image */}
                        <img 
                          src="/wallets/okx-wallet.png" 
                          alt="OKX Wallet" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%2300C6A9' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 12V7H5a2 2 0 0 1 0-4h14v4'/%3E%3Cpath d='M3 5v14a2 2 0 0 0 2 2h16v-5'/%3E%3Cpath d='M18 12a2 2 0 0 0 0 4h4v-4Z'/%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      <div>
                        <span className="text-white font-medium block">OKX Wallet</span>
                        <span className="text-xs text-gray-400">Connect to OKX Web3 Wallet</span>
                      </div>
                    </div>
                    {isConnecting && selectedWallet === WALLET_TYPES.OKX && (
                      <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </motion.button>
                  
                  {/* Phantom Wallet */}
                  <motion.button
                    className={`w-full p-4 rounded-lg border ${
                      selectedWallet === WALLET_TYPES.PHANTOM 
                        ? 'border-purple-500 bg-purple-500/10' 
                        : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800'
                    } transition-colors flex items-center justify-between`}
                    onClick={() => handleConnect(WALLET_TYPES.PHANTOM)}
                    disabled={isConnecting && selectedWallet !== WALLET_TYPES.PHANTOM}
                    variants={walletOptionVariants}
                    custom={1}
                    initial="hidden"
                    animate="visible"
                    whileHover={selectedWallet !== WALLET_TYPES.PHANTOM ? "hover" : undefined}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 mr-3 rounded-full overflow-hidden flex items-center justify-center bg-slate-700">
                        {/* Placeholder for wallet image */}
                        <img 
                          src="/wallets/phantom-wallet.png" 
                          alt="Phantom Wallet" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23AB9FF2' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 12V7H5a2 2 0 0 1 0-4h14v4'/%3E%3Cpath d='M3 5v14a2 2 0 0 0 2 2h16v-5'/%3E%3Cpath d='M18 12a2 2 0 0 0 0 4h4v-4Z'/%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      <div>
                        <span className="text-white font-medium block">Phantom Wallet</span>
                        <span className="text-xs text-gray-400">Connect to Phantom Solana Wallet</span>
                      </div>
                    </div>
                    {isConnecting && selectedWallet === WALLET_TYPES.PHANTOM && (
                      <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </motion.button>
                </div>
                
                {/* Footer */}
                <div className="mt-6 text-center text-xs text-gray-500">
                  <p>New to crypto wallets?</p>
                  <a 
                    href="https://www.okx.com/web3" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-teal-500 hover:text-teal-400 inline-flex items-center mt-1"
                  >
                    <span>Learn more about Web3 wallets</span>
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WalletModal;
