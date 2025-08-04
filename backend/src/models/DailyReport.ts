import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyReport extends Document {
  id: string;
  title: string;
  dailyPlanId: string;
  status: string;
  assignedTo: string;
  assignedRole: string;
  submittedAt: string;
  entries: Array<{
    id: string;
    deptName: string;
    operatorName: string;
    work: string;
    h1Plan: number;
    h2Plan: number;
    otPlan: number;
    target: number;
    h1Actual?: number;
    h2Actual?: number;
    otActual?: number;
    actualProduction?: number;
    qualityDefect?: number;
    productionPercentage?: number;
    reason?: string;
    correctiveActions?: string;
    responsiblePerson?: string;
    targetCompletionDate?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const dailyReportSchema = new Schema<IDailyReport>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  dailyPlanId: { type: String, required: true },
  status: { type: String, required: true },
  assignedTo: { type: String, required: true },
  assignedRole: { type: String, required: true },
  submittedAt: { type: String },
  entries: [{
    id: { type: String, required: true },
    deptName: { type: String, required: true },
    operatorName: { type: String, required: true },
    work: { type: String, required: true },
    h1Plan: { type: Number, required: true },
    h2Plan: { type: Number, required: true },
    otPlan: { type: Number, required: true },
    target: { type: Number, required: true },
    h1Actual: { type: Number },
    h2Actual: { type: Number },
    otActual: { type: Number },
    actualProduction: { type: Number },
    qualityDefect: { type: Number },
    productionPercentage: { type: Number },
    reason: { type: String },
    correctiveActions: { type: String },
    responsiblePerson: { type: String },
    targetCompletionDate: { type: String }
  }]
}, {
  timestamps: true
});

export const DailyReport = mongoose.model<IDailyReport>('DailyReport', dailyReportSchema); 