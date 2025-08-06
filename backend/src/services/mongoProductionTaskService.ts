import { ProductionTask, IProductionTask } from '../models/ProductionTask';

export class MongoProductionTaskService {
  static async create(taskData: Partial<IProductionTask>): Promise<IProductionTask> {
    const task = new ProductionTask(taskData);
    return await task.save();
  }

  static async findById(id: string): Promise<IProductionTask | null> {
    return await ProductionTask.findOne({ id });
  }

  static async updateById(id: string, updateData: Partial<IProductionTask>): Promise<IProductionTask | null> {
    return await ProductionTask.findOneAndUpdate({ id }, updateData, { new: true });
  }

  static async deleteById(id: string): Promise<boolean> {
    const result = await ProductionTask.deleteOne({ id });
    return result.deletedCount > 0;
  }

  static async getAll(): Promise<IProductionTask[]> {
    return await ProductionTask.find().sort({ createdAt: -1 }).limit(1000);
  }

  static async clearAll(): Promise<void> {
    await ProductionTask.deleteMany({});
  }

  static async findByType(type: string): Promise<IProductionTask[]> {
    return await ProductionTask.find({ type }).sort({ createdAt: -1 });
  }

  static async findByAssignedTo(assignedTo: string): Promise<IProductionTask[]> {
    return await ProductionTask.find({ assignedTo }).sort({ createdAt: -1 });
  }

  static async findByStatus(status: string): Promise<IProductionTask[]> {
    return await ProductionTask.find({ status }).sort({ createdAt: -1 });
  }

  static async getByUser(userId: string): Promise<IProductionTask[]> {
    return await ProductionTask.find({ assignedTo: userId }).sort({ createdAt: -1 });
  }

  static async addComment(taskId: string, userId: string, content: string): Promise<IProductionTask | null> {
    // For now, just return the task since comments are not implemented in the new model
    // TODO: Implement comments functionality
    return await ProductionTask.findOne({ id: taskId });
  }
} 