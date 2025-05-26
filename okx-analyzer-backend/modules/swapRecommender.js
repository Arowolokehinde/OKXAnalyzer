/**
 * swapRecommender.js
 * Module for generating trading recommendations based on token metrics analysis
 */
const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');
const { validateRecommendation } = require('../utils/validation');
const { getDetailedMetrics } = require('./tokenMetrics');

/**
 * Analyze token metrics to determine if it's a good swap opportunity
 * @param {Object} token - Token with detailed metrics
 * @returns {Object} Recommendation object with score and reasons
 */
function analyzeTokenForSwap(token) {
  try {
    // Default values if metrics are missing
    const volumeUSD = parseFloat(token.volume24h) || 0;
    const liquidityUSD = parseFloat(token.liquidity) || 0;
    const priceChange24h = parseFloat(token.priceChange24h) || 0;
    const holders = parseInt(token.holders) || 0;
    
    // Get volatility from derived metrics if available
    const volatility = token.derived && token.derived.volatility !== undefined
      ? token.derived.volatility
      : 0.1; // Default moderate volatility
    
    // Get holder growth rate from derived metrics if available
    const holderGrowthRate = token.derived && token.derived.holderGrowthRate !== undefined
      ? token.derived.holderGrowthRate
      : 0.5; // Default moderate growth rate
    
    // Calculate volume to liquidity ratio (VLR)
    // Higher ratio means more active trading relative to available liquidity
    const volumeLiquidityRatio = liquidityUSD > 0 ? volumeUSD / liquidityUSD : 0;
    
    // Define weights for different factors
    const weights = {
      volumeLiquidityRatio: 0.25,
      priceAction: 0.20,
      volatility: 0.15,
      holderGrowth: 0.20,
      holders: 0.10,
      liquidity: 0.10
    };
    
    // Calculate individual scores (0-100 scale)
    
    // VLR score - higher is better, but diminishing returns
    // A ratio of 1.0 (equal volume and liquidity) gives 50 points
    // A ratio of 3.0 or higher gives 100 points
    const vlrScore = Math.min(100, volumeLiquidityRatio * 33.33);
    
    // Price action score
    // Positive change is good, but too high might indicate a pump and dump
    // Optimal range is 5-30% change
    let priceActionScore = 0;
    if (priceChange24h >= 0 && priceChange24h <= 5) {
      priceActionScore = priceChange24h * 10; // 0-50 points for 0-5% change
    } else if (priceChange24h > 5 && priceChange24h <= 30) {
      priceActionScore = 50 + ((priceChange24h - 5) * 2); // 50-100 points for 5-30% change
    } else if (priceChange24h > 30) {
      // Penalty for extreme price changes (potential pump and dump)
      priceActionScore = 100 - Math.min(100, (priceChange24h - 30) * 2);
    } else { // Negative price change
      // Small negative changes can still be buying opportunities
      priceActionScore = Math.max(0, 50 + priceChange24h * 5);
    }
    
    // Volatility score
    // Moderate volatility is preferred (0.05-0.15)
    // Too low: not enough movement to profit
    // Too high: too much risk
    let volatilityScore = 0;
    if (volatility < 0.05) {
      volatilityScore = volatility * 1000; // 0-50 points for 0-0.05 volatility
    } else if (volatility >= 0.05 && volatility <= 0.15) {
      volatilityScore = 50 + ((volatility - 0.05) * 500); // 50-100 points for 0.05-0.15 volatility
    } else {
      // Penalty for high volatility
      volatilityScore = Math.max(0, 100 - ((volatility - 0.15) * 300));
    }
    
    // Holder growth score
    // Higher growth rate is better, up to a point
    const holderGrowthScore = Math.min(100, holderGrowthRate * 50);
    
    // Holders score
    // More holders is better (up to 500 holders)
    const holdersScore = Math.min(100, holders / 5);
    
    // Liquidity score
    // Higher liquidity is better for ease of trading (up to $50k)
    const liquidityScore = Math.min(100, liquidityUSD / 500);
    
    // Calculate weighted score
    const score = (
      weights.volumeLiquidityRatio * vlrScore +
      weights.priceAction * priceActionScore +
      weights.volatility * volatilityScore +
      weights.holderGrowth * holderGrowthScore +
      weights.holders * holdersScore +
      weights.liquidity * liquidityScore
    );
    
    // Convert to final 0-100 score
    const finalScore = Math.round(score);
    
    // Generate recommendation
    const recommendation = {
      symbol: token.symbol || 'Unknown',
      name: token.name || 'Unknown Token',
      score: finalScore,
      recommendation: getRecommendationText(finalScore),
      analysis: {
        volumeLiquidityRatio: {
          value: volumeLiquidityRatio.toFixed(2),
          score: Math.round(vlrScore),
          weight: weights.volumeLiquidityRatio
        },
        priceAction: {
          value: `${priceChange24h}%`,
          score: Math.round(priceActionScore),
          weight: weights.priceAction
        },
        volatility: {
          value: (volatility * 100).toFixed(2) + '%',
          score: Math.round(volatilityScore),
          weight: weights.volatility
        },
        holderGrowth: {
          value: holderGrowthRate.toFixed(2) + ' holders/hour',
          score: Math.round(holderGrowthScore),
          weight: weights.holderGrowth
        },
        holders: {
          value: holders,
          score: Math.round(holdersScore),
          weight: weights.holders
        },
        liquidity: {
          value: `$${liquidityUSD}`,
          score: Math.round(liquidityScore),
          weight: weights.liquidity
        }
      },
      reasons: generateReasons(finalScore, {
        vlrScore, priceActionScore, volatilityScore, 
        holderGrowthScore, holdersScore, liquidityScore
      }, token)
    };
    
    // Validate the recommendation
    if (!validateRecommendation(recommendation)) {
      logger.warn('Invalid recommendation generated', { token });
      return null;
    }
    
    return recommendation;
  } catch (error) {
    logger.errorWithContext('Error analyzing token for swap', error, { token });
    return null;
  }
}

