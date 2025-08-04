import { Role, IRole } from '../models/Role';

export class MongoRoleService {
  static async create(roleData: Partial<IRole>): Promise<IRole> {
    const role = new Role(roleData);
    return await role.save();
  }

  static async findById(id: string): Promise<IRole | null> {
    return await Role.findOne({ id });
  }

  static async getById(id: string): Promise<IRole | null> {
    return await Role.findOne({ id });
  }

  static async updateById(id: string, updateData: Partial<IRole>): Promise<IRole | null> {
    return await Role.findOneAndUpdate({ id }, updateData, { new: true });
  }

  static async update(id: string, updateData: Partial<IRole>): Promise<IRole | null> {
    return await Role.findOneAndUpdate({ id }, updateData, { new: true });
  }

  static async deleteById(id: string): Promise<boolean> {
    const result = await Role.deleteOne({ id });
    return result.deletedCount > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await Role.deleteOne({ id });
    return result.deletedCount > 0;
  }

  static async getAll(): Promise<IRole[]> {
    return await Role.find().sort({ createdAt: -1 });
  }

  static async clearAll(): Promise<void> {
    await Role.deleteMany({});
  }
} 