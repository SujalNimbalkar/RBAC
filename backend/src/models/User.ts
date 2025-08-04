import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  department: string;
  designation: string;
  roles: string[];
  isActive: boolean;
  joinDate: Date;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true },
  uid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  employeeId: { type: String, required: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  roles: [{ type: String, required: true }],
  isActive: { type: Boolean, default: true },
  joinDate: { type: Date, required: true },
  lastLogin: { type: Date },
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema); 