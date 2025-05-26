'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import ClientBackgroundWrapper from '@/component/animations/ClientBackgroundWrapper';
import MemeCoinsHeader from '@/component/discovery/MemeCoinsHeader';
import MemeCoinsFilters from '@/component/discovery/MemeCoinsFilters';
import MemeCoinsGrid from '@/component/discovery/MemeCoinsGrid';
import MemeCoinsStats from '@/component/discovery/MemeCoinsStats';
import MemeCoinsLoading from '@/component/discovery/MemeCoinsLoading';

export default function MemeCoinsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [memeCoins, setMemeCoins] = useState([]);
  const [filters, setFilters] = useState({
    timeRange: '24h',
    sortBy: 'trending',
    minMarketCap: 0,
    maxMarketCap: 1000000000,
    chain: 'all'
  });
  
  const containerRef = useRef(null);
  // Set once to true to ensure animations trigger properly
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });
  
  // Fetch meme coins data
  useEffect(() => {
    const fetchMemeCoins = async () => {
      try {
        // For now, use mock data
        setTimeout(() => {
          setMemeCoins(generateMockMemeCoins());
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error fetching meme coins:', error);
        setIsLoading(false);
      }
    };
    
    setIsLoading(true);
    fetchMemeCoins();
  }, [filters]);
  
  // Generate mock data
  const generateMockMemeCoins = () => {
    const chains = ['Ethereum', 'Solana', 'OKX Chain', 'Arbitrum', 'Base', 'BNB Chain'];
    const prefixes = ['Moon', 'Doge', 'Pepe', 'Shib', 'Floki', 'Wojak', 'Cat', 'Frog', 'Ape', 'Baby'];
    const suffixes = ['Inu', 'Moon', 'Rocket', 'Elon', 'Coin', 'Token', 'Doge', 'AI', 'Swap', 'Meme'];
    
    return Array.from({ length: 24 }, (_, i) => {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      const name = `${prefix} ${suffix}`;
      const symbol = `${prefix.substring(0, 2)}${suffix.substring(0, 2)}`.toUpperCase();
      const chain = chains[Math.floor(Math.random() * chains.length)];
      const price = Math.random() * (i < 5 ? 0.1 : 0.0001);
      const marketCap = Math.random() * 1000000000;
      const volume24h = Math.random() * 10000000;
      const change24h = (Math.random() * 40) * (Math.random() > 0.5 ? 1 : -1);
      const holders = Math.floor(Math.random() * 50000) + 1000;
      const launchDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      // Use the correct path to the images in the public folder
      const imageIndex = (i % 9) + 1; // Use images 1.jpeg to 9.jpeg
      
      return {
        id: i + 1,
        name,
        symbol,
        chain,
        price,
        marketCap,
        volume24h,
        change24h,
        holders,
        launchDate,
        logoUrl: `/${imageIndex}.jpeg`, // Path to images in public folder
        verified: Math.random() > 0.7,
        trending: i < 8,
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
    return <MemeCoinsLoading />;
  }
  
  // Debug output
  console.log("Rendering MemeCoinsPage with data:", { 
    memeCoinsCount: memeCoins.length,
    filters,
    isInView
  });
  
  return (
    <ClientBackgroundWrapper>
      <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <MemeCoinsHeader isInView={true} />
          
          <MemeCoinsStats 
            isInView={true} 
            totalMemeCoins={memeCoins.length}
            totalMarketCap={memeCoins.reduce((sum, coin) => sum + coin.marketCap, 0)}
            totalVolume={memeCoins.reduce((sum, coin) => sum + coin.volume24h, 0)}
          />
          
          <MemeCoinsFilters 
            isInView={true} 
            filters={filters} 
            setFilters={setFilters} 
          />
          
          <MemeCoinsGrid 
            isInView={true} 
            memeCoins={memeCoins} 
          />
        </div>
      </div>
    </ClientBackgroundWrapper>
  );
}
