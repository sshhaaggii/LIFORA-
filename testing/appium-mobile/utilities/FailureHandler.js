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

    logger.error(`FAILURE ENCOUNTERED IN TEST: "${testTitle}" - Reason: ${error.message}`);

    let screenshotSaved = false;
    let pageSource = '';
    let deviceLogs = [];

    if (driver) {
      try {
        const screenshot = await driver.takeScreenshot();
        fs.writeFileSync(screenshotPath, screenshot, 'base64');
        screenshotSaved = true;
        logger.info(`Screenshot captured at: ${screenshotPath}`);
      } catch (e) {
        logger.error(`Failed to capture screenshot: ${e.message}`);
      }

      try {
        pageSource = await driver.getPageSource();
      } catch (e) {
        pageSource = `Could not extract page source: ${e.message}`;
      }

      try {
        deviceLogs = await driver.getLogs('logcat');
      } catch (e) {
        deviceLogs = [`Device logcat unavailable: ${e.message}`];
      }
    }

    const failureData = {
      testTitle,
      timestamp: new Date().toISOString(),
      errorMessage: error.message,
      stackTrace: error.stack,
      screenshotPath: screenshotSaved ? screenshotPath : null,
      pageSource,
      deviceLogs: deviceLogs.slice(-100) // Last 100 log lines
    };

    fs.writeFileSync(logPath, JSON.stringify(failureData, null, 2));
    logger.info(`Failure diagnostics saved at: ${logPath}`);

    return {
      screenshotPath: screenshotSaved ? screenshotPath : 'N/A',
      logPath
    };
  }
}

module.exports = new FailureHandler();
