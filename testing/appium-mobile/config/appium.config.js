const path = require('path');
require('dotenv').config();

const absoluteApkPath = path.resolve(__dirname, '../../../frontend/app/build/outputs/apk/debug/app-debug.apk');

module.exports = {
  server: {
    host: process.env.APPIUM_HOST || '127.0.0.1',
    port: parseInt(process.env.APPIUM_PORT || '4723', 10),
    path: '/'
  },
  capabilities: {
    platformName: 'Android',
    'appium:automationName': process.env.AUTOMATION_NAME || 'UiAutomator2',
    'appium:deviceName': process.env.DEVICE_NAME || 'Android Emulator',
    'appium:platformVersion': process.env.PLATFORM_VERSION || '14.0',
    'appium:app': process.env.APK_PATH || absoluteApkPath,
    'appium:appPackage': process.env.APP_PACKAGE || 'com.lifora',
    'appium:appActivity': process.env.APP_ACTIVITY || 'com.lifora.ui.activities.MainActivity',
    'appium:autoGrantPermissions': true,
    'appium:noReset': false,
    'appium:fullReset': false,
    'appium:newCommandTimeout': 300,
    'appium:uiautomator2ServerInstallTimeout': 60000,
    'appium:adbExecTimeout': 60000,
    'appium:ensureWebviewsHavePages': true,
    'appium:nativeWebScreenshot': true
  }
};
