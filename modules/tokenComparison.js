/**
 * tokenComparison.js
 * Module for comparing multiple tokens side-by-side on various metrics
 */
const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');
const { getDetailedMetrics } = require('./tokenMetrics');

/**
 * Calculate a composite score for a token based on various metrics
 * @param {Object} token - Token with detailed metrics
 * @returns {number} Score from 0-100
 */
function calculateTokenScore(token) {
  try {
    // Ensure all required properties exist
    if (!token || !token.volume24h || !token.liquidity || !token.holders) {
      logger.warn('Invalid token data for scoring', { token });
      return 0;
    }
    
    // Define weights for different metrics
    const weights = {
      volume: 0.35,      // 35% weight for volume
      liquidity: 0.25,   // 25% weight for liquidity
      holders: 0.15,     // 15% weight for holder count
      volatility: 0.10,  // 10% weight for price volatility
      growth: 0.15       // 15% weight for holder growth rate
    };
    
    // Normalize values to 0-100 scale (based on typical ranges)
    // These normalization factors would need to be calibrated based on real data
    const volumeScore = Math.min(100, parseFloat(token.volume24h) / 1000);
    const liquidityScore = Math.min(100, parseFloat(token.liquidity) / 500);
    const holdersScore = Math.min(100, parseFloat(token.holders) / 5);
    
    // Volatility score - higher volatility generally means higher risk but also potential for higher returns
    const volatilityScore = token.derived && token.derived.volatility !== undefined
      ? Math.min(100, token.derived.volatility * 200)
      : 50; // Default if not available
    
    // Holder growth rate score
    const growthScore = token.derived && token.derived.holderGrowthRate !== undefined
      ? Math.min(100, token.derived.holderGrowthRate * 50)
      : 50; // Default if not available
    
    // Calculate weighted score
    const score = (
      weights.volume * volumeScore +
      weights.liquidity * liquidityScore +
      weights.holders * holdersScore +
      weights.volatility * volatilityScore +
      weights.growth * growthScore
    );
    
    // Return rounded score
    return Math.round(score);
  } catch (error) {
    logger.errorWithContext('Error calculating token score', error, { token });
    return 0;
  }
}

/**
 * Prepare token data for comparison
 * @param {Array} tokens - List of tokens with detailed metrics
 * @returns {Array} Tokens with comparison-friendly format
 */
function prepareForComparison(tokens) {
  return tokens.map(token => {
    try {
      // Calculate an overall score
      const score = calculateTokenScore(token);
      
      // Return a simplified object with just the key fields for comparison
      return {
        symbol: token.symbol || 'Unknown',
        name: token.name || 'Unknown Token',
        address: token.address,
        priceUSD: token.priceUSD,
        volume24h: token.volume24h,
        liquidity: token.liquidity,
        priceChange24h: token.priceChange24h || '0',
        holders: token.holders,
        // Include derived metrics if available
        swapsLastHour: token.derived ? token.derived.swapsLastHour : 0,
        volatility: token.derived ? (token.derived.volatility * 100).toFixed(2) : '0',
        holderGrowthRate: token.derived ? token.derived.holderGrowthRate.toFixed(2) : '0',
        // Add the calculated score
        score
      };
    } catch (error) {
      logger.errorWithContext('Error preparing token for comparison', error, { token });
      return null;
    }
  }).filter(token => token !== null); // Remove any tokens that failed processing
}

/**
 * Save comparison results to file
 * @param {Array} comparisonResults - Comparison results to save
 * @returns {Promise<boolean>} Success status
 */
async function saveComparisonResults(comparisonResults) {
  try {
    // Ensure directory exists
    const dir = path.dirname(config.outputPaths.tokenComparison);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write to file
    fs.writeFileSync(
      config.outputPaths.tokenComparison, 
      JSON.stringify(comparisonResults, null, 2)
    );
    
    logger.info(`Saved comparison results for ${comparisonResults.length} tokens to ${config.outputPaths.tokenComparison}`);
    
    return true;
  } catch (error) {
    logger.errorWithContext('Error saving comparison results', error);
    return false;
  }
}

