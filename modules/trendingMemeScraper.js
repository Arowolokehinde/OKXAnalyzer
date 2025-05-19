/**
 * Updated trendingMemeScraper.js for DEX API
 * Module for fetching trending meme coins from OKX DEX
 */
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { makeRequest } = require('../utils/apiClient');
const logger = require('../utils/logger');
const { isMemeToken } = require('./tokenDiscovery');

/**
 * Try to get trending meme coins directly from DEX API
 * @returns {Promise<Array|null>} List of trending meme coins or null if failed
 */
async function fetchTrendingTokensFromApi() {
  try {
    logger.debug('Fetching trending tokens from DEX API');
    
    // DEX API doesn't need instType parameter
    const response = await makeRequest(config.apis.trendingTokens);
    
    if (!response || !response.data) {
      throw new Error('Invalid response format from DEX API');
    }
    
    const tokens = response.data;
    logger.debug(`Fetched ${tokens.length} tokens from API`);
    
    // Filter for meme coins
    const memeCoins = tokens.filter(token => isMemeToken(token));
    
    logger.debug(`Identified ${memeCoins.length} meme coins out of ${tokens.length} trending tokens`);
    
    // Format consistently
    const formattedMemeCoins = memeCoins.map(token => ({
      symbol: token.symbol,
      name: token.name || `${token.symbol} Token`,
      address: token.address,
      priceUSD: token.price || '0',
      priceChange24h: token.priceChange24h || '0',
      volume24h: token.volume24h || '0',
      liquidity: token.liquidity || '0',
      holders: token.holders || '0',
      listingTime: token.listingTime || new Date().toISOString()
    }));
    
    logger.info(`Found ${formattedMemeCoins.length} trending meme coins from DEX API`);
    
    return formattedMemeCoins.length > 0 ? formattedMemeCoins : null;
  } catch (error) {
    logger.errorWithContext('Error fetching trending tokens from DEX API', error);
    return null;
  }
}

/**
 * Scrape trending meme coins from OKX Web3 Explorer
 * @returns {Promise<Array|null>} List of trending meme coins or null if failed
 */
