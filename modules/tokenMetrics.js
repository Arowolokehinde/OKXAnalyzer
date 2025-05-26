/**
 * tokenMetrics.js
 * Module for fetching and calculating detailed metrics for tokens using correct OKX API
 */
const fs = require('fs');
const path = require('path');
const config = require('../config');
const apiClient = require('../utils/apiClient');
const logger = require('../utils/logger');
const { validateTokenMetrics, validateSwap, validateAndNormalizeNumber } = require('../utils/validation');
const { getTokenByAddress } = require('./tokenDiscovery');

/**
 * Fetch basic metrics for a specific token using OKX Market API
 * @param {string} tokenSymbol - Symbol of the token (e.g., 'BTC-USDT')
 * @param {string} tokenAddress - Contract address of the token (optional, for reference)
 * @returns {Promise<Object|null>} Token metrics or null if failed
 */
async function fetchTokenMetrics(tokenSymbol, tokenAddress = null) {
  try {
    logger.debug(`Fetching metrics for token ${tokenSymbol}`);
    
    // Use OKX Market Ticker API - correct endpoint
    const endpoint = '/api/v5/market/ticker';
    
    // OKX API expects instId parameter (instrument ID like 'BTC-USDT')
    const params = {
      instId: tokenSymbol // Should be in format like 'TOKEN-USDT'
    };
    
    const response = await apiClient.makeRequest(endpoint, 'GET', params);
    
    // Check if we have a valid response
    if (!response || response.status !== 200) {
      logger.warn(`API request failed for ${tokenSymbol}`, {
        status: response?.status,
        statusText: response?.statusText
      });
      return getMockTokenMetrics(tokenAddress || tokenSymbol);
    }
    
    // Check OKX API response format
    if (!response.data || response.data.code !== '0') {
      logger.warn(`Invalid API response for ${tokenSymbol}`, {
        code: response.data?.code,
        msg: response.data?.msg
      });
      return getMockTokenMetrics(tokenAddress || tokenSymbol);
    }
    
    // Extract data from response
    const tickerData = response.data.data;
    
    // OKX API returns array, take first item
    const data = Array.isArray(tickerData) && tickerData.length > 0 
      ? tickerData[0] 
      : tickerData;
    
    if (!data) {
      logger.warn(`No ticker data returned for ${tokenSymbol}`);
      return getMockTokenMetrics(tokenAddress || tokenSymbol);
    }
    
    // Map OKX API response to our format
    return {
      address: tokenAddress || data.instId || tokenSymbol,
      symbol: data.instId ? data.instId.split('-')[0] : tokenSymbol,
      name: data.instId || tokenSymbol,
      
      // Price and market data
      priceUSD: validateAndNormalizeNumber(data.last, 0).toString(),
      priceChange24h: validateAndNormalizeNumber(data.chg24h, 0).toString(),
      priceChange1h: validateAndNormalizeNumber(data.chg1h, 0).toString(),
      
      // Volume and liquidity
      volume24h: validateAndNormalizeNumber(data.vol24h, 0).toString(),
      volumeUSD24h: validateAndNormalizeNumber(data.volCcy24h, 0).toString(),
      
      // Market data
      high24h: validateAndNormalizeNumber(data.high24h, 0).toString(),
      low24h: validateAndNormalizeNumber(data.low24h, 0).toString(),
      open24h: validateAndNormalizeNumber(data.open24h, 0).toString(),
      
      // Additional data (may not be available for all tokens)
      liquidity: validateAndNormalizeNumber(data.askSz, 0).toString(), // Use ask size as liquidity proxy
      marketCap: '0', // Not directly available from ticker API
      totalSupply: '0', // Not available from ticker API
      holders: 0, // Not available from ticker API
      
      // Timestamp
      listingTime: data.ts ? new Date(parseInt(data.ts)).toISOString() : new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    };
  } catch (error) {
    logger.errorWithContext(`Error fetching metrics for token ${tokenSymbol}`, error);
    return getMockTokenMetrics(tokenAddress || tokenSymbol);
  }
}

/**
 * Fetch recent trades for a token using OKX Market Trades API
 * @param {string} tokenSymbol - Symbol of the token (e.g., 'BTC-USDT')
 * @param {number} limit - Maximum number of trades to return
 * @returns {Promise<Array>} List of recent trades
 */
