import cron from 'node-cron';
import { MongoMonthlyPlanService } from './mongoMonthlyPlanService';
import { MongoProductionTaskService } from './mongoProductionTaskService';
import { generateId } from '../utils/idGenerator';

export class CronService {
  private static isInitialized = false;

  static initialize() {
    if (this.isInitialized) {
      console.log('⚠️  Cron service already initialized');
      return;
    }

    console.log('🕐 Initializing cron service...');

    // Monthly production plan automation - runs at 16:15 on the 4th of every month
    cron.schedule('58 16 4 * *', async () => {
      console.log('🕐 Running monthly production plan automation...');
      await this.createMonthlyProductionPlan();
    }, {
      timezone: "Asia/Kolkata" // Indian Standard Time
    });

    console.log('✅ Cron service initialized with schedule:');
    console.log('  📅 Monthly: 4th of every month at 16:15 IST');

    this.isInitialized = true;
  }

  private static async createMonthlyProductionPlan() {
    try {
      const currentDate = new Date();
      // Get next month instead of current month
      let nextMonth = currentDate.getMonth() + 2; // getMonth() returns 0-11, so +2 for next month
      let nextYear = currentDate.getFullYear();
      
      // Handle December to January transition
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear = nextYear + 1;
      }

      console.log(`📋 Creating monthly production plan for ${nextMonth}/${nextYear} (next month)`);

      // Check if monthly plan already exists for this month/year
      const existingPlan = await MongoMonthlyPlanService.findByMonthAndYear(nextMonth, nextYear);

      if (existingPlan) {
        console.log(`⚠️  Monthly plan already exists for ${nextMonth}/${nextYear}`);
        return;
      }

      // Create monthly plan with empty items array
      const monthlyPlan = await MongoMonthlyPlanService.create({
        id: generateId(),
        title: `Monthly Production Plan - ${this.getMonthName(nextMonth)} ${nextYear}`,
        month: nextMonth,
        year: nextYear,
        weekCount: 4,
        status: 'pending',
        assignedTo: 'mdsxto8ydv4dknv25i', // Amit Kumar Parida
        assignedRole: 'mdsvs0sm4g2ebejicna', // Production Manager
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        submittedAt: new Date().toISOString(),
        items: [] // Empty items array - no predefined data
      });

      console.log(`✅ Monthly production plan created: ${monthlyPlan.title}`);
      console.log(`📋 Plan ID: ${monthlyPlan.id}`);
      console.log(`📝 Items: ${monthlyPlan.items.length} (empty)`);

      // Create task for monthly plan with generic name (no dates)
      console.log(`📋 Creating task for monthly plan...`);
      const task = await MongoProductionTaskService.create({
        id: generateId(),
        title: `Monthly Production Plan - ${this.getMonthName(nextMonth)} ${nextYear}`,
        description: `Create and submit monthly production plan for ${this.getMonthName(nextMonth)} ${nextYear}`,
        type: 'monthly',
        status: 'pending',
        priority: 'high',
        assignedTo: 'mdsxto8ydv4dknv25i', // Amit Kumar Parida
        assignedRole: 'mdsvs0sm4g2ebejicna', // Production Manager
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        planId: monthlyPlan.id
      });

      console.log(`✅ Task created for monthly plan: ${task.title}`);
      console.log(`📋 Task ID: ${task.id}, Type: ${task.type}, Status: ${task.status}`);

    } catch (error) {
      console.error('❌ Error creating monthly production plan:', (error as Error).message);
      if ((error as Error).stack) {
        console.error('❌ Stack trace:', (error as Error).stack);
      }
    }
  }

  private static getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  }

  private static getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  static async triggerMonthlyPlan() {
    console.log('🚀 Manually triggering monthly production plan creation...');
    await this.createMonthlyProductionPlan();
  }

  static getStatus() {
    return {
      initialized: this.isInitialized,
      schedules: {
        monthly: 'Every month on 4th at 16:15 IST'
      }
    };
  }
}