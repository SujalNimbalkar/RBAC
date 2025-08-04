import mongoose, { Document, Schema } from 'mongoose';

export interface IRole extends Document {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  permissions: [{ type: String, required: true }],
  isSystem: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const Role = mongoose.model<IRole>('Role', roleSchema); 