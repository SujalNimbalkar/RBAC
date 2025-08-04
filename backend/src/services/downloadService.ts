import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { IMonthlyPlan } from '../models/MonthlyPlan';
import { IWeeklyPlan } from '../models/WeeklyPlan';
import { IDailyPlan } from '../models/DailyPlan';
import { IDailyReport } from '../models/DailyReport';

export class DownloadService {
  
  // Generate PDF for Monthly Plan
  static generateMonthlyPlanPDF(plan: IMonthlyPlan): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', reject);
      
      // Add document header info in top right
      doc.fontSize(8);
      doc.text('Doc No. F-PRD-01', 400, 50);
      doc.text('Rev No./Date: 00', 400, 65);
      doc.text('Issue Date: 01-04-2024', 400, 80);
      
      // Add main header
      doc.fontSize(20).text('Monthly Production Plan', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Month: ${plan.month}/${plan.year}`, { align: 'center' });
      doc.moveDown();
      
      // Add items table
      doc.fontSize(12).text('Production Items:', { underline: true });
      doc.moveDown();
      
      const tableTop = doc.y;
      let tableY = tableTop;
      
      // Table headers
      doc.fontSize(10);
      doc.text('Item Code', 50, tableY);
      doc.text('Item Name', 150, tableY);
      doc.text('Customer', 300, tableY);
      doc.text('Quantity', 450, tableY);
      
      tableY += 20;
      
      // Table rows
      plan.items.forEach((item, index) => {
        doc.text(item.itemCode, 50, tableY);
        doc.text(item.itemName, 150, tableY);
        doc.text(item.customerName, 300, tableY);
        doc.text(item.monthlyQuantity.toString(), 450, tableY);
        tableY += 15;
      });
      
      doc.end();
    });
  }
  
  // Generate Excel for Monthly Plan
  static async generateMonthlyPlanExcel(plan: IMonthlyPlan): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Monthly Plan');
    
          // Add document header info in top right
      worksheet.getCell('D1').value = 'Doc No. F-PRD-01';
      worksheet.getCell('D1').font = { size: 10 };
      worksheet.getCell('D1').alignment = { horizontal: 'right' };
      
      worksheet.getCell('D2').value = 'Rev No./Date: 00';
      worksheet.getCell('D2').font = { size: 10 };
      worksheet.getCell('D2').alignment = { horizontal: 'right' };
      
      worksheet.getCell('D3').value = 'Issue Date: 01-04-2024';
      worksheet.getCell('D3').font = { size: 10 };
      worksheet.getCell('D3').alignment = { horizontal: 'right' };
      
      // Add title
      worksheet.mergeCells('A1:C1');
      worksheet.getCell('A1').value = `Monthly Production Plan - ${plan.month}/${plan.year}`;
      worksheet.getCell('A1').font = { bold: true, size: 16 };
      worksheet.getCell('A1').alignment = { horizontal: 'center' };
    
    // Add headers
    worksheet.getCell('A3').value = 'Item Code';
    worksheet.getCell('B3').value = 'Item Name';
    worksheet.getCell('C3').value = 'Customer';
    worksheet.getCell('D3').value = 'Monthly Quantity';
    
    // Style headers
    ['A3', 'B3', 'C3', 'D3'].forEach(cell => {
      worksheet.getCell(cell).font = { bold: true };
      worksheet.getCell(cell).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    });
    
    // Add data
    plan.items.forEach((item, index) => {
      const row = index + 4;
      worksheet.getCell(`A${row}`).value = item.itemCode;
      worksheet.getCell(`B${row}`).value = item.itemName;
      worksheet.getCell(`C${row}`).value = item.customerName;
      worksheet.getCell(`D${row}`).value = item.monthlyQuantity;
    });
    
    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 15;
    });
    
    return await workbook.xlsx.writeBuffer() as unknown as Buffer;
  }
  
  // Generate PDF for Weekly Plan
  static generateWeeklyPlanPDF(plan: IWeeklyPlan): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', reject);
      
      // Add document header info in top right
      doc.fontSize(8);
      doc.text('Doc No. F-PRD-01', 400, 50);
      doc.text('Rev No./Date: 00', 400, 65);
      doc.text('Issue Date: 01-04-2024', 400, 80);
      
      // Add main header
      doc.fontSize(20).text('Weekly Production Plan', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Week ${plan.weekNumber} (${new Date(plan.weekStartDate).toLocaleDateString()} - ${new Date(plan.weekEndDate).toLocaleDateString()})`, { align: 'center' });
      doc.moveDown();
      
