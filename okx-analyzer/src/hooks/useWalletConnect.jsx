// hooks/useWalletConnect.js (Fixed Version)
import { useState, useEffect, useCallback } from 'react';
import { OKXUniversalProvider } from "@okxconnect/universal-provider";
import { toast } from 'react-hot-toast';

// Error codes from OKX SDK
export const OKX_CONNECT_ERROR_CODES = {
  UNKNOWN_ERROR: 0,
  ALREADY_CONNECTED_ERROR: 11,
  NOT_CONNECTED_ERROR: 12,
  USER_REJECTS_ERROR: 300,
  METHOD_NOT_SUPPORTED: 400,
  CHAIN_NOT_SUPPORTED: 500,
  WALLET_NOT_SUPPORTED: 600,
  CONNECTION_ERROR: 700
};

const SUPPORTED_CHAINS = {
  ETHEREUM: "eip155:1",
  POLYGON: "eip155:137",
  BSC: "eip155:56",
  ARBITRUM: "eip155:42161",
  OPTIMISM: "eip155:10",
  OKC: "eip155:66",
};

export const useWalletConnect = () => {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Initialize the provider
  const initProvider = useCallback(async () => {
    try {
      // FIXED: Using dappMetaData (lowercase) instead of DAppMetaData
      const provider = await OKXUniversalProvider.init({
        dappMetaData: {
          name: "OKX Token Launch Analytics",
          icon: "/logo.png", // Replace with your app's icon URL
        },
      });
      
      setProvider(provider);
      
      // Set up event listeners
      provider.on('display_uri', (uri) => {
        console.log('Wallet URI:', uri);
        // You could use this to display a QR code for mobile wallet connection
      });
      
      provider.on('session_update', (session) => {
        console.log('Session updated:', session);
        // Handle chain or account changes
        if (session.namespaces.eip155) {
          const accounts = session.namespaces.eip155.accounts;
          if (accounts && accounts.length > 0) {
            const accountData = accounts[0].split(':');
            setChainId(accountData[1]);
            setAccount(accountData[2]);
          }
        }
      });
      
      provider.on('session_delete', () => {
        console.log('Session deleted');
        setIsConnected(false);
        setAccount(null);
        setChainId(null);
      });

      return provider;
    } catch (err) {
      console.error('Failed to initialize provider:', err);
      setError('Failed to initialize OKX wallet provider');
      return null;
    }
  }, []);

  // Connect to wallet
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      let walletProvider = provider;
      
      if (!walletProvider) {
        walletProvider = await initProvider();
        if (!walletProvider) {
          throw new Error('Provider initialization failed');
        }
      }
      
      // Check if already connected
      if (walletProvider.connected()) {
        setIsConnected(true);
        
        // Get account and chain info
        const accounts = await walletProvider.request({
          method: "eth_accounts"
        }, SUPPORTED_CHAINS.ETHEREUM);
        
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          
          // Get chain ID
          const chainIdResult = await walletProvider.request({
            method: "eth_chainId"
          }, SUPPORTED_CHAINS.ETHEREUM);
          
          setChainId(chainIdResult);
        }
        
        setIsConnecting(false);
        return;
      }
      
      // Connect to wallet
      const session = await walletProvider.connect({
        namespaces: {
          eip155: {
            chains: [
              SUPPORTED_CHAINS.ETHEREUM,
              SUPPORTED_CHAINS.POLYGON,
              SUPPORTED_CHAINS.BSC
            ],
            defaultChain: "1",
            rpcMap: {
              "137": "https://polygon-rpc.com",
              "56": "https://bsc-dataseed.binance.org"
            }
          }
        },
        optionalNamespaces: {
          eip155: {
            chains: [
              SUPPORTED_CHAINS.ARBITRUM,
              SUPPORTED_CHAINS.OPTIMISM,
              SUPPORTED_CHAINS.OKC
            ]
          }
        },
        sessionConfig: {
          redirect: "tg://resolve" // For Telegram mini apps, use standard URL for web
        }
      });
      
      if (session) {
        setIsConnected(true);
        
        // Extract and set account from session
        if (session.namespaces.eip155) {
          const accounts = session.namespaces.eip155.accounts;
          if (accounts && accounts.length > 0) {
            const accountData = accounts[0].split(':');
            setChainId(accountData[1]);
            setAccount(accountData[2]);
          }
        }
        
        toast.success('Wallet connected successfully');
      } else {
        throw new Error('Connection failed');
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      
      let errorMessage = 'Failed to connect wallet';
      
      // Handle specific error codes
      if (err.code === OKX_CONNECT_ERROR_CODES.USER_REJECTS_ERROR) {
        errorMessage = 'Connection rejected by user';
      } else if (err.code === OKX_CONNECT_ERROR_CODES.CHAIN_NOT_SUPPORTED) {
        errorMessage = 'Chain not supported';
      } else if (err.code === OKX_CONNECT_ERROR_CODES.WALLET_NOT_SUPPORTED) {
        errorMessage = 'Wallet not supported';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  }, [provider, initProvider]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      if (provider && isConnected) {
        await provider.disconnect();
        setIsConnected(false);
        setAccount(null);
        setChainId(null);
        toast.success('Wallet disconnected');
      }
    } catch (err) {
      console.error('Disconnect error:', err);
      setError('Failed to disconnect wallet');
      toast.error('Failed to disconnect wallet');
    }
  }, [provider, isConnected]);

  // Switch chain
  const switchChain = useCallback(async (targetChainId) => {
    if (!provider || !isConnected) {
      setError('Wallet not connected');
      return;
    }
    
    try {
      const hexChainId = `0x${parseInt(targetChainId).toString(16)}`;
      
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }]
      }, `eip155:${targetChainId}`);
      
      setChainId(targetChainId);
      toast.success(`Switched to chain: ${targetChainId}`);
    } catch (err) {
      console.error('Chain switch error:', err);
      setError('Failed to switch chain');
      toast.error('Failed to switch chain');
    }
  }, [provider, isConnected]);

  // Check if wallet is connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      const walletProvider = await initProvider();
      if (walletProvider && walletProvider.connected()) {
        setIsConnected(true);
        setProvider(walletProvider);
        
        try {
          // Get accounts
          const accounts = await walletProvider.request({
            method: "eth_accounts"
          }, SUPPORTED_CHAINS.ETHEREUM);
          
          if (accounts && accounts.length > 0) {
            setAccount(accounts[0]);
            
            // Get chain ID
            const chainIdResult = await walletProvider.request({
              method: "eth_chainId"
            }, SUPPORTED_CHAINS.ETHEREUM);
            
            setChainId(chainIdResult);
          }
        } catch (err) {
          console.error('Error getting account info:', err);
        }
      }
    };
    
    checkConnection();
    
    // Cleanup function
    return () => {
      if (provider) {
        provider.off('display_uri');
        provider.off('session_update');
        provider.off('session_delete');
      }
    };
  }, [initProvider]);

  return {
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
  };
};

export default useWalletConnect;