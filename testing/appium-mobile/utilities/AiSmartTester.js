const logger = require('./Logger');

class AiSmartTester {
  constructor(driver) {
    this.driver = driver;
  }

  async analyzeScreen() {
    logger.info('🤖 AI Smart Tester: Analyzing active screen XML widget tree...');
    const xmlSource = await this.driver.getPageSource();
    
    const discoveredWidgets = {
      inputs: [],
      buttons: [],
      textViews: [],
      switches: [],
      checkboxes: []
    };

    // Regex analysis of Android XML dump
    const editTextMatches = xmlSource.match(/<android\.widget\.EditText[^>]*>/g) || [];
    editTextMatches.forEach(tag => {
      const resourceId = (tag.match(/resource-id="([^"]+)"/) || [])[1] || 'unnamed_input';
      const text = (tag.match(/text="([^"]+)"/) || [])[1] || '';
      const contentDesc = (tag.match(/content-desc="([^"]+)"/) || [])[1] || '';
      discoveredWidgets.inputs.push({ resourceId, text, contentDesc, tag });
    });

    const buttonMatches = xmlSource.match(/<(android\.widget\.Button|android\.widget\.ImageButton)[^>]*>/g) || [];
    buttonMatches.forEach(tag => {
      const resourceId = (tag.match(/resource-id="([^"]+)"/) || [])[1] || 'unnamed_button';
      const text = (tag.match(/text="([^"]+)"/) || [])[1] || '';
      const contentDesc = (tag.match(/content-desc="([^"]+)"/) || [])[1] || '';
      discoveredWidgets.buttons.push({ resourceId, text, contentDesc, tag });
    });

    logger.info(`🤖 AI Smart Tester Discovered: ${discoveredWidgets.inputs.length} Inputs, ${discoveredWidgets.buttons.length} Buttons.`);
    return discoveredWidgets;
  }

  async autoGenerateAndRunScenarios(discoveredWidgets) {
    logger.info('🤖 AI Smart Tester: Generating dynamic test scenarios from discovered widgets...');
    const generatedScenarios = [];

    // 1. Mandatory Field Validation Scenarios
    for (const input of discoveredWidgets.inputs) {
      const fieldName = input.contentDesc || input.resourceId || 'InputField';
      generatedScenarios.push({
        name: `AI Dynamic Validation: Mandatory Check for ${fieldName}`,
        field: input,
        action: 'EMPTY_SUBMIT',
        expectedBehavior: 'Validation error message triggered'
      });
      generatedScenarios.push({
        name: `AI Dynamic Validation: Boundary Check for ${fieldName}`,
        field: input,
        action: 'MAX_LENGTH_OVERFLOW',
        expectedBehavior: 'Input truncated or error shown'
      });
    }

    // 2. Navigation & Button Click Scenarios
    for (const button of discoveredWidgets.buttons) {
      const btnName = button.text || button.contentDesc || button.resourceId;
      generatedScenarios.push({
        name: `AI Dynamic Navigation: Click ${btnName}`,
        button,
        action: 'CLICK',
        expectedBehavior: 'Screen transition or action triggered'
      });
    }

    logger.info(`🤖 AI Smart Tester Generated ${generatedScenarios.length} dynamic E2E scenarios.`);
    return generatedScenarios;
  }
}

module.exports = AiSmartTester;
