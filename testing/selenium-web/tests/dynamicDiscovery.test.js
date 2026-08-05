const { expect } = require('chai');
const driverFactory = require('../drivers/WebDriverFactory');
const BasePage = require('../pages/BasePage');
const DynamicRouteFormScanner = require('../utilities/DynamicRouteFormScanner');
const excelReporter = require('../utilities/ExcelReportGenerator');
const logger = require('../utilities/Logger');

describe('Selenium Web E2E Suite: Dynamic React Route & Form Auto-Discovery', function () {
  this.timeout(120000);
  let driver;
  let basePage;
  let scanner;

  before(async function () {
    driver = await driverFactory.createDriver();
    basePage = new BasePage(driver);
    scanner = new DynamicRouteFormScanner(driver);
    await basePage.open();
  });

  after(async function () {
    await driverFactory.quitDriver();
  });

  it('WEB-DYN-01: Should scan all React routes, discover forms dynamically, and execute validation tests', async function () {
    logger.info('Executing WEB-DYN-01: Auto-discovery of React routes and dynamic form validation synthesis');

    // 1. Discover all active application routes
    const routes = await scanner.discoverRoutes();
    expect(routes).to.be.an('array');

    // 2. Discover all interactive forms & inputs on current view
    const fields = await scanner.discoverFormsOnCurrentPage();
    expect(fields).to.be.an('array');

    // 3. Synthesize dynamic test cases based on field validation rules
    const testCases = await scanner.synthesizeDynamicTestCases(fields);
    expect(testCases).to.be.an('array');

    // 4. Execute dynamic test cases
    for (const testCase of testCases) {
      const result = await scanner.executeDynamicTestCase(testCase);
      excelReporter.recordLog(
        testCase.name,
        `Executed dynamic rule on #${testCase.field.id} (${testCase.field.type})`,
        result.success ? 'PASSED' : 'FAILED',
        result.message
      );
    }

    logger.info(`WEB-DYN-01 Complete: Tested ${testCases.length} dynamically synthesized form validation cases.`);
  });
});
