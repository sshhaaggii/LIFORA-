const { expect } = require('chai');
const driverFactory = require('../drivers/DriverFactory');
const GestureUtils = require('../utilities/GestureUtils');
const excelReporter = require('../utilities/ExcelReportGenerator');
const logger = require('../utilities/Logger');

describe('Appium Mobile E2E Suite: Gesture Testing', function () {
  this.timeout(120000);
  let driver;
  let gestureUtils;

  before(async function () {
    driver = await driverFactory.createDriver();
    gestureUtils = new GestureUtils(driver);
  });

  after(async function () {
    await driverFactory.quitDriver();
  });

  it('TC-GEST-01: Should perform vertical scroll down and scroll up gestures', async function () {
    logger.info('Executing TC-GEST-01: Scroll gestures');
    await gestureUtils.scrollDown(500);
    await driver.pause(500);
    await gestureUtils.scrollUp(500);
    excelReporter.recordLog(this.test.title, 'Successfully executed scroll down and scroll up', 'PASSED');
  });

  it('TC-GEST-02: Should perform long press and double tap gestures', async function () {
    logger.info('Executing TC-GEST-02: Touch interaction gestures');
    await gestureUtils.doubleTap(300, 400);
    await gestureUtils.longPress(300, 400, 1000);
    excelReporter.recordLog(this.test.title, 'Successfully executed double tap and long press gestures', 'PASSED');
  });

  it('TC-GEST-03: Should perform pinch and zoom gestures', async function () {
    logger.info('Executing TC-GEST-03: Multi-touch pinch/zoom gestures');
    await gestureUtils.zoom(400, 800);
    await gestureUtils.pinch(400, 800);
    excelReporter.recordLog(this.test.title, 'Successfully executed pinch and zoom gestures', 'PASSED');
  });
});
