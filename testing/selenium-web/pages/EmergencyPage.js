const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class EmergencyPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.mainSosButton = By.id('btnMainSos');
    this.modalSosActive = By.id('modalSosActive');
    this.call108Button = By.id('btnSosCall108');
    this.sendSms112Button = By.id('btnSosSms112');
    this.cancelSosButton = By.id('btnCancelSosAlert');
    this.navHomeBtn = By.css('button[data-target="screen-home"]');
    this.navServicesBtn = By.css('button[data-target="screen-services"]');
    this.navContactsBtn = By.css('button[data-target="screen-contacts"]');
    this.navSignBtn = By.css('button[data-target="screen-sign"]');
    this.navAiBtn = By.css('button[data-target="screen-ai"]');
  }

  async triggerEmergencySos() {
    await this.click(this.mainSosButton);
  }

  async isSosModalDisplayed() {
    return await this.isDisplayed(this.modalSosActive, 5000);
  }

  async cancelSos() {
    await this.click(this.cancelSosButton);
  }

  async navigateTo(targetScreen) {
    if (targetScreen === 'screen-auth') {
      const authBtn = By.id('authActionBtn');
      if (await this.isDisplayed(authBtn)) {
        await this.click(authBtn);
      } else {
        await this.driver.executeScript("document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active')); document.getElementById('screen-auth').classList.add('active');");
      }
    } else {
      const navBtn = By.css(`button[data-target="${targetScreen}"]`);
      await this.click(navBtn);
    }
  }
}

module.exports = EmergencyPage;
