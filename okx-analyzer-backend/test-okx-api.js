/**
 * test-okx-api.js
 * A simple script to test OKX API credentials
 */
require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

// API credentials from environment variables
const API_KEY = process.env.OKX_API_KEY;
const SECRET_KEY = process.env.OKX_SECRET_KEY;
const PASSPHRASE = process.env.OKX_PASSPHRASE;

// Test endpoint - try with a public endpoint first
// This endpoint does not require authentication
const PUBLIC_ENDPOINT = '/api/v5/market/ticker';
const PUBLIC_PARAMS = { instId: 'BTC-USDT' };

// DEX-specific endpoint (requires auth)
const DEX_ENDPOINT = '/api/v5/dex/aggregator/all-tokens';
const DEX_PARAMS = { chainIndex: '1' }; // Ethereum

// Base URL
const BASE_URL = 'https://www.okx.com'; // Try with www.okx.com first

/**
 * Generate signature for OKX API
 */
function generateSignature(timestamp, method, path, body = '') {
  const message = `${timestamp}${method}${path}${body}`;
  console.log(`Signature input: "${message}"`);
  
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(message)
    .digest('base64');
}

/**
 * Test a public endpoint that doesn't require auth
 */
async function testPublicEndpoint() {
  console.log('\n--- Testing Public Endpoint ---');
  
  try {
    // Build URL
    const queryStr = Object.entries(PUBLIC_PARAMS)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    const fullUrl = `${BASE_URL}${PUBLIC_ENDPOINT}?${queryStr}`;
    console.log(`Testing URL: ${fullUrl}`);
    
    // Make request without auth
    const response = await axios.get(fullUrl);
    
    if (response.status === 200) {
      console.log('✅ Public endpoint accessible!');
      console.log(`Response code: ${response.data?.code}`);
      console.log('Sample data:', JSON.stringify(response.data?.data?.[0] || {}, null, 2));
      return true;
    } else {
      console.log('❌ Public endpoint failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Public endpoint error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return false;
  }
}

/**
 * Test OKX API with authentication
 */
async function testApiWithAuth() {
  console.log('\n--- Testing Authenticated Access ---');
  
  // Check if credentials are set
  if (!API_KEY || !SECRET_KEY || !PASSPHRASE) {
    console.error('❌ API credentials are not set.');
    console.log('Please set OKX_API_KEY, OKX_SECRET_KEY, and OKX_PASSPHRASE in your .env file.');
    return false;
  }
  
  console.log(`API Key: ${API_KEY.substring(0, 4)}...${API_KEY.substring(API_KEY.length - 4)}`);
  console.log(`Secret Key: ${SECRET_KEY.substring(0, 4)}...`);
  console.log(`Passphrase: ${PASSPHRASE.substring(0, 2)}...`);
  
  try {
    // Prepare request
    const timestamp = new Date().toISOString();
    
    // Build query string
    const queryStr = Object.entries(PUBLIC_PARAMS)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    const path = `${PUBLIC_ENDPOINT}?${queryStr}`;
    const fullUrl = `${BASE_URL}${path}`;
    
    // Generate signature
    const signature = generateSignature(timestamp, 'GET', path);
    
    console.log(`\nTesting URL: ${fullUrl}`);
    console.log(`Timestamp: ${timestamp}`);
    console.log(`Signature: ${signature}`);
    
    // Set headers
    const headers = {
      'Content-Type': 'application/json',
      'OK-ACCESS-KEY': API_KEY,
      'OK-ACCESS-SIGN': signature,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': PASSPHRASE
    };
    
    // Make request
    console.log('\nSending authenticated request...');
    const response = await axios.get(fullUrl, { headers });
    
    // Check response
    if (response.status === 200 && response.data) {
      console.log('\n✅ API authentication working!');
      console.log(`Response code: ${response.data.code}`);
      console.log('Sample data:', JSON.stringify(response.data.data?.[0] || {}, null, 2));
      return true;
    } else {
      console.error('\n❌ API request succeeded but with unexpected response:');
      console.log(JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.error('\n❌ API authentication failed:');
    
    if (error.response) {
      console.error(`Status code: ${error.response.status}`);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.log('\n🔍 Authentication error tips:');
        console.log('- Double-check your API key, secret, and passphrase');
        console.log('- Ensure your API key has the necessary permissions');
        console.log('- Check if your API key has IP restrictions');
        console.log('- Verify the timestamp format is correct (ISO format)');
      }
    } else if (error.request) {
      console.error('No response received');
    } else {
      console.error('Error:', error.message);
    }
    
    return false;
  }
}

/**
 * Test DEX API endpoint
 */
async function testDexEndpoint(baseUrl = BASE_URL) {
  console.log(`\n--- Testing DEX Endpoint (${baseUrl}) ---`);
  
  try {
    // Prepare request
    const timestamp = new Date().toISOString();
    
    // Build query string
    const queryStr = Object.entries(DEX_PARAMS)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    const path = `${DEX_ENDPOINT}?${queryStr}`;
    const fullUrl = `${baseUrl}${path}`;
    
    // Generate signature
    const signature = generateSignature(timestamp, 'GET', path);
    
    console.log(`\nTesting URL: ${fullUrl}`);
    console.log(`Timestamp: ${timestamp}`);
    
    // Set headers
    const headers = {
      'Content-Type': 'application/json',
      'OK-ACCESS-KEY': API_KEY,
      'OK-ACCESS-SIGN': signature,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': PASSPHRASE
    };
    
    // Make request
    console.log('\nSending DEX API request...');
    const response = await axios.get(fullUrl, { headers });
    
    // Check response
    if (response.status === 200 && response.data) {
      console.log('\n✅ DEX API request successful!');
      console.log(`Response code: ${response.data.code}`);
      console.log(`Data count: ${response.data.data?.length || 0} tokens`);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log('\nSample token data:');
        console.log(JSON.stringify(response.data.data[0], null, 2));
      }
      
      return true;
    } else {
      console.error('\n❌ DEX API request succeeded but with unexpected response:');
      console.log(JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.error('\n❌ DEX API request failed:');
    
    if (error.response) {
      console.error(`Status code: ${error.response.status}`);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.log('\n🔍 This might be because:');
        console.log('- The DEX API might not be accessible with your API key');
        console.log('- This endpoint might be restricted or deprecated');
        console.log('- You might need a different base URL for DEX API');
      }
    } else if (error.request) {
      console.error('No response received');
    } else {
      console.error('Error:', error.message);
    }
    
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('==== OKX API Test Script ====');
  
  // Test public endpoint first
  await testPublicEndpoint();
  
  // Test authentication
  const authWorks = await testApiWithAuth();
  
  // If auth works, test DEX endpoint with different base URLs
  if (authWorks) {
    // Try with www.okx.com
    let success = await testDexEndpoint('https://www.okx.com');
    
    // If that fails, try with web3.okx.com
    if (!success) {
      await testDexEndpoint('https://web3.okx.com');
    }
  }
  
  console.log('\n==== Test Complete ====');
}

// Run all tests
runAllTests();