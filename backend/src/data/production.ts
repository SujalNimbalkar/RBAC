import fs from 'fs';
import path from 'path';
import { 
  MonthlyProductionPlan, 
  WeeklyProductionPlan, 
  DailyProductionPlan, 
  DailyProductionReport,
  ProductionTask,
  ProductionWorkflow,
  ProductionItem,
  ProductionEntry,
  MonthlyPlanSubmission,
  WeeklyPlanSubmission,
  DailyPlanSubmission,
  DailyReportSubmission,
  PlanApproval
} from '../types';

const DATA_DIR = path.join(__dirname, '../../data');
const PRODUCTION_DIR = path.join(DATA_DIR, 'production');

// Ensure production data directory exists
const ensureProductionDir = () => {
  if (!fs.existsSync(PRODUCTION_DIR)) {
    fs.mkdirSync(PRODUCTION_DIR, { recursive: true });
  }
};

// Generate unique ID
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Helper function to get week dates
const getWeekDates = (year: number, month: number, weekNumber: number) => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0); // Last day of the month
  const daysInMonth = lastDay.getDate();
  
  // Calculate the actual start and end dates for the week
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() + (weekNumber - 1) * 7);
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  
  // If the end date goes beyond the month, cap it at the last day of the month
  if (endDate.getMonth() !== month - 1) {
    endDate.setDate(daysInMonth);
  }
  
  return { startDate, endDate };
};

// Helper function to calculate weeks in a month
const getWeeksInMonth = (year: number, month: number) => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const firstWeekDay = firstDay.getDay();
  
  return Math.ceil((daysInMonth + firstWeekDay) / 7);
};

// Helper function to generate week keys
const generateWeekKeys = (weekCount: number, year: number, month: number) => {
  const lastDay = new Date(year, month, 0); // Last day of the month
  const daysInMonth = lastDay.getDate();
  
  const keys = [];
  for (let i = 1; i <= weekCount; i++) {
    const startDay = (i - 1) * 7 + 1;
    let endDay = i * 7;
    
    // For the last week, use the actual last day of the month
    if (i === weekCount) {
      endDay = daysInMonth;
    } else {
      // For other weeks, cap at the last day of the month
      endDay = Math.min(endDay, daysInMonth);
    }
    
    keys.push(`week${startDay}-${endDay}`);
  }
  return keys;
};

export class MonthlyProductionPlanService {
  private filePath = path.join(PRODUCTION_DIR, 'monthly-plans.json');

  constructor() {
    ensureProductionDir();
    this.ensureFile();
  }

  private ensureFile() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  private readData(): MonthlyProductionPlan[] {
    const data = fs.readFileSync(this.filePath, 'utf8');
    return JSON.parse(data);
  }

  private writeData(data: MonthlyProductionPlan[]) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  async create(submission: MonthlyPlanSubmission, assignedTo: string, assignedRole: string): Promise<MonthlyProductionPlan> {
    const plans = this.readData();
    
    // Check if plan already exists for this month/year
    const existingPlan = plans.find(p => p.month === submission.month && p.year === submission.year);
    if (existingPlan) {
      throw new Error(`Monthly plan already exists for ${submission.month}/${submission.year}`);
    }

    const weekCount = getWeeksInMonth(submission.year, submission.month);
    const deadline = new Date(submission.year, submission.month - 1, 28); // 3 days before month ends
    
    const plan: MonthlyProductionPlan = {
      id: generateId(),
      title: `Monthly Production Plan - ${new Date(submission.year, submission.month - 1).toLocaleString('default', { month: 'long' })} ${submission.year}`,
      month: submission.month,
      year: submission.year,
      status: 'pending',
      assignedTo,
      assignedRole,
      deadline,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: submission.items.map(item => ({
        ...item,
        id: generateId(),
        weeklyQuantities: {}
      })),
      weekCount
    };

    plans.push(plan);
    this.writeData(plans);
    return plan;
  }

  async getById(id: string): Promise<MonthlyProductionPlan | null> {
    const plans = this.readData();
    return plans.find(p => p.id === id) || null;
  }

  async getByMonthYear(month: number, year: number): Promise<MonthlyProductionPlan | null> {
    const plans = this.readData();
    return plans.find(p => p.month === month && p.year === year) || null;
  }

  async getAll(): Promise<MonthlyProductionPlan[]> {
    return this.readData();
  }

