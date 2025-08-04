import mongoose, { Document, Schema } from 'mongoose';

export interface IProductionTask extends Document {
  id: string;
  type: 'monthly' | 'weekly' | 'daily' | 'report';
  title: string;
  description?: string;
  status: 'pending' | 'inProgress' | 'completed' | 'rejected';
  priority?: 'low' | 'medium' | 'high';
  assignedTo: string;
  assignedBy?: string;
  assignedRole: string;
  planId: string;
  projectId?: string;
  deadline: string;
  dueDate?: Date;
  tags?: string[];
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const productionTaskSchema = new Schema<IProductionTask>({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true, enum: ['monthly', 'weekly', 'daily', 'report'] },
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, required: true, enum: ['pending', 'inProgress', 'completed', 'rejected'] },
  priority: { type: String, enum: ['low', 'medium', 'high'] },
  assignedTo: { type: String, required: true },
  assignedBy: { type: String },
  assignedRole: { type: String, required: true },
  planId: { type: String, required: true },
  projectId: { type: String },
  deadline: { type: String, required: true },
  dueDate: { type: Date },
  tags: [{ type: String }],
  attachments: [{ type: String }]
}, {
  timestamps: true
});

export const ProductionTask = mongoose.model<IProductionTask>('ProductionTask', productionTaskSchema); 