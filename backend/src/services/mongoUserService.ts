import { User, IUser } from '../models/User';

export class MongoUserService {
  static async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  static async findByUid(uid: string): Promise<IUser | null> {
    return await User.findOne({ uid });
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  static async getById(id: string): Promise<IUser | null> {
    return await User.findOne({ id });
  }

  static async updateByUid(uid: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return await User.findOneAndUpdate({ uid }, updateData, { new: true });
  }

  static async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return await User.findOneAndUpdate({ id }, updateData, { new: true });
  }

  static async deleteByUid(uid: string): Promise<boolean> {
    const result = await User.deleteOne({ uid });
    return result.deletedCount > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await User.deleteOne({ id });
    return result.deletedCount > 0;
  }

  static async getAll(): Promise<IUser[]> {
    return await User.find().sort({ createdAt: -1 });
  }

  static async clearAll(): Promise<void> {
    await User.deleteMany({});
  }
} 