import { DailyReport, IDailyReport } from '../models/DailyReport';

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
    return await DailyReport.findOneAndUpdate(
      { id },
      { $set: { ...reportData, status: 'completed' } },
      { new: true }
    );
  }
} 