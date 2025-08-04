import mongoose, { Document, Schema } from 'mongoose';

export interface IPermission extends Document {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  resource: { type: String, required: true },
  action: { type: String, required: true }
}, {
  timestamps: true
});

export const Permission = mongoose.model<IPermission>('Permission', permissionSchema); 