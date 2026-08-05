const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const edge = require('selenium-webdriver/edge');
const config = require('../config/selenium.config');
const logger = require('../utilities/Logger');

class WebDriverFactory {
  constructor() {
    this.driver = null;
  }

  async createDriver(browserName = config.browser, headless = config.headless) {
    if (this.driver) {
      return this.driver;
    }

    logger.info(`Initializing Selenium WebDriver: Browser=${browserName}, Headless=${headless}`);
    const builder = new Builder();

    switch (browserName.toLowerCase()) {
      case 'firefox': {
        const options = new firefox.Options();
        if (headless) options.addArguments('--headless');
        builder.forBrowser('firefox').setFirefoxOptions(options);
        break;
      }
      case 'edge': {
        const options = new edge.Options();
        if (headless) options.addArguments('--headless');
        builder.forBrowser('MicrosoftEdge').setEdgeOptions(options);
        break;
      }
      case 'chrome':
      default: {
        const options = new chrome.Options();
        if (headless) {
          options.addArguments('--headless=new');
        }
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-gpu');
        options.addArguments(`--window-size=${config.window.width},${config.window.height}`);
        builder.forBrowser('chrome').setChromeOptions(options);
        break;
      }
    }

    try {
      this.driver = await builder.build();
      await this.driver.manage().setTimeouts(config.timeouts);
      await this.driver.manage().window().maximize();
      logger.info('Selenium WebDriver session successfully created.');
      return this.driver;
    } catch (err) {
      logger.error(`Failed to launch browser ${browserName}: ${err.message}`);
      throw err;
    }
  }

  async quitDriver() {
    if (this.driver) {
      logger.info('Closing Selenium WebDriver session...');
      await this.driver.quit();
      this.driver = null;
    }
  }
}

module.exports = new WebDriverFactory();
