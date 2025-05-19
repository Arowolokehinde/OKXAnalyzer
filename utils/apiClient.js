// /**
//  * OKX API Client for OKC Token Launch Analytics Dashboard
//  */
// const axios = require('axios');
// const crypto = require('crypto');
// const cache = require('memory-cache');
// const config = require('../config');
// const logger = require('./logger');

// // Last request timestamps for rate limiting
// const lastRequestTimes = {};

// /**
//  * Generate signature for OKX API authentication
//  * @param {string} timestamp - ISO timestamp
//  * @param {string} method - HTTP method
//  * @param {string} requestPath - Request path
//  * @param {Object|string} body - Request body (if any)
//  * @returns {string} Base64 encoded signature
//  */
// function generateSignature(timestamp, method, requestPath, body = '') {
//   try {
//     // Convert body to string if it's an object
//     const bodyStr = typeof body === 'object' ? JSON.stringify(body) : (body || '');
    
//     // Create signature message: timestamp + method + requestPath + body
//     const message = `${timestamp}${method}${requestPath}${bodyStr}`;
    
//     // Generate HMAC-SHA256 signature
//     const signature = crypto
//       .createHmac('sha256', config.apiKeys.okxSecretKey || '')
//       .update(message)
//       .digest('base64');
    
//     return signature;
//   } catch (error) {
//     logger.errorWithContext('Error generating API signature', error);
//     return '';
//   }
// }

// /**
//  * Apply rate limiting to API requests
//  * @param {string} endpoint - API endpoint
//  * @returns {Promise<void>}
//  */
// async function applyRateLimit(endpoint) {
//   if (!config.features.enableRateLimiting) return;
  
//   const now = Date.now();
//   const minInterval = 100; // Minimum 100ms between requests to same endpoint
  
//   // Get last request time for this endpoint
//   const lastRequest = lastRequestTimes[endpoint] || 0;
//   const timeToWait = Math.max(0, lastRequest + minInterval - now);
  
//   // Wait if needed
//   if (timeToWait > 0) {
//     await new Promise(resolve => setTimeout(resolve, timeToWait));
//   }
  
//   // Update last request time
//   lastRequestTimes[endpoint] = Date.now();
// }

// /**
//  * Get data from cache if available
//  * @param {string} cacheKey - Cache key
//  * @returns {Object|null} Cached data or null if not found
//  */
// function getFromCache(cacheKey) {
//   if (!config.features.enableCaching) return null;
  
//   return cache.get(cacheKey);
// }

// /**
//  * Store data in cache
//  * @param {string} cacheKey - Cache key
//  * @param {Object} data - Data to cache
//  */
// function storeInCache(cacheKey, data) {
//   if (!config.features.enableCaching) return;
  
//   cache.put(cacheKey, data, config.cache.ttl);
// }

// /**
//  * Build URL with query parameters
//  * @param {string} baseUrl - Base URL
//  * @param {string} endpoint - API endpoint
//  * @param {Object} params - Query parameters
//  * @returns {string} Full URL with query parameters
//  */
// function buildUrl(baseUrl, endpoint, params = {}) {
//   try {
//     // Start with the base URL
//     let url = baseUrl;
    
//     // Add endpoint
//     if (!url.endsWith('/') && !endpoint.startsWith('/')) {
//       url += '/';
//     }
//     url += endpoint;
    
//     // Add query parameters if any
//     if (params && Object.keys(params).length > 0) {
//       const queryParams = [];
      
//       for (const [key, value] of Object.entries(params)) {
//         if (value !== undefined && value !== null) {
//           queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
//         }
//       }
      
//       if (queryParams.length > 0) {
//         url += `?${queryParams.join('&')}`;
//       }
//     }
    
//     return url;
//   } catch (error) {
//     logger.errorWithContext('Error building URL', error, { baseUrl, endpoint });
    
//     // Fallback to simple concatenation
//     return `${baseUrl}${endpoint}`;
//   }
// }

// /**
//  * Make an authenticated request to OKX API
//  * @param {string} endpoint - API endpoint
//  * @param {Object} params - Query parameters or request body
//  * @param {Object} options - Additional options
//  * @returns {Promise<Object>} API response
//  */
// async function makeRequest(endpoint, params = {}, options = {}) {
//   try {
//     // Extract options with defaults
//     const method = (options.method || 'GET').toUpperCase();
//     const useCache = options.useCache !== false && config.features.enableCaching;
    