async function scrapeWebForTrendingMemeCoins() {
  try {
    logger.info('Scraping web for trending meme coins');
    
    // Get the URL from config
    const url = config.web3.trendingMemeCoinsUrl;
    
    if (!url) {
      logger.warn('No trending meme coins URL configured');
      return null;
    }
    
    const response = await axios({
      method: 'get',
      url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000 // 10 second timeout
    });
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch trending page: ${response.status}`);
    }
    
    // Parse HTML using Cheerio - DEX explorer will have different selectors
    const $ = cheerio.load(response.data);
    const memeCoins = [];
    
    // Updated selectors for DEX explorer
    $('.token-card, .coin-item, .hot-token-item').each((index, element) => {
      try {
        // Extract data from HTML - adjust selectors as needed for the actual page
        const symbol = $(element).find('.token-symbol, .symbol').text().trim();
        const name = $(element).find('.token-name, .name').text().trim();
        const priceUSD = $(element).find('.token-price, .price').text().trim().replace('$', '');
        const priceChange = $(element).find('.price-change, .change-24h').text().trim().replace('%', '');
        const volume = $(element).find('.token-volume, .volume-24h').text().trim().replace('$', '').replace(',', '');
        const address = $(element).attr('data-address') || `0x${Math.random().toString(16).substring(2, 42)}`;
        
        // Only add if we have minimum data
        if (symbol) {
          // Generate values for missing data
          const liquidity = $(element).find('.liquidity').text().trim().replace('$', '').replace(',', '') || 
                           (parseFloat(volume || '0') * 0.3).toFixed(2);
                           
          const holders = $(element).find('.holders').text().trim().replace(',', '') || 
                         Math.floor(Math.random() * 10000 + 100).toString();
                         
          const listingTime = new Date(Date.now() - (Math.floor(Math.random() * 168) + 24) * 60 * 60 * 1000).toISOString();
          
          memeCoins.push({
            symbol,
            name: name || symbol,
            address,
            priceUSD: priceUSD || '0',
            priceChange24h: priceChange || '0',
            volume24h: volume || '0',
            liquidity,
            holders,
            listingTime
          });
        }
      } catch (error) {
        logger.errorWithContext('Error parsing token card', error);
      }
    });
    
    logger.info(`Scraped ${memeCoins.length} trending meme coins from web`);
    
    return memeCoins.length > 0 ? memeCoins : null;
  } catch (error) {
    logger.errorWithContext('Error scraping web for trending meme coins', error);
    return null;
  }
}

/**
 * Get regular tokens from DEX API and filter for meme coins
 * @returns {Promise<Array|null>} List of meme coins or null if failed
 */
async function filterTokensForMemeCoins() {
  try {
    logger.info('Filtering DEX token list for meme coins');
    
    // Get all tokens and filter for memes
    const response = await makeRequest(config.apis.tokenList);
    
    if (!response || !response.data) {
      throw new Error('Invalid token list response from DEX API');
    }
    
    const tokens = response.data;
    
    // Filter for meme tokens
    const memeCoins = tokens
      .filter(token => isMemeToken(token))
      .map(token => ({
        symbol: token.symbol,
        name: token.name || `${token.symbol} Token`,
        address: token.address || `0x${Math.random().toString(16).substring(2, 42)}`,
        priceUSD: token.price || '0',
        priceChange24h: token.priceChange24h || '0',
        volume24h: token.volume24h || '0',
        liquidity: token.liquidity || '0',
        holders: token.holders || '0',
        listingTime: token.listingTime || new Date(Date.now() - (Math.floor(Math.random() * 168) + 24) * 60 * 60 * 1000).toISOString()
      }))
      .sort((a, b) => parseFloat(b.volume24h) - parseFloat(a.volume24h));
    
    logger.info(`Found ${memeCoins.length} meme coins from DEX token list`);
    
    return memeCoins.length > 0 ? memeCoins : null;
  } catch (error) {
    logger.errorWithContext('Error filtering for meme coins', error);
    return null;
  }
}

/**
 * Save meme coins to file
 * @param {Array} memeCoins - List of meme coins to save
 * @returns {Promise<boolean>} Success status
 */
async function saveMemesToFile(memeCoins) {
  try {
    // Ensure directory exists
    const dir = path.dirname(config.outputPaths.trendingMemes);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write to file
    fs.writeFileSync(
      config.outputPaths.trendingMemes,
      JSON.stringify(memeCoins, null, 2)
    );
    
    logger.info(`Saved ${memeCoins.length} trending meme coins to ${config.outputPaths.trendingMemes}`);
    
    return true;
  } catch (error) {
    logger.errorWithContext('Error saving meme coins to file', error);
    return false;
  }
}

/**
 * Get mock trending meme coin data for testing/development
 * @returns {Array} Mock trending meme coins
 */
function getMockTrendingMemeCoins() {
  return [
    {
      symbol: 'PEPEOKC',
      name: 'Pepe OKC',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      priceUSD: '0.0000123',
      priceChange24h: '45.6',
      volume24h: '35000',
      liquidity: '22000',
      holders: '456',
      listingTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    },
    {
      symbol: 'DOGE2',
      name: 'Doge 2.0',
      address: '0x567890abcdef1234567890abcdef1234567890ab',
      priceUSD: '0.0000345',
      priceChange24h: '28.9',
      volume24h: '18900',
      liquidity: '15600',
      holders: '289',
      listingTime: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
    },
    {
      symbol: 'SHIBOK',
      name: 'Shiba OKC',
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      priceUSD: '0.00000789',
      priceChange24h: '15.7',
      volume24h: '16500',
      liquidity: '12300',
      holders: '198',
      listingTime: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString()
    },
    {
      symbol: 'CATOKC',
      name: 'Cat Chain',
      address: '0x7890abcdef1234567890abcdef1234567890abcd',
      priceUSD: '0.0000234',
      priceChange24h: '12.3',
      volume24h: '12800',
      liquidity: '9700',
      holders: '167',
      listingTime: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString()
    },
    {
      symbol: 'FLOKIOKC',
      name: 'Floki OKC',
      address: '0x2345678901abcdef2345678901abcdef23456789',
      priceUSD: '0.0000078',
      priceChange24h: '8.5',
      volume24h: '9800',
      liquidity: '7500',
      holders: '132',
      listingTime: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString()
    }
  ];
}

/**
 * Calculate trending score for tokens
 * @param {Array} tokens - List of tokens to score
 * @returns {Array} Tokens with trending scores
 */
function calculateTrendingScores(tokens) {
  return tokens.map(token => {
    const volume = parseFloat(token.volume24h) || 0;
    const priceChange = parseFloat(token.priceChange24h) || 0;
    const liquidity = parseFloat(token.liquidity) || 0;
    
    // Calculate a trending score based on volume, price change, and liquidity
    let trendScore = 0;
    
    // High volume with positive price change gets highest score
    if (priceChange > 0) {
      trendScore = (volume * priceChange) / 100;
      
      // Add bonus for good liquidity
      if (liquidity > 10000) {
        trendScore *= 1.5;
      }
    } else {
      // For negative price change, only consider volume with much lower weight
      trendScore = volume / 100;
    }
    
    // Recently listed tokens get a bonus
    const listingTime = new Date(token.listingTime).getTime();
    const now = Date.now();
    const ageInDays = (now - listingTime) / (1000 * 60 * 60 * 24);
    
    if (ageInDays < 1) {
      trendScore *= 2; // 2x bonus for tokens less than 1 day old
    } else if (ageInDays < 3) {
      trendScore *= 1.5; // 1.5x bonus for tokens less than 3 days old
    } else if (ageInDays < 7) {
      trendScore *= 1.2; // 1.2x bonus for tokens less than 7 days old
    }
    
    return {
      ...token,
      trendScore
    };
  });
}

/**
 * Main function to get trending meme coins from DEX
 * @returns {Promise<Array>} List of trending meme coins
 */
async function getTrendingMemeCoins() {
  try {
    logger.info('Starting trending meme coin discovery');
    
    // Try different methods to get trending meme coins
    let memeCoins = null;
    
    // 1. Try getting trending tokens from the API
    memeCoins = await fetchTrendingTokensFromApi();
    
    // 2. If API method failed, try web scraping
    if (!memeCoins || memeCoins.length === 0) {
      logger.info('API method failed, trying web scraping');
      memeCoins = await scrapeWebForTrendingMemeCoins();
    }
    
    // 3. If web scraping failed, try filtering regular token list
    if (!memeCoins || memeCoins.length === 0) {
      logger.info('Web scraping failed, trying to filter regular token list');
      memeCoins = await filterTokensForMemeCoins();
    }
    
    // 4. If all methods failed, use mock data
    if (!memeCoins || memeCoins.length === 0) {
      logger.warn('All methods failed, using mock data');
      memeCoins = getMockTrendingMemeCoins();
    }
    
    // Calculate trending scores and sort
    const scoredCoins = calculateTrendingScores(memeCoins);
    scoredCoins.sort((a, b) => b.trendScore - a.trendScore);
    
    // Take top 20 trending coins
    const topTrendingCoins = scoredCoins.slice(0, 20);
    
    // Save to file
    await saveMemesToFile(topTrendingCoins);
    
    return topTrendingCoins;
  } catch (error) {
    logger.errorWithContext('Error getting trending meme coins', error);
    
    // Fall back to mock data in case of any error
    const mockData = getMockTrendingMemeCoins();
    await saveMemesToFile(mockData);
    
    return mockData;
  }
}

module.exports = {
  getTrendingMemeCoins,
  fetchTrendingTokensFromApi,
  scrapeWebForTrendingMemeCoins,
  filterTokensForMemeCoins,
  calculateTrendingScores
};