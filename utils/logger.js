

/**
 * Logger utility for OKC Token Launch Analytics Dashboard
 */
const winston = require('winston');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Safely access config properties
const getConfigValue = (path, defaultValue) => {
  try {
    const parts = path.split('.');
    let value = config;
    
    for (const part of parts) {
      if (value === undefined || value === null) return defaultValue;
      value = value[part];
    }
    
    return value !== undefined ? value : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

// Get log level from config (supporting both old and new config structure)
const logLevel = getConfigValue('logger.level', 
  getConfigValue('logging.level', 'info'));

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  defaultMeta: { service: getConfigValue('serviceName', 'okc-token-dashboard') },
  transports: [
    // Write logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...rest }) => {
          // Convert objects to string safely
          const restStr = Object.keys(rest).length 
            ? JSON.stringify(rest, (key, value) => {
                // Handle circular references and function values
                if (typeof value === 'function') return '[Function]';
                return value;
              }, 2) 
            : '';
          return `${timestamp} ${level}: ${message} ${restStr}`;
        })
      )
    })
  ]
});

// Add file transports if config specifies logging to file
const logToFile = getConfigValue('logger.logToFile', 
  getConfigValue('logging.logToFile', false));

if (logToFile) {
  // Write logs to files
  logger.add(new winston.transports.File({ 
    filename: path.join(logsDir, 'error.log'), 
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }));
  
  logger.add(new winston.transports.File({ 
    filename: path.join(logsDir, 'combined.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5 
  }));
}

// If not in production, also add a simpler console transport
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Create an enhanced logger that includes all the base methods
const enhancedLogger = {
  // Base winston methods
  error: (message, meta) => logger.error(message, meta),
  warn: (message, meta) => logger.warn(message, meta),
  info: (message, meta) => logger.info(message, meta),
  debug: (message, meta) => logger.debug(message, meta),
  verbose: (message, meta) => logger.verbose(message, meta),
  silly: (message, meta) => logger.silly(message, meta),
  
  // Enhanced logging methods
  warnWithContext: (message, error, context = {}) => {
    logger.warn(message, { 
      error: error?.message || error, 
      stack: error?.stack, 
      ...context 
    });
  },
  
  // Enhanced methods
  apiRequest: (method, url, params) => {
    logger.debug('API Request', { method, url, params });
  },
  
  apiResponse: (method, url, status, responseTime) => {
    logger.debug('API Response', { method, url, status, responseTime });
  },
  
  tokenDiscovery: (count) => {
    logger.info(`Discovered ${count} new tokens`);
  },
  
  errorWithContext: (message, error, context = {}) => {
    logger.error(message, { 
      error: error?.message || error, 
      stack: error?.stack, 
      ...context 
    });
  },
  
  // Additional convenience methods
  logRequest: (req, res, next) => {
    logger.info(`${req.method} ${req.url}`, { 
      ip: req.ip, 
      userAgent: req.get('User-Agent')
    });
    next();
  }
};

module.exports = enhancedLogger;