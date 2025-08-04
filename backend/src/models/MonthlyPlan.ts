import mongoose, { Document, Schema } from 'mongoose';

export interface IMonthlyPlan extends Document {
  id: string;
  title: string;
  month: number;
  year: number;
  status: string;
  assignedTo: string;
  assignedRole: string;
  deadline: string;
  weekCount: number;
  submittedAt: string;
  items: Array<{
    id: string;
    itemCode: string;
    itemName: string;
    customerName: string;
    monthlyQuantity: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const monthlyPlanSchema = new Schema<IMonthlyPlan>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  status: { type: String, required: true },
  assignedTo: { type: String, required: true },
  assignedRole: { type: String, required: true },
  deadline: { type: String, required: true },
  weekCount: { type: Number, required: true },
  submittedAt: { type: String },
  items: [{
    id: { type: String, required: true },
    itemCode: { type: String, required: true },
    itemName: { type: String, required: true },
    customerName: { type: String, required: true },
    monthlyQuantity: { type: Number, required: true }
  }]
}, {
  timestamps: true
});

export const MonthlyPlan = mongoose.model<IMonthlyPlan>('MonthlyPlan', monthlyPlanSchema); 