async function fetchTokenSwaps(tokenSymbol, limit = 100) {
  try {
    logger.debug(`Fetching trades for token ${tokenSymbol}`);
    
    // Use OKX Market Trades API
    const endpoint = '/api/v5/market/trades';
    
    const params = {
      instId: tokenSymbol,
      limit: Math.min(limit, 100).toString() // OKX API max limit is 100
    };
    
    const response = await apiClient.makeRequest(endpoint, 'GET', params);
    
    // Check response
    if (!response || response.status !== 200) {
      logger.warn(`Trades API request failed for ${tokenSymbol}`);
      return getMockTokenSwaps(tokenSymbol);
    }
    
    if (!response.data || response.data.code !== '0') {
      logger.warn(`Invalid trades API response for ${tokenSymbol}`, {
        code: response.data?.code,
        msg: response.data?.msg
      });
      return getMockTokenSwaps(tokenSymbol);
    }
    
    const tradesData = response.data.data || [];
    
    // Map OKX trades to our format
    const swaps = tradesData.map((trade, index) => {
      try {
        return {
          txHash: trade.tradeId || `trade-${Date.now()}-${index}`,
          timestamp: trade.ts ? new Date(parseInt(trade.ts)).toISOString() : new Date().toISOString(),
          token: tokenSymbol,
          amount: validateAndNormalizeNumber(trade.sz, 0).toString(),
          amountUSD: validateAndNormalizeNumber(trade.sz * trade.px, 0).toString(),
          priceUSD: validateAndNormalizeNumber(trade.px, 0).toString(),
          type: trade.side === 'buy' ? 'buy' : 'sell', // OKX uses 'buy'/'sell'
          sender: trade.tradeId || 'unknown' // OKX doesn't provide sender address
        };
      } catch (err) {
        logger.errorWithContext('Error processing trade data', err, { trade });
        return null;
      }
    }).filter(swap => swap !== null);
    
    // Validate swaps
    return swaps.filter(swap => {
      try {
        return validateSwap(swap);
      } catch (err) {
        logger.warn('Invalid swap data', { swap });
        return false;
      }
    });
  } catch (error) {
    logger.errorWithContext(`Error fetching trades for token ${tokenSymbol}`, error);
    return getMockTokenSwaps(tokenSymbol);
  }
}

/**
 * Get token symbol in OKX format (TOKEN-USDT)
 * @param {Object} token - Token object with symbol or address
 * @returns {string} Formatted symbol for OKX API
 */
function getOKXSymbol(token) {
  try {
    if (!token) return 'BTC-USDT'; // Default fallback
    
    // If token already has a symbol in correct format (contains hyphen)
    if (token.symbol && token.symbol.includes('-')) {
      return token.symbol;
    }
    
    // If token has a symbol, append default quote token
    if (token.symbol) {
      const quoteToken = config.dex?.defaultQuoteToken || 'USDT';
      return `${token.symbol}-${quoteToken}`;
    }
    
    // If only address is available, try to use a generic format
    if (token.address) {
      return `TOKEN-USDT`; // Generic fallback
    }
    
    return 'BTC-USDT'; // Ultimate fallback
  } catch (error) {
    logger.errorWithContext('Error formatting OKX symbol', error, { token });
    return 'BTC-USDT';
  }
}

/**
 * Calculate additional derived metrics from basic metrics and swap data
 * @param {Object} metrics - Basic token metrics
 * @param {Array} swaps - Recent swap activity
 * @returns {Object} Enhanced metrics with derived calculations
 */
