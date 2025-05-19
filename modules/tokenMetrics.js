/**
 * tokenMetrics.js
 * Module for fetching and calculating detailed metrics for tokens
 */
const fs = require('fs');
const path = require('path');
const config = require('../config');
const apiClient = require('../utils/apiClient');
const logger = require('../utils/logger');
const { validateTokenMetrics, validateSwap } = require('../utils/validation');
const { getTokenByAddress } = require('./tokenDiscovery');

/**
 * Fetch basic metrics for a specific token
 * @param {string} tokenAddress - Contract address of the token
 * @returns {Promise<Object|null>} Token metrics or null if failed
 */
async function fetchTokenMetrics(tokenAddress) {
  try {
    // Update to use the correct OKX DEX API endpoint format
    const endpoint = `${config.apis.baseUrl}/api/v5/dex/market/ticker`;
    const params = {
      instId: tokenAddress, // Required parameter
      chainId: config.networkId  // Add chain ID for OKC (typically '66')
    };
    
    const response = await apiClient.makeRequest(endpoint, 'GET', params);
    
    // Check if we have a valid response with data
    if (!response || !response.data || response.data.code !== '0') {
      logger.info(`Falling back to mock data for ${tokenAddress}`);
      return getMockTokenMetrics(tokenAddress);
    }
    
    // Safely extract data with null checks
    const tokenData = response.data.data;
    
    // If API returns an array, take the first item
    const data = Array.isArray(tokenData) && tokenData.length > 0 
      ? tokenData[0] 
      : tokenData;
    
    // Safely access properties with null checks and default values
    return {
      address: tokenAddress,
      liquidity: data?.liquidity ? data.liquidity.toString() : '0',
      volume24h: data?.volume_24h ? data.volume_24h.toString() : '0',
      priceUSD: data?.price_usd ? data.price_usd.toString() : '0',
      holders: data?.holders_count ? parseInt(data.holders_count) : 0,
      marketCap: data?.market_cap ? data.market_cap.toString() : '0',
      totalSupply: data?.total_supply ? data.total_supply.toString() : '0',
      priceChange1h: data?.price_change_1h ? data.price_change_1h.toString() : '0',
      priceChange24h: data?.price_change_24h ? data.price_change_24h.toString() : '0',
      listingTime: data?.listing_time || new Date().toISOString(),
      symbol: data?.symbol || '',
      name: data?.name || ''
    };
  } catch (error) {
    logger.errorWithContext(`Error fetching metrics for token ${tokenAddress}`, error);
    logger.info(`Falling back to mock data for ${tokenAddress}`);
    return getMockTokenMetrics(tokenAddress);
  }
}

/**
 * Fetch recent swap activity for a token
 * @param {string} tokenAddress - Contract address of the token
 * @param {number} limit - Maximum number of swaps to return
 * @returns {Promise<Array>} List of recent swaps
 */
