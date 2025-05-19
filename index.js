#!/usr/bin/env node
/**
 * index.js
 * Command-line interface for OKC Token Launch Analytics Dashboard
 */
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

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

// Ensure data directory exists
const dataDir = path.dirname(config.outputPaths.newTokens);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Display command help
 */
function displayHelp() {
  console.log(`
OKC Token Launch Analytics Dashboard CLI
=======================================

Usage: node index.js <command> [options]

Commands:
  discover                         Discover new token launches on OKC
  trending                         Get trending meme coins
  metrics <address>                Get detailed metrics for a specific token
  compare <address1,address2,...>  Compare multiple tokens
  recommend                        Generate swap recommendations
  filter [options]                 Filter tokens based on criteria
  export <type>                    Export data to files
  help                             Display this help message

Options for 'filter':
  --min-volume <value>     Minimum 24h volume (USD)
  --max-volume <value>     Maximum 24h volume (USD)
  --min-liquidity <value>  Minimum liquidity (USD)
  --max-liquidity <value>  Maximum liquidity (USD)
  --min-holders <value>    Minimum holder count
  --max-age <hours>        Maximum age in hours
  --meme-only              Only include meme coins
  --sort-by <field>        Field to sort by (volume24h, liquidity, holders, etc.)
  --ascending              Sort in ascending order (default: descending)

Options for 'export':
  --format <json|csv>      Export format (default: both)

Examples:
  node index.js discover
  node index.js trending
  node index.js metrics 0x1234567890abcdef1234567890abcdef12345678
  node index.js compare 0x1234,0x5678
  node index.js filter --min-volume 5000 --min-liquidity 1000 --max-age 24
  node index.js recommend
  node index.js export dashboard
  `);
}

/**
 * Discover new tokens
 */
async function discoverTokens() {
  try {
    console.log('Discovering new tokens...');
    
    const newTokens = await tokenDiscovery.discoverNewTokens();
    
    console.log(`\nDiscovered ${newTokens.length} new tokens:`);
    console.table(newTokens.map(token => ({
      Symbol: token.symbol,
      Name: token.name,
      Price: `$${token.priceUSD}`,
      Volume: `$${token.volume24h}`,
      Liquidity: `$${token.liquidity}`,
      Holders: token.holders
    })));
    
    console.log(`\nTokens saved to: ${config.outputPaths.newTokens}`);
  } catch (error) {
    console.error('Error discovering tokens:', error);
  }
}

/**
 * Get trending meme coins
 */
async function getTrendingMemes() {
  try {
    console.log('Getting trending meme coins...');
    
    const trendingMemes = await trendingMemeScraper.getTrendingMemeCoins();
    
    console.log(`\nFound ${trendingMemes.length} trending meme coins:`);
    console.table(trendingMemes.map(token => ({
      Symbol: token.symbol,
      Name: token.name,
      Price: `$${token.priceUSD}`,
      'Change 24h': `${token.priceChange24h}%`,
      Volume: `$${token.volume24h}`,
      Liquidity: `$${token.liquidity}`,
      Holders: token.holders
    })));
    
    console.log(`\nMeme coins saved to: ${config.outputPaths.trendingMemes}`);
  } catch (error) {
    console.error('Error getting trending meme coins:', error);
  }
}

/**
 * Get detailed metrics for a token
 * @param {string} address - Token address
 */
