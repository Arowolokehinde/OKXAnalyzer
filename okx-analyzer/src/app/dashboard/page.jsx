// app/dashboard/page.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Clock, 
  Star, 
  Filter, 
  Search,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ChevronDown,
  Info,
  AlertTriangle,
  Wallet,
  DollarSign
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import WalletConnectButton from '@/component/wallet/WalletConnectButton';
import DashboardHeader from '@/component/dashboard/DashboardHeader';
import OverviewTab from '@/component/dashboard/OverviewTab';
import TrendingTab from '@/component/dashboard/TrendingTab';
import NewLaunchesTab from '@/component/dashboard/NewLaunchesTab';
import WatchlistTab from '@/component/dashboard/WatchlistTab';
import AnalyticsTab from '@/component/dashboard/AnalyticsTab';
import MiniChart from '@/component/dashboard/MiniChart';
import LoadingState from '@/component/dashboard/LoadingState';
import NotConnectedState from '@/component/dashboard/NotConnectedState';
import ClientBackgroundWrapper from '@/component/animations/ClientBackgroundWrapper';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const { isConnected } = useWallet();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  // Parallax effect for header
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const headerY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  
  // Function to generate mock chart data
  function generateMockChartData(points, trend) {
    const data = [];
    let value = 50 + Math.random() * 10;
    
    for (let i = 0; i < points; i++) {
      // Add some randomness but follow the trend direction
      const change = (Math.random() - 0.5 + trend * 0.5) * 5;
      value += change;
      value = Math.max(0, Math.min(100, value)); // Keep within 0-100 range
      data.push(value);
    }
    
    return data;
  }
  
  // Mock data
  const trendingTokens = [
    { name: 'PEPE', symbol: 'PEPE', price: 0.00000123, change: 42.5, volume: '12.5M', marketCap: '1.2B', chart: generateMockChartData(24, 0.6) },
    { name: 'Floki Inu', symbol: 'FLOKI', price: 0.00002345, change: -12.3, volume: '8.7M', marketCap: '845M', chart: generateMockChartData(24, -0.3) },
    { name: 'Bonk', symbol: 'BONK', price: 0.00000089, change: 18.7, volume: '5.2M', marketCap: '512M', chart: generateMockChartData(24, 0.4) },
    { name: 'Mog Coin', symbol: 'MOG', price: 0.00000456, change: 8.2, volume: '3.8M', marketCap: '320M', chart: generateMockChartData(24, 0.2) },
    { name: 'Dogwifhat', symbol: 'WIF', price: 0.00123456, change: -5.8, volume: '9.1M', marketCap: '780M', chart: generateMockChartData(24, -0.1) },
  ];
  
  const recentLaunches = [
    { 
      name: 'OKX Chain Token', 
      symbol: 'OKT', 
      launchTime: '2 hours ago', 
      initialPrice: 0.00005678, 
      currentPrice: 0.00006789, 
      change: 19.6,
      liquidity: '450K',
      volume24h: '1.2M',
      holders: '1,245',
      chart: generateMockChartData(24, 0.3)
    },
    { 
      name: 'Solana Meme', 
      symbol: 'SLME', 
      launchTime: '5 hours ago', 
      initialPrice: 0.00000123, 
      currentPrice: 0.00000098, 
      change: -20.3,
      liquidity: '120K',
      volume24h: '450K',
      holders: '876',
      chart: generateMockChartData(24, -0.2)
    },
    { 
      name: 'Arbitrum Doge', 
      symbol: 'ARDG', 
      launchTime: '12 hours ago', 
      initialPrice: 0.00000456, 
      currentPrice: 0.00000789, 
      change: 73.0,
      liquidity: '320K',
      volume24h: '780K',
      holders: '2,134',
      chart: generateMockChartData(24, 0.7)
    },
    { 
      name: 'Base Pepe', 
      symbol: 'BPEPE', 
      launchTime: '1 day ago', 
      initialPrice: 0.00000789, 
      currentPrice: 0.00001234, 
      change: 56.4,
      liquidity: '560K',
      volume24h: '1.5M',
      holders: '3,456',
      chart: generateMockChartData(24, 0.5)
    },
  ];
  
  const watchlistTokens = [
    { name: 'Shiba Inu', symbol: 'SHIB', price: 0.00000789, change: 3.2, volume: '45.2M', marketCap: '4.5B', chart: generateMockChartData(24, 0.1) },
    { name: 'Dogecoin', symbol: 'DOGE', price: 0.07823, change: -1.8, volume: '320M', marketCap: '10.2B', chart: generateMockChartData(24, -0.05) },
    { name: 'Pepe', symbol: 'PEPE', price: 0.00000123, change: 42.5, volume: '12.5M', marketCap: '1.2B', chart: generateMockChartData(24, 0.6) },
  ];
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await fetch('/api/dashboard');
        // const data = await response.json();
        
        // For now, use mock data
        setDashboardData({
          trendingTokens,
          newTokens: recentLaunches,
          watchlistTokens
        });
        
        // Simulate loading delay
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Close time dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowTimeDropdown(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  
  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }
  
  // Not connected state
  if (!isConnected) {
    return <NotConnectedState />;
  }
  
  return (
    <ClientBackgroundWrapper>
      <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-16">
        {/* Dashboard Header */}
        <DashboardHeader 
          scrollYProgress={scrollYProgress}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        />
        
        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && dashboardData && (
                <OverviewTab 
                  trendingTokens={dashboardData.trendingTokens}
                  recentLaunches={dashboardData.newTokens}
                  watchlistTokens={dashboardData.watchlistTokens}
                />
              )}
              
              {activeTab === 'trending' && dashboardData && (
                <TrendingTab 
                  trendingTokens={dashboardData.trendingTokens}
                />
              )}
              
              {activeTab === 'new launches' && dashboardData && (
                <NewLaunchesTab 
                  newTokens={dashboardData.newTokens}
                />
              )}
              
              {activeTab === 'watchlist' && dashboardData && (
                <WatchlistTab 
                  watchlistTokens={dashboardData.watchlistTokens}
                />
              )}
              
              {activeTab === 'analytics' && (
                <AnalyticsTab />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ClientBackgroundWrapper>
  );
}
