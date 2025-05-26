// components/wallet/WalletModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import NetworkSelector from './NetworkSelector';

const WalletModal = ({ isOpen, onClose }) => {
  const { 
    account, 
    formattedAccount, 
    networkDetails, 
    isConnecting, 
    isConnected, 
    error, 
    connect, 
    disconnect 
  } = useWallet();
  
  const [copied, setCopied] = useState(false);
  
  // Automatically close modal when connection is successful
  useEffect(() => {
    if (isConnected && !isConnecting) {
      // Add a small delay for better UX
      const timer = setTimeout(() => {
        onClose();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isConnected, isConnecting, onClose]);
  
  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [copied]);
  
  // Copy address to clipboard
  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
    }
  };
  
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
            onClick={onClose}
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
                <h3 className="text-lg font-medium text-white">
                  {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
                </h3>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-5">
                {!isConnected ? (
                  <>
                    <p className="text-gray-300 mb-4">
                      Connect your wallet to access the OKX Token Launch Analytics Dashboard.
                    </p>
                    
                    {error && (
                      <div className="mb-4 p-3 bg-red-900/30 border border-red-600/30 rounded-lg flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-300">{error}</p>
                      </div>
                    )}
                    
                    <button
                      onClick={connect}
                      disabled={isConnecting}
                      className={`w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors ${
                        isConnecting ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        'Connect OKX Wallet'
                      )}
                    </button>
                    
                    <div className="mt-4 text-center text-gray-400 text-sm">
                      By connecting, you agree to the OKX Terms of Service and Privacy Policy.
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-slate-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Account</span>
                        <button
                          onClick={copyAddress}
                          className="text-xs bg-slate-700 hover:bg-slate-600 text-gray-300 py-1 px-2 rounded transition-colors"
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="font-mono text-sm text-white break-all">
                        {account}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Network</div>
                      <NetworkSelector />
                    </div>
                    
                    <button
                      onClick={disconnect}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WalletModal;