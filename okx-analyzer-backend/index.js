/**
 * dashboard.js
 * Main dashboard runner for OKC Token Launch Analytics Dashboard
 * This runs the full pipeline automatically (separate from the CLI interface)
 */
const config = require('./config');
const logger = require('./utils/logger');

// Import all modules
const { discoverNewTokens } = require('./modules/tokenDiscovery');
const { getTrendingMemeCoins } = require('./modules/trendingMemeScraper');
const { getDetailedMetrics } = require('./modules/tokenMetrics');
const { generateRecommendations } = require('./modules/swapRecommender');
const { compareTokens } = require('./modules/tokenComparison');
const { filterAndExport } = require('./modules/tokenFilter');
const { exportDashboardData } = require('./modules/exporter');

/**
 * Main dashboard orchestration function
 */
async function runDashboard() {
  try {
    logger.info('🚀 Starting OKC Token Launch Analytics Dashboard');
    
    const startTime = Date.now();
    const dashboardData = {};
    
    // Step 1: Discover new tokens
    logger.info('📡 Step 1: Discovering new tokens...');
    try {
      dashboardData.newTokens = await discoverNewTokens();
      logger.info(`Found ${dashboardData.newTokens.length} new tokens`);
    } catch (error) {
      logger.errorWithContext('Error in token discovery', error);
      dashboardData.newTokens = [];
    }
    
    // Step 2: Get trending meme coins
    logger.info('🔥 Step 2: Fetching trending meme coins...');
    try {
      dashboardData.trendingMemes = await getTrendingMemeCoins();
      logger.info(`Found ${dashboardData.trendingMemes.length} trending meme coins`);
    } catch (error) {
      logger.errorWithContext('Error fetching trending memes', error);
      dashboardData.trendingMemes = [];
    }
    
    // Step 3: Get detailed metrics for all tokens
    logger.info('📊 Step 3: Calculating detailed metrics...');
    try {
      // Combine new tokens and trending memes
      const allTokens = [
        ...(dashboardData.newTokens || []),
        ...(dashboardData.trendingMemes || [])
      ];
      
      // Remove duplicates based on address
      const uniqueTokens = allTokens.filter((token, index, self) => 
        index === self.findIndex(t => t.address === token.address)
      );
      
      dashboardData.detailedMetrics = await getDetailedMetrics(uniqueTokens);
      logger.info(`Analyzed ${dashboardData.detailedMetrics.length} tokens with detailed metrics`);
    } catch (error) {
      logger.errorWithContext('Error calculating detailed metrics', error);
      dashboardData.detailedMetrics = [];
    }
    
    // Step 4: Generate swap recommendations
    logger.info('💡 Step 4: Generating swap recommendations...');
    try {
      const tokensForRecommendations = dashboardData.detailedMetrics.length > 0 
        ? dashboardData.detailedMetrics 
        : [...(dashboardData.newTokens || []), ...(dashboardData.trendingMemes || [])];
        
      dashboardData.recommendations = await generateRecommendations(tokensForRecommendations);
      logger.info(`Generated ${dashboardData.recommendations.length} swap recommendations`);
    } catch (error) {
      logger.errorWithContext('Error generating recommendations', error);
      dashboardData.recommendations = [];
    }
    
    // Step 5: Compare tokens
    logger.info('🔄 Step 5: Comparing tokens...');
    try {
      const tokensForComparison = dashboardData.detailedMetrics.length > 0 
        ? dashboardData.detailedMetrics.slice(0, 20) // Compare top 20
        : [];
        
      if (tokensForComparison.length > 0) {
        dashboardData.comparisonResults = await compareTokens(tokensForComparison);
        logger.info(`Compared ${dashboardData.comparisonResults.length} tokens`);
      } else {
        dashboardData.comparisonResults = [];
        logger.info('No tokens available for comparison');
      }
    } catch (error) {
      logger.errorWithContext('Error comparing tokens', error);
      dashboardData.comparisonResults = [];
    }
    
    // Step 6: Apply filters and export
    logger.info('🎯 Step 6: Filtering and exporting data...');
    try {
      // Apply some example filters
      const filters = {
        minVolume: config.filters?.newToken?.minVolume || 1000,
        minLiquidity: config.filters?.newToken?.minLiquidity || 500,
        maxAge: config.filters?.newToken?.maxAge || (48 * 60 * 60 * 1000) // 48 hours
      };
      
      const allTokensForFiltering = [
        ...(dashboardData.newTokens || []),
        ...(dashboardData.trendingMemes || [])
      ];
      
      if (allTokensForFiltering.length > 0) {
        dashboardData.filteredTokens = await filterAndExport(
          allTokensForFiltering, 
          filters, 
          'volume24h', 
          false // descending order
        );
        logger.info(`Filtered down to ${dashboardData.filteredTokens.length} tokens`);
      } else {
        dashboardData.filteredTokens = [];
      }
    } catch (error) {
      logger.errorWithContext('Error filtering tokens', error);
      dashboardData.filteredTokens = [];
    }
    
    // Step 7: Export all data
    logger.info('💾 Step 7: Exporting dashboard data...');
    try {
      const exportResults = await exportDashboardData(dashboardData);
      if (exportResults.success) {
        logger.info('✅ Dashboard data exported successfully');
        
        // Log export summary
        Object.entries(exportResults.results || {}).forEach(([dataType, result]) => {
          const jsonStatus = result.json ? '✅' : '❌';
          const csvStatus = result.csv ? '✅' : '❌';
          logger.info(`   ${dataType}: JSON ${jsonStatus}, CSV ${csvStatus}`);
        });
      } else {
        logger.errorWithContext('Export failed', new Error(exportResults.error));
      }
    } catch (error) {
      logger.errorWithContext('Error exporting data', error);
    }
    
    // Generate summary
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    logger.info('📈 Dashboard execution completed!');
    logger.info(`⏱️  Total execution time: ${duration} seconds`);
    logger.info('📊 Summary:');
    logger.info(`   - New tokens discovered: ${dashboardData.newTokens?.length || 0}`);
    logger.info(`   - Trending meme coins: ${dashboardData.trendingMemes?.length || 0}`);
    logger.info(`   - Tokens with detailed metrics: ${dashboardData.detailedMetrics?.length || 0}`);
    logger.info(`   - Swap recommendations: ${dashboardData.recommendations?.length || 0}`);
    logger.info(`   - Token comparisons: ${dashboardData.comparisonResults?.length || 0}`);
    logger.info(`   - Filtered tokens: ${dashboardData.filteredTokens?.length || 0}`);
    
    return dashboardData;
    
  } catch (error) {
    logger.errorWithContext('Fatal error in dashboard execution', error);
    throw error;
  }
}

