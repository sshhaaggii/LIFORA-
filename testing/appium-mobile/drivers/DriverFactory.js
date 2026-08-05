const { remote } = require('webdriverio');
const config = require('../config/appium.config');
const logger = require('../utilities/Logger');
const { execSync } = require('child_process');

class DriverFactory {
  constructor() {
    this.driver = null;
  }

  autoDetectConnectedDevice() {
    try {
      const adbOutput = execSync('adb devices', { encoding: 'utf8' });
      const lines = adbOutput.split('\n').filter(line => line.includes('\tdevice'));
      if (lines.length > 0) {
        const deviceId = lines[0].split('\t')[0].trim();
        logger.info(`Auto-detected connected Android device/emulator ID: ${deviceId}`);
        return deviceId;
      }
    } catch (err) {
      logger.warn(`ADB auto-detection fallback: ${err.message}`);
    }
    return null;
  }

  async createDriver() {
    if (this.driver) {
      return this.driver;
    }

    const deviceId = this.autoDetectConnectedDevice();
    const capabilities = { ...config.capabilities };
    if (deviceId) {
      capabilities['appium:udid'] = deviceId;
    }

    logger.info(`Connecting to Appium Server at http://${config.server.host}:${config.server.port}${config.server.path}`);
    logger.info(`Launching APK: ${capabilities['appium:app']} on ${capabilities['appium:deviceName']}`);

    try {
      this.driver = await remote({
        hostname: config.server.host,
        port: config.server.port,
        path: config.server.path,
        capabilities
      });

      logger.info('Appium Session established successfully.');
      return this.driver;
    } catch (error) {
      logger.error(`Failed to initialize Appium driver: ${error.message}`);
      throw error;
    }
  }

  async quitDriver() {
    if (this.driver) {
      logger.info('Quitting Appium Session...');
      await this.driver.deleteSession();
      this.driver = null;
    }
  }
}

module.exports = new DriverFactory();
