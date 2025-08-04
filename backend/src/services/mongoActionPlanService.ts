import { ActionPlan, IActionPlan } from '../models/ActionPlan';

export class MongoActionPlanService {
  static async create(actionPlanData: Partial<IActionPlan>): Promise<IActionPlan> {
    const actionPlan = new ActionPlan(actionPlanData);
    return await actionPlan.save();
  }

  static async findById(id: string): Promise<IActionPlan | null> {
    return await ActionPlan.findOne({ id });
  }

  static async updateById(id: string, updateData: Partial<IActionPlan>): Promise<IActionPlan | null> {
    return await ActionPlan.findOneAndUpdate({ id }, updateData, { new: true });
  }

  static async deleteById(id: string): Promise<boolean> {
    const result = await ActionPlan.deleteOne({ id });
    return result.deletedCount > 0;
  }

  static async getAll(): Promise<IActionPlan[]> {
    return await ActionPlan.find().sort({ createdAt: -1 });
  }

  static async clearAll(): Promise<void> {
    await ActionPlan.deleteMany({});
  }

  static async findByDailyReportId(dailyReportId: string): Promise<IActionPlan[]> {
    return await ActionPlan.find({ dailyReportId }).sort({ createdAt: -1 });
  }

  static async findByDailyPlanId(dailyPlanId: string): Promise<IActionPlan[]> {
    return await ActionPlan.find({ dailyPlanId }).sort({ createdAt: -1 });
  }

  static async findByStatus(status: string): Promise<IActionPlan[]> {
    return await ActionPlan.find({ status }).sort({ createdAt: -1 });
  }
} 