async function getTokenMetricsForAddress(address) {
  try {
    if (!address) {
      console.error('Error: Token address is required');
      return;
    }
    
    console.log(`Getting detailed metrics for token ${address}...`);
    
    const metrics = await tokenMetrics.getTokenMetrics(address);
    
    if (!metrics) {
      console.error(`No metrics found for token ${address}`);
      return;
    }
    
    console.log('\nToken Info:');
    console.log(`Symbol: ${metrics.symbol || 'Unknown'}`);
    console.log(`Name: ${metrics.name || 'Unknown'}`);
    console.log(`Address: ${metrics.address}`);
    console.log(`Price: $${metrics.priceUSD}`);
    console.log(`24h Volume: $${metrics.volume24h}`);
    console.log(`Liquidity: $${metrics.liquidity}`);
    console.log(`Holders: ${metrics.holders}`);
    console.log(`Market Cap: $${metrics.marketCap || 'N/A'}`);
    console.log(`Total Supply: ${metrics.totalSupply || 'N/A'}`);
    console.log(`Price Change 1h: ${metrics.priceChange1h || '0'}%`);
    console.log(`Price Change 24h: ${metrics.priceChange24h || '0'}%`);
    
    if (metrics.derived) {
      console.log('\nDerived Metrics:');
      console.log(`Swaps Last Hour: ${metrics.derived.swapsLastHour}`);
      console.log(`Average Swap Size: $${metrics.derived.avgSwapSize.toFixed(2)}`);
      console.log(`Volatility: ${(metrics.derived.volatility * 100).toFixed(2)}%`);
      console.log(`Holder Growth Rate: ${metrics.derived.holderGrowthRate.toFixed(2)} holders/hour`);
    }
    
    if (metrics.recentSwaps && metrics.recentSwaps.length > 0) {
      console.log('\nRecent Swaps:');
      console.table(metrics.recentSwaps.slice(0, 5).map(swap => ({
        Time: new Date(swap.timestamp).toLocaleTimeString(),
        Type: swap.type,
        Amount: `$${swap.amountUSD}`,
        Price: `$${swap.priceUSD}`
      })));
      console.log(`... and ${metrics.recentSwaps.length - 5} more swaps`);
    }
  } catch (error) {
    console.error('Error getting token metrics:', error);
  }
}

/**
 * Compare multiple tokens
 * @param {string} addressList - Comma-separated list of token addresses
 */
async function compareTokens(addressList) {
  try {
    if (!addressList) {
      console.error('Error: Token addresses are required (comma-separated)');
      return;
    }
    
    const addresses = addressList.split(',');
    
    console.log(`Comparing ${addresses.length} tokens...`);
    
    // Create token objects for comparison
    const tokensToCompare = addresses.map(address => ({
      address: address.trim()
    }));
    
    const comparisonResults = await tokenComparison.compareTokens(tokensToCompare);
    
    if (comparisonResults.length === 0) {
      console.error('No comparison results generated');
      return;
    }
    
    console.log('\nToken Comparison Results:');
    console.table(comparisonResults.map(token => ({
      Symbol: token.symbol,
      Price: `$${token.priceUSD}`,
      'Volume 24h': `$${token.volume24h}`,
      Liquidity: `$${token.liquidity}`,
      'Price Change': `${token.priceChange24h}%`,
      Holders: token.holders,
      Volatility: `${token.volatility}%`,
      Score: token.score
    })));
    
    console.log('\nComparison Report:');
    console.log(tokenComparison.generateComparisonReport(comparisonResults));
    
    console.log(`\nComparison results saved to: ${config.outputPaths.tokenComparison}`);
  } catch (error) {
    console.error('Error comparing tokens:', error);
  }
}

/**
 * Filter tokens based on criteria
 * @param {Array} filterArgs - Filter arguments
 */