      // Add items table
      doc.fontSize(12).text('Production Items:', { underline: true });
      doc.moveDown();
      
      const tableTop = doc.y;
      let tableY = tableTop;
      
      // Table headers
      doc.fontSize(10);
      doc.text('Item Code', 50, tableY);
      doc.text('Item Name', 150, tableY);
      doc.text('Customer', 300, tableY);
      doc.text('Weekly Qty', 450, tableY);
      
      tableY += 20;
      
      // Table rows
      plan.items.forEach((item, index) => {
        doc.text(item.itemCode, 50, tableY);
        doc.text(item.itemName, 150, tableY);
        doc.text(item.customerName, 300, tableY);
        doc.text(Object.values(item.weeklyQuantities || {}).reduce((a, b) => a + b, 0).toString(), 450, tableY);
        tableY += 15;
      });
      
      doc.end();
    });
  }
  
  // Generate Excel for Weekly Plan
  static async generateWeeklyPlanExcel(plan: IWeeklyPlan): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Weekly Plan');
    
          // Add document header info in top right
      worksheet.getCell('D1').value = 'Doc No. F-PRD-01';
      worksheet.getCell('D1').font = { size: 10 };
      worksheet.getCell('D1').alignment = { horizontal: 'right' };
      
      worksheet.getCell('D2').value = 'Rev No./Date: 00';
      worksheet.getCell('D2').font = { size: 10 };
      worksheet.getCell('D2').alignment = { horizontal: 'right' };
      
      worksheet.getCell('D3').value = 'Issue Date: 01-04-2024';
      worksheet.getCell('D3').font = { size: 10 };
      worksheet.getCell('D3').alignment = { horizontal: 'right' };
      
      // Add title
      worksheet.mergeCells('A1:C1');
      worksheet.getCell('A1').value = `Weekly Production Plan - Week ${plan.weekNumber}`;
      worksheet.getCell('A1').font = { bold: true, size: 16 };
      worksheet.getCell('A1').alignment = { horizontal: 'center' };
      
      // Add date range
      worksheet.mergeCells('A2:C2');
      worksheet.getCell('A2').value = `${new Date(plan.weekStartDate).toLocaleDateString()} - ${new Date(plan.weekEndDate).toLocaleDateString()}`;
      worksheet.getCell('A2').alignment = { horizontal: 'center' };
    
    // Add headers
    worksheet.getCell('A4').value = 'Item Code';
    worksheet.getCell('B4').value = 'Item Name';
    worksheet.getCell('C4').value = 'Customer';
    worksheet.getCell('D4').value = 'Weekly Quantity';
    
    // Style headers
    ['A4', 'B4', 'C4', 'D4'].forEach(cell => {
      worksheet.getCell(cell).font = { bold: true };
      worksheet.getCell(cell).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    });
    
    // Add data
    plan.items.forEach((item, index) => {
      const row = index + 5;
      worksheet.getCell(`A${row}`).value = item.itemCode;
      worksheet.getCell(`B${row}`).value = item.itemName;
      worksheet.getCell(`C${row}`).value = item.customerName;
      worksheet.getCell(`D${row}`).value = Object.values(item.weeklyQuantities || {}).reduce((a, b) => a + b, 0);
    });
    
    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 15;
    });
    
    return await workbook.xlsx.writeBuffer() as unknown as Buffer;
  }
  
  // Generate PDF for Daily Plan
  static generateDailyPlanPDF(plan: IDailyPlan): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', reject);
      
      // Add document header info in top right
      doc.fontSize(8);
      doc.text('Doc No. F-PRD-01', 400, 50);
      doc.text('Rev No./Date: 00', 400, 65);
      doc.text('Issue Date: 01-04-2024', 400, 80);
      
      // Add main header
      doc.fontSize(20).text('Daily Production Plan', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Day ${plan.dayNumber} - ${new Date(plan.date).toLocaleDateString()}`, { align: 'center' });
      doc.moveDown();
      
      // Add entries table
      doc.fontSize(12).text('Production Entries:', { underline: true });
      doc.moveDown();
      
      const tableTop = doc.y;
      let tableY = tableTop;
      
      // Table headers
      doc.fontSize(8);
      doc.text('Dept', 50, tableY);
      doc.text('Operator', 120, tableY);
      doc.text('Work', 200, tableY);
      doc.text('H1 Plan', 350, tableY);
      doc.text('H2 Plan', 420, tableY);
      doc.text('OT Plan', 490, tableY);
      doc.text('Target', 560, tableY);
      
      tableY += 15;
      
      // Table rows
      plan.entries.forEach((entry, index) => {
        doc.text(entry.deptName, 50, tableY);
        doc.text(entry.operatorName, 120, tableY);
        doc.text(entry.work, 200, tableY);
        doc.text(entry.h1Plan.toString(), 350, tableY);
        doc.text(entry.h2Plan.toString(), 420, tableY);
        doc.text(entry.otPlan.toString(), 490, tableY);
        doc.text(entry.target.toString(), 560, tableY);
        tableY += 12;
      });
      
      doc.end();
    });
  }
  
  // Generate Excel for Daily Plan
  static async generateDailyPlanExcel(plan: IDailyPlan): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Daily Plan');
    
          // Add document header info in top right
      worksheet.getCell('G1').value = 'Doc No. F-PRD-01';
      worksheet.getCell('G1').font = { size: 10 };
      worksheet.getCell('G1').alignment = { horizontal: 'right' };
      
      worksheet.getCell('G2').value = 'Rev No./Date: 00';
      worksheet.getCell('G2').font = { size: 10 };
      worksheet.getCell('G2').alignment = { horizontal: 'right' };
      
      worksheet.getCell('G3').value = 'Issue Date: 01-04-2024';
      worksheet.getCell('G3').font = { size: 10 };
      worksheet.getCell('G3').alignment = { horizontal: 'right' };
      
      // Add title
      worksheet.mergeCells('A1:F1');
      worksheet.getCell('A1').value = `Daily Production Plan - Day ${plan.dayNumber}`;
      worksheet.getCell('A1').font = { bold: true, size: 16 };
      worksheet.getCell('A1').alignment = { horizontal: 'center' };
      
      // Add date
      worksheet.mergeCells('A2:F2');
      worksheet.getCell('A2').value = new Date(plan.date).toLocaleDateString();
      worksheet.getCell('A2').alignment = { horizontal: 'center' };
    
    // Add headers
    const headers = ['Department', 'Operator', 'Work', 'H1 Plan', 'H2 Plan', 'OT Plan', 'Target'];
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(4, index + 1);
      cell.value = header;
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    });
    
    // Add data
    plan.entries.forEach((entry, index) => {
      const row = index + 5;
      worksheet.getCell(row, 1).value = entry.deptName;
      worksheet.getCell(row, 2).value = entry.operatorName;
      worksheet.getCell(row, 3).value = entry.work;
      worksheet.getCell(row, 4).value = entry.h1Plan;
      worksheet.getCell(row, 5).value = entry.h2Plan;
      worksheet.getCell(row, 6).value = entry.otPlan;
      worksheet.getCell(row, 7).value = entry.target;
    });
    
    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 15;
    });
    
    return await workbook.xlsx.writeBuffer() as unknown as Buffer;
  }
  
  // Generate PDF for Daily Report
  static generateDailyReportPDF(report: IDailyReport): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', reject);
      
      // Add document header info in top right
      doc.fontSize(8);
      doc.text('Doc No. F-PRD-01', 400, 50);
      doc.text('Rev No./Date: 00', 400, 65);
      doc.text('Issue Date: 01-04-2024', 400, 80);
      
      // Add main header
      doc.fontSize(20).text('Daily Production Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(report.title, { align: 'center' });
      doc.moveDown();
      
      // Add entries table
      doc.fontSize(12).text('Production Entries:', { underline: true });
      doc.moveDown();
      
      const tableTop = doc.y;
      let tableY = tableTop;
      
      // Table headers
      doc.fontSize(7);
      doc.text('Dept', 30, tableY);
      doc.text('Operator', 80, tableY);
      doc.text('Work', 140, tableY);
      doc.text('H1 Plan', 220, tableY);
      doc.text('H2 Plan', 270, tableY);
      doc.text('OT Plan', 320, tableY);
      doc.text('Target', 370, tableY);
      doc.text('H1 Actual', 420, tableY);
      doc.text('H2 Actual', 470, tableY);
      doc.text('OT Actual', 520, tableY);
      doc.text('Actual', 570, tableY);
      doc.text('Defects', 620, tableY);
      doc.text('%', 670, tableY);
      
      tableY += 12;
      
      // Table rows
      report.entries.forEach((entry, index) => {
        doc.text(entry.deptName, 30, tableY);
        doc.text(entry.operatorName, 80, tableY);
        doc.text(entry.work, 140, tableY);
        doc.text(entry.h1Plan.toString(), 220, tableY);
        doc.text(entry.h2Plan.toString(), 270, tableY);
        doc.text(entry.otPlan.toString(), 320, tableY);
        doc.text(entry.target.toString(), 370, tableY);
        doc.text((entry.h1Actual || 0).toString(), 420, tableY);
        doc.text((entry.h2Actual || 0).toString(), 470, tableY);
        doc.text((entry.otActual || 0).toString(), 520, tableY);
        doc.text((entry.actualProduction || 0).toString(), 570, tableY);
        doc.text((entry.qualityDefect || 0).toString(), 620, tableY);
        doc.text(entry.productionPercentage ? `${entry.productionPercentage.toFixed(1)}%` : '--', 670, tableY);
        tableY += 10;
      });
      
      doc.end();
    });
  }
  
  // Generate Excel for Daily Report
  static async generateDailyReportExcel(report: IDailyReport): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Daily Report');
    
          // Add document header info in top right
      worksheet.getCell('N1').value = 'Doc No. F-PRD-01';
      worksheet.getCell('N1').font = { size: 10 };
      worksheet.getCell('N1').alignment = { horizontal: 'right' };
      
      worksheet.getCell('N2').value = 'Rev No./Date: 00';
      worksheet.getCell('N2').font = { size: 10 };
      worksheet.getCell('N2').alignment = { horizontal: 'right' };
      
      worksheet.getCell('N3').value = 'Issue Date: 01-04-2024';
      worksheet.getCell('N3').font = { size: 10 };
      worksheet.getCell('N3').alignment = { horizontal: 'right' };
      
      // Add title
      worksheet.mergeCells('A1:M1');
      worksheet.getCell('A1').value = report.title;
      worksheet.getCell('A1').font = { bold: true, size: 16 };
      worksheet.getCell('A1').alignment = { horizontal: 'center' };
    
    // Add headers
    const headers = [
      'Department', 'Operator', 'Work', 'H1 Plan', 'H2 Plan', 'OT Plan', 'Target',
      'H1 Actual', 'H2 Actual', 'OT Actual', 'Actual Production', 'Quality Defects', 'Production %'
    ];
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(3, index + 1);
      cell.value = header;
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    });
    
    // Add data
    report.entries.forEach((entry, index) => {
      const row = index + 4;
      worksheet.getCell(row, 1).value = entry.deptName;
      worksheet.getCell(row, 2).value = entry.operatorName;
      worksheet.getCell(row, 3).value = entry.work;
      worksheet.getCell(row, 4).value = entry.h1Plan;
      worksheet.getCell(row, 5).value = entry.h2Plan;
      worksheet.getCell(row, 6).value = entry.otPlan;
      worksheet.getCell(row, 7).value = entry.target;
      worksheet.getCell(row, 8).value = entry.h1Actual || 0;
      worksheet.getCell(row, 9).value = entry.h2Actual || 0;
      worksheet.getCell(row, 10).value = entry.otActual || 0;
      worksheet.getCell(row, 11).value = entry.actualProduction || 0;
      worksheet.getCell(row, 12).value = entry.qualityDefect || 0;
      worksheet.getCell(row, 13).value = entry.productionPercentage ? `${entry.productionPercentage.toFixed(1)}%` : '--';
    });
    
    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 12;
    });
    
    return await workbook.xlsx.writeBuffer() as unknown as Buffer;
  }
} 