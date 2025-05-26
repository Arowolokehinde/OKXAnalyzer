/**
 * exporter.js
 * Module for exporting token data in various formats (JSON, CSV)
 */
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Ensure output directory exists
 * @param {string} outputPath - File path
 */
function ensureDirectoryExists(outputPath) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Export data to JSON file
 * @param {Object|Array} data - Data to export
 * @param {string} outputPath - Output file path
 * @returns {Promise<boolean>} Success status
 */
async function exportToJson(data, outputPath) {
  try {
    ensureDirectoryExists(outputPath);
    
    fs.writeFileSync(
      outputPath,
      JSON.stringify(data, null, 2)
    );
    
    logger.info(`Exported data to JSON file: ${outputPath}`);
    return true;
  } catch (error) {
    logger.errorWithContext('Error exporting to JSON', error, { outputPath });
    return false;
  }
}

/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {Array} header - CSV header configuration
 * @param {string} outputPath - Output file path
 * @returns {Promise<boolean>} Success status
 */
async function exportToCsv(data, header, outputPath) {
  try {
    ensureDirectoryExists(outputPath);
    
    const csvWriter = createCsvWriter({
      path: outputPath,
      header
    });
    
    await csvWriter.writeRecords(data);
    
    logger.info(`Exported data to CSV file: ${outputPath}`);
    return true;
  } catch (error) {
    logger.errorWithContext('Error exporting to CSV', error, { outputPath });
    return false;
  }
}

/**
 * Export new tokens to JSON file
 * @param {Array} tokens - List of new tokens
 * @returns {Promise<boolean>} Success status
 */
async function exportNewTokens(tokens) {
  return exportToJson(tokens, config.outputPaths.newTokens);
}

/**
 * Export trending meme coins to JSON file
 * @param {Array} memeCoins - List of trending meme coins
 * @returns {Promise<boolean>} Success status
 */
async function exportTrendingMemes(memeCoins) {
  return exportToJson(memeCoins, config.outputPaths.trendingMemes);
}

/**
 * Export trending meme coins to CSV file
 * @param {Array} memeCoins - List of trending meme coins
 * @returns {Promise<boolean>} Success status
 */
async function exportTrendingMemesToCsv(memeCoins) {
  const header = [
    { id: 'symbol', title: 'Symbol' },
    { id: 'name', title: 'Name' },
    { id: 'address', title: 'Contract Address' },
    { id: 'priceUSD', title: 'Price (USD)' },
    { id: 'priceChange24h', title: 'Price Change 24h (%)' },
    { id: 'volume24h', title: 'Volume 24h (USD)' },
    { id: 'liquidity', title: 'Liquidity (USD)' },
    { id: 'holders', title: 'Holders' },
    { id: 'listingTime', title: 'Listing Time' }
  ];
  
  const csvPath = config.outputPaths.trendingMemes.replace('.json', '.csv');
  return exportToCsv(memeCoins, header, csvPath);
}

/**
 * Export detailed token metrics to JSON file
 * @param {Array} metrics - List of token metrics
 * @returns {Promise<boolean>} Success status
 */
async function exportDetailedMetrics(metrics) {
  return exportToJson(metrics, config.outputPaths.tokenMetrics);
}

/**
 * Export token comparison results to CSV file
 * @param {Array} comparisonResults - Token comparison results
 * @returns {Promise<boolean>} Success status
 */
async function exportComparisonResults(comparisonResults) {
  const header = [
    { id: 'symbol', title: 'Symbol' },
    { id: 'name', title: 'Name' },
    { id: 'volume24h', title: 'Volume 24h (USD)' },
    { id: 'liquidity', title: 'Liquidity (USD)' },
    { id: 'priceUSD', title: 'Price (USD)' },
    { id: 'priceChange24h', title: 'Price Change 24h (%)' },
    { id: 'holders', title: 'Holders' },
    { id: 'swapsLastHour', title: 'Swaps Last Hour' },
    { id: 'volatility', title: 'Volatility (%)' },
    { id: 'holderGrowthRate', title: 'Holder Growth Rate (per hour)' },
    { id: 'score', title: 'Overall Score' }
  ];
  
  return exportToCsv(comparisonResults, header, config.outputPaths.tokenComparison);
}

/**
 * Export filtered tokens to CSV
 * @param {Array} filteredTokens - List of filtered tokens
 * @param {string} outputPath - Custom output path (optional)
 * @returns {Promise<boolean>} Success status
 */
async function exportFilteredTokens(filteredTokens, outputPath = null) {
  const header = [
    { id: 'symbol', title: 'Symbol' },
    { id: 'name', title: 'Name' },
    { id: 'address', title: 'Contract Address' },
    { id: 'priceUSD', title: 'Price (USD)' },
    { id: 'volume24h', title: 'Volume 24h (USD)' },
    { id: 'liquidity', title: 'Liquidity (USD)' },
    { id: 'holders', title: 'Holders' },
    { id: 'ageDisplay', title: 'Age' }
  ];
  
  const filePath = outputPath || config.outputPaths.filteredTokens;
  return exportToCsv(filteredTokens, header, filePath);
}