  async update(id: string, updates: Partial<MonthlyProductionPlan>): Promise<MonthlyProductionPlan> {
    const plans = this.readData();
    const index = plans.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Monthly plan not found');
    }

    plans[index] = { ...plans[index], ...updates, updatedAt: new Date() };
    this.writeData(plans);
    return plans[index];
  }

  async submit(id: string): Promise<MonthlyProductionPlan> {
    const plan = await this.getById(id);
    if (!plan) {
      throw new Error('Monthly plan not found');
    }

    if (plan.status !== 'pending') {
      throw new Error('Plan is not in pending status');
    }

    return this.update(id, {
      status: 'completed',
      submittedAt: new Date()
    });
  }

  async delete(id: string): Promise<void> {
    const plans = this.readData();
    const filteredPlans = plans.filter(p => p.id !== id);
    this.writeData(filteredPlans);
  }
}

export class WeeklyProductionPlanService {
  private filePath = path.join(PRODUCTION_DIR, 'weekly-plans.json');

  constructor() {
    ensureProductionDir();
    this.ensureFile();
  }

  private ensureFile() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  private readData(): WeeklyProductionPlan[] {
    const data = fs.readFileSync(this.filePath, 'utf8');
    return JSON.parse(data);
  }

  private writeData(data: WeeklyProductionPlan[]) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  async createFromMonthlyPlan(monthlyPlanId: string, monthlyPlanService: MonthlyProductionPlanService): Promise<WeeklyProductionPlan[]> {
    const monthlyPlan = await monthlyPlanService.getById(monthlyPlanId);
    if (!monthlyPlan) {
      throw new Error('Monthly plan not found');
    }

    if (monthlyPlan.status !== 'completed') {
      throw new Error('Monthly plan must be completed before creating weekly plans');
    }

    const plans = this.readData();
    const weekKeys = generateWeekKeys(monthlyPlan.weekCount, monthlyPlan.year, monthlyPlan.month);
    const weeklyPlans: WeeklyProductionPlan[] = [];

    for (let weekNumber = 1; weekNumber <= monthlyPlan.weekCount; weekNumber++) {
      const { startDate, endDate } = getWeekDates(monthlyPlan.year, monthlyPlan.month, weekNumber);
      
      const plan: WeeklyProductionPlan = {
        id: generateId(),
        title: `Weekly Production Plan - Week ${weekNumber} (${startDate.getDate()}-${endDate.getDate()}) - ${new Date(monthlyPlan.year, monthlyPlan.month - 1).toLocaleString('default', { month: 'long' })} ${monthlyPlan.year}`,
        weekNumber,
        weekStartDate: startDate,
        weekEndDate: endDate,
        month: monthlyPlan.month,
        year: monthlyPlan.year,
        status: 'pending',
        assignedTo: monthlyPlan.assignedTo,
        assignedRole: monthlyPlan.assignedRole,
        monthlyPlanId,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: monthlyPlan.items.map(item => ({
          ...item,
          id: generateId(),
          weeklyQuantities: { [weekKeys[weekNumber - 1]]: 0 }
        }))
      };

      weeklyPlans.push(plan);
      plans.push(plan);
    }

    this.writeData(plans);
    return weeklyPlans;
  }

  async getById(id: string): Promise<WeeklyProductionPlan | null> {
    const plans = this.readData();
    return plans.find(p => p.id === id) || null;
  }

  async getByMonthlyPlan(monthlyPlanId: string): Promise<WeeklyProductionPlan[]> {
    const plans = this.readData();
    return plans.filter(p => p.monthlyPlanId === monthlyPlanId);
  }

  async getAll(): Promise<WeeklyProductionPlan[]> {
    return this.readData();
  }

  async update(id: string, updates: Partial<WeeklyProductionPlan>): Promise<WeeklyProductionPlan> {
    const plans = this.readData();
    const index = plans.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Weekly plan not found');
    }

