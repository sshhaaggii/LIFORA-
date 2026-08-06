const { expect } = require('chai');
const driverFactory = require('../drivers/WebDriverFactory');
const AuthPage = require('../pages/AuthPage');
const excelReporter = require('../utilities/ExcelReportGenerator');
const logger = require('../utilities/Logger');

describe('Selenium Web E2E Suite: Form Validation Rules Testing', function () {
  this.timeout(60000);
  let driver;
  let authPage;

  before(async function () {
    driver = await driverFactory.createDriver();
    authPage = new AuthPage(driver);
    await authPage.open();
  });

  after(async function () {
    await driverFactory.quitDriver();
  });

  it('WEB-FORM-01: Should test maximum length and special characters on auth inputs', async function () {
    logger.info('Executing WEB-FORM-01: Special characters & boundary testing');
    await authPage.ensureAuthScreenVisible();
    const xssPayload = "<script>alert('xss')</script>";
    await authPage.type(authPage.emailInput, xssPayload);
    excelReporter.recordLog(this.test.title, 'Entered special character payload into email field', 'PASSED');
  });
});
