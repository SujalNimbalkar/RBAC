import { WeeklyPlan, IWeeklyPlan } from '../models/WeeklyPlan';

export class MongoWeeklyPlanService {
  static async create(planData: Partial<IWeeklyPlan>): Promise<IWeeklyPlan> {
    const plan = new WeeklyPlan(planData);
    return await plan.save();
  }

  static async findById(id: string): Promise<IWeeklyPlan | null> {
    return await WeeklyPlan.findOne({ id });
  }

  static async updateById(id: string, updateData: Partial<IWeeklyPlan>): Promise<IWeeklyPlan | null> {
    return await WeeklyPlan.findOneAndUpdate({ id }, updateData, { new: true });
  }

  static async deleteById(id: string): Promise<boolean> {
    const result = await WeeklyPlan.deleteOne({ id });
    return result.deletedCount > 0;
  }

  static async getAll(): Promise<IWeeklyPlan[]> {
    return await WeeklyPlan.find().sort({ createdAt: -1 });
  }

  static async clearAll(): Promise<void> {
    await WeeklyPlan.deleteMany({});
  }

  static async findByMonthlyPlanId(monthlyPlanId: string): Promise<IWeeklyPlan[]> {
    return await WeeklyPlan.find({ monthlyPlanId }).sort({ weekNumber: 1 });
  }

  static async findByWeekNumber(weekNumber: number): Promise<IWeeklyPlan | null> {
    return await WeeklyPlan.findOne({ weekNumber });
  }
} 