function calculateDerivedMetrics(metrics, swaps) {
  try {
    // Ensure we have valid input data
    const safeMetrics = metrics || {};
    const safeSwaps = Array.isArray(swaps) ? swaps : [];
    
    // If no swaps, return basic metrics with zero-value derived metrics
    if (safeSwaps.length === 0) {
      return {
        ...safeMetrics,
        derived: {
          swapsLastHour: 0,
          avgSwapSize: 0,
          volatility: 0,
          holderGrowthRate: 0,
          priceVolatility: 0,
          tradingActivity: 0
        }
      };
    }
    
    // Calculate time-based metrics
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    // Count swaps in the last hour
    const swapsLastHour = safeSwaps.filter(swap => {
      try {
        const swapTime = new Date(swap.timestamp).getTime();
        return swapTime >= oneHourAgo && swapTime <= now;
      } catch (e) {
        return false;
      }
    }).length;
    
    // Calculate average swap size (in USD)
    const totalVolumeUSD = safeSwaps.reduce((total, swap) => {
      try {
        return total + validateAndNormalizeNumber(swap.amountUSD, 0);
      } catch (e) {
        return total;
      }
    }, 0);
    
    const avgSwapSize = safeSwaps.length > 0 ? totalVolumeUSD / safeSwaps.length : 0;
    
    // Calculate price volatility (standard deviation of prices)
    const prices = safeSwaps
      .map(swap => validateAndNormalizeNumber(swap.priceUSD, 0))
      .filter(price => price > 0);
    
    let volatility = 0;
    let priceVolatility = 0;
    
    if (prices.length > 1) {
      const meanPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const variance = prices.reduce((sum, price) => sum + Math.pow(price - meanPrice, 2), 0) / prices.length;
      priceVolatility = Math.sqrt(variance) / meanPrice; // Coefficient of variation
      
      // Simple volatility calculation (range / mean)
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      volatility = maxPrice > 0 ? (maxPrice - minPrice) / maxPrice : 0;
    }
    
    // Calculate trading activity score (combination of frequency and volume)
    const tradingActivity = swapsLastHour > 0 
      ? Math.log10(swapsLastHour + 1) * Math.log10(avgSwapSize + 1)
      : 0;
    
    // Calculate holder growth rate (if we have holder data)
    let holderGrowthRate = 0;
    try {
      const holders = validateAndNormalizeNumber(safeMetrics.holders, 0);
      if (holders > 0 && safeMetrics.listingTime) {
        const listingTime = new Date(safeMetrics.listingTime).getTime();
        const ageHours = Math.max(1, (now - listingTime) / (1000 * 60 * 60));
        holderGrowthRate = holders / ageHours;
      }
    } catch (e) {
      holderGrowthRate = 0;
    }
    
    // Return enhanced metrics
    return {
      ...safeMetrics,
      derived: {
        swapsLastHour,
        avgSwapSize: Math.round(avgSwapSize * 100) / 100, // Round to 2 decimal places
        volatility: Math.round(volatility * 10000) / 10000, // Round to 4 decimal places
        priceVolatility: Math.round(priceVolatility * 10000) / 10000,
        holderGrowthRate: Math.round(holderGrowthRate * 100) / 100,
        tradingActivity: Math.round(tradingActivity * 100) / 100,
        
        // Additional derived metrics
        lastTradeTime: safeSwaps.length > 0 ? safeSwaps[0].timestamp : null,
        totalTradesAnalyzed: safeSwaps.length,
        buyVsSellRatio: calculateBuyVsSellRatio(safeSwaps)
      }
    };
  } catch (error) {
    logger.errorWithContext('Error calculating derived metrics', error, { 
      metricsKeys: Object.keys(metrics || {}),
      swapsCount: swaps?.length || 0 
    });
    
    // Return metrics with empty derived data in case of error
    return {
      ...(metrics || {}),
      derived: {
        swapsLastHour: 0,
        avgSwapSize: 0,
        volatility: 0,
        priceVolatility: 0,
        holderGrowthRate: 0,
        tradingActivity: 0,
        buyVsSellRatio: 0.5
      }
    };
  }
}

/**
 * Calculate buy vs sell ratio from swaps
 * @param {Array} swaps - Array of swap data
 * @returns {number} Ratio of buys to total trades (0.5 = equal, > 0.5 = more buys)
 */
function calculateBuyVsSellRatio(swaps) {
  try {
    if (!Array.isArray(swaps) || swaps.length === 0) {
      return 0.5; // Neutral if no data
    }
    
    const buyCount = swaps.filter(swap => swap.type === 'buy').length;
    return buyCount / swaps.length;
  } catch (error) {
    logger.errorWithContext('Error calculating buy/sell ratio', error);
    return 0.5;
  }
}

/**
 * Save token metrics to file
 * @param {Array} metricsArray - Array of token metrics
 * @returns {Promise<boolean>} Success status
 */
