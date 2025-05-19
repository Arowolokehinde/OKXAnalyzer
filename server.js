/**
 * server.js
 * Main API server for OKC Token Launch Analytics Dashboard
 */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const logger = require('./utils/logger');

// Import modules
const tokenDiscovery = require('./modules/tokenDiscovery');
const trendingMemeScraper = require('./modules/trendingMemeScraper');
const tokenMetrics = require('./modules/tokenMetrics');
const tokenComparison = require('./modules/tokenComparison');
const swapRecommender = require('./modules/swapRecommender');
const tokenFilter = require('./modules/tokenFilter');
const exporter = require('./modules/exporter');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan(config.logging.format, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Data source middleware
app.use((req, res, next) => {
  // Add data source information to response
  res.locals.dataSource = config.features.useRealApi ? 'real' : 'mock';
  next();
});

// Ensure data directory exists
const dataDir = path.dirname(config.outputPaths.newTokens);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// API Routes

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
app.get(`${config.server.apiPrefix}/health`, (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'OKC Token Launch Analytics API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    apiVersion: '1.0.0'
  });
});

/**
 * @route   GET /api/tokens/new
 * @desc    Get newly launched tokens
 * @access  Public
 */
app.get(`${config.server.apiPrefix}/tokens/new`, async (req, res) => {
  try {
    const newTokens = await tokenDiscovery.discoverNewTokens();
    
    res.status(200).json({
      success: true,
      count: newTokens.length,
      data: newTokens,
      source: res.locals.dataSource
    });
  } catch (error) {
    logger.errorWithContext('API Error: Failed to fetch new tokens', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch new tokens',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/tokens/trending
 * @desc    Get trending meme coins
 * @access  Public
 */
app.get(`${config.server.apiPrefix}/tokens/trending`, async (req, res) => {
  try {
    const trendingMemes = await trendingMemeScraper.getTrendingMemeCoins();
    
    res.status(200).json({
      success: true,
      count: trendingMemes.length,
      data: trendingMemes,
      source: res.locals.dataSource
    });
  } catch (error) {
    logger.errorWithContext('API Error: Failed to fetch trending meme coins', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending meme coins',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/tokens/metrics/:address
 * @desc    Get detailed metrics for a specific token
 * @access  Public
 */
app.get(`${config.server.apiPrefix}/tokens/metrics/:address`, async (req, res) => {
  try {
    const { address } = req.params;
    
    // Validate address
    if (!address || address.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token address'
      });
    }
    
    const metrics = await tokenMetrics.getTokenMetrics(address);
    
    if (metrics) {
      res.status(200).json({
        success: true,
        data: metrics,
        source: res.locals.dataSource
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Token metrics not found'
      });
    }
  } catch (error) {
    logger.errorWithContext('API Error: Failed to fetch token metrics', error, {
      address: req.params.address
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch token metrics',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/tokens/compare
 * @desc    Compare multiple tokens
 * @access  Public
 */
app.post(`${config.server.apiPrefix}/tokens/compare`, async (req, res) => {
  try {
    const { tokens } = req.body;
    
    // Validate tokens array
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid tokens array'
      });
    }
    
    const comparisonResults = await tokenComparison.compareTokens(tokens);
    const comparisonReport = tokenComparison.generateComparisonReport(comparisonResults);
    
    res.status(200).json({
      success: true,
      count: comparisonResults.length,
      data: comparisonResults,
      report: comparisonReport,
      source: res.locals.dataSource
    });
  } catch (error) {
    logger.errorWithContext('API Error: Failed to compare tokens', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to compare tokens',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/tokens/filter
 * @desc    Filter tokens based on criteria
 * @access  Public
 */
app.post(`${config.server.apiPrefix}/tokens/filter`, async (req, res) => {
  try {
    const { filters, sortBy, ascending } = req.body;
    
    // Get all tokens first
    const [newTokens, trendingMemes] = await Promise.all([
      tokenDiscovery.discoverNewTokens(),
      trendingMemeScraper.getTrendingMemeCoins()
    ]);
    
    // Combine and deduplicate tokens
    const allTokens = [];
    const addressSet = new Set();
    
    [...newTokens, ...trendingMemes].forEach(token => {
      if (!addressSet.has(token.address)) {
        addressSet.add(token.address);
        allTokens.push(token);
      }
    });
    
    // Apply filters and sort
    const filteredTokens = await tokenFilter.filterAndExport(
      allTokens,
      filters || {},
      sortBy || 'volume24h',
      ascending || false,
      null // Don't export to file
    );
    
    // Get filter summary
    const summary = tokenFilter.getFilterSummary(allTokens, filteredTokens, filters || {});
    
    res.status(200).json({
      success: true,
      count: filteredTokens.length,
      data: filteredTokens,
      summary,
      source: res.locals.dataSource
    });
  } catch (error) {
    logger.errorWithContext('API Error: Failed to filter tokens', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to filter tokens',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/recommendations
 * @desc    Generate token swap recommendations
 * @access  Public
 */
app.post(`${config.server.apiPrefix}/recommendations`, async (req, res) => {
  try {
    const { tokens } = req.body;
    
    // If tokens not provided, use new and trending tokens
    let tokensToAnalyze = tokens;
    
    if (!tokensToAnalyze || !Array.isArray(tokensToAnalyze) || tokensToAnalyze.length === 0) {
      const [newTokens, trendingMemes] = await Promise.all([
        tokenDiscovery.discoverNewTokens(),
        trendingMemeScraper.getTrendingMemeCoins()
      ]);
      
      // Combine and deduplicate tokens
      tokensToAnalyze = [];
      const addressSet = new Set();
      
      [...newTokens, ...trendingMemes].forEach(token => {
        if (!addressSet.has(token.address)) {
          addressSet.add(token.address);
          tokensToAnalyze.push(token);
        }
      });
    }
    
    // Generate recommendations
    const recommendations = await swapRecommender.generateRecommendations(tokensToAnalyze);
    const recommendationReport = swapRecommender.generateRecommendationReport(recommendations);
    
    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
      report: recommendationReport,
      source: res.locals.dataSource
    });
  } catch (error) {
    logger.errorWithContext('API Error: Failed to generate recommendations', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/dashboard
 * @desc    Get all dashboard data in one call
 * @access  Public
 */
app.get(`${config.server.apiPrefix}/dashboard`, async (req, res) => {
  try {
    // Fetch all data concurrently
    const [newTokens, trendingMemes] = await Promise.all([
      tokenDiscovery.discoverNewTokens(),
      trendingMemeScraper.getTrendingMemeCoins()
    ]);
    
    // Combine tokens for comparison and recommendations
    const combinedTokens = [];
    const addressSet = new Set();
    
    // Take top 5 from each category
    [...newTokens.slice(0, 5), ...trendingMemes.slice(0, 5)].forEach(token => {
      if (!addressSet.has(token.address)) {
        addressSet.add(token.address);
        combinedTokens.push(token);
      }
    });
    
    // Get detailed metrics
    const tokensWithMetrics = await tokenMetrics.getDetailedMetrics(combinedTokens);
    
    // Generate comparison and recommendations
    const [comparisonResults, recommendations] = await Promise.all([
      tokenComparison.compareTokens(tokensWithMetrics),
      swapRecommender.generateRecommendations(tokensWithMetrics)
    ]);
    
    // Find top gainer
    const topGainer = trendingMemes.length > 0 
      ? trendingMemes.reduce((max, token) => 
          parseFloat(token.priceChange24h) > parseFloat(max.priceChange24h) ? token : max
        , trendingMemes[0]) 
      : null;
    
    // Return all data
    res.status(200).json({
      success: true,
      data: {
        newTokens,
        trendingMemes,
        comparisonResults,
        recommendations,
        topToken: newTokens.length > 0 ? newTokens[0] : null,
        topGainer: topGainer,
        stats: {
          totalNewTokens: newTokens.length,
          totalTrendingMemes: trendingMemes.length,
          averageVolume: calculateAverageVolume(newTokens),
          averagePrice: calculateAveragePrice(newTokens)
        }
      },
      source: res.locals.dataSource
    });
  } catch (error) {
    logger.errorWithContext('API Error: Failed to fetch dashboard data', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/export/:type
 * @desc    Export data to file
 * @access  Public
 */
app.get(`${config.server.apiPrefix}/export/:type`, async (req, res) => {
  try {
    const { type } = req.params;
    const { format } = req.query;
    
    let data;
    let exportResult;
    
    // Get data based on type
    switch (type) {
      case 'new-tokens':
        data = await tokenDiscovery.discoverNewTokens();
        exportResult = await exporter.exportToMultipleFormats('newTokens', data);
        break;
      
      case 'trending-memes':
        data = await trendingMemeScraper.getTrendingMemeCoins();
        exportResult = await exporter.exportToMultipleFormats('trendingMemes', data);
        break;
      
      case 'comparisons':
        // Get tokens first
        const tokens = await tokenDiscovery.discoverNewTokens();
        // Generate comparison results
        data = await tokenComparison.compareTokens(tokens.slice(0, 10)); // Top 10 tokens
        exportResult = await exporter.exportToMultipleFormats('comparisonResults', data);
        break;
      
      case 'recommendations':
        // Get tokens first
        const tokensForRecs = await tokenDiscovery.discoverNewTokens();
        // Generate recommendations
        data = await swapRecommender.generateRecommendations(tokensForRecs.slice(0, 10)); // Top 10 tokens
        exportResult = await exporter.exportToMultipleFormats('recommendations', data);
        break;
      
      case 'dashboard':
        // Get dashboard data
        const newTokens = await tokenDiscovery.discoverNewTokens();
        const trendingMemes = await trendingMemeScraper.getTrendingMemeCoins();
        const metrics = await tokenMetrics.getDetailedMetrics(newTokens.slice(0, 5));
        const compResults = await tokenComparison.compareTokens(newTokens.slice(0, 10));
        const recommendations = await swapRecommender.generateRecommendations(newTokens.slice(0, 10));
        
        // Export all dashboard data
        exportResult = await exporter.exportDashboardData({
          newTokens,
          trendingMemes,
          detailedMetrics: metrics,
          comparisonResults: compResults,
          recommendations
        });
        break;
      
      default:
        return res.status(400).json({
          success: false,
          error: `Unknown export type: ${type}`
        });
    }
    
    // Return result based on requested format
    if (format === 'json' || format === 'csv') {
      // If specific format requested, return info about that format
      res.status(200).json({
        success: true,
        message: `Data exported as ${format.toUpperCase()}`,
        exportResult: exportResult[format]
      });
    } else {
      // Otherwise return info about all exported formats
      res.status(200).json({
        success: true,
        message: `Data exported successfully`,
        exportResult
      });
    }
  } catch (error) {
    logger.errorWithContext('API Error: Failed to export data', error, {
      type: req.params.type
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to export data',
      message: error.message
    });
  }
});

/**
 * Calculate average volume for tokens
 * @param {Array} tokens - List of tokens
 * @returns {number} Average volume
 */
function calculateAverageVolume(tokens) {
  if (!tokens || tokens.length === 0) return 0;
  
  const total = tokens.reduce((sum, token) => sum + parseFloat(token.volume24h), 0);
  return Math.round(total / tokens.length);
}

/**
 * Calculate average price for tokens
 * @param {Array} tokens - List of tokens
 * @returns {number} Average price
 */
function calculateAveragePrice(tokens) {
  if (!tokens || tokens.length === 0) return 0;
  
  const total = tokens.reduce((sum, token) => sum + parseFloat(token.priceUSD), 0);
  return total / tokens.length;
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Resource not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.errorWithContext('Server error', err, {
    path: req.path,
    method: req.method
  });
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// Start the server
app.listen(PORT, () => {
  logger.info(`🚀 OKC Token Launch Analytics API running on port ${PORT}`);
  logger.info(`Using ${config.features.useRealApi ? 'real' : 'mock'} API data`);
});

module.exports = app; // For testing