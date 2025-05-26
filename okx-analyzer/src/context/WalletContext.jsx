// context/WalletContext.jsx
'use client';

import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useWalletConnect } from '../hooks/useWalletConnect';
import { Toaster } from 'react-hot-toast';

// Create context
const WalletContext = createContext(null);

// This wrapper is needed to use WalletProvider with Next.js server components
export const WalletProviderWrapper = ({ children }) => {
  return (
    <WalletProvider>
      {children}
    </WalletProvider>
  );
};

export const WalletProvider = ({ children }) => {
  const walletConnect = useWalletConnect();
  const {
    provider,
    account,
    chainId,
    isConnecting,
    isConnected,
    error,
    connect,
    disconnect,
    switchChain,
    SUPPORTED_CHAINS
  } = walletConnect;

  // Format address for display (with ENS support in the future)
  const formattedAccount = useMemo(() => {
    if (!account) return null;
    // Simple formatting for now, can be extended with ENS resolution
    return `${account.slice(0, 6)}...${account.slice(-4)}`;
  }, [account]);

  // Get network details based on chainId
  const networkDetails = useMemo(() => {
    const networks = {
      '1': { name: 'Ethereum', chainId: 1, color: 'bg-blue-500', icon: '/icons/eth.svg' },
      '137': { name: 'Polygon', chainId: 137, color: 'bg-purple-500', icon: '/icons/polygon.svg' },
      '56': { name: 'BSC', chainId: 56, color: 'bg-yellow-500', icon: '/icons/bnb.svg' },
      '42161': { name: 'Arbitrum', chainId: 42161, color: 'bg-blue-400', icon: '/icons/arbitrum.svg' },
      '10': { name: 'Optimism', chainId: 10, color: 'bg-red-500', icon: '/icons/optimism.svg' },
      '66': { name: 'OKC', chainId: 66, color: 'bg-green-500', icon: '/icons/okc.svg' },
    };
    
    if (!chainId) return null;
    return networks[chainId] || { 
      name: `Chain ${chainId}`, 
      chainId: Number(chainId),
      color: 'bg-gray-500', 
      icon: null 
    };
  }, [chainId]);

  // Expose context value
  const value = {
    // State
    provider,
    account,
    formattedAccount,
    chainId,
    networkDetails,
    isConnecting,
    isConnected,
    error,
    
    // Actions
    connect,
    disconnect,
    switchChain,
    
    // Constants
    SUPPORTED_CHAINS
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook for consuming the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export default WalletContext;