    plans[index] = { ...plans[index], ...updates, updatedAt: new Date() };
    this.writeData(plans);
    return plans[index];
  }

  async submit(id: string): Promise<WeeklyProductionPlan> {
    const plan = await this.getById(id);
    if (!plan) {
      throw new Error('Weekly plan not found');
    }

    if (plan.status !== 'pending') {
      throw new Error('Plan is not in pending status');
    }

    return this.update(id, {
      status: 'completed',
      submittedAt: new Date()
    });
  }

  async delete(id: string): Promise<void> {
    const plans = this.readData();
    const filteredPlans = plans.filter(p => p.id !== id);
    this.writeData(filteredPlans);
  }

  async updateFromMonthlyPlan(monthlyPlanId: string, monthlyPlanService: MonthlyProductionPlanService): Promise<WeeklyProductionPlan[]> {
    const monthlyPlan = await monthlyPlanService.getById(monthlyPlanId);
    if (!monthlyPlan) {
      throw new Error('Monthly plan not found');
    }

    if (monthlyPlan.status !== 'completed') {
      throw new Error('Monthly plan must be completed before updating weekly plans');
    }

    const plans = this.readData();
    const existingPlans = plans.filter(p => p.monthlyPlanId === monthlyPlanId);
    
    if (existingPlans.length === 0) {
      // If no existing weekly plans, create new ones
      return this.createFromMonthlyPlan(monthlyPlanId, monthlyPlanService);
    }

    const weekKeys = generateWeekKeys(monthlyPlan.weekCount, monthlyPlan.year, monthlyPlan.month);
    const updatedPlans: WeeklyProductionPlan[] = [];

    for (let weekNumber = 1; weekNumber <= monthlyPlan.weekCount; weekNumber++) {
      const existingPlan = existingPlans.find(p => p.weekNumber === weekNumber);
      const { startDate, endDate } = getWeekDates(monthlyPlan.year, monthlyPlan.month, weekNumber);
      
      if (existingPlan) {
        // Update existing plan with new items from monthly plan
        const updatedPlan = await this.update(existingPlan.id, {
          title: `Weekly Production Plan - Week ${weekNumber} (${startDate.getDate()}-${endDate.getDate()}) - ${new Date(monthlyPlan.year, monthlyPlan.month - 1).toLocaleString('default', { month: 'long' })} ${monthlyPlan.year}`,
          weekStartDate: startDate,
          weekEndDate: endDate,
          items: monthlyPlan.items.map(item => ({
            ...item,
            id: generateId(),
            weeklyQuantities: { [weekKeys[weekNumber - 1]]: existingPlan.items.find(existingItem => 
              existingItem.itemCode === item.itemCode && 
              existingItem.itemName === item.itemName
            )?.weeklyQuantities?.[weekKeys[weekNumber - 1]] || 0 }
          }))
        });
        updatedPlans.push(updatedPlan);
      } else {
        // Create new plan if it doesn't exist
        const newPlan: WeeklyProductionPlan = {
          id: generateId(),
          title: `Weekly Production Plan - Week ${weekNumber} (${startDate.getDate()}-${endDate.getDate()}) - ${new Date(monthlyPlan.year, monthlyPlan.month - 1).toLocaleString('default', { month: 'long' })} ${monthlyPlan.year}`,
          weekNumber,
          weekStartDate: startDate,
          weekEndDate: endDate,
          month: monthlyPlan.month,
          year: monthlyPlan.year,
          status: 'pending',
          assignedTo: monthlyPlan.assignedTo,
          assignedRole: monthlyPlan.assignedRole,
          monthlyPlanId,
          createdAt: new Date(),
          updatedAt: new Date(),
          items: monthlyPlan.items.map(item => ({
            ...item,
            id: generateId(),
            weeklyQuantities: { [weekKeys[weekNumber - 1]]: 0 }
          }))
        };
        plans.push(newPlan);
        updatedPlans.push(newPlan);
      }
    }

    this.writeData(plans);
    return updatedPlans;
  }
}

export class DailyProductionPlanService {
  private filePath = path.join(PRODUCTION_DIR, 'daily-plans.json');

  constructor() {
    ensureProductionDir();
    this.ensureFile();
  }

  private ensureFile() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  private readData(): DailyProductionPlan[] {
    const data = fs.readFileSync(this.filePath, 'utf8');
    return JSON.parse(data);
  }

