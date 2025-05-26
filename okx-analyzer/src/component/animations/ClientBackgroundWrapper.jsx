'use client';

import { motion } from 'framer-motion';

const ClientBackgroundWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-slate-950"
    >
      {children}
    </motion.div>
  );
};

export default ClientBackgroundWrapper;
