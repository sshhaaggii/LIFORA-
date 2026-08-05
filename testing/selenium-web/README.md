# LIFORA Selenium WebDriver React Web E2E Automation Framework

An enterprise-grade, production-ready web test automation framework built for React applications using Node.js, Selenium WebDriver, Mocha, Chai, Mochawesome, ExcelJS, Winston, and **Smart Dynamic Route & Form Auto-Discovery Engine**.

---

## 🌟 Key Features

- **Multi-Browser & Headless Support**: Full support for Google Chrome, Firefox, and Microsoft Edge in both Headed and Headless modes.
- **Smart Dynamic Route & Form Auto-Discovery (`DynamicRouteFormScanner.js`)**: Automatically scans React application routes, discovers interactive inputs (`<input>`, `<select>`, `<textarea>`), extracts validation constraints (`required`, `email`, `maxLength`, `pattern`), and dynamically synthesizes and executes test cases on the fly.
- **Page Object Model (POM)**: Decoupled Page Objects (`AuthPage.js`, `EmergencyPage.js`, `SignLanguagePage.js`) with explicit waits, JS execution, and alert handling.
- **4-Sheet Excel Reporting (`ExcelReportGenerator.js`)**: Generates `E2E_Report.xlsx` with Summary, Test Cases, Failed Tests, and Execution Logs.
- **Mochawesome HTML Dashboard**: Interactive HTML reports featuring pass/fail charts and embedded screenshot links under `reports/`.
- **Winston Enterprise Logger**: Timestamped logs output to console and file (`reports/logs/selenium_execution.log`).
- **Failure Diagnostic Suite**: Captures screenshot, browser console logs, current URL, and stack trace on failure in `reports/failures/`.
- **CI/CD Automation**: GitHub Actions workflow (`.github/workflows/selenium-e2e.yml`).

---

## 📁 Framework Structure

```
testing/selenium-web/
├── config/
│   └── selenium.config.js        # Multi-browser & timeout settings
├── drivers/
│   └── WebDriverFactory.js       # Browser launch & lifecycle management
├── pages/
│   ├── BasePage.js               # Reusable explicit waits, scrolling & alerts
│   ├── AuthPage.js               # Sign-In / Sign-Up page object
│   ├── EmergencyPage.js          # Helpline, contacts & SOS page object
│   └── SignLanguagePage.js       # Live CV Sign Language AI page object
├── utilities/
│   ├── DynamicRouteFormScanner.js# Smart React Route & Form Auto-Discovery engine
│   ├── FailureHandler.js         # Screenshots & browser console log capture
│   ├── ExcelReportGenerator.js   # 4-sheet Excel report generator
│   ├── Logger.js                 # Winston logger utility
│   └── RetryHandler.js           # Automated test retry handler
├── tests/
│   ├── auth.test.js              # Web authentication scenarios
│   ├── formValidation.test.js    # Input boundary & form rules tests
│   ├── navigation.test.js        # Routing & navigation tests
│   └── dynamicDiscovery.test.js  # Dynamic React Route & Form discovery suite
├── .mocharc.json                 # Mocha test runner config
├── package.json                  # Dependencies & test scripts
└── README.md                     # Documentation & setup guide
```

---

## 🚀 Execution Instructions

### Installation

1. Navigate to the Selenium web test directory:
   ```bash
   cd testing/selenium-web
   npm install
   ```

### Running Tests

- Run full test suite in default Chrome browser:
  ```bash
  npm test
  ```

- Run in Headless mode:
  ```bash
  HEADLESS=true npm test
  ```

- Run on Firefox or Microsoft Edge:
  ```bash
  BROWSER=firefox npm test
  BROWSER=edge npm test
  ```

- Run specific test modules:
  ```bash
  npm run test:auth       # Run Authentication tests
  npm run test:forms      # Run Form validation tests
  npm run test:nav        # Run Navigation tests
  npm run test:dynamic    # Run Smart Dynamic Route & Form Discovery tests
  ```

---

## 📊 Test Reports

After execution:
- **Interactive HTML Report**: Open `reports/html/index.html` in your browser.
- **Excel Report**: View `reports/excel/E2E_Report.xlsx`.
- **Failure Screenshots & Console Logs**: Check `reports/failures/`.
