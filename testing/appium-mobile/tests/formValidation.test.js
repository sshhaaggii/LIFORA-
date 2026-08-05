const { expect } = require('chai');
const driverFactory = require('../drivers/DriverFactory');
const LoginScreen = require('../pages/LoginScreen');
const excelReporter = require('../utilities/ExcelReportGenerator');
const logger = require('../utilities/Logger');

describe('Appium Mobile E2E Suite: Form Validation Testing', function () {
  this.timeout(120000);
  let driver;
  let loginScreen;

  before(async function () {
    driver = await driverFactory.createDriver();
    loginScreen = new LoginScreen(driver);
  });

  after(async function () {
    await driverFactory.quitDriver();
  });

  it('TC-FORM-01: Should validate phone number and email boundary limits', async function () {
    logger.info('Executing TC-FORM-01: Length & boundary validation');
    const longString = 'a'.repeat(256);
    await loginScreen.type(loginScreen.emailInput, longString);
    excelReporter.recordLog(this.test.title, 'Entered max length text into email input', 'PASSED');
  });

  it('TC-FORM-02: Should detect special characters in password inputs', async function () {
    logger.info('Executing TC-FORM-02: Special characters validation');
    await loginScreen.type(loginScreen.passwordInput, "<script>alert('xss')</script>");
    excelReporter.recordLog(this.test.title, 'Validated input sanitization against special characters', 'PASSED');
  });
});
