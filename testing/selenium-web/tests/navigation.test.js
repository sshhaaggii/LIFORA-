const { expect } = require('chai');
const driverFactory = require('../drivers/WebDriverFactory');
const EmergencyPage = require('../pages/EmergencyPage');
const excelReporter = require('../utilities/ExcelReportGenerator');
const logger = require('../utilities/Logger');

describe('Selenium Web E2E Suite: Navigation & Routing', function () {
  this.timeout(60000);
  let driver;
  let emergencyPage;

  before(async function () {
    driver = await driverFactory.createDriver();
    emergencyPage = new EmergencyPage(driver);
    await emergencyPage.open();
  });

  after(async function () {
    await driverFactory.quitDriver();
  });

  it('WEB-NAV-01: Should navigate across navbar routes seamlessly', async function () {
    logger.info('Executing WEB-NAV-01: Navbar route switching');
    await emergencyPage.navigateTo('screen-services');
    await emergencyPage.navigateTo('screen-contacts');
    await emergencyPage.navigateTo('screen-sign');
    await emergencyPage.navigateTo('screen-ai');
    await emergencyPage.navigateTo('screen-home');
    excelReporter.recordLog(this.test.title, 'Successfully navigated across all top navbar views', 'PASSED');
  });

  it('WEB-NAV-02: Should trigger emergency SOS modal and handle overlay cancellation', async function () {
    logger.info('Executing WEB-NAV-02: Emergency SOS Modal flow');
    await emergencyPage.triggerEmergencySos();
    const isModalOpen = await emergencyPage.isSosModalDisplayed();
    expect(isModalOpen).to.be.true;
    await emergencyPage.cancelSos();
    excelReporter.recordLog(this.test.title, 'SOS Emergency overlay triggered and cancelled cleanly', 'PASSED');
  });
});