  private writeData(data: DailyProductionPlan[]) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  async createFromWeeklyPlan(weeklyPlanId: string, weeklyPlanService: WeeklyProductionPlanService): Promise<DailyProductionPlan[]> {
    const weeklyPlan = await weeklyPlanService.getById(weeklyPlanId);
    if (!weeklyPlan) {
      throw new Error('Weekly plan not found');
    }

    if (weeklyPlan.status !== 'completed') {
      throw new Error('Weekly plan must be completed before creating daily plans');
    }

    const plans = this.readData();
    const dailyPlans: DailyProductionPlan[] = [];

    // Create 6 daily plans (Monday to Saturday)
    for (let dayNumber = 1; dayNumber <= 6; dayNumber++) {
      const startDate = new Date(weeklyPlan.weekStartDate);
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + dayNumber - 1);
      
      const plan: DailyProductionPlan = {
        id: generateId(),
        title: `Daily Production Plan - Week ${weeklyPlan.weekNumber} Day ${dayNumber}`,
        dayNumber,
        date,
        weekNumber: weeklyPlan.weekNumber,
        month: weeklyPlan.month,
        year: weeklyPlan.year,
        status: 'pending',
        assignedTo: 'mdsxto8ydv4dknv25i', // Amit Kumar Parida - Production Manager
        assignedRole: 'mdsvs0sm4g2ebejicna', // Production Manager role
        weeklyPlanId,
        createdAt: new Date(),
        updatedAt: new Date(),
        entries: []
      };

      dailyPlans.push(plan);
      plans.push(plan);
    }

    this.writeData(plans);
    return dailyPlans;
  }

  async getById(id: string): Promise<DailyProductionPlan | null> {
    const plans = this.readData();
    return plans.find(p => p.id === id) || null;
  }

  async getByWeeklyPlan(weeklyPlanId: string): Promise<DailyProductionPlan[]> {
    const plans = this.readData();
    return plans.filter(p => p.weeklyPlanId === weeklyPlanId);
  }

  async getByStatus(status: string): Promise<DailyProductionPlan[]> {
    const plans = this.readData();
    return plans.filter(p => p.status === status);
  }

  async getAll(): Promise<DailyProductionPlan[]> {
    return this.readData();
  }

  async update(id: string, updates: Partial<DailyProductionPlan>): Promise<DailyProductionPlan> {
    const plans = this.readData();
    const index = plans.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Daily plan not found');
    }

    plans[index] = { ...plans[index], ...updates, updatedAt: new Date() };
    this.writeData(plans);
    return plans[index];
  }

  async submit(id: string, submission: DailyPlanSubmission): Promise<DailyProductionPlan> {
    const plan = await this.getById(id);
    if (!plan) {
      throw new Error('Daily plan not found');
    }

    if (plan.status !== 'pending') {
      throw new Error('Plan is not in pending status');
    }

    // Calculate target for each entry
    const entries = submission.entries.map(entry => ({
      ...entry,
      id: generateId(),
      target: entry.h1Plan + entry.h2Plan + entry.otPlan
    }));

    return this.update(id, {
      status: 'inProgress',
      submittedAt: new Date(),
      entries
    });
  }

  async approve(id: string, approvedBy: string): Promise<DailyProductionPlan> {
    const plan = await this.getById(id);
    if (!plan) {
      throw new Error('Daily plan not found');
    }

    if (plan.status !== 'inProgress') {
      throw new Error('Plan is not in progress status');
    }

    return this.update(id, {
      status: 'completed',
      approvedBy,
      approvedAt: new Date()
    });
  }

  async reject(id: string, rejectedBy: string, reason: string): Promise<DailyProductionPlan> {
    const plan = await this.getById(id);
    if (!plan) {
      throw new Error('Daily plan not found');
    }

    if (plan.status !== 'inProgress') {
      throw new Error('Plan is not in progress status');
    }

    return this.update(id, {
      status: 'rejected',
      rejectedBy,
      rejectedAt: new Date(),
      rejectionReason: reason
    });
  }

  async delete(id: string): Promise<void> {
    const plans = this.readData();
    const filteredPlans = plans.filter(p => p.id !== id);
    this.writeData(filteredPlans);
  }
}

export class DailyProductionReportService {
  private filePath = path.join(PRODUCTION_DIR, 'daily-reports.json');

  constructor() {
    ensureProductionDir();
    this.ensureFile();
  }

  private ensureFile() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  private readData(): DailyProductionReport[] {
    const data = fs.readFileSync(this.filePath, 'utf8');
    return JSON.parse(data);
  }

