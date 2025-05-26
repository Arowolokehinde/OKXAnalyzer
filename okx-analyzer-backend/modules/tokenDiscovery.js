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
 * Check if a token is a meme token based on name/symbol keywords
 * @param {Object} token - Token object with name and symbol
 * @returns {boolean} True if token appears to be a meme token
 */
function isMemeToken(token) {
  try {
    if (!token || (!token.name && !token.symbol)) {
      return false;
    }
    
    const name = (token.name || '').toLowerCase();
    const symbol = (token.symbol || '').toLowerCase();
    
    // Get meme keywords from config
    const keywords = config.filters?.memeToken?.keywords || [
      'pepe', 'doge', 'shib', 'inu', 'elon', 'moon', 'cat', 'floki', 'wojak'
    ];
    
    // Check if name or symbol contains any meme keywords
    return keywords.some(keyword => 
      name.includes(keyword.toLowerCase()) || 
      symbol.includes(keyword.toLowerCase())
    );
  } catch (error) {
    logger.errorWithContext('Error checking if token is meme token', error, { token });
    return false;  
  }
}

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
        // Only include meme tokens if meme filter is enabled
        if (!isMemeToken(token)) return false;
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
    
    // Load existing tokens first
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
      // Use the correct OKX DEX endpoint for token info
      const endpoint = '/api/v5/dex/aggregator/all-tokens';
      
      // Make API request with correct parameters
      const response = await apiClient.makeRequest(endpoint, 'GET', {
        chainIndex: config.dex?.chainId || '66' // OKC chain ID
      });
      
      if (response?.data?.code === '0' && response.data.data && Array.isArray(response.data.data)) {
        // Find the specific token by address
        const tokenData = response.data.data.find(t => 
          t.tokenContractAddress && t.tokenContractAddress.toLowerCase() === normalizedAddress
        );
        
        if (tokenData) {
          return {
            address: tokenData.tokenContractAddress || address,
            symbol: tokenData.tokenSymbol,
            name: tokenData.tokenName,
            decimals: tokenData.decimals,
            logoUrl: tokenData.tokenLogoUrl,
            chainId: config.dex?.chainId || '66'
          };
        }
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
    logger.info('Fetching token list from OKX DEX API');
    
    // Use the correct OKX DEX endpoint for all tokens
    const endpoint = '/api/v5/dex/aggregator/all-tokens';
    
    // Parameters for OKC chain
    const params = {
      chainIndex: config.dex?.chainId?.toString() || '66' // OKC chain ID as string
    };
    
    // Make the request
    const response = await apiClient.makeRequest(endpoint, 'GET', params);
    
    // Check response format
    if (!response || response.status !== 200) {
      logger.warn('Failed to fetch token list from API', {
        status: response?.status,
        statusText: response?.statusText
      });
      return generateMockTokens();
    }
    
    // Check if we got valid data
    if (!response.data || response.data.code !== '0') {
      logger.warn('Invalid response from token list API', {
        code: response.data?.code,
        msg: response.data?.msg
      });
      return generateMockTokens();
    }
    
    // Extract and format token data
    let tokens = [];
    
    if (response.data.data && Array.isArray(response.data.data)) {
      tokens = response.data.data.map(token => ({
        address: token.tokenContractAddress,
        symbol: token.tokenSymbol,
        name: token.tokenName,
        decimals: token.decimals,
        logoUrl: token.tokenLogoUrl,
        chainId: params.chainIndex
      })).filter(token => token.address && token.symbol); // Filter out invalid tokens
    } else {
      logger.warn('Unexpected token list format', {
        dataType: typeof response.data.data,
        hasData: !!response.data.data
      });
      return generateMockTokens();
    }
    
    logger.info(`Fetched ${tokens.length} tokens from OKX DEX API`);
    
    // Save tokens to file for caching
    if (tokens.length > 0) {
      saveTokensToFile(tokens, config.outputPaths.tokenList || './data/tokens.json');
    }
    
    return tokens;
  } catch (error) {
    logger.errorWithContext('Error fetching token list from API', error);
    return generateMockTokens();
  }
}

/**
 * Generate mock token data for development/testing
 * @param {number} count - Number of tokens to generate
 * @returns {Array} Mock tokens
 */
function generateMockTokens(count = 20) {
  logger.info(`Generating ${count} mock tokens`);
  
  const mockTokens = Array.from({ length: count }, (_, index) => {
    const randomHex = () => Math.floor(Math.random() * 16).toString(16);
    const address = '0x' + Array.from({ length: 40 }, () => randomHex()).join('');
    
    return {
      address: address,
      symbol: `TOKEN${index}`,
      name: `Token ${index}`,
      decimals: "18",
      logoUrl: `https://static.okx.com/cdn/wallet/logo/TOKEN${index}.png`,
      chainId: config.dex?.chainId?.toString() || '66'
    };
  });
  
  return mockTokens;
}

/**
 * Discover new tokens from the token list
 * @param {Object} options - Discovery options
 * @returns {Promise<Array>} New tokens
 */
async function discoverNewTokens(options = {}) {
  try {
    logger.info('Starting new token discovery');
    
    // Get all tokens from API
    const allTokens = await fetchTokenList();
    
    // Ensure allTokens is an array
    if (!Array.isArray(allTokens)) {
      logger.warn('fetchTokenList did not return an array', { 
        type: typeof allTokens 
      });
      return [];
    }
    
    // Load existing tokens to compare
    const existingTokens = loadExistingTokens(config.outputPaths.newTokens);
    
    // Create set of existing addresses for fast lookup
    const existingAddresses = new Set(
      existingTokens
        .map(token => token.address?.toLowerCase())
        .filter(addr => addr) // Remove undefined/null addresses
    );
    
    // Filter for truly new tokens
    const newTokens = allTokens.filter(token => {
      // Skip tokens without addresses
      if (!token || !token.address) return false;
      
      // Skip tokens we already know about
      if (existingAddresses.has(token.address.toLowerCase())) return false;
      
      // Additional filters can be added here based on options
      
      return true;
    });
    
    logger.info(`Discovered ${newTokens.length} new tokens out of ${allTokens.length} total tokens`);
    
    // Save new tokens to file
    if (newTokens.length > 0) {
      saveTokensToFile(newTokens, config.outputPaths.newTokens || './data/new_tokens.json');
    }
    
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
  saveTokensToFile,
  isMemeToken, // Export the missing function
  generateMockTokens
};