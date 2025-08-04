import { Permission, IPermission } from '../models/Permission';

export class MongoPermissionService {
  static async create(permissionData: Partial<IPermission>): Promise<IPermission> {
    const permission = new Permission(permissionData);
    return await permission.save();
  }

  static async findById(id: string): Promise<IPermission | null> {
    return await Permission.findOne({ id });
  }

  static async getById(id: string): Promise<IPermission | null> {
    return await Permission.findOne({ id });
  }

  static async updateById(id: string, updateData: Partial<IPermission>): Promise<IPermission | null> {
    return await Permission.findOneAndUpdate({ id }, updateData, { new: true });
  }

  static async update(id: string, updateData: Partial<IPermission>): Promise<IPermission | null> {
    return await Permission.findOneAndUpdate({ id }, updateData, { new: true });
  }

  static async deleteById(id: string): Promise<boolean> {
    const result = await Permission.deleteOne({ id });
    return result.deletedCount > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await Permission.deleteOne({ id });
    return result.deletedCount > 0;
  }

  static async getAll(): Promise<IPermission[]> {
    return await Permission.find().sort({ createdAt: -1 });
  }

  static async clearAll(): Promise<void> {
    await Permission.deleteMany({});
  }
} 