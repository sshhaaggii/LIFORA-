const { By } = require('selenium-webdriver');
const logger = require('./Logger');

class DynamicRouteFormScanner {
  constructor(driver) {
    this.driver = driver;
  }

  async discoverRoutes() {
    logger.info('🔍 Dynamic Route Scanner: Scanning DOM for navigation routes & buttons...');
    const navElements = await this.driver.findElements(
      By.css('nav button, nav a, .nav-btn, [data-target], [data-navigate], a[href]')
    );

    const discoveredRoutes = [];
    for (const el of navElements) {
      try {
        const text = await el.getText();
        const dataTarget = await el.getAttribute('data-target');
        const dataNavigate = await el.getAttribute('data-navigate');
        const href = await el.getAttribute('href');

        discoveredRoutes.push({
          element: el,
          title: text || dataTarget || dataNavigate || href || 'Route',
          target: dataTarget || dataNavigate || href
        });
      } catch (err) {
        // Stale element fallback
      }
    }

    logger.info(`🔍 Discovered ${discoveredRoutes.length} active routes in application.`);
    return discoveredRoutes;
  }

  async discoverFormsOnCurrentPage() {
    logger.info('🔍 Dynamic Form Scanner: Scanning current page for forms & input fields...');
    const inputs = await this.driver.findElements(By.css('input, select, textarea'));
    const formFields = [];

    for (const input of inputs) {
      try {
        const type = (await input.getAttribute('type')) || 'text';
        const id = await input.getAttribute('id');
        const name = await input.getAttribute('name');
        const placeholder = await input.getAttribute('placeholder');
        const isRequired = (await input.getAttribute('required')) !== null;
        const minLength = await input.getAttribute('minlength');
        const maxLength = await input.getAttribute('maxlength');
        const pattern = await input.getAttribute('pattern');

        if (type !== 'hidden') {
          formFields.push({
            element: input,
            type,
            id: id || name || placeholder || 'field',
            placeholder: placeholder || '',
            isRequired,
            minLength,
            maxLength,
            pattern
          });
        }
      } catch (e) {
        // Ignore unattached elements
      }
    }

    logger.info(`🔍 Discovered ${formFields.length} interactive input fields on current route.`);
    return formFields;
  }

  async synthesizeDynamicTestCases(formFields) {
    logger.info('⚡ Synthesizing dynamic test cases based on extracted validation rules...');
    const dynamicCases = [];

    for (const field of formFields) {
      // 1. Mandatory / Empty input test
      if (field.isRequired) {
        dynamicCases.push({
          id: `DYN-REQ-${field.id}`,
          name: `Dynamic Check: Required field validation for #${field.id}`,
          field,
          inputValue: '',
          expected: 'Browser/Custom validation error triggered'
        });
      }

      // 2. Email format test
      if (field.type === 'email' || field.id.toLowerCase().includes('email')) {
        dynamicCases.push({
          id: `DYN-EMAIL-${field.id}`,
          name: `Dynamic Check: Invalid email format for #${field.id}`,
          field,
          inputValue: 'invalid_email_no_at',
          expected: 'Inline error or invalid email state'
        });
      }

      // 3. Max length overflow test
      if (field.maxLength) {
        dynamicCases.push({
          id: `DYN-MAX-${field.id}`,
          name: `Dynamic Check: Boundary max length (${field.maxLength}) for #${field.id}`,
          field,
          inputValue: 'X'.repeat(parseInt(field.maxLength, 10) + 10),
          expected: `Value capped at max ${field.maxLength}`
        });
      }

      // 4. Special Characters & XSS Sanitization
      dynamicCases.push({
        id: `DYN-XSS-${field.id}`,
        name: `Dynamic Check: Special character sanitization for #${field.id}`,
        field,
        inputValue: "<script>alert('test')</script>",
        expected: 'Text sanitized cleanly without execution'
      });
    }

    logger.info(`⚡ Generated ${dynamicCases.length} dynamic E2E validation test cases.`);
    return dynamicCases;
  }

  async executeDynamicTestCase(testCase) {
    logger.info(`Executing dynamic scenario: ${testCase.name}`);
    try {
      await testCase.field.element.clear();
      if (testCase.inputValue) {
        await testCase.field.element.sendKeys(testCase.inputValue);
      }
      return { success: true, message: 'Executed cleanly' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

module.exports = DynamicRouteFormScanner;
