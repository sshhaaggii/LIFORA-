const { until, By } = require('selenium-webdriver');
const logger = require('../utilities/Logger');
const config = require('../config/selenium.config');

class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async open(url = config.baseUrl) {
    logger.info(`Navigating to URL: ${url}`);
    await this.driver.get(url);
  }

  async findElement(by, timeout = config.timeouts.explicit) {
    logger.info(`Waiting for element by: ${by}`);
    await this.driver.wait(until.elementLocated(by), timeout);
    const element = await this.driver.findElement(by);
    await this.driver.wait(until.elementIsVisible(element), timeout);
    return element;
  }

  async click(by, timeout = config.timeouts.explicit) {
    const el = await this.findElement(by, timeout);
    logger.info(`Clicking element: ${by}`);
    await el.click();
  }

  async type(by, text, timeout = config.timeouts.explicit) {
    const el = await this.findElement(by, timeout);
    logger.info(`Typing text into element: ${by}`);
    await el.clear();
    await el.sendKeys(text);
  }

  async getText(by, timeout = config.timeouts.explicit) {
    const el = await this.findElement(by, timeout);
    const text = await el.getText();
    logger.info(`Extracted text "${text}" from element: ${by}`);
    return text;
  }

  async isDisplayed(by, timeout = 3000) {
    try {
      const el = await this.driver.findElement(by);
      return await el.isDisplayed();
    } catch {
      return false;
    }
  }

  async executeScript(script, ...args) {
    logger.info('Executing custom JavaScript in browser runtime...');
    return await this.driver.executeScript(script, ...args);
  }

  async scrollIntoView(by) {
    const el = await this.findElement(by);
    await this.driver.executeScript('arguments[0].scrollIntoView(true);', el);
  }

  async acceptAlert() {
    await this.driver.wait(until.alertIsPresent(), 5000);
    const alert = await this.driver.switchTo().alert();
    const alertText = await alert.getText();
    logger.info(`Accepting browser alert with text: "${alertText}"`);
    await alert.accept();
    return alertText;
  }

  async getCurrentUrl() {
    return await this.driver.getCurrentUrl();
  }
}

module.exports = BasePage;