async function filterTokens(filterArgs) {
  try {
    console.log('Filtering tokens...');
    
    // Parse filter options
    const filters = {};
    const options = { sortBy: 'volume24h', ascending: false };
    
    for (let i = 0; i < filterArgs.length; i++) {
      const arg = filterArgs[i];
      
      switch (arg) {
        case '--min-volume':
          filters.minVolume = parseFloat(filterArgs[++i]);
          break;
        
        case '--max-volume':
          filters.maxVolume = parseFloat(filterArgs[++i]);
          break;
        
        case '--min-liquidity':
          filters.minLiquidity = parseFloat(filterArgs[++i]);
          break;
        
        case '--max-liquidity':
          filters.maxLiquidity = parseFloat(filterArgs[++i]);
          break;
        
        case '--min-holders':
          filters.minHolders = parseInt(filterArgs[++i]);
          break;
        
        case '--max-age':
          filters.maxAge = parseInt(filterArgs[++i]) * 60 * 60 * 1000; // Convert hours to ms
          break;
        
        case '--meme-only':
          filters.memeOnly = true;
          break;
        
        case '--sort-by':
          options.sortBy = filterArgs[++i];
          break;
        
        case '--ascending':
          options.ascending = true;
          break;
      }
    }
    
    // Get all tokens
    const [newTokens, trendingMemes] = await Promise.all([
      tokenDiscovery.discoverNewTokens(),
      trendingMemeScraper.getTrendingMemeCoins()
    ]);
    
    // Combine tokens
    const allTokens = [];
    const addressSet = new Set();
    
    [...newTokens, ...trendingMemes].forEach(token => {
      if (!addressSet.has(token.address)) {
        addressSet.add(token.address);
        allTokens.push(token);
      }
    });
    
    console.log(`Total tokens before filtering: ${allTokens.length}`);
    
    // Apply filters
    const filteredTokens = await tokenFilter.filterAndExport(
      allTokens,
      filters,
      options.sortBy,
      options.ascending
    );
    
    console.log(`\nMatched ${filteredTokens.length} tokens after filtering:`);
    console.table(filteredTokens.slice(0, 10).map(token => ({
      Symbol: token.symbol,
      Name: token.name,
      Price: `$${token.priceUSD}`,
      Volume: `$${token.volume24h}`,
      Liquidity: `$${token.liquidity}`,
      Holders: token.holders,
      Age: token.ageDisplay
    })));
    
    if (filteredTokens.length > 10) {
      console.log(`... and ${filteredTokens.length - 10} more tokens`);
    }
    
    // Log filter summary
    const summary = tokenFilter.getFilterSummary(allTokens, filteredTokens, filters);
    console.log('\nFilter Summary:');
    console.log(`- Total tokens: ${summary.totalTokens}`);
    console.log(`- Filtered tokens: ${summary.filteredTokens}`);
    console.log(`- Rejected tokens: ${summary.rejectedTokens} (${summary.rejectionRate})`);
    console.log(`- Filters applied: ${summary.filtersApplied.join(', ') || 'none'}`);
    
    console.log(`\nFiltered tokens saved to: ${config.outputPaths.filteredTokens}`);
  } catch (error) {
    console.error('Error filtering tokens:', error);
  }
}

/**
 * Generate swap recommendations
 */
async function generateRecommendations() {
  try {
    console.log('Generating swap recommendations...');
    
    // Get tokens to analyze
    const [newTokens, trendingMemes] = await Promise.all([
      tokenDiscovery.discoverNewTokens(),
      trendingMemeScraper.getTrendingMemeCoins()
    ]);
    
    // Combine tokens
    const tokensToAnalyze = [];
    const addressSet = new Set();
    
    [...newTokens, ...trendingMemes].forEach(token => {
      if (!addressSet.has(token.address)) {
        addressSet.add(token.address);
        tokensToAnalyze.push(token);
      }
    });
    
    // Generate recommendations
    const recommendations = await swapRecommender.generateRecommendations(tokensToAnalyze);
    
    console.log(`\nGenerated ${recommendations.length} swap recommendations:`);
    console.table(recommendations.map(rec => ({
      Symbol: rec.symbol,
      Name: rec.name,
      Score: rec.score,
      Recommendation: rec.recommendation,
      Reasons: rec.reasons.length > 0 ? rec.reasons[0] : ''
    })));
    
    console.log('\nDetailed Recommendation Report:');
    console.log(swapRecommender.generateRecommendationReport(recommendations));
    
    console.log(`\nRecommendations saved to: ${config.outputPaths.recommendations}`);
  } catch (error) {
    console.error('Error generating recommendations:', error);
  }
}

