import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

import { connectDB, disconnectDB } from '../config/database';
import { MongoUserService } from '../services/mongoUserService';
import { MongoProductionTaskService } from '../services/mongoProductionTaskService';
import { MongoMonthlyPlanService } from '../services/mongoMonthlyPlanService';
import { MongoWeeklyPlanService } from '../services/mongoWeeklyPlanService';
import { MongoDailyPlanService } from '../services/mongoDailyPlanService';
import { MongoDailyReportService } from '../services/mongoDailyReportService';
import { MongoActionPlanService } from '../services/mongoActionPlanService';
import { MongoRoleService } from '../services/mongoRoleService';
import { MongoPermissionService } from '../services/mongoPermissionService';

// Fix path resolution - use absolute paths from the backend root
const backendRoot = path.resolve(__dirname, '../../');
const dataDir = path.join(backendRoot, 'data');
const databaseDir = path.join(backendRoot, 'database');

async function migrateData() {
  try {
    console.log('🔄 Starting data migration to MongoDB Atlas...');
    console.log(`📁 Backend root: ${backendRoot}`);
    console.log(`📁 Data directory: ${dataDir}`);
    console.log(`📁 Database directory: ${databaseDir}`);
    
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not defined!');
      console.error('');
      console.error('Please set your MongoDB Atlas connection string:');
      console.error('');
      console.error('Option 1: Set environment variable:');
      console.error('  $env:MONGODB_URI="your_mongodb_connection_string"');
      console.error('');
      console.error('Option 2: Create a .env file in the backend directory with:');
      console.error('  MONGODB_URI=your_mongodb_connection_string');
      console.error('');
      console.error('Option 3: Run with inline environment variable:');
      console.error('  $env:MONGODB_URI="your_connection_string"; npm run migrate-to-mongo');
      console.error('');
      process.exit(1);
    }
    
    // Connect to MongoDB Atlas
    await connectDB();
    
    // Clear existing collections to avoid duplicate key errors
    console.log('🧹 Clearing existing collections...');
    try {
      await MongoUserService.clearAll();
      await MongoRoleService.clearAll();
      await MongoPermissionService.clearAll();
      await MongoProductionTaskService.clearAll();
      await MongoMonthlyPlanService.clearAll();
      await MongoWeeklyPlanService.clearAll();
      await MongoDailyPlanService.clearAll();
      await MongoDailyReportService.clearAll();
      await MongoActionPlanService.clearAll();
      console.log('✅ Cleared existing collections');
    } catch (error) {
      console.log('⚠️  Could not clear collections (might not exist yet):', (error as Error).message);
    }
    
    // Migrate Users (from database directory)
    console.log('📊 Migrating users...');
    const usersPath = path.join(databaseDir, 'users.json');
    console.log(`🔍 Checking for users at: ${usersPath}`);
    if (fs.existsSync(usersPath)) {
      const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
      for (const user of users) {
        // Transform user data to match MongoDB model
        const transformedUser = {
          ...user,
          uid: user.id // Map 'id' to 'uid' for MongoDB model, but keep 'id' too
        };
        await MongoUserService.create(transformedUser);
      }
      console.log(`✅ Migrated ${users.length} users`);
    } else {
      console.log('⚠️  users.json not found in database directory');
    }
    
    // Migrate Roles (from database directory)
    console.log('📊 Migrating roles...');
    const rolesPath = path.join(databaseDir, 'roles.json');
    console.log(`🔍 Checking for roles at: ${rolesPath}`);
    if (fs.existsSync(rolesPath)) {
      const roles = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
      for (const role of roles) {
        await MongoRoleService.create(role);
      }
      console.log(`✅ Migrated ${roles.length} roles`);
    } else {
      console.log('⚠️  roles.json not found in database directory');
    }
    
    // Migrate Permissions (from database directory)
    console.log('📊 Migrating permissions...');
    const permissionsPath = path.join(databaseDir, 'permissions.json');
    console.log(`🔍 Checking for permissions at: ${permissionsPath}`);
    if (fs.existsSync(permissionsPath)) {
      const permissions = JSON.parse(fs.readFileSync(permissionsPath, 'utf8'));
      for (const permission of permissions) {
        await MongoPermissionService.create(permission);
      }
      console.log(`✅ Migrated ${permissions.length} permissions`);
    } else {
      console.log('⚠️  permissions.json not found in database directory');
    }
    
    // Migrate Production Tasks
    console.log('📊 Migrating production tasks...');
    const tasksPath = path.join(dataDir, 'production/tasks.json');
    console.log(`🔍 Checking for tasks at: ${tasksPath}`);
    if (fs.existsSync(tasksPath)) {
      const tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
      for (const task of tasks) {
        // Transform task data to match MongoDB model
        const transformedTask = {
          ...task,
          deadline: task.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 7 days from now
          description: task.description || task.title || 'No description provided',
          priority: task.priority || 'medium',
          assignedBy: task.assignedBy || 'system',
          projectId: task.projectId || null,
          dueDate: task.dueDate || task.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          tags: task.tags || [],
          attachments: task.attachments || []
        };
        await MongoProductionTaskService.create(transformedTask);
      }
      console.log(`✅ Migrated ${tasks.length} production tasks`);
    } else {
      console.log('⚠️  tasks.json not found in data/production directory');
    }
    
    // Migrate Monthly Plans
    console.log('📊 Migrating monthly plans...');
    const monthlyPlansPath = path.join(dataDir, 'production/monthly-plans.json');
    console.log(`🔍 Checking for monthly plans at: ${monthlyPlansPath}`);
    if (fs.existsSync(monthlyPlansPath)) {
      const monthlyPlans = JSON.parse(fs.readFileSync(monthlyPlansPath, 'utf8'));
      for (const plan of monthlyPlans) {
        // Transform monthly plan data to match MongoDB model
        const transformedPlan = {
          ...plan,
          title: plan.title || `Monthly Plan - ${plan.month}/${plan.year}`,
          status: plan.status || 'pending',
          assignedTo: plan.assignedTo || 'system',
          assignedRole: plan.assignedRole || 'plant_head',
          deadline: plan.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          weekCount: plan.weekCount || 4,
          submittedAt: plan.submittedAt || new Date().toISOString()
        };
        await MongoMonthlyPlanService.create(transformedPlan);
      }
      console.log(`✅ Migrated ${monthlyPlans.length} monthly plans`);
    } else {
      console.log('⚠️  monthly-plans.json not found in data/production directory');
    }
    
    // Migrate Weekly Plans
    console.log('📊 Migrating weekly plans...');
    const weeklyPlansPath = path.join(dataDir, 'production/weekly-plans.json');
    console.log(`🔍 Checking for weekly plans at: ${weeklyPlansPath}`);
    if (fs.existsSync(weeklyPlansPath)) {
      const weeklyPlans = JSON.parse(fs.readFileSync(weeklyPlansPath, 'utf8'));
      for (const plan of weeklyPlans) {
        // Transform weekly plan data to match MongoDB model
        const transformedPlan = {
          ...plan,
          title: plan.title || `Weekly Plan - Week ${plan.weekNumber}`,
          status: plan.status || 'pending',
          assignedTo: plan.assignedTo || 'system',
          assignedRole: plan.assignedRole || 'plant_head',
          startDate: plan.startDate || new Date().toISOString(),
          endDate: plan.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          submittedAt: plan.submittedAt || new Date().toISOString()
        };
        await MongoWeeklyPlanService.create(transformedPlan);
      }
      console.log(`✅ Migrated ${weeklyPlans.length} weekly plans`);
    } else {
      console.log('⚠️  weekly-plans.json not found in data/production directory');
    }
    
    // Migrate Daily Plans
    console.log('📊 Migrating daily plans...');
    const dailyPlansPath = path.join(dataDir, 'production/daily-plans.json');
    console.log(`🔍 Checking for daily plans at: ${dailyPlansPath}`);
    if (fs.existsSync(dailyPlansPath)) {
      const dailyPlans = JSON.parse(fs.readFileSync(dailyPlansPath, 'utf8'));
      for (const plan of dailyPlans) {
        // Transform daily plan data to match MongoDB model
        const transformedPlan = {
          ...plan,
          title: plan.title || `Daily Plan - ${plan.date}`,
          status: plan.status || 'pending',
          assignedTo: plan.assignedTo || 'system',
          assignedRole: plan.assignedRole || 'production_manager',
          date: plan.date || new Date().toISOString(),
          deadline: plan.deadline || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          submittedAt: plan.submittedAt || new Date().toISOString()
        };
        await MongoDailyPlanService.create(transformedPlan);
      }
      console.log(`✅ Migrated ${dailyPlans.length} daily plans`);
    } else {
      console.log('⚠️  daily-plans.json not found in data/production directory');
    }
    
    // Migrate Daily Reports
    console.log('📊 Migrating daily reports...');
    const dailyReportsPath = path.join(dataDir, 'production/daily-reports.json');
    console.log(`🔍 Checking for daily reports at: ${dailyReportsPath}`);
    if (fs.existsSync(dailyReportsPath)) {
      const dailyReports = JSON.parse(fs.readFileSync(dailyReportsPath, 'utf8'));
      for (const report of dailyReports) {
        // Transform daily report data to match MongoDB model
        const transformedReport = {
          ...report,
          status: report.status || 'pending',
          assignedTo: report.assignedTo || 'system',
          assignedRole: report.assignedRole || 'production_manager',
          submittedAt: report.submittedAt || new Date().toISOString(),
          entries: report.entries.map((entry: any) => ({
            ...entry,
            target: entry.target || 0,
            otPlan: entry.otPlan || 0,
            h2Plan: entry.h2Plan || 0,
            h1Plan: entry.h1Plan || 0,
            work: entry.work || 'Standard production work',
            operatorName: entry.operatorName || 'Operator',
            deptName: entry.deptName || 'Production',
            productionPercentage: entry.productionPercentage || 0
          }))
        };
        await MongoDailyReportService.create(transformedReport);
      }
      console.log(`✅ Migrated ${dailyReports.length} daily reports`);
    } else {
      console.log('⚠️  daily-reports.json not found in data/production directory');
    }
    
    // Migrate Action Plans
    console.log('📊 Migrating action plans...');
    const actionPlansPath = path.join(dataDir, 'production/action-plans.json');
    console.log(`🔍 Checking for action plans at: ${actionPlansPath}`);
    if (fs.existsSync(actionPlansPath)) {
      const actionPlans = JSON.parse(fs.readFileSync(actionPlansPath, 'utf8'));
      for (const actionPlan of actionPlans) {
        await MongoActionPlanService.create(actionPlan);
      }
      console.log(`✅ Migrated ${actionPlans.length} action plans`);
    } else {
      console.log('⚠️  action-plans.json not found in data/production directory');
    }
    
    console.log('🎉 Data migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await disconnectDB();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateData();
} 