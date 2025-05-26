'use client';

import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import WalletConnectButton from '@/component/wallet/WalletConnectButton';
import ClientBackgroundWrapper from '../animations/ClientBackgroundWrapper';

const NotConnectedState = () => {
  return (
    <ClientBackgroundWrapper>
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto text-center py-24"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-24 h-24 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-8"
          >
            <BarChart3 className="h-12 w-12 text-teal-500" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Connect Your Wallet
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-gray-400 max-w-2xl mx-auto mb-8"
          >
            Please connect your wallet to access the OKX Token Launch Analytics Dashboard and track your favorite tokens.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex justify-center"
          >
            <WalletConnectButton />
          </motion.div>
        </motion.div>
      </div>
    </ClientBackgroundWrapper>
  );
};

export default NotConnectedState;
