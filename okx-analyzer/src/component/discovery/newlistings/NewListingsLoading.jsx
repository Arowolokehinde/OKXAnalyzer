'use client';

import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';
import ClientBackgroundWrapper from '@/component/animations/ClientBackgroundWrapper';

const NewListingsLoading = () => {
  return (
    <ClientBackgroundWrapper>
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 flex items-center justify-center">
        <div className="text-center px-4">
          <motion.div 
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mx-auto mb-6"
          >
            <Rocket className="h-8 w-8 text-blue-400" />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent"
          >
            Discovering New Tokens
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-gray-400 mt-2 max-w-md mx-auto"
          >
            Scanning the blockchain for the latest token launches and gathering market data...
          </motion.p>
          
          {/* Loading Skeleton */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-10 max-w-md mx-auto"
          >
            <div className="space-y-3">
              <div className="h-2 bg-slate-700/50 rounded animate-pulse"></div>
              <div className="h-2 bg-slate-700/50 rounded animate-pulse w-5/6"></div>
              <div className="h-2 bg-slate-700/50 rounded animate-pulse w-4/6"></div>
            </div>
            
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="h-8 bg-slate-700/50 rounded animate-pulse"></div>
              <div className="h-8 bg-slate-700/50 rounded animate-pulse"></div>
              <div className="h-8 bg-slate-700/50 rounded animate-pulse"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </ClientBackgroundWrapper>
  );
};

export default NewListingsLoading;