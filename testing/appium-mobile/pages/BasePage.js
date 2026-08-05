const logger = require('../utilities/Logger');

class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  // React Native Finder Strategies
  byValueKey(key) {
    return `~${key}`; // ValueKey mapped to accessibility id / content-desc
  }

  byAccessibilityId(id) {
    return `~${id}`;
  }

  bySemanticsLabel(label) {
    return `// *[@content-desc='${label}' or @aria-label='${label}']`;
  }

  byText(text) {
    return `// *[@text='${text}' or @content-desc='${text}']`;
  }

  async findElement(selector, timeout = 10000) {
    logger.info(`Locating element with selector: ${selector}`);
    const element = await this.driver.$(selector);
    await element.waitForDisplayed({ timeout });
    return element;
  }

  async click(selector, timeout = 10000) {
    const el = await this.findElement(selector, timeout);
    logger.info(`Clicking element: ${selector}`);
    await el.click();
  }

  async type(selector, text, timeout = 10000) {
    const el = await this.findElement(selector, timeout);
    logger.info(`Entering text "${text}" into element: ${selector}`);
    await el.clearValue();
    await el.setValue(text);
  }

  async getText(selector, timeout = 10000) {
    const el = await this.findElement(selector, timeout);
    const text = await el.getText();
    logger.info(`Extracted text "${text}" from selector: ${selector}`);
    return text;
  }

  async isDisplayed(selector, timeout = 5000) {
    try {
      const el = await this.driver.$(selector);
      return await el.isDisplayed();
    } catch {
      return false;
    }
  }

  async captureScreenshot(name) {
    const screenshot = await this.driver.takeScreenshot();
    return screenshot;
  }
}

module.exports = BasePage;
