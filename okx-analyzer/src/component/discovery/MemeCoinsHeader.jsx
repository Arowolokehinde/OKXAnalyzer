'use client';

import { motion } from 'framer-motion';

const MemeCoinsHeader = ({ isInView }) => {
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
      <h1 className="text-3xl font-bold text-white mb-2">Meme Coins</h1>
      <p className="text-gray-400">Discover trending meme coins with high growth potential</p>
    </motion.div>
  );
};

export default MemeCoinsHeader;