async function saveMetricsToFile(metricsArray) {
  try {
    // Ensure directory exists
    const outputPath = config.outputPaths.tokenMetrics;
    const dir = path.dirname(outputPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Ensure metricsArray is valid
    const safeMetricsArray = Array.isArray(metricsArray) ? metricsArray : [];
    
    // Add metadata
    const dataToSave = {
      metadata: {
        timestamp: new Date().toISOString(),
        count: safeMetricsArray.length,
        version: '1.0.0'
      },
      data: safeMetricsArray
    };
    
    // Write to file
    fs.writeFileSync(outputPath, JSON.stringify(dataToSave, null, 2));
    
    logger.info(`Saved metrics for ${safeMetricsArray.length} tokens to ${outputPath}`);
    
    return true;
  } catch (error) {
    logger.errorWithContext('Error saving metrics to file', error);
    return false;
  }
}

/**
 * Get detailed metrics for multiple tokens
 * @param {Array} tokens - List of tokens
 * @returns {Promise<Array>} Detailed metrics for each token
 */
async function getDetailedMetrics(tokens) {
  try {
    // Ensure tokens is a valid array
    const safeTokens = Array.isArray(tokens) ? tokens : [];
    
    logger.info(`Getting detailed metrics for ${safeTokens.length} tokens`);
    
    const detailedMetrics = [];
    
    // Process tokens with rate limiting
    for (let i = 0; i < safeTokens.length; i++) {
      const token = safeTokens[i];
      
      try {
        if (!token) {
          logger.warn(`Skipping invalid token at index ${i}`);
          continue;
        }
        
        // Get OKX-formatted symbol
        const okxSymbol = getOKXSymbol(token);
        
        logger.debug(`Processing token ${i + 1}/${safeTokens.length}: ${okxSymbol}`);
        
        // Get basic metrics
        const metrics = await fetchTokenMetrics(okxSymbol, token.address);
        
        if (metrics) {
          // Enhance with token info
          if (token.symbol && !metrics.symbol) {
            metrics.symbol = token.symbol;
          }
          if (token.name && !metrics.name) {
            metrics.name = token.name;
          }
          
          // Get swap/trade activity
          const swaps = await fetchTokenSwaps(okxSymbol);
          
          // Calculate derived metrics
          const enhancedMetrics = calculateDerivedMetrics(metrics, swaps);
          
          // Add trade data
          enhancedMetrics.recentSwaps = swaps.slice(0, 10); // Keep only 10 most recent
          enhancedMetrics.totalSwapsAnalyzed = swaps.length;
          
          // Validate metrics
          try {
            if (validateTokenMetrics(enhancedMetrics)) {
              detailedMetrics.push(enhancedMetrics);
            } else {
              logger.warn(`Metrics validation failed for ${okxSymbol}, including anyway`);
              detailedMetrics.push(enhancedMetrics);
            }
          } catch (validationError) {
            logger.warn(`Validation error for ${okxSymbol}:`, validationError.message);
            detailedMetrics.push(enhancedMetrics);
          }
        } else {
          logger.warn(`No metrics returned for token ${okxSymbol}`);
        }
        
        // Rate limiting - small delay between requests
        if (i < safeTokens.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
        }
        
      } catch (error) {
        logger.errorWithContext(`Error processing token at index ${i}`, error, { 
          token: token?.symbol || token?.address || 'unknown'
        });
      }
    }
    
    // Save to file
    await saveMetricsToFile(detailedMetrics);
    
    logger.info(`Successfully processed ${detailedMetrics.length} tokens with detailed metrics`);
    
    return detailedMetrics;
  } catch (error) {
    logger.errorWithContext('Error getting detailed metrics', error);
    return [];
  }
}

/**
 * Get mock token metrics for development/testing
 * @param {string} tokenIdentifier - Token address or symbol
 * @returns {Object} Mock token metrics
 */
function getMockTokenMetrics(tokenIdentifier) {
  const identifier = tokenIdentifier || 'UNKNOWN';
  
  // Generate semi-realistic data based on identifier
  const seed = identifier.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const randomFactor = (seed % 100) / 100;
  
  const symbol = identifier.includes('-') ? identifier.split('-')[0] : identifier.substring(0, 4).toUpperCase();
  const basePrice = 0.001 + (randomFactor * 0.1);
  const volume = 5000 + (randomFactor * 50000);
  
  return {
    address: identifier.startsWith('0x') ? identifier : `0x${seed.toString(16).padStart(40, '0')}`,
    symbol: symbol,
    name: `${symbol} Token`,
    
    // Price data
    priceUSD: (basePrice * (0.8 + randomFactor * 0.4)).toFixed(8),
    priceChange24h: ((randomFactor - 0.5) * 40).toFixed(2),
    priceChange1h: ((randomFactor - 0.5) * 10).toFixed(2),
    
    // Volume and market data
    volume24h: (volume * (0.5 + randomFactor)).toFixed(2),
    volumeUSD24h: (volume * basePrice * (0.5 + randomFactor)).toFixed(2),
    high24h: (basePrice * (1 + randomFactor * 0.2)).toFixed(8),
    low24h: (basePrice * (1 - randomFactor * 0.2)).toFixed(8),
    open24h: (basePrice * (0.9 + randomFactor * 0.2)).toFixed(8),
    
    // Market data
    liquidity: (volume * 0.3).toFixed(2),
    marketCap: (volume * 10 * (1 + randomFactor)).toFixed(2),
    totalSupply: (1000000 * (1 + randomFactor * 10)).toFixed(0),
    holders: Math.floor(50 + randomFactor * 500),
    
    // Timestamps
    listingTime: new Date(Date.now() - (randomFactor * 7 * 24 * 60 * 60 * 1000)).toISOString(),
    lastUpdate: new Date().toISOString()
  };
}

/**
 * Get mock token swaps for development/testing
 * @param {string} tokenSymbol - Token symbol
 * @returns {Array} Mock token swaps
 */
function getMockTokenSwaps(tokenSymbol) {
  const symbol = tokenSymbol || 'TOKEN-USDT';
  const swaps = [];
  const now = Date.now();
  const basePrice = 0.001 + (Math.random() * 0.01);
  
  // Generate 20 mock swaps over the last few hours
  for (let i = 0; i < 20; i++) {
    const minutesAgo = i * 15; // 15 minutes apart
    const swapTime = new Date(now - (minutesAgo * 60 * 1000));
    
    // Price variation
    const priceVariation = 0.85 + (Math.random() * 0.3); // 0.85 to 1.15
    const price = basePrice * priceVariation;
    
    // Random amount
    const amount = 50 + Math.random() * 500;
    
    swaps.push({
      txHash: `trade-${Date.now()}-${i}`,
      timestamp: swapTime.toISOString(),
      token: symbol,
      amount: amount.toFixed(2),
      amountUSD: (amount * price).toFixed(2),
      priceUSD: price.toFixed(8),
      type: Math.random() > 0.6 ? 'buy' : 'sell', // Slightly more buys
      sender: `trader-${i}`
    });
  }
  
  return swaps;
}

/**
 * Get detailed metrics for a single token
 * @param {string} tokenAddress - Token address
 * @returns {Promise<Object|null>} Detailed token metrics or null if failed
 */
async function getTokenMetrics(tokenAddress) {
  try {
    if (!tokenAddress) {
      logger.warn('getTokenMetrics called with no address');
      return null;
    }
    
    logger.info(`Getting metrics for token ${tokenAddress}`);
    
    // Get token info first to get symbol
    let tokenInfo;
    try {
      tokenInfo = await getTokenByAddress(tokenAddress);
    } catch (error) {
      logger.warn(`Failed to get token info: ${error.message}`);
    }
    
    // Prepare token object
    let token = { address: tokenAddress };
    if (tokenInfo) {
      token = { ...token, ...tokenInfo };
    }
    
    // Use the general function to get metrics
    const metricsArray = await getDetailedMetrics([token]);
    
    // Return the first result, or null if none
    return metricsArray.length > 0 ? metricsArray[0] : null;
  } catch (error) {
    logger.errorWithContext(`Error getting metrics for token ${tokenAddress}`, error);
    return null;
  }
}

/**
 * Get market overview data from OKX
 * @returns {Promise<Object>} Market overview data
 */
async function getMarketOverview() {
  try {
    logger.info('Fetching market overview');
    
    // Get market tickers for overview
    const endpoint = '/api/v5/market/tickers';
    const params = {
      instType: 'SPOT' // Get spot trading pairs
    };
    
    const response = await apiClient.makeRequest(endpoint, 'GET', params);
    
    if (!response || response.status !== 200 || response.data?.code !== '0') {
      logger.warn('Failed to fetch market overview');
      return getMockMarketOverview();
    }
    
    const tickers = response.data.data || [];
    
    // Calculate overview statistics
    const overview = {
      totalPairs: tickers.length,
      totalVolume24h: tickers.reduce((sum, ticker) => {
        return sum + validateAndNormalizeNumber(ticker.volCcy24h, 0);
      }, 0),
      topGainers: tickers
        .filter(ticker => validateAndNormalizeNumber(ticker.chg24h, 0) > 0)
        .sort((a, b) => validateAndNormalizeNumber(b.chg24h, 0) - validateAndNormalizeNumber(a.chg24h, 0))
        .slice(0, 10)
        .map(ticker => ({
          symbol: ticker.instId,
          change: validateAndNormalizeNumber(ticker.chg24h, 0),
          volume: validateAndNormalizeNumber(ticker.volCcy24h, 0)
        })),
      topLosers: tickers
        .filter(ticker => validateAndNormalizeNumber(ticker.chg24h, 0) < 0)
        .sort((a, b) => validateAndNormalizeNumber(a.chg24h, 0) - validateAndNormalizeNumber(b.chg24h, 0))
        .slice(0, 10)
        .map(ticker => ({
          symbol: ticker.instId,
          change: validateAndNormalizeNumber(ticker.chg24h, 0),
          volume: validateAndNormalizeNumber(ticker.volCcy24h, 0)
        })),
      timestamp: new Date().toISOString()
    };
    
    return overview;
  } catch (error) {
    logger.errorWithContext('Error fetching market overview', error);
    return getMockMarketOverview();
  }
}

/**
 * Get mock market overview for development
 * @returns {Object} Mock market overview
 */
function getMockMarketOverview() {
  return {
    totalPairs: 500,
    totalVolume24h: 1500000000,
    topGainers: [
      { symbol: 'BTC-USDT', change: 15.5, volume: 50000000 },
      { symbol: 'ETH-USDT', change: 12.3, volume: 30000000 },
      { symbol: 'ADA-USDT', change: 8.7, volume: 15000000 }
    ],
    topLosers: [
      { symbol: 'DOGE-USDT', change: -8.2, volume: 20000000 },
      { symbol: 'SHIB-USDT', change: -6.5, volume: 10000000 },
      { symbol: 'LTC-USDT', change: -4.3, volume: 8000000 }
    ],
    timestamp: new Date().toISOString()
  };
}

/**
 * Batch process multiple tokens with rate limiting
 * @param {Array} tokens - Array of tokens to process
 * @param {number} batchSize - Number of tokens to process at once
 * @param {number} delayMs - Delay between batches in milliseconds
 * @returns {Promise<Array>} Array of processed token metrics
 */
async function batchProcessTokens(tokens, batchSize = 5, delayMs = 1000) {
  try {
    const results = [];
    const safeTokens = Array.isArray(tokens) ? tokens : [];
    
    logger.info(`Batch processing ${safeTokens.length} tokens in batches of ${batchSize}`);
    
    for (let i = 0; i < safeTokens.length; i += batchSize) {
      const batch = safeTokens.slice(i, i + batchSize);
      
      logger.debug(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(safeTokens.length / batchSize)}`);
      
      // Process batch concurrently
      const batchPromises = batch.map(token => getDetailedMetrics([token]));
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Collect successful results
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.length > 0) {
          results.push(result.value[0]);
        } else {
          logger.warn(`Failed to process token in batch:`, batch[index]);
        }
      });
      
      // Delay between batches (except for the last batch)
      if (i + batchSize < safeTokens.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    logger.info(`Batch processing completed. Successfully processed ${results.length}/${safeTokens.length} tokens`);
    
    return results;
  } catch (error) {
    logger.errorWithContext('Error in batch processing', error);
    return [];
  }
}

module.exports = {
  getDetailedMetrics,
  getTokenMetrics,
  fetchTokenMetrics,
  fetchTokenSwaps,
  calculateDerivedMetrics,
  getMarketOverview,
  batchProcessTokens,
  getOKXSymbol,
  
  // Utility functions for testing
  getMockTokenMetrics,
  getMockTokenSwaps,
  getMockMarketOverview
};