//     // Check cache first if enabled and it's a GET request
//     const cacheKey = `${method}:${endpoint}:${JSON.stringify(params)}`;
//     if (method === 'GET' && useCache) {
//       const cachedData = getFromCache(cacheKey);
//       if (cachedData) {
//         logger.debug('Using cached data', { endpoint });
//         return cachedData;
//       }
//     }
    
//     // Apply rate limiting
//     await applyRateLimit(endpoint);
    
//     // Use mock data if real API is disabled
//     if (!config.features.useRealApi) {
//       logger.debug('Using mock data (real API disabled)', { endpoint });
//       return getMockData(endpoint, params);
//     }
    
//     // Build the complete URL for GET requests
//     const url = method === 'GET' 
//       ? buildUrl(config.baseUrl, endpoint, params)
//       : buildUrl(config.baseUrl, endpoint);
    
//     logger.debug('Making API request', { method, url });
    
//     // Prepare headers
//     const headers = {
//       'Content-Type': 'application/json',
//       'Accept': 'application/json'
//     };
    
//     // Add authentication if API keys are available
//     if (config.apiKeys.okxApiKey) {
//       const timestamp = new Date().toISOString();
//       headers['OK-ACCESS-KEY'] = config.apiKeys.okxApiKey;
      
//       if (config.apiKeys.okxSecretKey && config.apiKeys.okxPassphrase) {
//         const signature = generateSignature(
//           timestamp, 
//           method, 
//           endpoint, 
//           method !== 'GET' ? params : ''
//         );
        
//         headers['OK-ACCESS-SIGN'] = signature;
//         headers['OK-ACCESS-TIMESTAMP'] = timestamp;
//         headers['OK-ACCESS-PASSPHRASE'] = config.apiKeys.okxPassphrase;
//       }
//     }
    
//     // Add custom headers
//     if (options.headers) {
//       Object.assign(headers, options.headers);
//     }
    
//     // Simple Axios request configuration
//     const axiosConfig = {
//       method,
//       url,
//       headers
//     };
    
//     // Add request body for non-GET requests
//     if (method !== 'GET' && params) {
//       axiosConfig.data = params;
//     }
    
//     // Make the request
//     const response = await axios(axiosConfig);
    
//     // Cache successful response if it's a GET request
//     if (method === 'GET' && useCache) {
//       storeInCache(cacheKey, response.data);
//     }
    
//     return response.data;
//   } catch (error) {
//     // Handle specific error types
//     if (error.response) {
//       logger.errorWithContext('API request failed with response', error, {
//         status: error.response.status,
//         data: error.response.data,
//         endpoint
//       });
      
//       // Handle rate limiting (429)
//       if (error.response.status === 429) {
//         logger.warn('Rate limit exceeded, waiting and retrying...');
//         await new Promise(resolve => setTimeout(resolve, 1000));
//         return makeRequest(endpoint, params, options);
//       }
//     } else if (error.request) {
//       logger.errorWithContext('API request failed with no response', error, { endpoint });
//     } else {
//       logger.errorWithContext('API request setup failed', error, { endpoint });
//     }
    
//     // Fall back to mock data
//     logger.info('Falling back to mock data', { endpoint });
//     return getMockData(endpoint, params);
//   }
// }

// module.exports = {
//   makeRequest,
//   generateSignature,
//   getMockData
// };


/**
 * OKX API Client for OKC Token Launch Analytics Dashboard
 */
const axios = require('axios');
const crypto = require('crypto');
const cache = require('memory-cache');
const config = require('../config');
const logger = require('./logger');

// Last request timestamps for rate limiting
const lastRequestTimes = {};

/**
 * Generate signature for OKX API authentication
 * @param {string} timestamp - ISO timestamp
 * @param {string} method - HTTP method
 * @param {string} requestPath - Request path
 * @param {Object|string} body - Request body (if any)
 * @returns {string} Base64 encoded signature
 */
function generateSignature(timestamp, method, requestPath, body = '') {
  try {
    // Convert body to string if it's an object
    const bodyStr = typeof body === 'object' ? JSON.stringify(body) : (body || '');
    
    // Create signature message: timestamp + method + requestPath + body
    const message = `${timestamp}${method}${requestPath}${bodyStr}`;
    
    // Generate HMAC-SHA256 signature
    const signature = crypto
      .createHmac('sha256', config.apiKeys.okxSecretKey || '')
      .update(message)
      .digest('base64');
    
    return signature;
  } catch (error) {
    logger.errorWithContext('Error generating API signature', error);
    return '';
  }
}

/**
 * Apply rate limiting to API requests
 * @param {string} endpoint - API endpoint
 * @returns {Promise<void>}
 */
