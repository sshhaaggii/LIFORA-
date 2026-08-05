const fs = require('fs');
const path = require('path');
const logger = require('./Logger');

class FailureHandler {
  constructor() {
    this.failureDir = path.resolve(__dirname, '../reports/failures');
    if (!fs.existsSync(this.failureDir)) {
      fs.mkdirSync(this.failureDir, { recursive: true });
    }
  }

  async handleFailure(driver, testTitle, error) {
    const timestamp = Date.now();
    const sanitizedTitle = testTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
    const screenshotPath = path.join(this.failureDir, `${sanitizedTitle}_${timestamp}.png`);
    const logPath = path.join(this.failureDir, `${sanitizedTitle}_${timestamp}.json`);

    logger.error(`WEB FAILURE ENCOUNTERED: "${testTitle}" - ${error.message}`);

    let screenshotSaved = false;
    let currentUrl = 'N/A';
    let browserLogs = [];

    if (driver) {
      try {
        currentUrl = await driver.getCurrentUrl();
      } catch (e) {
        currentUrl = `Could not fetch URL: ${e.message}`;
      }

      try {
        const screenshot = await driver.takeScreenshot();
        fs.writeFileSync(screenshotPath, screenshot, 'base64');
        screenshotSaved = true;
        logger.info(`Browser screenshot captured at: ${screenshotPath}`);
      } catch (e) {
        logger.error(`Failed to capture browser screenshot: ${e.message}`);
      }

      try {
        browserLogs = await driver.manage().logs().get('browser');
      } catch (e) {
        browserLogs = [`Browser console logs unavailable: ${e.message}`];
      }
    }

    const failureData = {
      testTitle,
      timestamp: new Date().toISOString(),
      currentUrl,
      errorMessage: error.message,
      stackTrace: error.stack,
      screenshotPath: screenshotSaved ? screenshotPath : null,
      browserLogs
    };

    fs.writeFileSync(logPath, JSON.stringify(failureData, null, 2));
    logger.info(`Web failure diagnostics saved at: ${logPath}`);

    return {
      screenshotPath: screenshotSaved ? screenshotPath : 'N/A',
      currentUrl,
      logPath
    };
  }
}

module.exports = new FailureHandler();
