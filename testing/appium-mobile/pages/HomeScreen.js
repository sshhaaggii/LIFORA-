const BasePage = require('./BasePage');

class HomeScreen extends BasePage {
  constructor(driver) {
    super(driver);
    this.mainSosButton = this.byText('SOS EMERGENCY');
    this.emergencyServicesCard = this.byText('Emergency Services');
    this.emergencyContactsCard = this.byText('Emergency Contacts');
    this.aiAssistantCard = this.byText('AI Safety Assistant');
    this.signLanguageCard = this.byText('Sign Language to Voice');
    this.navHomeBtn = this.byText('Home');
    this.navServicesBtn = this.byText('Emergency');
    this.navContactsBtn = this.byText('Contacts');
  }

  async triggerEmergencySos() {
    await this.click(this.mainSosButton);
  }

  async navigateToSignLanguage() {
    await this.click(this.signLanguageCard);
  }

  async navigateToAiAssistant() {
    await this.click(this.aiAssistantCard);
  }
}

module.exports = HomeScreen;
