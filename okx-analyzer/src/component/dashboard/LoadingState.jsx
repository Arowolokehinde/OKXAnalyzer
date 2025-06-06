'use client';

import { motion } from 'framer-motion';
import ClientBackgroundWrapper from '../animations/ClientBackgroundWrapper';

const LoadingState = () => {
  return (
    <ClientBackgroundWrapper>
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-16 h-16 rounded-full border-b-2 border-t-2 border-teal-500 mx-auto mb-6"
          ></motion.div>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent"
          >
            Loading Dashboard
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-gray-400 mt-2"
          >
            Fetching the latest token data...
          </motion.p>
        </div>
      </div>
    </ClientBackgroundWrapper>
  );
};

export default LoadingState;
