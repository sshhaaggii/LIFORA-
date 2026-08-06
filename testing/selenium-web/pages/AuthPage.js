const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class AuthPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.screenAuth = By.id('screen-auth');
    this.fullNameInput = By.id('authName');
    this.emailInput = By.id('authEmail');
    this.passwordInput = By.id('authPassword');
    this.rememberMeCheckbox = By.id('authRememberMe');
    this.termsCheckbox = By.id('authTerms');
    this.signInButton = By.id('btnEmailLogin');
    this.googleSignInButton = By.id('btnGoogleSignIn');
    this.toggleAuthModeBtn = By.id('toggleAuthMode');
    this.errAuthEmail = By.id('errAuthEmail');
    this.errAuthPassword = By.id('errAuthPassword');
  }

  async ensureAuthScreenVisible() {
    const isAuthVisible = await this.isDisplayed(this.screenAuth);
    if (!isAuthVisible) {
      const authBtn = By.id('authActionBtn');
      if (await this.isDisplayed(authBtn)) {
        await this.click(authBtn);
      } else {
        await this.driver.executeScript("document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active')); document.getElementById('screen-auth').classList.add('active');");
      }
    }
  }

  async login(email, password) {
    await this.ensureAuthScreenVisible();
    await this.scrollIntoView(this.emailInput);
    await this.type(this.emailInput, email);
    await this.type(this.passwordInput, password);
    await this.click(this.signInButton);
  }

  async toggleToSignUp() {
    await this.click(this.toggleAuthModeBtn);
  }

  async getEmailErrorMessage() {
    return await this.getText(this.errAuthEmail);
  }
}

module.exports = AuthPage;