  private writeData(data: DailyProductionReport[]) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  async createFromDailyPlan(dailyPlanId: string, dailyPlanService: DailyProductionPlanService): Promise<DailyProductionReport> {
    const dailyPlan = await dailyPlanService.getById(dailyPlanId);
    if (!dailyPlan) {
      throw new Error('Daily plan not found');
    }

    if (dailyPlan.status !== 'completed') {
      throw new Error('Daily plan must be completed before creating report');
    }

    const reports = this.readData();
    
    // Check if report already exists
    const existingReport = reports.find(r => r.dailyPlanId === dailyPlanId);
    if (existingReport) {
      throw new Error('Report already exists for this daily plan');
    }

    const report: DailyProductionReport = {
      id: generateId(),
      title: `Daily Production Report - Week ${dailyPlan.weekNumber} Day ${dailyPlan.dayNumber}`,
      dailyPlanId,
      status: 'pending',
      assignedTo: dailyPlan.assignedTo,
      assignedRole: dailyPlan.assignedRole,
      createdAt: new Date(),
      updatedAt: new Date(),
      entries: dailyPlan.entries.map(entry => ({
        ...entry,
        id: generateId()
      }))
    };

    reports.push(report);
    this.writeData(reports);
    return report;
  }

  async getById(id: string): Promise<DailyProductionReport | null> {
    const reports = this.readData();
    return reports.find(r => r.id === id) || null;
  }

  async getByDailyPlan(dailyPlanId: string): Promise<DailyProductionReport | null> {
    const reports = this.readData();
    return reports.find(r => r.dailyPlanId === dailyPlanId) || null;
  }

  async getAll(): Promise<DailyProductionReport[]> {
    return this.readData();
  }

  async update(id: string, updates: Partial<DailyProductionReport>): Promise<DailyProductionReport> {
    const reports = this.readData();
    const index = reports.findIndex(r => r.id === id);
    
    if (index === -1) {
      throw new Error('Daily report not found');
    }

    reports[index] = { ...reports[index], ...updates, updatedAt: new Date() };
    this.writeData(reports);
    return reports[index];
  }

  async submit(id: string, submission: DailyReportSubmission): Promise<DailyProductionReport> {
    const report = await this.getById(id);
    if (!report) {
      throw new Error('Daily report not found');
    }

    if (report.status !== 'pending') {
      throw new Error(`Report is not in pending status. Current status: ${report.status}`);
    }

    // Validate production percentage and reason
    const entries = submission.entries.map(entry => {
      const newEntry = {
        ...entry,
        id: generateId(),
        productionPercentage: entry.actualProduction ? (entry.actualProduction / entry.target) * 100 : 0
      };

      // Check if production is less than 85% and reason is mandatory
      if (newEntry.productionPercentage < 85 && !newEntry.reason) {
        throw new Error(`Reason is mandatory when production percentage is less than 85% (current: ${newEntry.productionPercentage.toFixed(2)}%)`);
      }

      return newEntry;
    });

    // Create action plans for entries with production below 85%
    const actionPlans = [];
    for (const entry of entries) {
      if (entry.productionPercentage < 85) {
        // Import action plan service dynamically to avoid circular dependency
        const { actionPlanService } = await import('../services/actionPlanService');
        
        const actionPlan = await actionPlanService.create(
          id, // dailyReportId
          report.dailyPlanId,
          {
            department: entry.deptName,
            operator: entry.operatorName,
            target: entry.target,
            actualProduction: entry.actualProduction,
            achievementPercentage: entry.productionPercentage
          },
          {
            reason: entry.reason || '',
            correctiveActions: entry.correctiveActions || '',
            responsiblePerson: entry.responsiblePerson || '',
            targetCompletionDate: entry.targetCompletionDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
          }
        );
        actionPlans.push(actionPlan);
      }
    }

    // Update the report status
    const updatedReport = await this.update(id, {
      status: 'completed',
      submittedAt: new Date(),
      entries
    });

    // Update the corresponding task status
    try {
      const taskService = new ProductionTaskService();
      const tasks = await taskService.getByType('report');
      const task = tasks.find(t => t.planId === id);
      if (task) {
        console.log(`Updating task ${task.id} status from ${task.status} to completed`);
        await taskService.update(task.id, { status: 'completed' });
        console.log(`Task ${task.id} status updated successfully`);
      } else {
        console.warn(`No task found for report ${id}`);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      // Don't throw error here, as the report submission was successful
    }

    return updatedReport;
  }

  async delete(id: string): Promise<void> {
    const reports = this.readData();
    const filteredReports = reports.filter(r => r.id !== id);
    this.writeData(filteredReports);
  }
}

export class ProductionTaskService {
  private filePath = path.join(PRODUCTION_DIR, 'tasks.json');

