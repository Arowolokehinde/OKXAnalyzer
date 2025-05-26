// components/sections/DataVisualizationSection.jsx
'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { ArrowUpRight, ArrowDownRight, BarChart2, PieChartIcon, Activity } from 'lucide-react';

// Sample data for visualization
const chartData = [
  { name: 'Jan', memes: 1500, defi: 4000, gamefi: 2400 },
  { name: 'Feb', memes: 1800, defi: 3000, gamefi: 2210 },
  { name: 'Mar', memes: 2800, defi: 2000, gamefi: 2290 },
  { name: 'Apr', memes: 5500, defi: 2780, gamefi: 3908 },
  { name: 'May', memes: 9800, defi: 1890, gamefi: 4800 },
  { name: 'Jun', memes: 8000, defi: 2390, gamefi: 3800 },
  { name: 'Jul', memes: 9300, defi: 3490, gamefi: 4300 }
];

// Token performance data
const tokenPerformance = [
  { name: 'MoonDoge', change: 145.2, volume: 78000, positive: true },
  { name: 'OKX Chain', change: 28.7, volume: 450000, positive: true },
  { name: 'MetaVerse', change: -12.8, volume: 65000, positive: false },
  { name: 'GameFi Pro', change: 18.9, volume: 120000, positive: true },
  { name: 'DeFi Yield', change: -5.3, volume: 230000, positive: false }
];

const DataVisualizationSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [activeChart, setActiveChart] = useState('trend');
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 } 
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-gray-300 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <p className="text-sm">
                <span className="text-gray-400">{entry.name}: </span>
                <span className="text-white font-medium">{entry.value.toLocaleString()}</span>
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <section ref={ref} className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 to-slate-900/90 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 to-teal-900/5"></div>
        
        {/* Animated glowing orbs */}
        {[...Array(3)].map((_, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full bg-gradient-to-r from-blue-500/10 to-teal-500/10"
            style={{
              width: Math.random() * 300 + 200,
              height: Math.random() * 300 + 200,
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
              filter: 'blur(80px)'
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">Market Insights Dashboard</h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Visualize market trends and token analytics to make data-driven investment decisions
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Section */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="lg:col-span-2 bg-slate-800/60 backdrop-blur-md rounded-xl border border-slate-700/50 p-6 h-full"
          >
            <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
              <h3 className="text-xl text-white font-medium">Token Category Growth</h3>
              
              <div className="flex space-x-2">
                {[
                  { id: 'trend', label: 'Trend', icon: <Activity size={16} /> },
                  { id: 'volume', label: 'Volume', icon: <BarChart2 size={16} /> },
                  { id: 'distribution', label: 'Distribution', icon: <PieChartIcon size={16} /> }
                ].map((chart) => (
                  <button
                    key={chart.id}
                    onClick={() => setActiveChart(chart.id)}
                    className={`flex items-center px-3 py-1.5 rounded-lg text-sm ${
                      activeChart === chart.id
                        ? 'bg-blue-600/80 text-white'
                        : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700'
                    } transition-colors`}
                  >
                    {chart.icon}
                    <span className="ml-1.5">{chart.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="h-80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <ResponsiveContainer width="100%" height="100%">
                {activeChart === 'trend' ? (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorMemes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDefi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorGamefi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{ fill: '#94A3B8' }} />
                    <YAxis tick={{ fill: '#94A3B8' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="memes" 
                      name="Meme Coins" 
                      stroke="#8B5CF6" 
                      fillOpacity={1} 
                      fill="url(#colorMemes)" 
                      animationDuration={2000}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="defi" 
                      name="DeFi" 
                      stroke="#10B981" 
                      fillOpacity={1} 
                      fill="url(#colorDefi)" 
                      animationDuration={2000}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="gamefi" 
                      name="GameFi" 
                      stroke="#3B82F6" 
                      fillOpacity={1} 
                      fill="url(#colorGamefi)" 
                      animationDuration={2000}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36} 
                      wrapperStyle={{
                        paddingTop: '10px',
                        color: '#E2E8F0'
                      }}
                    />
                  </AreaChart>
                ) : (
                  // Placeholder for other chart types
                  <div className="h-full w-full flex items-center justify-center">
                    <p className="text-gray-400">
                      {activeChart === 'volume' ? 'Volume Chart' : 'Distribution Chart'} (Placeholder)
                    </p>
                  </div>
                )}
              </ResponsiveContainer>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="mt-4 grid grid-cols-3 gap-4"
            >
              {[
                { label: 'Meme Coins', value: '+520%', color: 'bg-purple-500', textColor: 'text-purple-400' },
                { label: 'DeFi Tokens', value: '+42%', color: 'bg-green-500', textColor: 'text-green-400' },
                { label: 'GameFi', value: '+118%', color: 'bg-blue-500', textColor: 'text-blue-400' }
              ].map((stat, index) => (
                <div key={index} className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                  <div className="flex items-center">
                    <div className={`w-2 h-8 ${stat.color} rounded-full mr-3`}></div>
                    <div>
                      <p className="text-gray-400 text-xs">{stat.label}</p>
                      <p className={`text-lg font-bold ${stat.textColor}`}>{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
          
          {/* Token Performance Section */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="bg-slate-800/60 backdrop-blur-md rounded-xl border border-slate-700/50 p-6"
          >
            <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
              <h3 className="text-xl text-white font-medium">Top Performers</h3>
              <button className="text-sm text-teal-400 hover:text-teal-300">View All</button>
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-4">
              {tokenPerformance.map((token, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700/80 rounded-lg transition-colors border border-slate-700/50 cursor-pointer"
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/30 to-teal-500/30 flex items-center justify-center mr-3">
                      <span className="text-sm">{token.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{token.name}</p>
                      <p className="text-gray-400 text-sm">${(token.volume / 1000).toFixed(1)}K volume</p>
                    </div>
                  </div>
                  
                  <div className={`flex items-center ${token.positive ? 'text-green-400' : 'text-red-400'}`}>
                    <span className="font-medium">{token.positive ? '+' : ''}{token.change.toFixed(1)}%</span>
                    {token.positive ? (
                      <ArrowUpRight size={16} className="ml-1" />
                    ) : (
                      <ArrowDownRight size={16} className="ml-1" />
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="mt-6"
            >
              <button className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg text-white font-medium">
                See All Analytics
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DataVisualizationSection;