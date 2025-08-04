import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
// Try to get admin token from environment or from admin-token.json file
let ADMIN_TOKEN = process.env.ADMIN_TOKEN;
if (!ADMIN_TOKEN) {
  try {
    const fs = require('fs');
    const tokenData = JSON.parse(fs.readFileSync('admin-token.json', 'utf8'));
    ADMIN_TOKEN = tokenData.token;
    console.log('✅ Using admin token from admin-token.json');
  } catch (error) {
    console.error('❌ Could not read admin token from admin-token.json');
  }
}

interface MonthlyTaskRequest {
  month: number;
  year: number;
}

interface ApiResponse {
  success: boolean;
  data?: {
    id: string;
    assignedTo: string;
    deadline: string;
    title?: string;
  };
  error?: string;
  message?: string;
}

async function createMonthlyProductionTask(month: number, year: number): Promise<void> {
  try {
    if (!ADMIN_TOKEN) {
      throw new Error('Admin token not configured');
    }

    console.log(`🔄 Creating monthly production task for ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}...`);
    
    const requestData: MonthlyTaskRequest = { month, year };
    
    const response = await axios.post<ApiResponse>(
      `${API_BASE_URL}/production/automate/monthly-task`,
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );

    if (response.data.success) {
      console.log(`✅ Monthly production task created successfully for ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`);
      console.log(`📋 Task ID: ${response.data.data?.id}`);
      console.log(`👤 Assigned to: Employee ID ${response.data.data?.assignedTo}`);
      console.log(`⏰ Deadline: ${new Date(response.data.data?.deadline || '').toLocaleDateString()}`);
      console.log(`📝 Title: ${response.data.data?.title || 'Monthly Production Plan'}`);
      console.log(`💬 Message: ${response.data.message || 'Task created successfully'}`);
    } else {
      console.error('❌ Failed to create monthly production task:', response.data.error);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('❌ API Error:', (error.response.data as ApiResponse)?.error || error.message);
        console.error('📊 Status:', error.response.status);
        console.error('📋 Response:', error.response.data);
      } else if (error.request) {
        console.error('❌ Network Error: No response received from server');
        console.error('🔗 URL:', `${API_BASE_URL}/production/automate/monthly-task`);
      } else {
        console.error('❌ Request Error:', error.message);
      }
    } else {
      console.error('❌ Unexpected error:', error);
    }
  }
}

async function createCurrentMonthTask(): Promise<void> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = now.getFullYear();
  
  console.log(`🚀 Creating monthly production task for ${new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })} ${currentYear}...`);
  
  await createMonthlyProductionTask(currentMonth, currentYear);
}

async function createSpecificMonthTask(month: number, year: number): Promise<void> {
  console.log(`🚀 Creating monthly production task for ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}...`);
  
  await createMonthlyProductionTask(month, year);
}

// Test function to create a task for testing purposes
async function createTestTask(): Promise<void> {
  console.log('🧪 Creating test monthly production task...');
  
  // Create task for current month for testing
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  await createMonthlyProductionTask(currentMonth, currentYear);
}

// Main execution
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  console.log('🕐 Automation script started at:', new Date().toLocaleString());
  console.log('🌐 API Base URL:', API_BASE_URL);
  console.log('🔑 Admin Token:', ADMIN_TOKEN ? '✅ Configured' : '❌ Not configured');
  
  if (args.length === 0) {
    // No arguments - create task for current month
    await createCurrentMonthTask();
  } else if (args.length === 1 && args[0] === 'test') {
    // Test mode
    await createTestTask();
  } else if (args.length === 2) {
    // Two arguments - month and year
    const month = parseInt(args[0]);
    const year = parseInt(args[1]);
    
    if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
      console.error('❌ Invalid arguments. Usage: npm run automate-production [month] [year]');
      console.error('   Example: npm run automate-production 8 2025');
      console.error('   Or: npm run automate-production test (for testing)');
      process.exit(1);
    }
    
    await createSpecificMonthTask(month, year);
  } else {
    console.error('❌ Invalid arguments. Usage: npm run automate-production [month] [year]');
    console.error('   Example: npm run automate-production 8 2025');
    console.error('   Or: npm run automate-production test (for testing)');
    console.error('   Or run without arguments to create task for current month');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { createMonthlyProductionTask, createCurrentMonthTask, createSpecificMonthTask, createTestTask }; 