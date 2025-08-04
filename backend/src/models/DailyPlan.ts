import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyPlan extends Document {
  id: string;
  title: string;
  dayNumber: number;
  date: string;
  weekNumber: number;
  month: number;
  year: number;
  status: string;
  assignedTo: string;
  assignedRole: string;
  weeklyPlanId: string;
  submittedAt: string;
  approvedBy: string;
  approvedAt: string;
  entries: Array<{
    id: string;
    deptName: string;
    operatorName: string;
    work: string;
    h1Plan: number;
    h2Plan: number;
    otPlan: number;
    target: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const dailyPlanSchema = new Schema<IDailyPlan>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  dayNumber: { type: Number, required: true },
  date: { type: String, required: true },
  weekNumber: { type: Number, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  status: { type: String, required: true },
  assignedTo: { type: String, required: true },
  assignedRole: { type: String, required: true },
  weeklyPlanId: { type: String, required: true },
  submittedAt: { type: String },
  approvedBy: { type: String },
  approvedAt: { type: String },
  entries: [{
    id: { type: String, required: true },
    deptName: { type: String, required: true },
    operatorName: { type: String, required: true },
    work: { type: String, required: true },
    h1Plan: { type: Number, required: true },
    h2Plan: { type: Number, required: true },
    otPlan: { type: Number, required: true },
    target: { type: Number, required: true }
  }]
}, {
  timestamps: true
});

export const DailyPlan = mongoose.model<IDailyPlan>('DailyPlan', dailyPlanSchema); 