/**
 * Get recommendation text based on score
 * @param {number} score - Score from 0-100
 * @returns {string} Recommendation text
 */
function getRecommendationText(score) {
  if (score >= 80) {
    return 'Strong Buy';
  } else if (score >= 65) {
    return 'Buy';
  } else if (score >= 50) {
    return 'Hold';
  } else if (score >= 35) {
    return 'Avoid';
  } else {
    return 'Strong Avoid';
  }
}

/**
 * Generate reasons for the recommendation
 * @param {number} finalScore - Overall score
 * @param {Object} scores - Individual scores
 * @param {Object} token - Token data
 * @returns {Array} List of reasons
 */
function generateReasons(finalScore, scores, token) {
  const reasons = [];
  
  // Add positive reasons
  if (scores.vlrScore >= 70) {
    reasons.push(`High trading activity relative to liquidity (${token.volume24h}/${token.liquidity})`);
  }
  
  if (scores.priceActionScore >= 70) {
    reasons.push(`Favorable price movement (${token.priceChange24h}% in 24h)`);
  }
  
  if (scores.volatilityScore >= 70) {
    reasons.push('Optimal volatility for trading opportunities');
  }
  
  if (scores.holderGrowthScore >= 70) {
    reasons.push('Strong holder growth rate');
  }
  
  if (scores.holdersScore >= 70) {
    reasons.push(`Solid holder base (${token.holders} holders)`);
  }
  
  if (scores.liquidityScore >= 70) {
    reasons.push(`Good liquidity ($${token.liquidity})`);
  }
  
  // Add negative reasons
  if (scores.vlrScore <= 30) {
    reasons.push('Low trading volume relative to liquidity');
  }
  
  if (scores.priceActionScore <= 30) {
    // Check if price change is very high (potential pump and dump)
    if (parseFloat(token.priceChange24h) > 50) {
      reasons.push(`Potential pump and dump (${token.priceChange24h}% in 24h)`);
    } else {
      reasons.push(`Unfavorable price movement (${token.priceChange24h}% in 24h)`);
    }
  }
  
  if (scores.volatilityScore <= 30) {
    // Check if volatility is too high or too low
    const volatility = token.derived && token.derived.volatility !== undefined
      ? token.derived.volatility
      : 0.1;
    
    if (volatility > 0.2) {
      reasons.push('Excessive volatility increases risk');
    } else {
      reasons.push('Insufficient volatility for profitable trading');
    }
  }
  
  if (scores.holderGrowthScore <= 30) {
    reasons.push('Weak holder growth rate');
  }
  
  if (scores.holdersScore <= 30) {
    reasons.push(`Small holder base (${token.holders} holders)`);
  }
  
  if (scores.liquidityScore <= 30) {
    reasons.push(`Limited liquidity ($${token.liquidity})`);
  }
  
  return reasons;
}

