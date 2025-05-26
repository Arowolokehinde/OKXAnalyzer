/**
 * Configuration settings for OKC Token Launch Analytics Dashboard
 * Updated with correct OKX DEX API endpoints
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
    useRealApi: true, // Set to true to use real OKX API
    enableCaching: process.env.ENABLE_CACHING !== 'false',
    enableRateLimiting: process.env.ENABLE_RATE_LIMITING !== 'false',
    useMockDataOnFailure: true // Use mock data only when API fails
  },
  
  // Network configuration
  networkId: '66', // OKC chain ID
  
  // APIs configuration - Corrected OKX DEX API endpoints
  apis: {
    // Base URL for OKX API
    baseUrl: process.env.API_URL || 'https://www.okx.com',
    
    // Correct OKX DEX API endpoints
    tokenList: '/api/v5/dex/aggregator/all-tokens',        // Get all supported tokens
    tokenMetrics: '/api/v5/market/ticker',                 // Get token price/volume data
    tokenSwaps: '/api/v5/market/trades',                   // Get recent trades
    
    // DEX specific endpoints
    swapQuote: '/api/v5/dex/aggregator/quote',             // Get swap quotes
    swapExecute: '/api/v5/dex/aggregator/swap',            // Execute swaps
    swapHistory: '/api/v5/dex/aggregator/swap-history',    // Swap history
    
    // Market data endpoints
    marketTickers: '/api/v5/market/tickers',               // All market tickers
    marketDepth: '/api/v5/market/books',                   // Order book depth
    marketCandles: '/api/v5/market/candles',               // Price candles/klines
    
    // Index and public data
    indexTickers: '/api/v5/market/index-tickers',          // Index tickers
    blockTickers: '/api/v5/market/block-tickers',          // Block trading tickers
    
    // System status
    systemStatus: '/api/v5/system/status',                 // System maintenance status
    systemTime: '/api/v5/public/time',                     // Server time
    
    // Chain information
    supportedChains: '/api/v5/dex/aggregator/supported-chain', // Supported blockchains
  },
  
  // Web3 endpoints for additional data
  web3: {
    // These might need to be updated based on actual OKX web3 URLs
    trendingMemeCoinsUrl: 'https://www.okx.com/web3/dex-swap',
    tokenExplorerUrl: 'https://www.okx.com/web3/explorer/okc/token/',
    dexExplorerUrl: 'https://www.okx.com/web3/dex-swap',
    memePumpUrl: 'https://www.okx.com/web3/dex-swap',
  },
  
  // DEX-specific configuration
  dex: {
    chainId: 66,                         // OKC chain ID
    chainName: 'OKC',                    // OKC chain name
    defaultQuoteToken: 'USDT',           // Default quote token
    defaultQuoteTokenAddress: '0x382bb369d343125bfb2117af9c149795c6c65c50', // USDT on OKC
    
    // Thresholds
    minLiquidity: 1000,                  // $1K minimum liquidity
    minVolume: 5000,                     // $5K minimum volume
    minHolders: 10,                      // Minimum holders
    
    // Limits
    topTokenLimit: 100,                  // Top tokens to track
    newTokenAgeHours: 24,                // Hours for "new" tokens
    maxTokensPerRequest: 100,            // API rate limiting
    
    // Supported chains (for multi-chain expansion)
    supportedChains: [
      { id: 1, name: 'Ethereum', symbol: 'ETH' },
      { id: 56, name: 'BSC', symbol: 'BNB' },
      { id: 66, name: 'OKC', symbol: 'OKT' },
      { id: 137, name: 'Polygon', symbol: 'MATIC' },
      { id: 42161, name: 'Arbitrum', symbol: 'ETH' }
    ],
    defaultNetwork: 66                    // Default to OKC
  },
  
  // Filters for token discovery
  filters: {
    newToken: {
      maxAge: 24 * 60 * 60 * 1000,       // 24 hours in milliseconds
      minVolume: 5000,                    // $5K minimum volume
      minLiquidity: 1000,                 // $1K minimum liquidity
      minHolders: 10,                     // Minimum holders
      maxMarketCap: 1000000,              // $1M max market cap for "new"
    },
    memeToken: {
      keywords: [
        'pepe', 'doge', 'shib', 'inu', 'elon', 'moon', 'cat', 'floki', 
        'wojak', 'chad', 'frog', 'ape', 'monkey', 'banana', 'rocket',
        'diamond', 'hands', 'lambo', 'tendies', 'bull', 'bear'
      ],
      minPrice: 0.000000001,              // Very low minimum price
      maxPrice: 1.0,                      // $1 maximum price
      minVolume: 1000,                    // Lower volume threshold for memes
    },
    trending: {
      minPriceChange: 5,                  // 5% minimum price change
      minVolumeGrowth: 50,                // 50% volume growth
      timeWindow: 24,                     // 24 hours
      minTrendingScore: 10,               // Minimum trending score
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
    alerts: './data/alerts.json',                 // Token alerts
    logs: './logs/'                               // Log files directory
  },
  
  // Dashboard configuration
  dashboard: {
    // Default filtering settings
    defaultMinLiquidity: 5000,           // $5K
    defaultMinVolume: 10000,             // $10K
    defaultMaxAge: 48,                   // 48 hours
    defaultSortBy: 'volume24h',          // Default sort field
    defaultSortOrder: 'desc',            // Default sort order
    
    // Pagination
    defaultPageSize: 20,                 // Items per page
    maxPageSize: 100,                    // Maximum items per page
    
    // Update intervals (milliseconds)
    discoveryInterval: 15 * 60 * 1000,   // 15 minutes
    metricsInterval: 5 * 60 * 1000,      // 5 minutes
    alertsInterval: 3 * 60 * 1000,       // 3 minutes
    trendingInterval: 10 * 60 * 1000,    // 10 minutes
    
    // Display settings
    showMockDataWarning: true,           // Show warning when using mock data
    enableRealtimeUpdates: true,         // Enable real-time updates
    enableNotifications: true,           // Enable browser notifications
  },
  
  // Cache settings
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 300000,  // 5 minutes default
    tokenListTtl: 600000,                            // 10 minutes for token list
    metricsTtl: 120000,                              // 2 minutes for metrics
    trendingTtl: 300000,                             // 5 minutes for trending
    checkPeriod: 60000,                              // 1 minute cleanup interval
    maxSize: 1000,                                   // Maximum cache entries
  },
  
  // Rate limiting settings
  rateLimit: {
    windowMs: 60000,                     // 1 minute window
    maxRequests: 60,                     // 60 requests per minute
    requestDelay: 100,                   // 100ms minimum between requests
    burstLimit: 10,                      // Allow burst of 10 requests
    
    // Per-endpoint limits
    endpointLimits: {
      '/api/v5/market/ticker': { requests: 20, window: 60000 },
      '/api/v5/market/trades': { requests: 20, window: 60000 },
      '/api/v5/dex/aggregator/all-tokens': { requests: 10, window: 60000 }
    }
  },
  
  // API Authentication (use environment variables)
  apiKeys: {
    okxApiKey: process.env.OKX_API_KEY,
    okxSecretKey: process.env.OKX_SECRET_KEY,
    okxPassphrase: process.env.OKX_PASSPHRASE,
    okxProjectId: process.env.OKX_PROJECT_ID || '',
    
    // For testing (these should be set in .env file)
    testMode: process.env.NODE_ENV === 'test',
    sandboxMode: process.env.OKX_SANDBOX === 'true'
  },
  
  // Request configuration
  requests: {
    timeout: 10000,                      // 10 second timeout
    retries: 3,                          // Retry failed requests 3 times
    retryDelay: 1000,                    // 1 second delay between retries
    keepAlive: true,                     // Use HTTP keep-alive
    
    // Request headers
    defaultHeaders: {
      'Content-Type': 'application/json',
      'User-Agent': 'OKC-Token-Dashboard/1.0.0'
    }
  },
  
  // Fallback settings
  fallback: {
    useMockData: false,                  // Only use mock when API fails
    useMockDataOnFailure: true,          // Fallback to mock on errors
    mockTokenCount: 20,                  // Number of mock tokens
    mockDataSeed: 12345,                 // Seed for consistent mock data
    
    // Retry settings for API failures
    maxRetries: 3,
    retryDelay: 2000,                    // 2 seconds
    exponentialBackoff: true,            // Increase delay with each retry
  },
  
  // Alerts configuration
  alerts: {
    enabled: true,                       // Enable alert system
    
    // Alert thresholds
    volumeThreshold: 100000,             // $100K 24h volume spike
    liquidityGrowthThreshold: 50,        // 50% liquidity increase
    priceThreshold: 30,                  // 30% price change
    holderGrowthThreshold: 100,          // 100 new holders
    
    // Alert types
    types: {
      newToken: true,                    // Alert on new token discovery
      priceSpike: true,                  // Alert on price spikes
      volumeSpike: true,                 // Alert on volume spikes
      liquidityChange: true,             // Alert on liquidity changes
      holderGrowth: true,                // Alert on holder growth
    },
    
    // Notification settings
    maxAlertsPerHour: 10,                // Limit alerts per hour
    cooldownPeriod: 300000,              // 5 minute cooldown per token
  },
  
  // Logging configuration
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    logToFile: process.env.LOG_TO_FILE === 'true',
    logFilePath: './logs/',
    maxFileSize: 10485760,               // 10MB max log file size
    maxFiles: 5,                         // Keep 5 log files
    
    // Log format
    format: 'combined',
    timestamp: true,
    colorize: process.env.NODE_ENV !== 'production',
    
    // What to log
    logRequests: true,                   // Log API requests
    logResponses: false,                 // Don't log full responses (too verbose)
    logErrors: true,                     // Always log errors
    logPerformance: true,                // Log performance metrics
  },
  
  // Performance monitoring
  performance: {
    enabled: true,                       // Enable performance monitoring
    
    // Thresholds for warnings
    slowRequestThreshold: 5000,          // 5 seconds
    highMemoryThreshold: 512,            // 512MB
    
    // Metrics collection
    collectMetrics: true,                // Collect performance metrics
    metricsInterval: 60000,              // 1 minute metrics collection
    
    // Memory management
    maxMemoryUsage: 1024,                // 1GB max memory usage
    garbageCollectionThreshold: 0.8,     // Run GC at 80% memory usage
  },
  
  // Development settings
  development: {
    enableDebugMode: process.env.NODE_ENV === 'development',
    verboseLogging: process.env.VERBOSE === 'true',
    mockDataByDefault: false,            // Don't use mock data by default
    
    // Hot reload settings
    watchFiles: true,                    // Watch for file changes
    reloadOnChange: true,                // Reload on config changes
  },
  
  // Production settings
  production: {
    enableCompression: true,             // Enable response compression
    enableCaching: true,                 // Enable aggressive caching
    strictErrorHandling: true,           // Strict error handling
    
    // Security settings
    enableCors: true,                    // Enable CORS
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    enableHelmet: true,                  // Enable security headers
  }
};

// Validate configuration on load
function validateConfig() {
  const required = [
    'apis.baseUrl',
    'dex.chainId',
    'outputPaths.tokenList'
  ];
  
  for (const path of required) {
    const keys = path.split('.');
    let value = config;
    
    for (const key of keys) {
      value = value?.[key];
    }
    
    if (!value) {
      throw new Error(`Missing required configuration: ${path}`);
    }
  }
}

// Run validation
try {
  validateConfig();
} catch (error) {
  console.error('Configuration validation failed:', error.message);
  process.exit(1);
}

module.exports = config;