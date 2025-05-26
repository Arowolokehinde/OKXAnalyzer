// components/sections/StatsSection.jsx
'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, Users, Zap, BarChart3 } from 'lucide-react';
import CountUpAnimation from '../animations/CountUpAnimation';

const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  const statsItems = [
    { 
      label: 'New Tokens Today', 
      value: 24, 
      suffix: '', 
      icon: <Zap className="h-6 w-6 text-blue-400" />,
      delay: 0
    },
    { 
      label: 'Total Volume (24h)', 
      value: 3.5, 
      suffix: 'M', 
      prefix: '$',
      icon: <BarChart3 className="h-6 w-6 text-green-400" />,
      delay: 0.1
    },
    { 
      label: 'Active Traders', 
      value: 1.2, 
      suffix: 'K', 
      icon: <Users className="h-6 w-6 text-purple-400" />,
      delay: 0.2
    },
    { 
      label: 'Price Change (Avg)', 
      value: 27.5, 
      suffix: '%', 
      icon: <TrendingUp className="h-6 w-6 text-yellow-400" />,
      delay: 0.3
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section ref={ref} className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statsItems.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 flex items-center hover:border-teal-500/30 transition-all duration-300"
            >
              {/* Icon Container */}
              <div className="h-14 w-14 rounded-lg bg-slate-700/50 flex items-center justify-center">
                {item.icon}
              </div>
              
              {/* Stats Text */}
              <div className="ml-4">
                <p className="text-gray-400 text-sm">{item.label}</p>
                <h3 className="text-white text-2xl font-bold flex items-baseline">
                  {item.prefix && <span>{item.prefix}</span>}
                  <CountUpAnimation 
                    end={item.value} 
                    duration={2} 
                    decimals={typeof item.value === 'number' && !Number.isInteger(item.value) ? 1 : 0}
                    delay={item.delay}
                    startOnView={isInView}
                  />
                  {item.suffix && <span>{item.suffix}</span>}
                </h3>
              </div>
              
              {/* Animated Highlight */}
              <motion.div 
                className="absolute -inset-px rounded-xl z-[-1] bg-gradient-to-r from-blue-500/0 via-teal-500/10 to-blue-500/0"
                animate={{ 
                  opacity: [0, 1, 0],
                }}
                transition={{ 
                  duration: 3,
                  delay: 0.2 + index * 0.1,
                  repeat: Infinity,
                  repeatDelay: 5
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;