import { DailyReport, IDailyReport } from '../models/DailyReport';
import { generateId } from '../utils/idGenerator';

export class MongoDailyReportService {
  static async create(reportData: Partial<IDailyReport>): Promise<IDailyReport> {
    const report = new DailyReport(reportData);
    return await report.save();
  }

  static async findById(id: string): Promise<IDailyReport | null> {
    return await DailyReport.findOne({ id });
  }

  static async updateById(id: string, updateData: Partial<IDailyReport>): Promise<IDailyReport | null> {
    return await DailyReport.findOneAndUpdate({ id }, updateData, { new: true });
  }

  static async deleteById(id: string): Promise<boolean> {
    const result = await DailyReport.deleteOne({ id });
    return result.deletedCount > 0;
  }

  static async getAll(): Promise<IDailyReport[]> {
    return await DailyReport.find().sort({ createdAt: -1 });
  }

  static async clearAll(): Promise<void> {
    await DailyReport.deleteMany({});
  }

  static async findByDailyPlanId(dailyPlanId: string): Promise<IDailyReport | null> {
    return await DailyReport.findOne({ dailyPlanId });
  }

  static async submit(id: string, reportData: any): Promise<IDailyReport | null> {
    try {
      // First, get the existing report to ensure we don't overwrite required fields
      const existingReport = await DailyReport.findOne({ id });
      if (!existingReport) {
        throw new Error('Daily report not found');
      }

      // Process entries with proper structure and IDs
      const processedEntries = reportData.entries?.map((entry: any) => {
        const productionPercentage = entry.actualProduction && entry.target 
          ? (entry.actualProduction / entry.target) * 100 
          : 0;

        // Validate action plan fields for entries with production < 85%
        if (productionPercentage < 85 && productionPercentage > 0) {
          if (!entry.reason || entry.reason.trim() === '') {
            throw new Error(`Reason for low production is mandatory when production is below 85% (current: ${productionPercentage.toFixed(1)}%)`);
          }
          if (!entry.correctiveActions || entry.correctiveActions.trim() === '') {
            throw new Error(`Corrective actions are mandatory when production is below 85% (current: ${productionPercentage.toFixed(1)}%)`);
          }
          if (!entry.responsiblePerson || entry.responsiblePerson.trim() === '') {
            throw new Error(`Responsible person is mandatory when production is below 85% (current: ${productionPercentage.toFixed(1)}%)`);
          }
          if (!entry.targetCompletionDate || entry.targetCompletionDate.trim() === '') {
            throw new Error(`Target completion date is mandatory when production is below 85% (current: ${productionPercentage.toFixed(1)}%)`);
          }
        }

        return {
          id: entry.id || generateId(),
          deptName: entry.deptName || '',
          operatorName: entry.operatorName || '',
          work: entry.work || '',
          h1Plan: entry.h1Plan || 0,
          h2Plan: entry.h2Plan || 0,
          otPlan: entry.otPlan || 0,
          target: entry.target || 0,
          h1Actual: entry.h1Actual || 0,
          h2Actual: entry.h2Actual || 0,
          otActual: entry.otActual || 0,
          actualProduction: entry.actualProduction || 0,
          qualityDefect: entry.qualityDefect || 0,
          productionPercentage: productionPercentage,
          reason: entry.reason || '',
          correctiveActions: entry.correctiveActions || '',
          responsiblePerson: entry.responsiblePerson || '',
          targetCompletionDate: entry.targetCompletionDate || ''
        };
      }) || [];

      // Only update the fields that should be updated
      const updateData: any = {
        entries: processedEntries,
        status: 'completed',
        submittedAt: new Date().toISOString()
      };

      // Add notes if provided (if the schema supports it)
      if (reportData.notes) {
        updateData.notes = reportData.notes;
      }

      return await DailyReport.findOneAndUpdate(
        { id },
        { $set: updateData },
        { new: true }
      );
    } catch (error) {
      console.error('Error in submit function:', error);
      throw error;
    }
  }
} 