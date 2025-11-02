require('dotenv').config();
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Configure for web platform
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add support for additional file extensions
config.resolver.sourceExts.push('svg');

// Configure path aliases to match TypeScript config
config.resolver.alias = {
  '@': path.resolve(__dirname, '.'),
};

// Web-specific configuration to fix MIME type issues
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Fix MIME type for JavaScript bundles
      if (req.url && (req.url.includes('.bundle') || req.url.includes('.js'))) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;