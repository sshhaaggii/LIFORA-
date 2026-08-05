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
    this.filePath = path.join(this.reportDir, 'React_Native_E2E_Report.xlsx');
    this.testResults = [];
    this.logs = [];
    this.startTime = new Date();
  }

  recordTest(testData) {
    this.testResults.push({
      testId: testData.testId || `TC-${this.testResults.length + 1}`,
      module: testData.module || 'Mobile Module',
      scenario: testData.scenario || 'Android Scenario',
      status: testData.status || 'PASSED',
      device: testData.device || 'Android Emulator',
      androidVersion: testData.androidVersion || '14.0',
      duration: testData.duration || '0ms',
      failureReason: testData.failureReason || 'N/A',
      screenshotPath: testData.screenshotPath || 'N/A'
    });
  }

  recordLog(testName, step, result, remarks = '') {
    this.logs.push({
      timestamp: new Date().toISOString(),
      testName,
      step,
      result,
      remarks
    });
  }

  async generateFinalReport() {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'LIFORA Mobile QA Architecture';
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
      { header: 'Value', key: 'value', width: 35 }
    ];
    summarySheet.addRows([
      { metric: 'Execution Date', value: new Date().toLocaleString() },
      { metric: 'Device Name', value: process.env.DEVICE_NAME || 'Android Emulator' },
      { metric: 'Android Version', value: process.env.PLATFORM_VERSION || '14.0' },
      { metric: 'Total Tests Executed', value: totalTests },
      { metric: 'Passed Tests', value: passed },
      { metric: 'Failed Tests', value: failed },
      { metric: 'Skipped Tests', value: skipped },
      { metric: 'Pass Percentage', value: passPercentage },
      { metric: 'Execution Duration (ms)', value: `${totalDurationMs} ms` }
    ]);

    // Sheet 2: Test Cases
    const casesSheet = workbook.addWorksheet('Test Cases');
    casesSheet.columns = [
      { header: 'Test ID', key: 'testId', width: 15 },
      { header: 'Module', key: 'module', width: 20 },
      { header: 'Scenario', key: 'scenario', width: 40 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Device', key: 'device', width: 20 },
      { header: 'Duration', key: 'duration', width: 15 }
    ];
    this.testResults.forEach(r => casesSheet.addRow(r));

    // Sheet 3: Failed Tests
    const failedSheet = workbook.addWorksheet('Failed Tests');
    failedSheet.columns = [
      { header: 'Test Name', key: 'scenario', width: 35 },
      { header: 'Failure Reason', key: 'failureReason', width: 55 },
      { header: 'Screenshot Path', key: 'screenshotPath', width: 45 },
      { header: 'Device', key: 'device', width: 20 },
      { header: 'Android Version', key: 'androidVersion', width: 18 }
    ];
    const failedList = this.testResults.filter(t => t.status === 'FAILED');
    failedList.forEach(f => failedSheet.addRow(f));

    // Sheet 4: Execution Logs
    const logsSheet = workbook.addWorksheet('Execution Logs');
    logsSheet.columns = [
      { header: 'Timestamp', key: 'timestamp', width: 25 },
      { header: 'Test Name', key: 'testName', width: 30 },
      { header: 'Step', key: 'step', width: 40 },
      { header: 'Result', key: 'result', width: 12 },
      { header: 'Remarks', key: 'remarks', width: 30 }
    ];
    this.logs.forEach(l => logsSheet.addRow(l));

    // Style Header Rows
    [summarySheet, casesSheet, failedSheet, logsSheet].forEach(sheet => {
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1E293B' }
      };
    });

    await workbook.xlsx.writeFile(this.filePath);
    logger.info(`React Native Excel E2E Report generated at: ${this.filePath}`);
    return this.filePath;
  }
}

module.exports = new ExcelReportGenerator();
