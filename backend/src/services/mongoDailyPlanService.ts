import { DailyPlan, IDailyPlan } from '../models/DailyPlan';

export class MongoDailyPlanService {
  static async create(planData: Partial<IDailyPlan>): Promise<IDailyPlan> {
    const plan = new DailyPlan(planData);
    return await plan.save();
  }

  static async findById(id: string): Promise<IDailyPlan | null> {
    return await DailyPlan.findOne({ id });
  }

  static async updateById(id: string, updateData: Partial<IDailyPlan>): Promise<IDailyPlan | null> {
    return await DailyPlan.findOneAndUpdate({ id }, updateData, { new: true });
  }

  static async deleteById(id: string): Promise<boolean> {
    const result = await DailyPlan.deleteOne({ id });
    return result.deletedCount > 0;
  }

  static async getAll(): Promise<IDailyPlan[]> {
    return await DailyPlan.find().sort({ createdAt: -1 });
  }

  static async clearAll(): Promise<void> {
    await DailyPlan.deleteMany({});
  }

  static async findByWeeklyPlanId(weeklyPlanId: string): Promise<IDailyPlan[]> {
    return await DailyPlan.find({ weeklyPlanId }).sort({ dayNumber: 1 });
  }

  static async findByDayNumber(dayNumber: number): Promise<IDailyPlan | null> {
    return await DailyPlan.findOne({ dayNumber });
  }

  static async findByStatus(status: string): Promise<IDailyPlan[]> {
    return await DailyPlan.find({ status }).sort({ createdAt: -1 });
  }

  static async approve(id: string): Promise<IDailyPlan | null> {
    return await DailyPlan.findOneAndUpdate(
      { id },
      { $set: { status: 'approved' } },
      { new: true }
    );
  }

  static async reject(id: string): Promise<IDailyPlan | null> {
    return await DailyPlan.findOneAndUpdate(
      { id },
      { $set: { status: 'rejected' } },
      { new: true }
    );
  }
} 