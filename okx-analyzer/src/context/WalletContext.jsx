// context/WalletContext.jsx
'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

// Create context
const WalletContext = createContext(null);

// Supported wallets
export const WALLET_TYPES = {
  OKX: 'okx',
  PHANTOM: 'phantom'
};

// This wrapper is needed to use WalletProvider with Next.js server components
export const WalletProviderWrapper = ({ children }) => {
  return (
    <WalletProvider>
      {children}
    </WalletProvider>
  );
};

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [activeWallet, setActiveWallet] = useState(null);
  const [error, setError] = useState(null);

  // Simulated wallet connection
  const connect = useCallback(async (walletType) => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a random wallet address
      const randomAddress = `0x${Array.from({length: 40}, () => 
        Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      // Set wallet state based on type
      if (walletType === WALLET_TYPES.OKX) {
        setAccount(randomAddress);
        setChainId('1'); // Ethereum
        setActiveWallet(WALLET_TYPES.OKX);
        toast.success('OKX Wallet connected successfully');
      } else if (walletType === WALLET_TYPES.PHANTOM) {
        setAccount(randomAddress);
        setChainId('solana'); // Solana
        setActiveWallet(WALLET_TYPES.PHANTOM);
        toast.success('Phantom Wallet connected successfully');
      } else {
        throw new Error('Unsupported wallet type');
      }
      
      setIsConnected(true);
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError('Failed to connect wallet');
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Simulated wallet disconnection
  const disconnect = useCallback(async () => {
    setIsConnecting(true);
    
    try {
      // Simulate disconnection delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setAccount(null);
      setChainId(null);
      setIsConnected(false);
      setActiveWallet(null);
      
      toast.success('Wallet disconnected');
    } catch (err) {
      console.error('Disconnect error:', err);
      setError('Failed to disconnect wallet');
      toast.error('Failed to disconnect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Simulated chain switching
  const switchChain = useCallback(async (newChainId) => {
    if (!isConnected) {
      toast.error('Wallet not connected');
      return;
    }
    
    setIsConnecting(true);
    
    try {
      // Simulate switching delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setChainId(newChainId);
      toast.success(`Switched to chain: ${newChainId}`);
    } catch (err) {
      console.error('Chain switch error:', err);
      setError('Failed to switch chain');
      toast.error('Failed to switch chain');
    } finally {
      setIsConnecting(false);
    }
  }, [isConnected]);

  // Expose context value
  const value = {
    // State
    account,
    chainId,
    isConnecting,
    isConnected,
    activeWallet,
    error,
    
    // Actions
    connect,
    disconnect,
    switchChain,
    WALLET_TYPES
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
