/**
 * Configuration settings for OKC Token Launch Analytics Dashboard
 * Updated to use OKX DEX API with correct endpoints and authentication
 */
require('dotenv').config();

const config = {
  // Application name for logging
  serviceName: 'okc-token-dashboard',
  
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    apiPrefix: '/api'
  },
  
// Feature flags
features: {
    useRealApi: true, // Make sure this is set to true
    enableCaching: process.env.ENABLE_CACHING !== 'false',
    enableRateLimiting: process.env.ENABLE_RATE_LIMITING !== 'false',
    useMockDataOnFailure: true // Only use mock data as fallback, not by default
  },
  
  
  // Network configuration
  networkId: '66', // OKC chain ID
  
  // API base URLs - Updated to correct DEX API endpoints
  baseUrl: process.env.API_URL || 'https://web3.okx.com',
  
  // APIs configuration
  apis: {
    // Base URL
    baseUrl: process.env.API_URL || 'https://web3.okx.com',
    
    // Core DEX API endpoints
    tokenList: '/api/v5/market/tickers',    // Get all tokens
    tokenMetrics: '/api/v5/dex/market/ticker',         // Get token metrics
    tokenSwaps: '/api/v5/dex/market/trades',           // Get token swaps
    
    // Swap API endpoints
    swapQuote: '/api/v5/dex/aggregator/swap',          // Get swap quotes
    swapHistory: '/api/v5/dex/aggregator/history',     // Get swap history
    
    // Liquidity and prices
    liquidity: '/api/v5/dex/market/books',             // Get liquidity
    orderBook: '/api/v5/dex/market/depth',             // Get order book
    tokenPrices: '/api/v5/dex/market/price',           // Get token prices
    
    // Historical data
    klines: '/api/v5/dex/market/candles',              // Get price candles
    
    // Chain-specific endpoints
    chains: '/api/v5/dex/cross-chain/supported/chain', // Get supported chains
    
    // Meme coins specific endpoints
    memePumpTokens: '/api/v5/meme-pump/trending',      // For meme coins
    
    // General market data
    marketOverview: '/api/v5/market/index-components'  // Market overview
  },
  
  // Web3 endpoints for scraping
  web3: {
    trendingMemeCoinsUrl: 'https://web3.okx.com/meme-pump',    // Updated URL for meme pumps
    tokenExplorerUrl: 'https://www.okx.com/web3/oktc/tokens/', // Token explorer
    dexExplorerUrl: 'https://web3.okx.com/dex-swap',           // DEX swap interface
    memePumpUrl: 'https://web3.okx.com/meme-pump',             // Meme pump trends
  },
  
  // DEX-specific configuration
  dex: {
    chainId: 66,                   // OKC chain ID as number
    defaultQuoteToken: 'USDT',     // Default quote token for pairs
    minLiquidity: 1000,            // Minimum liquidity threshold
    minVolume: 5000,               // Minimum volume threshold
    topTokenLimit: 100,            // Limit for top tokens to track
    newTokenAgeHours: 24,          // Hours to consider a token "new"
    supportedChains: [1, 56, 66, 137, 42161], // ETH, BSC, OKC, Polygon, Arbitrum
    defaultNetwork: 66             // Default to OKC
  },
  
  // Filters for token discovery
  filters: {
    newToken: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      minVolume: 5000,             // $5,000 minimum volume
      minLiquidity: 1000,          // $1,000 minimum liquidity
    },
    memeToken: {
      keywords: ['pepe', 'doge', 'shib', 'inu', 'elon', 'moon', 'cat', 'floki', 'wojak'],
      minPrice: 0.000000001,       // Minimum token price ($)
      maxPrice: 1.0,               // Maximum token price ($)
    }
  },
  
  // Output paths for data files
  outputPaths: {
    tokenList: './data/tokens.json',              // All tokens
    newTokens: './data/new_tokens.json',          // New tokens
    trendingMemes: './data/trending_memes.json',  // Trending meme tokens
    tokenMetrics: './data/token_metrics.json',    // Token metrics
    tokenComparison: './data/compare_tokens.csv', // Token comparison
    filteredTokens: './data/filtered_tokens.csv', // Filtered tokens
    recommendations: './data/swap_recommendations.json', // Swap recommendations
    alerts: './data/alerts.json'                  // Token alerts
  },
  
  // Dashboard configuration
  dashboard: {
    // Default filtering settings
    defaultMinLiquidity: 5000, // $5K
    defaultMinVolume: 10000,   // $10K
    defaultMaxAge: 48,         // 48 hours
    
    // Update intervals (milliseconds)
    discoveryInterval: 15 * 60 * 1000, // 15 minutes
    metricsInterval: 5 * 60 * 1000,    // 5 minutes
    alertsInterval: 3 * 60 * 1000      // 3 minutes
  },
  
  // Cache settings
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 600000, // 10 minutes
    checkPeriod: 60000                              // 1 minute cleanup
  },
  
  // Rate limiting settings
  rateLimit: {
    windowMs: 60000,    // 1 minute window
    maxRequests: 60,    // 60 requests per minute
    requestDelay: 100   // 100ms minimum between requests
  },
  
  // API Keys (use environment variables for security)
  apiKeys: {
    okxApiKey: process.env.OKX_API_KEY,
    okxSecretKey: process.env.OKX_SECRET_KEY,
    okxPassphrase: process.env.OKX_PASSPHRASE,
    okxProjectId: process.env.OKX_PROJECT_ID || ''  // Added project ID
  },
  
// Fallback settings - make sure these don't override real API usage
fallback: {
    useMockData: false, // Set to false to prefer real data
    useMockDataOnFailure: true, // Only use mock data when API calls fail
    mockTokenCount: 20
  },
  
  // Alerts configuration
  alerts: {
    volumeThreshold: 100000, // $100K 24h volume
    liquidityGrowthThreshold: 50, // 50% increase
    priceThreshold: 30, // 30% price change
    holderGrowthThreshold: 100 // 100 new holders
  },
  
  // Logging configuration
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    logToFile: process.env.LOG_TO_FILE === 'true',
    logFilePath: './logs/',
    format: 'combined'
  }
};

module.exports = config;