  constructor() {
    ensureProductionDir();
    this.ensureFile();
  }

  private ensureFile() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  private readData(): ProductionTask[] {
    const data = fs.readFileSync(this.filePath, 'utf8');
    return JSON.parse(data);
  }

  private writeData(data: ProductionTask[]) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  async createTask(type: 'monthly' | 'weekly' | 'daily' | 'report', title: string, assignedTo: string, assignedRole: string, planId: string, deadline?: Date, dependencies?: string[]): Promise<ProductionTask> {
    const tasks = this.readData();
    
    const task: ProductionTask = {
      id: generateId(),
      type,
      title,
      status: 'pending',
      assignedTo,
      assignedRole,
      planId,
      deadline,
      createdAt: new Date(),
      updatedAt: new Date(),
      dependencies
    };

    tasks.push(task);
    this.writeData(tasks);
    return task;
  }

  async getById(id: string): Promise<ProductionTask | null> {
    const tasks = this.readData();
    return tasks.find(t => t.id === id) || null;
  }

  async getByAssignedTo(assignedTo: string): Promise<ProductionTask[]> {
    const tasks = this.readData();
    return tasks.filter(t => t.assignedTo === assignedTo);
  }

  async getByStatus(status: string): Promise<ProductionTask[]> {
    const tasks = this.readData();
    return tasks.filter(t => t.status === status);
  }

  async getByType(type: string): Promise<ProductionTask[]> {
    const tasks = this.readData();
    return tasks.filter(t => t.type === type);
  }

  async getAll(): Promise<ProductionTask[]> {
    return this.readData();
  }

  async update(id: string, updates: Partial<ProductionTask>): Promise<ProductionTask> {
    const tasks = this.readData();
    const index = tasks.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error('Task not found');
    }

    tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date() };
    this.writeData(tasks);
    return tasks[index];
  }

  async delete(id: string): Promise<void> {
    const tasks = this.readData();
    const filteredTasks = tasks.filter(t => t.id !== id);
    this.writeData(filteredTasks);
  }
}

export class ProductionWorkflowService {
  private filePath = path.join(PRODUCTION_DIR, 'workflows.json');

  constructor() {
    ensureProductionDir();
    this.ensureFile();
  }

  private ensureFile() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  private readData(): ProductionWorkflow[] {
    const data = fs.readFileSync(this.filePath, 'utf8');
    return JSON.parse(data);
  }

  private writeData(data: ProductionWorkflow[]) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  async createWorkflow(month: number, year: number): Promise<ProductionWorkflow> {
    const workflows = this.readData();
    
    // Check if workflow already exists
    const existingWorkflow = workflows.find(w => w.month === month && w.year === year);
    if (existingWorkflow) {
      throw new Error(`Workflow already exists for ${month}/${year}`);
    }

    const workflow: ProductionWorkflow = {
      id: generateId(),
      month,
      year,
      status: 'active',
      weeklyPlanIds: [],
      dailyPlanIds: [],
      reportIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    workflows.push(workflow);
    this.writeData(workflows);
    return workflow;
  }

  async getById(id: string): Promise<ProductionWorkflow | null> {
    const workflows = this.readData();
    return workflows.find(w => w.id === id) || null;
  }

  async getByMonthYear(month: number, year: number): Promise<ProductionWorkflow | null> {
    const workflows = this.readData();
    return workflows.find(w => w.month === month && w.year === year) || null;
  }

  async getAll(): Promise<ProductionWorkflow[]> {
    return this.readData();
  }

  async update(id: string, updates: Partial<ProductionWorkflow>): Promise<ProductionWorkflow> {
    const workflows = this.readData();
    const index = workflows.findIndex(w => w.id === id);
    
    if (index === -1) {
      throw new Error('Workflow not found');
    }

    workflows[index] = { ...workflows[index], ...updates, updatedAt: new Date() };
    this.writeData(workflows);
    return workflows[index];
  }

  async delete(id: string): Promise<void> {
    const workflows = this.readData();
    const filteredWorkflows = workflows.filter(w => w.id !== id);
    this.writeData(filteredWorkflows);
  }
} 