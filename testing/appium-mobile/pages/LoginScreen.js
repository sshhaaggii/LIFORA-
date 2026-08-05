const BasePage = require('./BasePage');

class LoginScreen extends BasePage {
  constructor(driver) {
    super(driver);
    this.emailInput = this.bySemanticsLabel('Email Address');
    this.passwordInput = this.bySemanticsLabel('Password');
    this.signInButton = this.byText('Sign In');
    this.registerButton = this.byText('Create New Account');
    this.errorMessageLabel = this.bySemanticsLabel('inline-error');
  }

  async login(email, password) {
    if (email) {
      await this.type(this.emailInput, email);
    }
    if (password) {
      await this.type(this.passwordInput, password);
    }
    await this.click(this.signInButton);
  }

  async getErrorMessage() {
    return await this.getText(this.errorMessageLabel);
  }
}

module.exports = LoginScreen;