/**
 * Export data to files
 * @param {string} type - Type of data to export
 * @param {Array} exportArgs - Export arguments
 */
async function exportData(type, exportArgs) {
  try {
    if (!type) {
      console.error('Error: Export type is required');
      return;
    }
    
    // Parse export options
    let format = 'both';
    
    for (let i = 0; i < exportArgs.length; i++) {
      const arg = exportArgs[i];
      
      if (arg === '--format' && i + 1 < exportArgs.length) {
        format = exportArgs[++i];
      }
    }
    
    console.log(`Exporting ${type} data in ${format} format...`);
    
    let exportResult;
    
    switch (type) {
      case 'new-tokens':
      case 'newtokens':
        const newTokens = await tokenDiscovery.discoverNewTokens();
        exportResult = await exporter.exportToMultipleFormats('newTokens', newTokens);
        break;
      
      case 'trending-memes':
      case 'trendingmemes':
        const trendingMemes = await trendingMemeScraper.getTrendingMemeCoins();
        exportResult = await exporter.exportToMultipleFormats('trendingMemes', trendingMemes);
        break;
      
      case 'comparisons':
      case 'comparison':
        const tokens = await tokenDiscovery.discoverNewTokens();
        const compResults = await tokenComparison.compareTokens(tokens.slice(0, 10));
        exportResult = await exporter.exportToMultipleFormats('comparisonResults', compResults);
        break;
      
      case 'recommendations':
      case 'recommendation':
        const tokensForRecs = await tokenDiscovery.discoverNewTokens();
        const recommendations = await swapRecommender.generateRecommendations(tokensForRecs.slice(0, 10));
        exportResult = await exporter.exportToMultipleFormats('recommendations', recommendations);
        break;
      
      case 'dashboard':
      case 'all':
        // Get dashboard data
        const allNewTokens = await tokenDiscovery.discoverNewTokens();
        const allTrendingMemes = await trendingMemeScraper.getTrendingMemeCoins();
        const metrics = await tokenMetrics.getDetailedMetrics(allNewTokens.slice(0, 5));
        const allCompResults = await tokenComparison.compareTokens(allNewTokens.slice(0, 10));
        const allRecommendations = await swapRecommender.generateRecommendations(allNewTokens.slice(0, 10));
        
        // Export all dashboard data
        exportResult = await exporter.exportDashboardData({
          newTokens: allNewTokens,
          trendingMemes: allTrendingMemes,
          detailedMetrics: metrics,
          comparisonResults: allCompResults,
          recommendations: allRecommendations
        });
        break;
      
      default:
        console.error(`Unknown export type: ${type}`);
        return;
    }
    
    console.log('\nExport Results:');
    
    if (exportResult.json) {
      console.log('✓ JSON export successful');
    }
    
    if (exportResult.csv) {
      console.log('✓ CSV export successful');
    }
    
    console.log('\nFiles saved to data directory');
  } catch (error) {
    console.error('Error exporting data:', error);
  }
}

/**
 * Execute a command
 */
async function executeCommand() {
  try {
    if (!command || command === 'help' || command === '--help' || command === '-h') {
      displayHelp();
      return;
    }
    
    switch (command) {
      case 'discover':
        await discoverTokens();
        break;
      
      case 'trending':
        await getTrendingMemes();
        break;
      
      case 'metrics':
        await getTokenMetricsForAddress(args[1]);
        break;
      
      case 'compare':
        await compareTokens(args[1]);
        break;
      
      case 'filter':
        await filterTokens(args.slice(1));
        break;
      
      case 'recommend':
        await generateRecommendations();
        break;
      
      case 'export':
        await exportData(args[1], args.slice(2));
        break;
      
      default:
        console.error(`Unknown command: ${command}`);
        displayHelp();
        break;
    }
  } catch (error) {
    console.error('Error executing command:', error);
  }
}

// Run the CLI
executeCommand();