/**
 * Save recommendations to file
 * @param {Array} recommendations - List of recommendations to save
 * @returns {Promise<boolean>} Success status
 */
async function saveRecommendations(recommendations) {
  try {
    // Ensure directory exists
    const dir = path.dirname(config.outputPaths.recommendations);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write to file
    fs.writeFileSync(
      config.outputPaths.recommendations,
      JSON.stringify(recommendations, null, 2)
    );
    
    logger.info(`Saved ${recommendations.length} recommendations to ${config.outputPaths.recommendations}`);
    
    return true;
  } catch (error) {
    logger.errorWithContext('Error saving recommendations', error);
    return false;
  }
}

/**
 * Generate swap recommendations for multiple tokens
 * @param {Array} tokens - List of tokens with detailed metrics
 * @returns {Promise<Array>} List of recommendations
 */
async function generateRecommendations(tokens) {
  try {
    logger.info(`Generating recommendations for ${tokens.length} tokens`);
    
    // 1. Get detailed metrics if not already present
    let tokensWithMetrics = tokens;
    
    // Check if tokens already have detailed metrics
    const hasDetailed = tokens.length > 0 && tokens[0].derived;
    
    if (!hasDetailed) {
      logger.debug('Fetching detailed metrics for recommendations');
      tokensWithMetrics = await getDetailedMetrics(tokens);
    }
    
    // 2. Generate recommendations for each token
    const recommendations = [];
    
    for (const token of tokensWithMetrics) {
      const recommendation = analyzeTokenForSwap(token);
      
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }
    
    // 3. Sort recommendations by score (highest first)
    recommendations.sort((a, b) => b.score - a.score);
    
    // 4. Save to file
    await saveRecommendations(recommendations);
    
    return recommendations;
  } catch (error) {
    logger.errorWithContext('Error generating recommendations', error);
    return [];
  }
}

/**
 * Generate human-readable recommendation report
 * @param {Array} recommendations - List of recommendations
 * @returns {string} Formatted recommendation report
 */
function generateRecommendationReport(recommendations) {
  try {
    if (!recommendations || recommendations.length === 0) {
      return 'No recommendations available.';
    }
    
    let report = '# Swap Recommendations\n\n';
    
    // Add each recommendation
    recommendations.forEach((rec, index) => {
      report += `## ${index + 1}. ${rec.symbol} (${rec.name}) - ${rec.recommendation}\n\n`;
      report += `**Score: ${rec.score}/100**\n\n`;
      
      report += '### Why?\n';
      rec.reasons.forEach(reason => {
        report += `- ${reason}\n`;
      });
      
      report += '\n### Metrics Analysis\n';
      Object.entries(rec.analysis).forEach(([metric, data]) => {
        report += `- **${metric}**: ${data.value} (Score: ${data.score})\n`;
      });
      
      report += '\n---\n\n';
    });
    
    // Add disclaimer
    report += '## Disclaimer\n\n';
    report += 'These recommendations are based on quantitative metrics analysis and should not be considered financial advice. ';
    report += 'Always do your own research before making investment decisions.\n';
    
    return report;
  } catch (error) {
    logger.errorWithContext('Error generating recommendation report', error);
    return 'Error generating recommendation report.';
  }
}

module.exports = {
  generateRecommendations,
  analyzeTokenForSwap,
  generateRecommendationReport
};