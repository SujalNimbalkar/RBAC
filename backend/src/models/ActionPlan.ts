import mongoose, { Document, Schema } from 'mongoose';

export interface IActionPlan extends Document {
  id: string;
  dailyReportId: string;
  dailyPlanId: string;
  department: string;
  operator: string;
  targetProduction: number;
  actualProduction: number;
  achievementPercentage: number;
  reason: string;
  correctiveActions: string;
  responsiblePerson: string;
  targetCompletionDate: string;
  status: 'pending' | 'inProgress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const actionPlanSchema = new Schema<IActionPlan>({
  id: { type: String, required: true, unique: true },
  dailyReportId: { type: String, required: true },
  dailyPlanId: { type: String, required: true },
  department: { type: String, required: true },
  operator: { type: String, required: true },
  targetProduction: { type: Number, required: true },
  actualProduction: { type: Number, required: true },
  achievementPercentage: { type: Number, required: true },
  reason: { type: String, required: true },
  correctiveActions: { type: String, required: true },
  responsiblePerson: { type: String, required: true },
  targetCompletionDate: { type: String, required: true },
  status: { type: String, required: true, enum: ['pending', 'inProgress', 'completed'] }
}, {
  timestamps: true
});

export const ActionPlan = mongoose.model<IActionPlan>('ActionPlan', actionPlanSchema); 