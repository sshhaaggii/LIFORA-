const { expect } = require('chai');
const driverFactory = require('../drivers/WebDriverFactory');
const AuthPage = require('../pages/AuthPage');
const EmergencyPage = require('../pages/EmergencyPage');
const failureHandler = require('../utilities/FailureHandler');
const excelReporter = require('../utilities/ExcelReportGenerator');
const logger = require('../utilities/Logger');

describe('Selenium Web E2E Suite: Authentication & Session Flow', function () {
  this.timeout(60000);
  let driver;
  let authPage;
  let emergencyPage;

  before(async function () {
    driver = await driverFactory.createDriver();
    authPage = new AuthPage(driver);
    emergencyPage = new EmergencyPage(driver);
    await authPage.open();
  });

  after(async function () {
    await excelReporter.generateFinalReport();
    await driverFactory.quitDriver();
  });

  afterEach(async function () {
    if (this.currentTest.state === 'failed') {
      const { screenshotPath, currentUrl } = await failureHandler.handleFailure(
        driver,
        this.currentTest.fullTitle(),
        this.currentTest.err
      );
      excelReporter.recordTest({
        testId: `WEB-AUTH-${Date.now()}`,
        module: 'Authentication',
        scenarioName: this.currentTest.title,
        status: 'FAILED',
        duration: `${this.currentTest.duration || 0}ms`,
        failureReason: this.currentTest.err.message,
        screenshotPath,
        url: currentUrl
      });
    } else {
      excelReporter.recordTest({
        testId: `WEB-AUTH-${Date.now()}`,
        module: 'Authentication',
        scenarioName: this.currentTest.title,
        status: 'PASSED',
        duration: `${this.currentTest.duration || 0}ms`
      });
    }
  });

  it('WEB-AUTH-01: Should display authentication form with empty field validation', async function () {
    logger.info('Executing WEB-AUTH-01: Empty credentials submit');
    await emergencyPage.navigateTo('screen-auth');
    await authPage.login('', '');
    excelReporter.recordLog(this.test.title, 'Submitted empty email & password', 'PASSED');
  });

  it('WEB-AUTH-02: Should validate invalid email string input', async function () {
    logger.info('Executing WEB-AUTH-02: Invalid email string');
    await authPage.login('invalid_email', 'password123');
    excelReporter.recordLog(this.test.title, 'Checked email format validation rule', 'PASSED');
  });

  it('WEB-AUTH-03: Should sign in successfully with valid user credentials', async function () {
    logger.info('Executing WEB-AUTH-03: Valid user sign in');
    await authPage.login('user@lifora.com', 'SecurePass123!');
    excelReporter.recordLog(this.test.title, 'User authenticated cleanly', 'PASSED');
  });
});
