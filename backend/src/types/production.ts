export interface ProductionItem {
  id: string;
  itemName: string;
  itemCode: string;
  customerName: string;
  monthlyQuantity: number;
  weeklyQuantities: { [weekKey: string]: number }; // e.g., "week1-7": 100
}

export interface ProductionEntry {
  id: string;
  deptName: string;
  operatorName: string;
  work: string;
  h1Plan: number;
  h2Plan: number;
  otPlan: number;
  target: number; // calculated: h1Plan + h2Plan + otPlan
  h1Actual?: number;
  h2Actual?: number;
  otActual?: number;
  qualityDefect?: number;
  defectDetails?: string;
  responsiblePerson?: string;
  actualProduction?: number;
  productionPercentage?: number;
  reason?: string;
  rework?: number;
  correctiveActions?: string;
  targetCompletionDate?: string;
}

export interface MonthlyProductionPlan {
  id: string;
  title: string; // "Monthly Production Plan - [Month+1] [Year]"
  month: number; // 1-12
  year: number;
  status: 'pending' | 'completed';
  assignedTo: string; // employee ID
  assignedRole: string; // role ID
  deadline: Date; // 3 days before month ends
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  items: ProductionItem[];
  weekCount: number; // dynamic number of weeks in the month
}

export interface WeeklyProductionPlan {
  id: string;
  title: string; // "Weekly Production Plan - Week X (DD-DD) - [Month] [Year]"
  weekNumber: number;
  weekStartDate: Date;
  weekEndDate: Date;
  month: number;
  year: number;
  status: 'pending' | 'completed';
  assignedTo: string; // employee ID
  assignedRole: string; // role ID
  monthlyPlanId: string; // reference to parent monthly plan
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  items: ProductionItem[]; // inherited from monthly plan with weekly quantities
}

export interface DailyProductionPlan {
  id: string;
  title: string; // "Daily Production Plan - Week X Day Y"
  dayNumber: number;
  date: Date;
  weekNumber: number;
  month: number;
  year: number;
  status: 'pending' | 'inProgress' | 'completed' | 'rejected';
  assignedTo: string; // employee ID
  assignedRole: string; // role ID
  weeklyPlanId: string; // reference to parent weekly plan
  approvedBy?: string; // plant head employee ID
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  entries: ProductionEntry[];
}

export interface DailyProductionReport {
  id: string;
  title: string; // "Daily Production Report - Week X Day Y"
  dailyPlanId: string; // reference to parent daily plan
  status: 'pending' | 'completed';
  assignedTo: string; // employee ID
  assignedRole: string; // role ID
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  entries: ProductionEntry[]; // with actual data filled
}

export interface ProductionTask {
  id: string;
  type: 'monthly' | 'weekly' | 'daily' | 'report';
  title: string;
  status: 'pending' | 'inProgress' | 'completed' | 'rejected';
  assignedTo: string; // employee ID
  assignedRole: string; // role ID
  planId: string; // reference to the actual plan
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  dependencies?: string[]; // IDs of dependent tasks
}

export interface ProductionWorkflow {
  id: string;
  month: number;
  year: number;
  status: 'active' | 'completed' | 'cancelled';
  monthlyPlanId?: string;
  weeklyPlanIds: string[];
  dailyPlanIds: string[];
  reportIds: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// API Response types
export interface ProductionPlanResponse {
  success: boolean;
  data?: MonthlyProductionPlan | WeeklyProductionPlan | DailyProductionPlan | DailyProductionReport;
  error?: string;
}

export interface ProductionPlansResponse {
  success: boolean;
  data?: {
    plans: (MonthlyProductionPlan | WeeklyProductionPlan | DailyProductionPlan | DailyProductionReport)[];
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
}

export interface ProductionTaskResponse {
  success: boolean;
  data?: ProductionTask;
  error?: string;
}

export interface ProductionTasksResponse {
  success: boolean;
  data?: {
    tasks: ProductionTask[];
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
}

// Form submission types
export interface MonthlyPlanSubmission {
  month: number;
  year: number;
  items: Omit<ProductionItem, 'id'>[];
}

export interface WeeklyPlanSubmission {
  weekNumber: number;
  weekStartDate: string | Date; // Accept both string and Date for flexibility
  weekEndDate: string | Date;   // Accept both string and Date for flexibility
  items: Omit<ProductionItem, 'id'>[];
}

export interface DailyPlanSubmission {
  dayNumber: number;
  date: Date;
  entries: Omit<ProductionEntry, 'id'>[];
}



export interface DailyReportSubmission {
  entries: Omit<ProductionEntry, 'id'>[];
}

// Approval types
export interface PlanApproval {
  approved: boolean;
  reason?: string; // required if rejected
} 