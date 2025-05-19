/**
 * Token discovery module for OKC Token Launch Analytics Dashboard
 * This module handles discovering and tracking new tokens on OKX DEX
 */
const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');
const apiClient = require('../utils/apiClient');

/**
 * Load existing tokens from file
 * @param {string} filePath - Path to the token list file (optional)
 * @returns {Array} List of existing tokens
 */
function loadExistingTokens(filePath) {
  try {
    const file = filePath || config.outputPaths.tokenList || './data/tokens.json';
    
    // Check if file exists
    if (!fs.existsSync(file)) {
      logger.info(`No existing token file found at ${file}`);
      return [];
    }
    
    // Read and parse file
    const fileContent = fs.readFileSync(file, 'utf8');
    const tokens = JSON.parse(fileContent);
    
    // Ensure it's an array
    if (!Array.isArray(tokens)) {
      logger.warn(`Token file ${file} doesn't contain an array`);
      return [];
    }
    
    logger.debug(`Loaded ${tokens.length} existing tokens from ${file}`);
    return tokens;
  } catch (error) {
    logger.errorWithContext(`Error loading existing tokens from ${filePath}`, error);
    return [];
  }
}

/**
 * Save tokens to file
 * @param {Array} tokens - List of tokens to save
 * @param {string} filePath - Path to save to
 * @returns {boolean} Success status
 */
function saveTokensToFile(tokens, filePath) {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write to file
    fs.writeFileSync(filePath, JSON.stringify(tokens, null, 2));
    
    logger.info(`Saved ${tokens.length} tokens to ${filePath}`);
    return true;
  } catch (error) {
    logger.errorWithContext(`Error saving tokens to ${filePath}`, error);
    return false;
  }
}

/**
 * Filter tokens based on config criteria
 * @param {Array} tokens - List of tokens to filter
 * @returns {Array} Filtered tokens
 */
function filterTokens(tokens) {
  try {
    // Ensure tokens is an array
    if (!Array.isArray(tokens)) {
      logger.warn('filterTokens called with non-array input', { type: typeof tokens });
      return [];
    }
    
    // Apply filters
    const filtered = tokens.filter(token => {
      // Skip null/undefined tokens
      if (!token) return false;
      
      // Filter by meme token keywords if configured
      if (config.filters?.memeToken?.keywords && config.filters.memeToken.keywords.length > 0) {
        // Check if token name or symbol includes any of the keywords
        const tokenName = (token.name || '').toLowerCase();
        const tokenSymbol = (token.symbol || '').toLowerCase();
        
        const isMemeToken = config.filters.memeToken.keywords.some(keyword => {
          const key = keyword.toLowerCase();
          return tokenName.includes(key) || tokenSymbol.includes(key);
        });
        
        // Skip if not a meme token and we're filtering for meme tokens
        if (!isMemeToken) return false;
      }
      
      return true;
    });
    
    logger.debug(`Filtered ${tokens.length} tokens down to ${filtered.length}`);
    return filtered;
  } catch (error) {
    logger.errorWithContext('Error filtering tokens', error);
    return [];
  }
}

/**
 * Get token by address
 * @param {string} address - Token address
 * @returns {Promise<Object|null>} Token info or null if not found
 */
async function getTokenByAddress(address) {
  try {
    if (!address) {
      logger.warn('getTokenByAddress called with empty address');
      return null;
    }
    
    // Normalize address
    const normalizedAddress = address.toLowerCase();
    
    // Load existing tokens
    const tokens = loadExistingTokens();
    
    // Find matching token
    const token = tokens.find(t => t.address && t.address.toLowerCase() === normalizedAddress);
    
    if (token) {
      logger.debug(`Found token for address ${address}: ${token.symbol}`);
      return token;
    }
    
    // If not found in cached tokens, try to fetch from API
    logger.debug(`Token not found in cache for address ${address}, fetching from API`);
    
    try {
      // Endpoint to get token details
      const endpoint = '/api/v5/dex/aggregator/all-tokens';
      
      // Make API request
      const response = await apiClient.makeRequest(endpoint, 'GET', {
        tokenAddress: address,
        chainIndex: config.dex?.chainId || config.networkId || '66'
      });
      
      if (response?.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        const tokenData = response.data.data[0];
        
        return {
          address: tokenData.tokenContractAddress || address,
          symbol: tokenData.tokenSymbol,
          name: tokenData.tokenName,
          decimals: tokenData.decimals,
          logoUrl: tokenData.tokenLogoUrl
        };
      }
      
      logger.warn(`No token data found for address ${address}`);
      return null;
    } catch (error) {
      logger.errorWithContext(`Error fetching token data for address ${address}`, error);
      return null;
    }
  } catch (error) {
    logger.errorWithContext(`Error getting token by address ${address}`, error);
    return null;
  }
}

