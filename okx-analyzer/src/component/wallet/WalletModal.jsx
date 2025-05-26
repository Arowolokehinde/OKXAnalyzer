// components/wallet/WalletModal.jsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';

const WalletModal = ({ isOpen, onClose }) => {
  const { connect, isConnecting, WALLET_TYPES } = useWallet();
  
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
    await connect(walletType);
    onClose();
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
                <h3 className="text-lg font-medium text-white">Connect Wallet</h3>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-5">
                <p className="text-gray-300 mb-4">
                  Connect your wallet to access the OKX Token Launch Analytics Dashboard.
                </p>
                
                {/* Wallet options */}
                <div className="space-y-3">
                  {/* OKX Wallet */}
                  <motion.button
                    className="w-full p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors flex items-center justify-between"
                    onClick={() => handleConnect(WALLET_TYPES.OKX)}
                    disabled={isConnecting}
                    variants={walletOptionVariants}
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 mr-3 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center">
                        <span className="text-white font-bold">OKX</span>
                      </div>
                      <span className="text-white font-medium">OKX Wallet</span>
                    </div>
                    {isConnecting && <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>}
                  </motion.button>
                  
                  {/* Phantom Wallet */}
                  <motion.button
                    className="w-full p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors flex items-center justify-between"
                    onClick={() => handleConnect(WALLET_TYPES.PHANTOM)}
                    disabled={isConnecting}
                    variants={walletOptionVariants}
                    custom={1}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 mr-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-400 flex items-center justify-center">
                        <span className="text-white font-bold">Ph</span>
                      </div>
                      <span className="text-white font-medium">Phantom Wallet</span>
                    </div>
                    {isConnecting && <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>}
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
