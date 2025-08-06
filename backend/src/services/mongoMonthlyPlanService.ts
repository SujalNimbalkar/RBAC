import { MonthlyPlan, IMonthlyPlan } from '../models/MonthlyPlan';

export class MongoMonthlyPlanService {
  static async create(planData: Partial<IMonthlyPlan>): Promise<IMonthlyPlan> {
    const plan = new MonthlyPlan(planData);
    return await plan.save();
  }

  static async findById(id: string): Promise<IMonthlyPlan | null> {
    return await MonthlyPlan.findOne({ id });
  }

  static async updateById(id: string, updateData: Partial<IMonthlyPlan>): Promise<IMonthlyPlan | null> {
    return await MonthlyPlan.findOneAndUpdate({ id }, updateData, { new: true });
  }

  static async deleteById(id: string): Promise<boolean> {
    const result = await MonthlyPlan.deleteOne({ id });
    return result.deletedCount > 0;
  }

  static async getAll(): Promise<IMonthlyPlan[]> {
    return await MonthlyPlan.find().sort({ createdAt: -1 }).limit(100);
  }

  static async findByMonthAndYear(month: number, year: number): Promise<IMonthlyPlan | null> {
    return await MonthlyPlan.findOne({ month, year });
  }

  static async clearAll(): Promise<void> {
    await MonthlyPlan.deleteMany({});
  }
} 