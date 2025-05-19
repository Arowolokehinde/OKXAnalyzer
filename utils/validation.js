/**
 * Data validation utilities for OKC Token Launch Analytics Dashboard
 */
const logger = require('./logger');

/**
 * Validate token data
 * @param {Object} token - Token object to validate
 * @returns {boolean} True if token is valid, false otherwise
 */
function validateToken(token) {
  // Required fields for a valid token
  const requiredFields = ['symbol', 'name', 'address', 'volume24h', 'liquidity', 'priceUSD'];
  
  // Check if all required fields exist
  for (const field of requiredFields) {
    if (token[field] === undefined || token[field] === null) {
      logger.debug(`Token validation failed: missing required field '${field}'`, { token });
      return false;
    }
  }
  
  // Validate numeric fields
  const numericFields = ['volume24h', 'liquidity', 'priceUSD'];
  for (const field of numericFields) {
    const value = parseFloat(token[field]);
    if (isNaN(value)) {
      logger.debug(`Token validation failed: field '${field}' is not a valid number`, { token });
      return false;
    }
  }
  
  // Validate address format (basic check)
  if (!token.address.startsWith('0x') || token.address.length < 10) {
    logger.debug('Token validation failed: invalid address format', { token });
    return false;
  }
  
  return true;
}

/**
 * Validate token metrics data
 * @param {Object} metrics - Token metrics object to validate
 * @returns {boolean} True if metrics are valid, false otherwise
 */
function validateTokenMetrics(metrics) {
  // Required fields for valid metrics
  const requiredFields = ['address', 'volume24h', 'liquidity', 'priceUSD', 'holders'];
  
  // Check if all required fields exist
  for (const field of requiredFields) {
    if (metrics[field] === undefined || metrics[field] === null) {
      logger.debug(`Metrics validation failed: missing required field '${field}'`, { metrics });
      return false;
    }
  }
  
  // Check if derived metrics exist if they're included
  if (metrics.derived) {
    const derivedFields = ['swapsLastHour', 'volatility', 'holderGrowthRate'];
    for (const field of derivedFields) {
      if (metrics.derived[field] === undefined) {
        logger.debug(`Metrics validation failed: missing derived field '${field}'`, { metrics });
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Validate swap data
 * @param {Object} swap - Swap object to validate
 * @returns {boolean} True if swap is valid, false otherwise
 */
function validateSwap(swap) {
  // Required fields for a valid swap
  const requiredFields = ['txHash', 'timestamp', 'token', 'amount', 'amountUSD', 'priceUSD', 'type'];
  
  // Check if all required fields exist
  for (const field of requiredFields) {
    if (swap[field] === undefined || swap[field] === null) {
      logger.debug(`Swap validation failed: missing required field '${field}'`, { swap });
      return false;
    }
  }
  
  // Validate swap type
  if (swap.type !== 'buy' && swap.type !== 'sell') {
    logger.debug(`Swap validation failed: invalid swap type '${swap.type}'`, { swap });
    return false;
  }
  
  // Validate numeric fields
  const numericFields = ['amount', 'amountUSD', 'priceUSD'];
  for (const field of numericFields) {
    const value = parseFloat(swap[field]);
    if (isNaN(value) || value <= 0) {
      logger.debug(`Swap validation failed: field '${field}' is not a valid positive number`, { swap });
      return false;
    }
  }
  
  // Validate timestamp
  try {
    const date = new Date(swap.timestamp);
    if (isNaN(date.getTime())) {
      logger.debug(`Swap validation failed: invalid timestamp '${swap.timestamp}'`, { swap });
      return false;
    }
  } catch (error) {
    logger.debug(`Swap validation failed: invalid timestamp format`, { swap, error: error.message });
    return false;
  }
  
  return true;
}

/**
 * Validate recommendation data
 * @param {Object} recommendation - Recommendation object to validate
 * @returns {boolean} True if recommendation is valid, false otherwise
 */
function validateRecommendation(recommendation) {
  // Required fields for a valid recommendation
  const requiredFields = ['symbol', 'name', 'score', 'recommendation', 'reasons'];
  
  // Check if all required fields exist
  for (const field of requiredFields) {
    if (recommendation[field] === undefined || recommendation[field] === null) {
      logger.debug(`Recommendation validation failed: missing required field '${field}'`, { recommendation });
      return false;
    }
  }
  
  // Validate score
  const score = recommendation.score;
  if (typeof score !== 'number' || score < 0 || score > 100) {
    logger.debug(`Recommendation validation failed: invalid score '${score}'`, { recommendation });
    return false;
  }
  
  // Validate recommendation text
  const validRecommendations = ['Strong Buy', 'Buy', 'Hold', 'Avoid', 'Strong Avoid'];
  if (!validRecommendations.includes(recommendation.recommendation)) {
    logger.debug(`Recommendation validation failed: invalid recommendation text '${recommendation.recommendation}'`, { recommendation });
    return false;
  }
  
  // Validate reasons
  if (!Array.isArray(recommendation.reasons) || recommendation.reasons.length === 0) {
    logger.debug(`Recommendation validation failed: reasons must be a non-empty array`, { recommendation });
    return false;
  }
  
  return true;
}

/**
 * Validate API request parameters
 * @param {Object} params - Request parameters
 * @param {Array} required - Required parameter names
 * @param {Object} validators - Parameter validators
 * @returns {Object} Validation result { isValid, errors }
 */
function validateRequestParams(params, required = [], validators = {}) {
  const errors = [];
  
  // Check required parameters
  for (const param of required) {
    if (params[param] === undefined || params[param] === null) {
      errors.push(`Missing required parameter: ${param}`);
    }
  }
  
  // Apply custom validators
  for (const [param, validator] of Object.entries(validators)) {
    if (params[param] !== undefined && params[param] !== null) {
      try {
        const isValid = validator(params[param]);
        if (!isValid) {
          errors.push(`Invalid parameter: ${param}`);
        }
      } catch (error) {
        errors.push(`Validation error for parameter ${param}: ${error.message}`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Common validators for request parameters
const paramValidators = {
  address: (value) => typeof value === 'string' && value.startsWith('0x') && value.length >= 10,
  positiveNumber: (value) => !isNaN(parseFloat(value)) && parseFloat(value) > 0,
  nonNegativeNumber: (value) => !isNaN(parseFloat(value)) && parseFloat(value) >= 0,
  boolean: (value) => typeof value === 'boolean' || value === 'true' || value === 'false',
  nonEmptyString: (value) => typeof value === 'string' && value.trim().length > 0,
  nonEmptyArray: (value) => Array.isArray(value) && value.length > 0,
  isoDate: (value) => {
    try {
      return !isNaN(new Date(value).getTime());
    } catch (e) {
      return false;
    }
  }
};

module.exports = {
  validateToken,
  validateTokenMetrics,
  validateSwap,
  validateRecommendation,
  validateRequestParams,
  paramValidators
};