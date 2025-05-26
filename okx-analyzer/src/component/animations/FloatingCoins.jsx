// components/animations/FloatingCoins.jsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Coin URLs for various crypto coins
const coinImages = [
  '/coins/btc.png', // These are placeholder paths
  '/coins/eth.png',
  '/coins/okx.png',
  '/coins/usdt.png',
  '/coins/doge.png',
  '/coins/shib.png',
];

const FloatingCoins = () => {
  const [coins, setCoins] = useState([]);
  
  useEffect(() => {
    // Generate random coin positions based on viewport size
    const generateCoins = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const numberOfCoins = windowWidth < 768 ? 10 : 20; // Less coins on mobile
      
      const newCoins = Array.from({ length: numberOfCoins }, (_, i) => ({
        id: i,
        x: Math.random() * windowWidth,
        y: Math.random() * windowHeight,
        size: Math.random() * 40 + 10, // 10-50px
        duration: Math.random() * 20 + 10, // 10-30s
        delay: Math.random() * 5,
        rotate: Math.random() * 360,
        image: coinImages[Math.floor(Math.random() * coinImages.length)]
      }));
      
      setCoins(newCoins);
    };
    
    generateCoins();
    
    // Regenerate coins on window resize
    window.addEventListener('resize', generateCoins);
    return () => window.removeEventListener('resize', generateCoins);
  }, []);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {coins.map((coin) => (
        <motion.div
          key={coin.id}
          className="absolute rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center"
          style={{
            width: coin.size,
            height: coin.size,
            left: coin.x,
            top: coin.y,
            boxShadow: '0 0 10px rgba(14, 165, 233, 0.2), 0 0 20px rgba(14, 165, 233, 0.1)'
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, coin.id % 2 === 0 ? 50 : -50, 0],
            rotate: [coin.rotate, coin.rotate + 360, coin.rotate],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: coin.duration,
            delay: coin.delay,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        >
          {/* This would be an actual coin image in production */}
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500/30 to-teal-500/30 flex items-center justify-center">
            <div className="w-2/3 h-2/3 rounded-full bg-gradient-to-br from-blue-500/50 to-teal-500/50"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingCoins;