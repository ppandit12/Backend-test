// Vercel serverless entry point
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const app = require('../src/app');

// Export for Vercel
module.exports = app;
