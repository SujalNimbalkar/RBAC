import mongoose, { Document, Schema } from 'mongoose';

export interface IWeeklyPlan extends Document {
  id: string;
  title: string;
  weekNumber: number;
  weekStartDate: string;
  weekEndDate: string;
  month: number;
  year: number;
  status: string;
  assignedTo: string;
  assignedRole: string;
  monthlyPlanId: string;
  submittedAt: string;
  items: Array<{
    id: string;
    itemCode: string;
    itemName: string;
    customerName: string;
    monthlyQuantity: number;
    weeklyQuantities: Record<string, number>;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const weeklyPlanSchema = new Schema<IWeeklyPlan>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  weekNumber: { type: Number, required: true },
  weekStartDate: { type: String, required: true },
  weekEndDate: { type: String, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  status: { type: String, required: true },
  assignedTo: { type: String, required: true },
  assignedRole: { type: String, required: true },
  monthlyPlanId: { type: String, required: true },
  submittedAt: { type: String },
  items: [{
    id: { type: String, required: true },
    itemCode: { type: String, required: true },
    itemName: { type: String, required: true },
    customerName: { type: String, required: true },
    monthlyQuantity: { type: Number, required: true },
    weeklyQuantities: { type: Schema.Types.Mixed, required: true }
  }]
}, {
  timestamps: true
});

export const WeeklyPlan = mongoose.model<IWeeklyPlan>('WeeklyPlan', weeklyPlanSchema); 