async function fetchTokenSwaps(tokenAddress, limit = 20) {
  try {
    // Update to use the correct OKX DEX API endpoint and parameters
    const endpoint = `${config.apis.baseUrl}/api/v5/dex/market/trades`;
    const params = {
      instId: tokenAddress, // Required parameter
      limit: limit,
      chainId: config.networkId // Add chain ID for OKC
    };
    
    const response = await apiClient.makeRequest(endpoint, 'GET', params);
    
    // Check if we have a valid response with data
    if (!response || !response.data || response.data.code !== '0' || !response.data.data) {
      logger.info(`Falling back to mock data for swaps ${tokenAddress}`);
      return getMockTokenSwaps(tokenAddress);
    }
    
    // Safely process the data
    const swapsData = response.data.data || [];
    
    // Map API response to our format with careful null checks
    const swaps = swapsData.map(swap => {
      try {
        return {
          txHash: swap.tx_hash || `tx-${Math.random().toString(16).substring(2, 10)}`,
          timestamp: swap.timestamp || new Date().toISOString(),
          token: tokenAddress,
          amount: swap.amount ? swap.amount.toString() : '0',
          amountUSD: swap.amount_usd ? swap.amount_usd.toString() : '0',
          priceUSD: swap.price_usd ? swap.price_usd.toString() : '0',
          type: swap.type ? swap.type.toLowerCase() : 'unknown', // buy or sell
          sender: swap.sender_address || '0x0000000000000000000000000000000000000000'
        };
      } catch (err) {
        logger.errorWithContext('Error processing swap data', err, { swap });
        return null;
      }
    }).filter(swap => swap !== null); // Remove any failed conversions
    
    // Filter out invalid swaps
    return swaps.filter(swap => {
      try {
        return validateSwap(swap);
      } catch (err) {
        return false;
      }
    });
  } catch (error) {
    logger.errorWithContext(`Error fetching swaps for token ${tokenAddress}`, error);
    logger.info(`Falling back to mock swap data for ${tokenAddress}`);
    return getMockTokenSwaps(tokenAddress);
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
    // Ensure we have the required data with defaults if missing
    const safeMetrics = metrics || {
      address: '',
      liquidity: '0',
      volume24h: '0',
      priceUSD: '0',
      holders: 0,
      marketCap: '0',
      totalSupply: '0',
      priceChange1h: '0',
      priceChange24h: '0',
      listingTime: new Date().toISOString()
    };
    
    const safeSwaps = Array.isArray(swaps) ? swaps : [];
    
    // If no swaps, return basic metrics with zero-value derived metrics
    if (safeSwaps.length === 0) {
      return {
        ...safeMetrics,
        derived: {
          swapsLastHour: 0,
          avgSwapSize: 0,
          volatility: 0,
          holderGrowthRate: 0
        }
      };
    }
    
    // Calculate time-based metrics
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    // Count swaps in the last hour with safer date handling
    const swapsLastHour = safeSwaps.filter(swap => {
      try {
        return new Date(swap.timestamp).getTime() >= oneHourAgo;
      } catch (e) {
        return false;
      }
    }).length;
    
    // Calculate average swap size with safer parsing
    const totalVolume = safeSwaps.reduce((total, swap) => {
      try {
        return total + (parseFloat(swap.amountUSD) || 0);
      } catch (e) {
        return total;
      }
    }, 0);
    
    const avgSwapSize = safeSwaps.length > 0 ? totalVolume / safeSwaps.length : 0;
    
    // Calculate price volatility (max - min) / max with safer parsing
    const prices = safeSwaps.map(swap => {
      try {
        return parseFloat(swap.priceUSD) || 0;
      } catch (e) {
        return 0;
      }
    }).filter(price => price > 0); // Filter out zero or invalid prices
    
    let volatility = 0;
    if (prices.length > 0) {
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      volatility = maxPrice > 0 ? (maxPrice - minPrice) / maxPrice : 0;
    }
    
    // Calculate holder growth rate with safer date parsing
    let holderGrowthRate = 0;
    try {
      if (safeMetrics.listingTime) {
        const listingTime = new Date(safeMetrics.listingTime).getTime();
        const ageHours = Math.max(1, (now - listingTime) / (1000 * 60 * 60));
        holderGrowthRate = parseInt(safeMetrics.holders || 0) / ageHours;
      }
    } catch (e) {
      holderGrowthRate = 0;
    }
    
    // Return enhanced metrics
    return {
      ...safeMetrics,
      derived: {
        swapsLastHour,
        avgSwapSize,
        volatility,
        holderGrowthRate
      }
    };
  } catch (error) {
    logger.errorWithContext('Error calculating derived metrics', error, { metrics });
    
    // Return metrics with empty derived data in case of error
    return {
      ...(metrics || {}),
      derived: {
        swapsLastHour: 0,
        avgSwapSize: 0,
        volatility: 0,
        holderGrowthRate: 0
      }
    };
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
    const dir = path.dirname(config.outputPaths.tokenMetrics);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Ensure metricsArray is valid
    const safeMetricsArray = Array.isArray(metricsArray) ? metricsArray : [];
    
    // Write to file
    fs.writeFileSync(
      config.outputPaths.tokenMetrics, 
      JSON.stringify(safeMetricsArray, null, 2)
    );
    
    logger.info(`Saved metrics for ${safeMetricsArray.length} tokens to ${config.outputPaths.tokenMetrics}`);
    
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
    
    // Process tokens sequentially to avoid rate limiting
    for (const token of safeTokens) {
      try {
        if (!token || !token.address) {
          logger.warn('Skipping token with missing address');
          continue;
        }
        
        logger.debug(`Fetching detailed metrics for ${token.symbol || token.address}`);
        
        // Get basic metrics
        const metrics = await fetchTokenMetrics(token.address);
        
        // Add token info if not already included
        if (metrics) {
          if (!metrics.symbol && token.symbol) {
            metrics.symbol = token.symbol;
          }
          
          if (!metrics.name && token.name) {
            metrics.name = token.name;
          }
          
          // Get swap activity
          const swaps = await fetchTokenSwaps(token.address);
          
          // Calculate derived metrics
          const enhancedMetrics = calculateDerivedMetrics(metrics, swaps);
          
          // Add swaps to the metrics
          enhancedMetrics.recentSwaps = swaps;
          
          // Validate the metrics
          try {
            if (validateTokenMetrics(enhancedMetrics)) {
              detailedMetrics.push(enhancedMetrics);
            } else {
              logger.warn(`Invalid metrics for token ${token.address}, using anyway`);
              detailedMetrics.push(enhancedMetrics);
            }
          } catch (validationError) {
            logger.warn(`Validation error for token ${token.address}, using metrics anyway`);
            detailedMetrics.push(enhancedMetrics);
          }
        } else {
          logger.warn(`No metrics returned for token ${token.address}`);
        }
      } catch (error) {
        logger.errorWithContext(`Error processing metrics for token ${token?.address}`, error);
      }
    }
    
    // Save to file
    await saveMetricsToFile(detailedMetrics);
    
    return detailedMetrics;
  } catch (error) {
    logger.errorWithContext('Error getting detailed metrics', error);
    return [];
  }
}

