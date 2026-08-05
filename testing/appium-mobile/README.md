# LIFORA Appium 2.x Android Mobile E2E Automation Framework

An enterprise-grade, production-ready mobile test automation framework designed for React Native Android applications using Node.js, Appium 2.x, UiAutomator2, Mocha, Chai, Mochawesome, and ExcelJS.

---

## 🌟 Key Capabilities

- **Appium 2.x Architecture**: Native driver integration for Android (`UiAutomator2` & React Native locators).
- **Auto APK Installation**: Installs and launches `./frontend/app/build/outputs/apk/debug/app-debug.apk` automatically before test runs.
- **Smart AI Screen Discovery Engine (`AiSmartTester.js`)**: Auto-inspects screen XML tree, discovers inputs and buttons, and dynamically executes form validation and navigation scenarios.
- **W3C Mobile Gesture Suite (`GestureUtils.js`)**: Reusable implementations of Tap, Double Tap, Long Press, Vertical/Horizontal Scroll, Swipe, Drag & Drop, Pinch, and Zoom.
- **4-Sheet Excel Reporting (`ExcelReportGenerator.js`)**: Generates `React_Native_E2E_Report.xlsx` with Summary, Test Cases, Failed Tests, and Execution Logs.
- **Mochawesome HTML Dashboard**: Produces interactive HTML reports with screenshots and failure diagnostics under `reports/`.
- **Winston Enterprise Logger**: Multi-level timestamped logs saved to console and `reports/logs/appium_execution.log`.
- **CI/CD Integration**: Pre-configured GitHub Actions workflow (`.github/workflows/React native-appium.yml`).

---

## 📁 Directory Structure

```
testing/appium-mobile/
├── config/
│   └── appium.config.js          # Appium 2.x server & capabilities configuration
├── drivers/
│   └── DriverFactory.js          # Session lifecycle, device auto-detection & teardown
├── pages/
│   ├── BasePage.js               # Common interaction methods & locator helpers
│   ├── LoginScreen.js            # Login & authentication page object
│   ├── HomeScreen.js             # Emergency dashboard page object
│   └── SosScreen.js              # Active SOS overlay page object
├── utilities/
│   ├── GestureUtils.js           # Full touch gesture utility suite
│   ├── AiSmartTester.js          # AI screen analyzer & dynamic test case generator
│   ├── FailureHandler.js         # Captures screenshot, page source XML & logcat on failure
│   ├── ExcelReportGenerator.js   # 4-sheet Excel report generator
│   └── Logger.js                 # Winston logger utility
├── tests/
│   ├── auth.test.js              # Authentication test scenarios
│   ├── formValidation.test.js    # Input boundary & form validation test scenarios
│   ├── gestures.test.js          # Mobile gesture interaction tests
│   └── aiSmartTest.test.js       # Dynamic AI-driven screen discovery test
├── .mocharc.json                 # Mocha configuration
├── package.json                  # Node.js dependencies & test scripts
└── README.md                     # Documentation & usage guide
```

---

## 🚀 Getting Started

### Prerequisites

1. **Node.js** v18+ installed.
2. **Android SDK** with `adb` added to system PATH.
3. **Appium 2.x** installed globally or locally:
   ```bash
   npm install -g appium
   appium driver install uiautomator2
   ```
4. **Android Emulator** or **Connected Real Android Device** with USB Debugging enabled.

---

### Installation & Execution

1. Navigate to the Appium test directory:
   ```bash
   cd testing/appium-mobile
   npm install
   ```

2. Start the Appium 2.x server:
   ```bash
   appium
   ```

3. Run the full test suite:
   ```bash
   npm test
   ```

4. Run specific test modules:
   ```bash
   npm run test:auth       # Run Authentication tests
   npm run test:forms      # Run Form validation tests
   npm run test:gestures   # Run Mobile gesture tests
   npm run test:ai         # Run AI Smart screen discovery tests
   ```

---

## 📊 Test Reports

After execution:
- **Interactive HTML Report**: Open `reports/html/index.html` in your browser.
- **Excel Report**: Check `reports/excel/React_Native_E2E_Report.xlsx`.
- **Failure Diagnostics**: Screenshots and XML widget logs are saved under `reports/failures/`.
