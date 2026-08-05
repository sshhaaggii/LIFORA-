const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const logger = require('./Logger');

class ExcelReportGenerator {
  constructor() {
    this.reportDir = path.resolve(__dirname, '../reports/excel');
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
    this.filePath = path.join(this.reportDir, 'E2E_Report.xlsx');
    this.testResults = [];
    this.logs = [];
    this.startTime = new Date();
  }

  recordTest(testData) {
    this.testResults.push({
      testId: testData.testId || `WEB-TC-${this.testResults.length + 1}`,
      module: testData.module || 'Web Module',
      scenarioName: testData.scenarioName || 'React Web Scenario',
      browser: testData.browser || process.env.BROWSER || 'Chrome',
      status: testData.status || 'PASSED',
      startTime: testData.startTime || new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: testData.duration || '0ms',
      failureReason: testData.failureReason || 'N/A',
      screenshotPath: testData.screenshotPath || 'N/A',
      url: testData.url || 'N/A'
    });
  }

  recordLog(testName, stepDescription, result, remarks = '') {
    this.logs.push({
      timestamp: new Date().toISOString(),
      testName,
      stepDescription,
      result,
      remarks
    });
  }

  async generateFinalReport() {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'LIFORA Web QA Automation Architect';
    workbook.created = new Date();

    const totalTests = this.testResults.length;
    const passed = this.testResults.filter(t => t.status === 'PASSED').length;
    const failed = this.testResults.filter(t => t.status === 'FAILED').length;
    const skipped = this.testResults.filter(t => t.status === 'SKIPPED').length;
    const passPercentage = totalTests > 0 ? ((passed / totalTests) * 100).toFixed(2) + '%' : '0%';
    const totalDurationMs = new Date() - this.startTime;

    // Sheet 1: Summary
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 45 }
    ];
    summarySheet.addRows([
      { metric: 'Execution Date', value: new Date().toLocaleString() },
      { metric: 'Environment', value: process.env.NODE_ENV || 'Local Dev / Staging' },
      { metric: 'Total Tests', value: totalTests },
      { metric: 'Passed', value: passed },
      { metric: 'Failed', value: failed },
      { metric: 'Skipped', value: skipped },
      { metric: 'Pass Percentage', value: passPercentage },
      { metric: 'Execution Duration', value: `${totalDurationMs} ms` }
    ]);

    // Sheet 2: Test Cases
    const casesSheet = workbook.addWorksheet('Test Cases');
    casesSheet.columns = [
      { header: 'Test ID', key: 'testId', width: 15 },
      { header: 'Module', key: 'module', width: 20 },
      { header: 'Scenario Name', key: 'scenarioName', width: 35 },
      { header: 'Browser', key: 'browser', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Start Time', key: 'startTime', width: 24 },
      { header: 'End Time', key: 'endTime', width: 24 },
      { header: 'Duration', key: 'duration', width: 15 }
    ];
    this.testResults.forEach(r => casesSheet.addRow(r));

    // Sheet 3: Failed Tests
    const failedSheet = workbook.addWorksheet('Failed Tests');
    failedSheet.columns = [
      { header: 'Test Name', key: 'scenarioName', width: 35 },
      { header: 'Failure Reason', key: 'failureReason', width: 55 },
      { header: 'Screenshot Path', key: 'screenshotPath', width: 45 },
      { header: 'Browser', key: 'browser', width: 15 },
      { header: 'URL', key: 'url', width: 40 }
    ];
    const failedList = this.testResults.filter(t => t.status === 'FAILED');
    failedList.forEach(f => failedSheet.addRow(f));

    // Sheet 4: Execution Logs
    const logsSheet = workbook.addWorksheet('Execution Logs');
    logsSheet.columns = [
      { header: 'Timestamp', key: 'timestamp', width: 25 },
      { header: 'Test Name', key: 'testName', width: 30 },
      { header: 'Step Description', key: 'stepDescription', width: 45 },
      { header: 'Result', key: 'result', width: 12 },
      { header: 'Remarks', key: 'remarks', width: 30 }
    ];
    this.logs.forEach(l => logsSheet.addRow(l));

    // Style Headers
    [summarySheet, casesSheet, failedSheet, logsSheet].forEach(sheet => {
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0F172A' }
      };
    });

    await workbook.xlsx.writeFile(this.filePath);
    logger.info(`Selenium Excel E2E Report generated at: ${this.filePath}`);
    return this.filePath;
  }
}

module.exports = new ExcelReportGenerator();