/**
 * Run dashboard in continuous mode (with intervals)
 */
async function runContinuous() {
  logger.info('🔄 Starting dashboard in continuous mode');
  
  const interval = config.dashboard?.discoveryInterval || 15 * 60 * 1000; // 15 minutes
  
  // Initial run
  await runDashboard();
  
  // Set up interval
  setInterval(async () => {
    try {
      logger.info('🔄 Running scheduled dashboard update');
      await runDashboard();
    } catch (error) {
      logger.errorWithContext('Error in scheduled dashboard run', error);
    }
  }, interval);
  
  logger.info(`⏰ Dashboard scheduled to run every ${interval / 60000} minutes`);
}

/**
 * Display dashboard information
 */
function displayInfo() {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                OKC Token Launch Analytics Dashboard              ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  🔍 Discovers new tokens on OKX Chain (OKC)                    ║
║  🔥 Tracks trending meme coins                                  ║
║  📊 Analyzes token metrics and trading activity                 ║
║  💡 Generates swap recommendations                              ║
║  🔄 Compares tokens side-by-side                               ║
║  📁 Exports data in JSON and CSV formats                       ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

Dashboard Runner Commands:
- node dashboard.js          : Run full dashboard once
- node dashboard.js continuous : Run dashboard continuously
- node dashboard.js help     : Show this help

CLI Commands (use index.js):
- node index.js discover     : Discover new tokens
- node index.js trending     : Get trending meme coins  
- node index.js metrics <addr> : Get token metrics
- node index.js compare <addrs> : Compare tokens
- node index.js recommend    : Generate recommendations
- node index.js filter       : Filter tokens
- node index.js export <type> : Export data

Configuration:
- Chain: OKC (Chain ID: ${config.dex?.chainId || 66})
- API Base: ${config.apis?.baseUrl || 'Not configured'}
- Output Directory: ./data/
- Use Real API: ${config.features?.useRealApi ? 'Yes' : 'No'}
- Mock Fallback: ${config.features?.useMockDataOnFailure ? 'Enabled' : 'Disabled'}
`);
}

/**
 * Main execution logic for dashboard runner
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    const command = args[0];
    
    // Display info first
    displayInfo();
    
    switch (command) {
      case 'continuous':
        await runContinuous();
        break;
        
      case 'help':
        // Info already displayed
        process.exit(0);
        break;
        
      default:
        // Single run (default)
        console.log('🚀 Starting full dashboard run...\n');
        await runDashboard();
        console.log('\n✅ Dashboard run completed. Check ./data/ for output files.');
        process.exit(0);
    }
    
  } catch (error) {
    logger.errorWithContext('Fatal error in dashboard execution', error);
    console.error('\n❌ Dashboard execution failed:', error.message);
    console.error('Check logs for detailed error information.');
    process.exit(1);
  }
}

/**
 * Graceful shutdown handling
 */
function setupGracefulShutdown() {
  const cleanup = (signal) => {
    logger.info(`Received ${signal}. Performing graceful shutdown...`);
    process.exit(0);
  };
  
  process.on('SIGINT', () => cleanup('SIGINT'));
  process.on('SIGTERM', () => cleanup('SIGTERM'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.errorWithContext('Uncaught Exception', error);
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    logger.errorWithContext('Unhandled Rejection', new Error(reason), { promise });
    console.error('❌ Unhandled Rejection:', reason);
  });
}

// Setup and run
if (require.main === module) {
  setupGracefulShutdown();
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

// Export functions for use by other modules
module.exports = {
  runDashboard,
  runContinuous,
  displayInfo
};