async function applyRateLimit(endpoint) {
  if (!config.features?.enableRateLimiting) return;
  
  const now = Date.now();
  const minInterval = 100; // Minimum 100ms between requests to same endpoint
  
  // Get last request time for this endpoint
  const lastRequest = lastRequestTimes[endpoint] || 0;
  const timeToWait = Math.max(0, lastRequest + minInterval - now);
  
  // Wait if needed
  if (timeToWait > 0) {
    await new Promise(resolve => setTimeout(resolve, timeToWait));
  }
  
  // Update last request time
  lastRequestTimes[endpoint] = Date.now();
}

/**
 * Get data from cache if available
 * @param {string} cacheKey - Cache key
 * @returns {Object|null} Cached data or null if not found
 */
function getFromCache(cacheKey) {
  if (!config.features?.enableCaching) return null;
  
  return cache.get(cacheKey);
}

/**
 * Store data in cache
 * @param {string} cacheKey - Cache key
 * @param {Object} data - Data to cache
 */
function storeInCache(cacheKey, data) {
  if (!config.features?.enableCaching) return;
  
  const ttl = config.cache?.ttl || 60000; // Default to 1 minute if not specified
  cache.put(cacheKey, data, ttl);
}

/**
 * Build URL with query parameters
 * @param {string} baseUrl - Base URL
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {string} Full URL with query parameters
 */
function buildUrl(baseUrl, endpoint, params = {}) {
  try {
    // Ensure baseUrl is defined, using a fallback if necessary
    const url = baseUrl || 'https://web3.okx.com';
    
    // Ensure endpoint has a leading slash if not already present
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Create URL object
    const urlObj = new URL(formattedEndpoint, url);
    
    // Add query parameters if any
    if (params && Object.keys(params).length > 0) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          urlObj.searchParams.append(key, value);
        }
      });
    }
    
    return urlObj.toString();
  } catch (error) {
    logger.errorWithContext('Error building URL', error, { baseUrl, endpoint });
    
    // Fallback to simple concatenation
    const base = baseUrl || 'https://web3.okx.com';
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
  }
}

/**
 * Extract path for signature from URL or path
 * @param {string} urlOrPath - URL or path
 * @returns {string} Path for signature
 */
function extractPathForSignature(urlOrPath) {
    // If it's already just a path (starts with /), return it directly
    if (urlOrPath.startsWith('/')) {
      return urlOrPath;
    }
    
    // If it's a full URL, try to extract the path
    try {
      if (urlOrPath.startsWith('http')) {
        const url = new URL(urlOrPath);
        return `${url.pathname}${url.search}`;
      }
    } catch (error) {
      console.error(`Error extracting path from URL ${urlOrPath}: ${error.message}`);
    }
    
    // Return original as fallback
    return urlOrPath;
  }
/**
 * Get mock data for development/testing
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Request parameters
 * @returns {Object} Mock data
 */
function getMockData(endpoint, params = {}) {
  // Basic structure for mock responses
  const mockResponse = {
    code: '0',
    msg: '',
    data: []
  };
  
  // Generate different mock data based on endpoint
  if (endpoint.includes('tokens')) {
    // Mock token list
    mockResponse.data = Array.from({ length: 20 }, (_, i) => ({
      address: `0x${Math.random().toString(16).substring(2, 42)}`,
      symbol: `TOKEN${i}`,
      name: `Token ${i}`,
      decimals: '18',
      chainId: params.chainId || '66'
    }));
  } else if (endpoint.includes('ticker')) {
    // Mock ticker data
    mockResponse.data = [{
      price_usd: (0.0001 * Math.random() * 100).toFixed(10),
      volume_24h: (10000 + Math.random() * 100000).toFixed(2),
      liquidity: (5000 + Math.random() * 50000).toFixed(2),
      price_change_1h: (Math.random() * 10 - 5).toFixed(2),
      price_change_24h: (Math.random() * 20 - 10).toFixed(2),
      market_cap: (50000 + Math.random() * 500000).toFixed(2),
      holders_count: Math.floor(50 + Math.random() * 500).toString(),
      total_supply: (1000000000 + Math.random() * 1000000000).toFixed(0),
      listing_time: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }];
  } else if (endpoint.includes('trades')) {
    // Mock trades data
    mockResponse.data = Array.from({ length: 20 }, (_, i) => {
      const timestamp = new Date(Date.now() - i * 3 * 60 * 1000);
      const price = 0.0001 * (1 + Math.random() * 0.2 - 0.1);
      const amount = 100 + Math.random() * 900;
      
      return {
        tx_hash: `0x${Math.random().toString(16).substring(2, 66)}`,
        timestamp: timestamp.toISOString(),
        amount: amount.toFixed(2),
        amount_usd: (amount * price).toFixed(2),
        price_usd: price.toFixed(10),
        type: Math.random() > 0.5 ? 'buy' : 'sell',
        sender_address: `0x${Math.random().toString(16).substring(2, 42)}`
      };
    });
  }
  
  return mockResponse;
}

