require('dotenv').config();
const path = require('path');

const staticIndexPath = path.resolve(__dirname, '../../../backend/src/public/index.html');

module.exports = {
  baseUrl: process.env.BASE_URL || `file:///${staticIndexPath.replace(/\\/g, '/')}`,
  browser: (process.env.BROWSER || 'chrome').toLowerCase(),
  headless: process.env.HEADLESS === 'true',
  timeouts: {
    implicit: parseInt(process.env.IMPLICIT_WAIT || '5000', 10),
    pageLoad: parseInt(process.env.PAGE_LOAD_TIMEOUT || '30000', 10),
    script: parseInt(process.env.SCRIPT_TIMEOUT || '30000', 10),
    explicit: parseInt(process.env.EXPLICIT_WAIT || '10000', 10)
  },
  window: {
    width: 1920,
    height: 1080
  }
};
