const { expect } = require('chai');
const driverFactory = require('../drivers/DriverFactory');
const AiSmartTester = require('../utilities/AiSmartTester');
const excelReporter = require('../utilities/ExcelReportGenerator');
const logger = require('../utilities/Logger');

describe('Appium Mobile E2E Suite: AI-Assisted Screen Discovery Testing', function () {
  this.timeout(120000);
  let driver;
  let aiTester;

  before(async function () {
    driver = await driverFactory.createDriver();
    aiTester = new AiSmartTester(driver);
  });

  after(async function () {
    await driverFactory.quitDriver();
  });

  it('TC-AI-01: Should automatically inspect active screen widgets and execute dynamic scenarios', async function () {
    logger.info('Executing TC-AI-01: Smart AI Screen Inspection');
    
    // 1. Analyze active screen XML hierarchy
    const widgets = await aiTester.analyzeScreen();
    expect(widgets).to.have.property('inputs');
    expect(widgets).to.have.property('buttons');

    // 2. Automatically synthesize dynamic test scenarios
    const dynamicScenarios = await aiTester.autoGenerateAndRunScenarios(widgets);
    expect(dynamicScenarios).to.be.an('array');
    
    excelReporter.recordLog(
      this.test.title,
      `AI Smart Tester discovered ${widgets.inputs.length} inputs, ${widgets.buttons.length} buttons, and generated ${dynamicScenarios.length} dynamic test cases`,
      'PASSED'
    );
  });
});
