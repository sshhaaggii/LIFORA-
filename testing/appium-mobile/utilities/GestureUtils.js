const logger = require('./Logger');

class GestureUtils {
  constructor(driver) {
    this.driver = driver;
  }

  async tap(x, y) {
    logger.info(`Performing Tap gesture at (${x}, ${y})`);
    await this.driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x, y },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
  }

  async doubleTap(x, y) {
    logger.info(`Performing Double Tap gesture at (${x}, ${y})`);
    await this.tap(x, y);
    await this.driver.pause(100);
    await this.tap(x, y);
  }

  async longPress(x, y, durationMs = 1500) {
    logger.info(`Performing Long Press gesture at (${x}, ${y}) for ${durationMs}ms`);
    await this.driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x, y },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: durationMs },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
  }

  async swipe(startX, startY, endX, endY, durationMs = 800) {
    logger.info(`Performing Swipe from (${startX}, ${startY}) to (${endX}, ${endY})`);
    await this.driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: durationMs, x: endX, y: endY },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
  }

  async scrollDown(distancePixels = 600) {
    const { width, height } = await this.driver.getWindowSize();
    const startX = Math.floor(width / 2);
    const startY = Math.floor(height * 0.8);
    const endY = Math.max(0, startY - distancePixels);
    logger.info(`Scrolling Down on screen...`);
    await this.swipe(startX, startY, startX, endY, 600);
  }

  async scrollUp(distancePixels = 600) {
    const { width, height } = await this.driver.getWindowSize();
    const startX = Math.floor(width / 2);
    const startY = Math.floor(height * 0.2);
    const endY = Math.min(height, startY + distancePixels);
    logger.info(`Scrolling Up on screen...`);
    await this.swipe(startX, startY, startX, endY, 600);
  }

  async dragAndDrop(startX, startY, endX, endY) {
    logger.info(`Performing Drag and Drop from (${startX}, ${startY}) to (${endX}, ${endY})`);
    await this.swipe(startX, startY, endX, endY, 1500);
  }

  async pinch(centerX, centerY) {
    logger.info(`Performing Pinch gesture at (${centerX}, ${centerY})`);
    await this.driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: centerX - 200, y: centerY },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 600, x: centerX - 50, y: centerY },
          { type: 'pointerUp', button: 0 }
        ]
      },
      {
        type: 'pointer',
        id: 'finger2',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: centerX + 200, y: centerY },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 600, x: centerX + 50, y: centerY },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
  }

  async zoom(centerX, centerY) {
    logger.info(`Performing Zoom gesture at (${centerX}, ${centerY})`);
    await this.driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: centerX - 50, y: centerY },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 600, x: centerX - 250, y: centerY },
          { type: 'pointerUp', button: 0 }
        ]
      },
      {
        type: 'pointer',
        id: 'finger2',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: centerX + 50, y: centerY },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 600, x: centerX + 250, y: centerY },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
  }
}

module.exports = GestureUtils;