/**
 * Fetch token list from OKX DEX API
 * @returns {Promise<Array>} List of tokens
 */
async function fetchTokenList() {
    try {
      logger.info('Fetching token list from DEX API');
      
      // Use the correct token list endpoint based on the curl example
      const endpoint = '/api/v5/dex/aggregator/all-tokens';
      
      // Add the chainIndex parameter exactly as shown in the curl example
      const params = {
        chainIndex: '1' // Ethereum chain (change to '66' for OKC)
      };
      
      // Make the request
      const response = await apiClient.makeRequest(endpoint, 'GET', params);
      
      // Check if we got an error response
      if (response.status !== 200 || !response.data || response.data.code !== '0') {
        logger.warn('Error response from token list API', {
          status: response.status,
          code: response.data?.code,
          msg: response.data?.msg
        });
        
        return generateMockTokens();
      }
      
      // Extract token data from response
      let tokens = [];
      
      if (response.data.data && Array.isArray(response.data.data)) {
        // Map response to our token format
        tokens = response.data.data.map(token => ({
          address: token.tokenContractAddress,
          symbol: token.tokenSymbol,
          name: token.tokenName,
          decimals: token.decimals,
          logoUrl: token.tokenLogoUrl,
          chainId: params.chainIndex
        }));
      } else {
        logger.warn('Unexpected token list format', {
          dataType: typeof response.data.data
        });
        
        return generateMockTokens();
      }
      
      logger.info(`Fetched ${tokens.length} tokens from API`);
      
      // Save tokens to file for reference
      saveTokensToFile(tokens, config.outputPaths.tokenList || './data/tokens.json');
      
      return tokens;
    } catch (error) {
      logger.errorWithContext('Error fetching token list', error);
      return generateMockTokens();
    }
  }
  
//   /**
//    * Generate mock token data
//    * @param {number} count - Number of tokens to generate
//    * @returns {Array} Mock tokens
//    */
//   function generateMockTokens(count = 20) {
//     logger.info(`Generating ${count} mock tokens`);
    
//     const mockTokens = Array.from({ length: count }, (_, index) => {
//       const randomHex = () => Math.floor(Math.random() * 16).toString(16);
//       const address = '0x' + Array.from({ length: 40 }, () => randomHex()).join('');
      
//       return {
//         address: address,
//         symbol: `TOKEN${index}`,
//         name: `Token ${index}`,
//         decimals: "18",
//         logoUrl: `https://static.okx.com/cdn/wallet/logo/TOKEN${index}.png`,
//         price: (Math.random() * 100).toFixed(8),
//         volume24h: (Math.random() * 1000000).toFixed(2),
//         priceChange24h: (Math.random() * 20 - 10).toFixed(2)
//       };
//     });
    
//     return mockTokens;
//   }

/**
 * Discover new tokens from the token list
 * @param {Object} options - Discovery options
 * @returns {Promise<Array>} New tokens
 */
async function discoverNewTokens(options = {}) {
  try {
    // Get all tokens
    const allTokens = await fetchTokenList();
    
    // Ensure allTokens is an array
    if (!Array.isArray(allTokens)) {
      logger.warn('fetchTokenList did not return an array', { 
        type: typeof allTokens 
      });
      return [];
    }
    
    // Load existing tokens
    const existingTokens = loadExistingTokens(config.outputPaths.newTokens);
    
    // Filter out tokens we already know about
    const existingAddresses = new Set(existingTokens.map(token => 
      token.address?.toLowerCase() || ''
    ));
    
    // Apply filters based on options
    const newTokens = allTokens.filter(token => {
      // Skip undefined or null tokens
      if (!token || !token.address) return false;
      
      // Skip existing tokens
      if (existingAddresses.has(token.address.toLowerCase())) return false;
      
      // Additional filters can be added here based on options
      
      return true;
    });
    
    logger.info(`Discovered ${newTokens.length} new tokens out of ${allTokens.length} total tokens`);
    
    // Save new tokens to file
    saveTokensToFile(newTokens, config.outputPaths.newTokens || './data/new_tokens.json');
    
    return newTokens;
  } catch (error) {
    logger.errorWithContext('Error discovering new tokens', error);
    return [];
  }
}

module.exports = {
  discoverNewTokens,
  fetchTokenList,
  getTokenByAddress,
  filterTokens,
  loadExistingTokens,
  saveTokensToFile
};