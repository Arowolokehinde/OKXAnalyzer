'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import ClientBackgroundWrapper from '@/component/animations/ClientBackgroundWrapper';
import NewListingsHeader from '@/component/discovery/newlistings/NewListingsHeader';
import NewListingsStats from '@/component/discovery/newlistings/NewListingsStats';
import NewListingsFilters from '@/component/discovery/newlistings/NewListingsFilters';
import NewListingsGrid from '@/component/discovery/newlistings/NewListingsGrid';
import NewListingsLoading from '@/component/discovery/newlistings/NewListingsLoading';

export default function NewListingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [newTokens, setNewTokens] = useState([]);
  const [filters, setFilters] = useState({
    timeRange: '24h',
    sortBy: 'newest',
    minLiquidity: 0,
    maxLiquidity: 10000000,
    chain: 'all'
  });
  
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });
  
  // Fetch new tokens data
  useEffect(() => {
    const fetchNewTokens = async () => {
      try {
        // For now, use mock data
        setTimeout(() => {
          setNewTokens(generateMockNewTokens());
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error fetching new tokens:', error);
        setIsLoading(false);
      }
    };
    
    setIsLoading(true);
    fetchNewTokens();
  }, [filters]);
  
  // Generate mock data
  const generateMockNewTokens = () => {
    const chains = ['Ethereum', 'Solana', 'OKX Chain', 'Arbitrum', 'Base', 'BNB Chain'];
    const prefixes = ['Crypto', 'Meta', 'Dex', 'Yield', 'Chain', 'Block', 'Swap', 'Finance', 'Stake', 'Liquid'];
    const suffixes = ['Protocol', 'Network', 'Finance', 'DAO', 'Swap', 'Chain', 'Token', 'Exchange', 'AI', 'Pay'];
    
    return Array.from({ length: 24 }, (_, i) => {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      const name = `${prefix} ${suffix}`;
      const symbol = `${prefix.substring(0, 2)}${suffix.substring(0, 2)}`.toUpperCase();
      const chain = chains[Math.floor(Math.random() * chains.length)];
      const price = Math.random() * (i < 5 ? 1 : 0.1);
      const liquidity = Math.random() * 5000000;
      const volume24h = Math.random() * 2000000;
      const change24h = (Math.random() * 30) * (Math.random() > 0.5 ? 1 : -1);
      const holders = Math.floor(Math.random() * 10000) + 100;
      
      // Calculate launch time (within the last 24 hours for most tokens)
      const hoursAgo = i < 15 ? Math.random() * 24 : Math.random() * 72;
      const launchDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
      
      // Use the correct path to the images in the public folder
      const imageIndex = (i % 9) + 1; // Use images 1.jpeg to 9.jpeg
      
      return {
        id: i + 1,
        name,
        symbol,
        chain,
        price,
        liquidity,
        volume24h,
        change24h,
        holders,
        launchDate,
        launchTime: hoursAgo,
        logoUrl: `/${imageIndex}.jpeg`, // Path to images in public folder
        verified: Math.random() > 0.8,
        trending: i < 6,
        chartData: generateChartData(24, change24h > 0 ? 0.6 : -0.3)
      };
    });
  };
  
  // Generate chart data
  const generateChartData = (points, trend) => {
    const data = [];
    let value = 50 + Math.random() * 10;
    
    for (let i = 0; i < points; i++) {
      const change = (Math.random() - 0.5 + trend * 0.5) * 5;
      value += change;
      value = Math.max(0, Math.min(100, value));
      data.push(value);
    }
    
    return data;
  };
  
  // Loading state
  if (isLoading) {
    return <NewListingsLoading />;
  }
  
  return (
    <ClientBackgroundWrapper>
      <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <NewListingsHeader isInView={true} />
          
          <NewListingsStats 
            isInView={true} 
            totalNewTokens={newTokens.length}
            totalLiquidity={newTokens.reduce((sum, token) => sum + token.liquidity, 0)}
            totalVolume={newTokens.reduce((sum, token) => sum + token.volume24h, 0)}
            averageReturn={newTokens.reduce((sum, token) => sum + token.change24h, 0) / newTokens.length}
          />
          
          <NewListingsFilters 
            isInView={true} 
            filters={filters} 
            setFilters={setFilters} 
          />
          
          <NewListingsGrid 
            isInView={true} 
            newTokens={newTokens} 
          />
        </div>
      </div>
    </ClientBackgroundWrapper>
  );
};