/**
 * Compare multiple tokens
 * @param {Array} tokens - List of tokens to compare
 * @returns {Promise<Array>} Comparison results
 */
async function compareTokens(tokens) {
  try {
    logger.info(`Comparing ${tokens.length} tokens`);
    
    // 1. Get detailed metrics for each token if not already present
    let detailedTokens = tokens;
    
    // Check if tokens already have detailed metrics
    const hasDetailed = tokens.length > 0 && tokens[0].derived;
    
    if (!hasDetailed) {
      logger.debug('Fetching detailed metrics for token comparison');
      detailedTokens = await getDetailedMetrics(tokens);
    }
    
    // 2. Prepare for comparison
    const comparisonResults = prepareForComparison(detailedTokens);
    
    // 3. Sort by score (highest first)
    comparisonResults.sort((a, b) => b.score - a.score);
    
    // 4. Save to file
    await saveComparisonResults(comparisonResults);
    
    return comparisonResults;
  } catch (error) {
    logger.errorWithContext('Error comparing tokens', error);
    return [];
  }
}

/**
 * Generate a human-readable comparison report
 * @param {Array} comparisonResults - Comparison results
 * @returns {string} Formatted comparison report
 */
function generateComparisonReport(comparisonResults) {
  try {
    if (!comparisonResults || comparisonResults.length === 0) {
      return 'No tokens to compare.';
    }
    
    let report = '# Token Comparison Report\n\n';
    
    // Add table header
    report += '| Symbol | Price | 24h Change | Volume | Liquidity | Holders | Score |\n';
    report += '|--------|-------|------------|--------|-----------|---------|-------|\n';
    
    // Add each token
    comparisonResults.forEach(token => {
      report += `| ${token.symbol} | $${token.priceUSD} | ${token.priceChange24h}% | $${token.volume24h} | $${token.liquidity} | ${token.holders} | ${token.score} |\n`;
    });
    
    // Add summary
    report += '\n## Analysis\n\n';
    
    // Get top token
    const topToken = comparisonResults[0];
    report += `**${topToken.symbol}** has the highest overall score of **${topToken.score}** based on volume, liquidity, holder count, and other metrics.\n\n`;
    
    // Compare volume
    const volumeRanking = [...comparisonResults].sort((a, b) => parseFloat(b.volume24h) - parseFloat(a.volume24h));
    report += `**Volume Leaders:**\n`;
    volumeRanking.slice(0, 3).forEach((token, index) => {
      report += `${index + 1}. ${token.symbol}: $${token.volume24h}\n`;
    });
    
    report += '\n';
    
    // Compare liquidity
    const liquidityRanking = [...comparisonResults].sort((a, b) => parseFloat(b.liquidity) - parseFloat(a.liquidity));
    report += `**Liquidity Leaders:**\n`;
    liquidityRanking.slice(0, 3).forEach((token, index) => {
      report += `${index + 1}. ${token.symbol}: $${token.liquidity}\n`;
    });
    
    report += '\n';
    
    // Compare volatility if available
    if (comparisonResults[0].volatility) {
      const volatilityRanking = [...comparisonResults].sort((a, b) => parseFloat(b.volatility) - parseFloat(a.volatility));
      report += `**Highest Volatility:**\n`;
      volatilityRanking.slice(0, 3).forEach((token, index) => {
        report += `${index + 1}. ${token.symbol}: ${token.volatility}%\n`;
      });
    }
    
    return report;
  } catch (error) {
    logger.errorWithContext('Error generating comparison report', error);
    return 'Error generating comparison report.';
  }
}

module.exports = {
  compareTokens,
  calculateTokenScore,
  prepareForComparison,
  generateComparisonReport
};