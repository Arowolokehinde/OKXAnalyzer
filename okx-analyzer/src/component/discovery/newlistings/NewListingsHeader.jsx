'use client';

import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';

const NewListingsHeader = ({ isInView }) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="mb-8"
    >
      <div className="flex items-center mb-2">
        <div className="h-10 w-10 rounded-lg bg-blue-600/30 flex items-center justify-center mr-3">
          <Rocket className="h-5 w-5 text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-white">New Token Listings</h1>
      </div>
      <p className="text-gray-400 max-w-2xl">
        Discover the newest tokens launched on various blockchains. Be the first to find promising projects before they gain mainstream attention.
      </p>
    </motion.div>
  );
};

export default NewListingsHeader;