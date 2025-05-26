/**
 * tokenFilter.js
 * Module for filtering tokens based on custom criteria
 */
const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');
const { isMemeToken } = require('./tokenDiscovery');

/**
 * Apply custom filters to a list of tokens
 * @param {Array} tokens - List of tokens to filter
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered list of tokens
 */
function applyFilters(tokens, filters = {}) {
  try {
    logger.debug('Applying filters to tokens', { filterCount: Object.keys(filters).length, tokenCount: tokens.length });
    
    return tokens.filter(token => {
      // Apply each filter criterion if it exists
      
      // Time since launch filter
      if (filters.maxAge !== undefined) {
        const now = Date.now();
        const tokenTimestamp = new Date(token.listingTime).getTime();
        const tokenAge = now - tokenTimestamp;
        if (tokenAge > filters.maxAge) {
          return false;
        }
      }
      
      // Minimum volume filter
      if (filters.minVolume !== undefined) {
        if (parseFloat(token.volume24h) < filters.minVolume) {
          return false;
        }
      }
      
      // Maximum volume filter
      if (filters.maxVolume !== undefined) {
        if (parseFloat(token.volume24h) > filters.maxVolume) {
          return false;
        }
      }
      
      // Minimum liquidity filter
      if (filters.minLiquidity !== undefined) {
        if (parseFloat(token.liquidity) < filters.minLiquidity) {
          return false;
        }
      }
      
      // Maximum liquidity filter
      if (filters.maxLiquidity !== undefined) {
        if (parseFloat(token.liquidity) > filters.maxLiquidity) {
          return false;
        }
      }
      
      // Minimum holders filter
      if (filters.minHolders !== undefined) {
        if (parseInt(token.holders) < filters.minHolders) {
          return false;
        }
      }
      
      // Meme coin filter
      if (filters.memeOnly === true) {
        if (!isMemeToken(token)) {
          return false;
        }
      }
      
      // Price change filter
      if (filters.minPriceChange !== undefined && token.priceChange24h !== undefined) {
        if (parseFloat(token.priceChange24h) < filters.minPriceChange) {
          return false;
        }
      }
      
      // Market cap filter
      if (filters.maxMarketCap !== undefined && token.marketCap !== undefined) {
        if (parseFloat(token.marketCap) > filters.maxMarketCap) {
          return false;
        }
      }
      
      // Pass all filters
      return true;
    });
  } catch (error) {
    logger.errorWithContext('Error applying filters', error, { filters });
    return tokens; // Return original list on error
  }
}

/**
 * Sort filtered tokens based on specified criteria
 * @param {Array} tokens - List of tokens to sort
 * @param {string} sortBy - Field to sort by
 * @param {boolean} ascending - Sort in ascending order if true
 * @returns {Array} Sorted list of tokens
 */
function sortTokens(tokens, sortBy = 'volume24h', ascending = false) {
  try {
    return [...tokens].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      
      // Handle numeric fields
      if (typeof valA === 'string' && !isNaN(parseFloat(valA))) {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      }
      
      // Handle string fields
      if (typeof valA === 'string' && typeof valB === 'string') {
        return ascending 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }
      
      // Handle numeric comparison
      return ascending ? valA - valB : valB - valA;
    });
  } catch (error) {
    logger.errorWithContext('Error sorting tokens', error, { sortBy, ascending });
    return tokens; // Return original list on error
  }
}

/**
 * Format tokens with age information for better display
 * @param {Array} tokens - List of tokens
 * @returns {Array} Tokens with additional age information
 */
function formatTokensWithAge(tokens) {
  try {
    const now = Date.now();
    
    return tokens.map(token => {
      try {
        const listingTime = new Date(token.listingTime).getTime();
        const ageMs = now - listingTime;
        const ageHours = Math.round(ageMs / (1000 * 60 * 60));
        const ageDays = Math.floor(ageHours / 24);
        
        // Format age as hours or days
        let ageDisplay;
        if (ageHours < 24) {
          ageDisplay = `${ageHours}h`;
        } else {
          const remainingHours = ageHours % 24;
          ageDisplay = remainingHours > 0 
            ? `${ageDays}d ${remainingHours}h` 
            : `${ageDays}d`;
        }
        
        return {
          ...token,
          ageHours,
          ageDisplay
        };
      } catch (error) {
        logger.errorWithContext('Error calculating token age', error, { token });
        return { ...token, ageHours: 0, ageDisplay: 'Unknown' };
      }
    });
  } catch (error) {
    logger.errorWithContext('Error formatting tokens with age', error);
    return tokens; // Return original list on error
  }
}

/**
 * Save filtered tokens to file
 * @param {Array} tokens - List of tokens to save
 * @param {string} outputPath - Path to save tokens
 * @returns {Promise<boolean>} Success status
 */
async function saveFilteredTokens(tokens, outputPath) {
  try {
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write to file
    fs.writeFileSync(outputPath, JSON.stringify(tokens, null, 2));
    
    logger.info(`Saved ${tokens.length} filtered tokens to ${outputPath}`);
    
    return true;
  } catch (error) {
    logger.errorWithContext('Error saving filtered tokens', error, { outputPath });
    return false;
  }
}

/**
 * Apply filters, sort, and export tokens
 * @param {Array} tokens - List of tokens
 * @param {Object} filters - Filter criteria
 * @param {string} sortBy - Field to sort by
 * @param {boolean} ascending - Sort in ascending order if true
 * @param {string} outputPath - Custom output path (optional)
 * @returns {Promise<Array>} Filtered and sorted tokens
 */
async function filterAndExport(tokens, filters = {}, sortBy = 'volume24h', ascending = false, outputPath = null) {
  try {
    logger.info('Filtering and exporting tokens', { 
      filterCount: Object.keys(filters).length, 
      tokenCount: tokens.length,
      sortBy,
      ascending
    });
    
    // Apply filters
    const filteredTokens = applyFilters(tokens, filters);
    
    // Sort tokens
    const sortedTokens = sortTokens(filteredTokens, sortBy, ascending);
    
    // Format with age
    const formattedTokens = formatTokensWithAge(sortedTokens);
    
    // Export to file if path is provided
    if (outputPath || config.outputPaths.filteredTokens) {
      const filePath = outputPath || config.outputPaths.filteredTokens;
      await saveFilteredTokens(formattedTokens, filePath);
    }
    
    return formattedTokens;
  } catch (error) {
    logger.errorWithContext('Error filtering and exporting tokens', error);
    return [];
  }
}

/**
 * Get summary of filter results
 * @param {Array} originalTokens - Original list of tokens
 * @param {Array} filteredTokens - Filtered list of tokens
 * @param {Object} filters - Filter criteria
 * @returns {Object} Filter summary
 */
function getFilterSummary(originalTokens, filteredTokens, filters) {
  try {
    const filterNames = Object.keys(filters);
    
    return {
      totalTokens: originalTokens.length,
      filteredTokens: filteredTokens.length,
      rejectedTokens: originalTokens.length - filteredTokens.length,
      rejectionRate: ((originalTokens.length - filteredTokens.length) / originalTokens.length * 100).toFixed(2) + '%',
      filterCriteria: filters,
      filterCount: filterNames.length,
      filtersApplied: filterNames
    };
  } catch (error) {
    logger.errorWithContext('Error generating filter summary', error);
    return {
      totalTokens: originalTokens.length,
      filteredTokens: filteredTokens.length
    };
  }
}

module.exports = {
  applyFilters,
  sortTokens,
  filterAndExport,
  formatTokensWithAge,
  getFilterSummary
};