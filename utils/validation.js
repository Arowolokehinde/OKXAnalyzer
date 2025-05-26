/**
 * Validation utility for OKX Token Launch Analytics Dashboard
 * Contains validation functions for tokens, swaps, recommendations, etc.
 */
const logger = require('./logger');

/**
 * Validate token data structure
 * @param {Object} token - Token object to validate
 * @returns {boolean} True if token is valid
 */
function validateToken(token) {
  try {
    if (!token || typeof token !== 'object') {
      return false;
    }
    
    // Required fields
    const requiredFields = ['address', 'symbol'];
    
    for (const field of requiredFields) {
      if (!token[field] || typeof token[field] !== 'string') {
        return false;
      }
    }
    
    // Address should look like a hex address
    if (!/^0x[a-fA-F0-9]{40}$/.test(token.address)) {
      return false;
    }
    
    // Symbol should be reasonable length
    if (token.symbol.length > 20) {
      return false;
    }
    
    return true;
  } catch (error) {
    logger.errorWithContext('Error validating token', error, { token });
    return false;
  }
}

/**
 * Validate token metrics data
 * @param {Object} metrics - Token metrics object to validate
 * @returns {boolean} True if metrics are valid
 */
function validateTokenMetrics(metrics) {
  try {
    if (!metrics || typeof metrics !== 'object') {
      return false;
    }
    
    // Required fields for metrics
    const requiredFields = ['address'];
    
    for (const field of requiredFields) {
      if (!metrics[field]) {
        return false;
      }
    }
    
    // Numeric fields should be valid numbers or numeric strings
    const numericFields = ['liquidity', 'volume24h', 'priceUSD', 'holders'];
    
    for (const field of numericFields) {
      if (metrics[field] !== undefined) {
        const value = typeof metrics[field] === 'string' 
          ? parseFloat(metrics[field]) 
          : metrics[field];
          
        if (isNaN(value) || value < 0) {
          logger.warn(`Invalid numeric value for ${field}:`, metrics[field]);
          // Don't fail validation for this, just warn
        }
      }
    }
    
    // Check derived metrics if present
    if (metrics.derived) {
      const derivedFields = ['swapsLastHour', 'avgSwapSize', 'volatility', 'holderGrowthRate'];
      
      for (const field of derivedFields) {
        if (metrics.derived[field] !== undefined) {
          const value = metrics.derived[field];
          if (typeof value !== 'number' || isNaN(value)) {
            logger.warn(`Invalid derived metric ${field}:`, value);
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    logger.errorWithContext('Error validating token metrics', error, { metrics });
    return false;
  }
}

/**
 * Validate swap data
 * @param {Object} swap - Swap object to validate
 * @returns {boolean} True if swap is valid
 */
function validateSwap(swap) {
  try {
    if (!swap || typeof swap !== 'object') {
      return false;
    }
    
    // Required fields
    const requiredFields = ['txHash', 'timestamp', 'token'];
    
    for (const field of requiredFields) {
      if (!swap[field]) {
        return false;
      }
    }
    
    // Validate transaction hash format
    if (!/^0x[a-fA-F0-9]{64}$/.test(swap.txHash) && !/^tx-[a-fA-F0-9]{8}$/.test(swap.txHash)) {
      // Allow both full tx hashes and our mock format
      return false;
    }
    
    // Validate timestamp
    const timestamp = new Date(swap.timestamp);
    if (isNaN(timestamp.getTime())) {
      return false;
    }
    
    // Validate numeric fields
    const numericFields = ['amount', 'amountUSD', 'priceUSD'];
    
    for (const field of numericFields) {
      if (swap[field] !== undefined) {
        const value = typeof swap[field] === 'string' 
          ? parseFloat(swap[field]) 
          : swap[field];
          
        if (isNaN(value) || value < 0) {
          return false;
        }
      }
    }
    
    // Validate type if present
    if (swap.type && !['buy', 'sell', 'unknown'].includes(swap.type.toLowerCase())) {
      return false;
    }
    
    return true;
  } catch (error) {
    logger.errorWithContext('Error validating swap', error, { swap });
    return false;
  }
}

/**
 * Validate recommendation data
 * @param {Object} recommendation - Recommendation object to validate
 * @returns {boolean} True if recommendation is valid
 */
function validateRecommendation(recommendation) {
  try {
    if (!recommendation || typeof recommendation !== 'object') {
      return false;
    }
    
    // Required fields
    const requiredFields = ['symbol', 'score', 'recommendation'];
    
    for (const field of requiredFields) {
      if (recommendation[field] === undefined || recommendation[field] === null) {
        return false;
      }
    }
    
    // Validate score range
    if (typeof recommendation.score !== 'number' || 
        recommendation.score < 0 || 
        recommendation.score > 100) {
      return false;
    }
    
    // Validate recommendation text
    const validRecommendations = ['Strong Buy', 'Buy', 'Hold', 'Avoid', 'Strong Avoid'];
    if (!validRecommendations.includes(recommendation.recommendation)) {
      return false;
    }
    
    // Validate reasons array if present
    if (recommendation.reasons && !Array.isArray(recommendation.reasons)) {
      return false;
    }
    
    return true;
  } catch (error) {
    logger.errorWithContext('Error validating recommendation', error, { recommendation });
    return false;
  }
}

/**
 * Validate API response format
 * @param {Object} response - API response to validate
 * @returns {boolean} True if response format is valid
 */
function validateApiResponse(response) {
  try {
    if (!response || typeof response !== 'object') {
      return false;
    }
    
    // Check for expected response structure
    if (response.data === undefined) {
      return false;
    }
    
    // For OKX API responses, check code if present
    if (response.data && response.data.code !== undefined) {
      // OKX API returns '0' for success
      return response.data.code === '0';
    }
    
    // For other responses, check status
    if (response.status !== undefined) {
      return response.status >= 200 && response.status < 300;
    }
    
    return true;
  } catch (error) {
    logger.errorWithContext('Error validating API response', error);
    return false;
  }
}

/**
 * Validate configuration object
 * @param {Object} config - Configuration object to validate
 * @returns {boolean} True if config is valid
 */
function validateConfig(config) {
  try {
    if (!config || typeof config !== 'object') {
      return false;
    }
    
    // Check for required config sections
    const requiredSections = ['apis', 'outputPaths', 'dex'];
    
    for (const section of requiredSections) {
      if (!config[section] || typeof config[section] !== 'object') {
        logger.warn(`Missing required config section: ${section}`);
        return false;
      }
    }
    
    // Validate API endpoints
    if (!config.apis.baseUrl || typeof config.apis.baseUrl !== 'string') {
      logger.warn('Missing or invalid baseUrl in config');
      return false;
    }
    
    // Validate output paths
    if (!config.outputPaths.tokenList || typeof config.outputPaths.tokenList !== 'string') {
      logger.warn('Missing or invalid tokenList path in config');
      return false;
    }
    
    return true;
  } catch (error) {
    logger.errorWithContext('Error validating config', error);
    return false;
  }
}

/**
 * Sanitize string input to prevent injection attacks
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(input) {
  try {
    if (typeof input !== 'string') {
      return '';
    }
    
    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;&|`]/g, '') // Remove command injection chars
      .trim();
  } catch (error) {
    logger.errorWithContext('Error sanitizing string', error, { input });
    return '';
  }
}

/**
 * Validate Ethereum address format
 * @param {string} address - Address to validate
 * @returns {boolean} True if address format is valid
 */
function validateAddress(address) {
  try {
    if (!address || typeof address !== 'string') {
      return false;
    }
    
    // Check basic hex format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return false;
    }
    
    return true;
  } catch (error) {
    logger.errorWithContext('Error validating address', error, { address });
    return false;
  }
}

/**
 * Validate and normalize numeric value
 * @param {string|number} value - Value to validate and normalize
 * @param {number} defaultValue - Default value if invalid (default: 0)
 * @returns {number} Normalized numeric value
 */
function validateAndNormalizeNumber(value, defaultValue = 0) {
  try {
    if (value === undefined || value === null) {
      return defaultValue;
    }
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue) || !isFinite(numValue)) {
      return defaultValue;
    }
    
    return numValue;
  } catch (error) {
    logger.errorWithContext('Error validating number', error, { value });
    return defaultValue;
  }
}

module.exports = {
  validateToken,
  validateTokenMetrics,
  validateSwap,
  validateRecommendation,
  validateApiResponse,
  validateConfig,
  validateAddress,
  sanitizeString,
  validateAndNormalizeNumber
};