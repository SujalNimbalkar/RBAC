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
      const existingPlans = await MongoMonthlyPlanService.getAll();
      const existingPlan = existingPlans.find(plan => 
        plan.month === nextMonth && plan.year === nextYear
      );

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
        type: 'monthly',
        title: `Monthly Production Plan - ${this.getMonthName(nextMonth)} ${nextYear}`,
        assignedTo: monthlyPlan.assignedTo,
        assignedRole: monthlyPlan.assignedRole,
        planId: monthlyPlan.id,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        status: 'pending'
      });

      console.log(`✅ Task created successfully: ${task.title}`);
      console.log(`📋 Task ID: ${task.id}`);
      console.log(`📋 Task Type: ${task.type}`);
      console.log(`📋 Task Status: ${task.status}`);

    } catch (error) {
      console.error('❌ Error creating monthly production plan:', error);
      console.error('❌ Error details:', (error as Error).message);
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

  // Manual trigger for testing
  static async triggerMonthlyPlan() {
    console.log('🧪 Manually triggering monthly production plan...');
    await this.createMonthlyProductionPlan();
  }

  // Get cron status
  static getStatus() {
    return {
      initialized: this.isInitialized,
      schedules: {
        monthly: '15 16 4 * * (4th of every month at 16:15 IST)'
      }
    };
  }
} 