/**
 * Export recommendations to JSON
 * @param {Array} recommendations - List of recommendations
 * @returns {Promise<boolean>} Success status
 */
async function exportRecommendations(recommendations) {
  return exportToJson(recommendations, config.outputPaths.recommendations);
}

/**
 * Export recommendations to CSV
 * @param {Array} recommendations - List of recommendations
 * @returns {Promise<boolean>} Success status
 */
async function exportRecommendationsToCsv(recommendations) {
  const header = [
    { id: 'symbol', title: 'Symbol' },
    { id: 'name', title: 'Name' },
    { id: 'score', title: 'Score' },
    { id: 'recommendation', title: 'Recommendation' }
  ];
  
  // Simplify reasons for CSV export
  const simplifiedRecommendations = recommendations.map(rec => ({
    ...rec,
    reasons: rec.reasons.join('; ')
  }));
  
  const csvPath = config.outputPaths.recommendations.replace('.json', '.csv');
  return exportToCsv(simplifiedRecommendations, header, csvPath);
}

/**
 * Export data to multiple formats
 * @param {string} dataType - Type of data being exported
 * @param {Array|Object} data - Data to export
 * @returns {Promise<Object>} Results of export operations
 */
async function exportToMultipleFormats(dataType, data) {
  try {
    const results = {
      json: false,
      csv: false
    };
    
    switch (dataType) {
      case 'newTokens':
        results.json = await exportNewTokens(data);
        break;
      
      case 'trendingMemes':
        results.json = await exportTrendingMemes(data);
        results.csv = await exportTrendingMemesToCsv(data);
        break;
      
      case 'tokenMetrics':
        results.json = await exportDetailedMetrics(data);
        break;
      
      case 'comparisonResults':
        results.json = await exportToJson(data, config.outputPaths.tokenComparison.replace('.csv', '.json'));
        results.csv = await exportComparisonResults(data);
        break;
      
      case 'filteredTokens':
        results.json = await exportToJson(data, config.outputPaths.filteredTokens.replace('.csv', '.json'));
        results.csv = await exportFilteredTokens(data);
        break;
      
      case 'recommendations':
        results.json = await exportRecommendations(data);
        results.csv = await exportRecommendationsToCsv(data);
        break;
      
      default:
        logger.warn(`Unknown data type for export: ${dataType}`);
        break;
    }
    
    return results;
  } catch (error) {
    logger.errorWithContext('Error exporting to multiple formats', error, { dataType });
    return { json: false, csv: false };
  }
}

/**
 * Export dashboard data (all data types)
 * @param {Object} dashboardData - Complete dashboard data
 * @returns {Promise<Object>} Results of export operations
 */
async function exportDashboardData(dashboardData) {
  try {
    const results = {};
    
    // Export each data type if available
    if (dashboardData.newTokens) {
      results.newTokens = await exportToMultipleFormats('newTokens', dashboardData.newTokens);
    }
    
    if (dashboardData.trendingMemes) {
      results.trendingMemes = await exportToMultipleFormats('trendingMemes', dashboardData.trendingMemes);
    }
    
    if (dashboardData.detailedMetrics) {
      results.tokenMetrics = await exportToMultipleFormats('tokenMetrics', dashboardData.detailedMetrics);
    }
    
    if (dashboardData.comparisonResults) {
      results.comparisonResults = await exportToMultipleFormats('comparisonResults', dashboardData.comparisonResults);
    }
    
    if (dashboardData.recommendations) {
      results.recommendations = await exportToMultipleFormats('recommendations', dashboardData.recommendations);
    }
    
    // Export dashboard summary
    const summary = {
      exportTime: new Date().toISOString(),
      dataTypes: Object.keys(results),
      counts: {
        newTokens: dashboardData.newTokens?.length || 0,
        trendingMemes: dashboardData.trendingMemes?.length || 0,
        tokenMetrics: dashboardData.detailedMetrics?.length || 0,
        comparisonResults: dashboardData.comparisonResults?.length || 0,
        recommendations: dashboardData.recommendations?.length || 0
      }
    };
    
    await exportToJson(summary, path.join(path.dirname(config.outputPaths.newTokens), 'dashboard_summary.json'));
    
    return {
      success: true,
      results
    };
  } catch (error) {
    logger.errorWithContext('Error exporting dashboard data', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  exportNewTokens,
  exportTrendingMemes,
  exportTrendingMemesToCsv,
  exportDetailedMetrics,
  exportComparisonResults,
  exportFilteredTokens,
  exportRecommendations,
  exportRecommendationsToCsv,
  exportToMultipleFormats,
  exportDashboardData,
  exportToJson,
  exportToCsv
};