/**
 * Make an authenticated request to OKX API
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method (default: GET)
 * @param {Object} params - Query parameters or body data
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} API response
 */
async function makeRequest(endpoint, method = 'GET', params = {}, options = {}) {
    try {
      const requestMethod = method.toUpperCase();
      const baseUrl = 'https://web3.okx.com';
      
      // Format the URL with query parameters for GET requests
      let url;
      let queryString = '';
      
      if (requestMethod === 'GET' && Object.keys(params).length > 0) {
        // Build query string manually to ensure correct format
        const queryParams = [];
        
        for (const [key, value] of Object.entries(params)) {
          if (value !== undefined && value !== null) {
            queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
          }
        }
        
        queryString = queryParams.join('&');
        url = `${baseUrl}${endpoint}${queryString ? `?${queryString}` : ''}`;
      } else {
        url = `${baseUrl}${endpoint}`;
      }
      
      logger.debug(`Making ${requestMethod} request to ${url}`);
      
      // Get API credentials from environment variables
      const apiKey = process.env.OKX_API_KEY;
      const secretKey = process.env.OKX_SECRET_KEY;
      const passphrase = process.env.OKX_PASSPHRASE;
      
      // Ensure we have credentials
      if (!apiKey || !secretKey || !passphrase) {
        logger.warn('Missing API credentials, authentication will fail');
        
        // If using mock data is configured, return that immediately
        if (!config.features?.useRealApi) {
          logger.info('Using mock data (real API disabled)');
          return { data: getMockData(endpoint, params) };
        }
      }
      
      // Current timestamp in ISO format
      const timestamp = new Date().toISOString();
      
      // Generate signature message based on OKX docs
      // For GET: timestamp + GET + endpoint[?queryString]
      // For others: timestamp + METHOD + endpoint + body
      const signPath = queryString 
        ? `${endpoint}?${queryString}` 
        : endpoint;
        
      const signatureMessage = `${timestamp}${requestMethod}${signPath}${
        requestMethod === 'GET' ? '' : JSON.stringify(params)
      }`;
      
      // Generate HMAC-SHA256 signature
      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(signatureMessage)
        .digest('base64');
      
      // Build headers object
      const headers = {
        'Content-Type': 'application/json',
        'OK-ACCESS-KEY': apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': passphrase
      };
      
      // Log headers for debugging (but hide sensitive parts)
      logger.debug('Request headers:', {
        'OK-ACCESS-KEY': `${apiKey.substring(0, 4)}...`,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'Content-Type': 'application/json'
      });
      
      // Make the request
      try {
        const response = await axios({
          method: requestMethod,
          url,
          headers,
          data: requestMethod !== 'GET' ? params : undefined,
          timeout: options.timeout || 10000
        });
        
        logger.debug(`API response status: ${response.status}`);
        return response;
      } catch (error) {
        // Handle specific error cases
        if (error.response) {
          // The request was made and the server responded with a non-2xx status
          logger.errorWithContext(
            error.response.data?.msg || 'API request failed',
            error,
            {
              status: error.response.status,
              code: error.response.data?.code,
              endpoint
            }
          );
          
          // Return error response for handling
          return error.response;
        } else if (error.request) {
          // The request was made but no response was received
          logger.errorWithContext('No response received from API', error);
        } else {
          // Something happened in setting up the request
          logger.errorWithContext('Error setting up API request', error);
        }
        
        // Fall back to mock data
        logger.info('Falling back to mock data', { endpoint });
        return { 
          data: getMockData(endpoint, params),
          status: 200,
          statusText: 'OK (Mock)'
        };
      }
    } catch (error) {
      logger.errorWithContext('Error in makeRequest', error);
      
      // Ultimate fallback to mock data
      return { 
        data: getMockData(endpoint, params),
        status: 200,
        statusText: 'OK (Final Fallback)'
      };
    }
  }


module.exports = {
  makeRequest,
  generateSignature,
  buildUrl,
  getMockData,
  getFromCache,
  storeInCache
};