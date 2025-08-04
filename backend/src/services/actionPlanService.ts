import fs from 'fs';
import path from 'path';
import { generateId } from '../utils/idGenerator';

export interface ActionPlan {
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
  createdAt: string;
  updatedAt: string;
}

export interface ActionPlanSubmission {
  reason: string;
  correctiveActions: string;
  responsiblePerson: string;
  targetCompletionDate: string;
}

class ActionPlanService {
  private dataPath: string;

  constructor() {
    this.dataPath = path.join(__dirname, '../../data/production/action-plans.json');
    this.ensureDataFile();
  }

  private ensureDataFile() {
    if (!fs.existsSync(this.dataPath)) {
      fs.writeFileSync(this.dataPath, JSON.stringify([], null, 2));
    }
  }

  private readData(): ActionPlan[] {
    try {
      const data = fs.readFileSync(this.dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading action plans data:', error);
      return [];
    }
  }

  private writeData(data: ActionPlan[]) {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error writing action plans data:', error);
      throw error;
    }
  }

  async create(dailyReportId: string, dailyPlanId: string, productionData: any, submission: ActionPlanSubmission): Promise<ActionPlan> {
    const actionPlan: ActionPlan = {
      id: generateId(),
      dailyReportId,
      dailyPlanId,
      department: productionData.department || '',
      operator: productionData.operator || '',
      targetProduction: productionData.target || 0,
      actualProduction: productionData.actualProduction || 0,
      achievementPercentage: productionData.achievementPercentage || 0,
      reason: submission.reason,
      correctiveActions: submission.correctiveActions,
      responsiblePerson: submission.responsiblePerson,
      targetCompletionDate: submission.targetCompletionDate,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const data = this.readData();
    data.push(actionPlan);
    this.writeData(data);

    return actionPlan;
  }

  async getById(id: string): Promise<ActionPlan | null> {
    const data = this.readData();
    return data.find(plan => plan.id === id) || null;
  }

  async getByDailyReport(dailyReportId: string): Promise<ActionPlan[]> {
    const data = this.readData();
    return data.filter(plan => plan.dailyReportId === dailyReportId);
  }

  async update(id: string, updates: Partial<ActionPlan>): Promise<ActionPlan | null> {
    const data = this.readData();
    const index = data.findIndex(plan => plan.id === id);
    
    if (index === -1) return null;

    data[index] = {
      ...data[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.writeData(data);
    return data[index];
  }

  async getAll(): Promise<ActionPlan[]> {
    return this.readData();
  }
}

export const actionPlanService = new ActionPlanService(); 