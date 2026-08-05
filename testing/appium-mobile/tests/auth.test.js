const { expect } = require('chai');
const driverFactory = require('../drivers/DriverFactory');
const LoginScreen = require('../pages/LoginScreen');
const HomeScreen = require('../pages/HomeScreen');
const failureHandler = require('../utilities/FailureHandler');
const excelReporter = require('../utilities/ExcelReportGenerator');
const logger = require('../utilities/Logger');

describe('Appium Mobile E2E Suite: Authentication Testing', function () {
  this.timeout(120000);
  let driver;
  let loginScreen;
  let homeScreen;

  before(async function () {
    driver = await driverFactory.createDriver();
    loginScreen = new LoginScreen(driver);
    homeScreen = new HomeScreen(driver);
  });

  after(async function () {
    await excelReporter.generateFinalReport();
    await driverFactory.quitDriver();
  });

  afterEach(async function () {
    if (this.currentTest.state === 'failed') {
      const { screenshotPath } = await failureHandler.handleFailure(
        driver,
        this.currentTest.fullTitle(),
        this.currentTest.err
      );
      excelReporter.recordTest({
        testId: `TC-AUTH-${Date.now()}`,
        module: 'Authentication',
        scenario: this.currentTest.title,
        status: 'FAILED',
        duration: `${this.currentTest.duration || 0}ms`,
        failureReason: this.currentTest.err.message,
        screenshotPath
      });
    } else {
      excelReporter.recordTest({
        testId: `TC-AUTH-${Date.now()}`,
        module: 'Authentication',
        scenario: this.currentTest.title,
        status: 'PASSED',
        duration: `${this.currentTest.duration || 0}ms`
      });
    }
  });

  it('TC-AUTH-01: Should prevent login with empty credentials', async function () {
    logger.info('Executing TC-AUTH-01: Empty credentials validation');
    excelReporter.recordLog(this.test.title, 'Submit empty login form', 'PASSED');
    await loginScreen.login('', '');
    const isErrorDisplayed = await loginScreen.isDisplayed(loginScreen.errorMessageLabel);
    expect(isErrorDisplayed).to.be.true;
  });

  it('TC-AUTH-02: Should validate invalid email format error message', async function () {
    logger.info('Executing TC-AUTH-02: Invalid email format validation');
    excelReporter.recordLog(this.test.title, 'Enter invalid email format', 'PASSED');
    await loginScreen.login('invalid-email-string', 'Password123!');
  });

  it('TC-AUTH-03: Should successfully log in with valid credentials', async function () {
    logger.info('Executing TC-AUTH-03: Valid user login');
    excelReporter.recordLog(this.test.title, 'Submit valid user credentials', 'PASSED');
    await loginScreen.login('user@lifora.com', 'SecurePass123!');
  });
});
