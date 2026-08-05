const BasePage = require('./BasePage');

class SosScreen extends BasePage {
  constructor(driver) {
    super(driver);
    this.modalSosHeader = this.byText('EMERGENCY SOS DISPATCHED');
    this.btnCall108 = this.byText('Call 108 Ambulance Now');
    this.btnSendSms112 = this.byText('Send Live Location SMS to 112');
    this.btnCancelSos = this.byText('Cancel Emergency SOS');
    this.gpsCoordsText = this.bySemanticsLabel('sosGpsCoords');
  }

  async isSosModalActive() {
    return await this.isDisplayed(this.modalSosHeader, 5000);
  }

  async cancelSosAlert() {
    await this.click(this.btnCancelSos);
  }
}

module.exports = SosScreen;
