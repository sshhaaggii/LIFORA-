const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class SignLanguagePage extends BasePage {
  constructor(driver) {
    super(driver);
    this.tabDetector = By.id('tabSignDetector');
    this.tabTrainer = By.id('tabSignTrainer');
    this.tabDictionary = By.id('tabSignDictionary');
    this.btnStartWebcam = By.id('btnToggleSignWebcam');
    this.signTextDisplay = By.id('signTextDisplay');
    this.btnSpeak = By.id('btnSignSpeak');
    this.btnAppendSentence = By.id('btnSignAppend');
    this.inputCustomLabel = By.id('inputCustomLabel');
    this.btnCreateLabel = By.id('btnCreateLabel');
    this.btnTrainCustomML = By.id('btnTrainCustomML');
  }

  async switchToTrainerTab() {
    await this.click(this.tabTrainer);
  }

  async createCustomGestureLabel(label) {
    await this.type(this.inputCustomLabel, label);
    await this.click(this.btnCreateLabel);
  }

  async getPredictionText() {
    return await this.getText(this.signTextDisplay);
  }
}

module.exports = SignLanguagePage;