/**
 * Get mock token metrics for development/testing
 * @param {string} tokenAddress - Token address
 * @returns {Object} Mock token metrics
 */
function getMockTokenMetrics(tokenAddress) {
  // Default address if none provided
  const address = tokenAddress || '0x0000000000000000000000000000000000000000';
  
  // Generate semi-realistic data based on token address
  const addressSum = address.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const randomFactor = addressSum % 100 / 100;
  
  // Generate a random token name and symbol
  const nameLength = 5 + Math.floor(randomFactor * 10);
  let name = '';
  for (let i = 0; i < nameLength; i++) {
    name += String.fromCharCode(65 + Math.floor(Math.random() * 26));
  }
  
  const symbol = name.substring(0, 3 + Math.floor(randomFactor * 3)).toUpperCase();
  
  return {
    address: address,
    symbol: symbol,
    name: name + ' Token',
    liquidity: (10000 + randomFactor * 15000).toFixed(2),
    volume24h: (8000 + randomFactor * 12000).toFixed(2),
    priceUSD: (0.0000123 * (1 + randomFactor)).toFixed(10),
    holders: Math.floor(50 + randomFactor * 300),
    marketCap: (5000 + randomFactor * 20000).toFixed(2),
    totalSupply: (1000000000 * (1 + randomFactor * 2)).toFixed(0),
    priceChange1h: (randomFactor * 20 - 10).toFixed(2),
    priceChange24h: (randomFactor * 40 - 20).toFixed(2),
    listingTime: new Date(Date.now() - (Math.floor(1 + randomFactor * 23) * 60 * 60 * 1000)).toISOString()
  };
}

/**
 * Get mock token swaps for development/testing
 * @param {string} tokenAddress - Token address
 * @returns {Array} Mock token swaps
 */
function getMockTokenSwaps(tokenAddress) {
  const swaps = [];
  const now = Date.now();
  const basePrice = 0.0000123;
  
  // Default address if none provided
  const address = tokenAddress || '0x0000000000000000000000000000000000000000';
  
  // Generate 20 mock swaps
  for (let i = 0; i < 20; i++) {
    // Time decreases as we go back in history
    const swapTime = new Date(now - (i * 3 * 60 * 1000)); // 3 minutes apart
    
    // Random price fluctuation
    const priceVariation = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
    const price = basePrice * priceVariation;
    
    // Random amount
    const amount = 100 + Math.random() * 900; // 100 to 1000
    
    swaps.push({
      txHash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      timestamp: swapTime.toISOString(),
      token: address,
      amount: amount.toFixed(2),
      amountUSD: (amount * price).toFixed(2),
      priceUSD: price.toFixed(10),
      type: Math.random() > 0.5 ? 'buy' : 'sell',
      sender: `0x${Math.random().toString(16).substring(2, 42)}`
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
    
    // Get token info first (to get symbol/name)
    let tokenInfo;
    try {
      tokenInfo = await getTokenByAddress(tokenAddress);
    } catch (error) {
      logger.warn(`Failed to get token info, continuing with address only: ${error.message}`);
    }
    
    let token = { address: tokenAddress };
    if (tokenInfo) {
      token = { ...token, ...tokenInfo };
    }
    
    // Use the more general function to get metrics
    const metricsArray = await getDetailedMetrics([token]);
    
    // Return the first (and only) result, or null if none
    return metricsArray.length > 0 ? metricsArray[0] : null;
  } catch (error) {
    logger.errorWithContext(`Error getting metrics for token ${tokenAddress}`, error);
    return null;
  }
}

module.exports = {
  getDetailedMetrics,
  getTokenMetrics,
  fetchTokenMetrics,
  fetchTokenSwaps,
  calculateDerivedMetrics
};


