const mongoose = require("mongoose");
require("dotenv").config();

// Import the MongoDB service
const {
  MongoProductionTaskService,
} = require("./dist/services/mongoProductionTaskService");
const {
  MongoMonthlyPlanService,
} = require("./dist/services/mongoMonthlyPlanService");
const { generateId } = require("./dist/utils/idGenerator");

function getMonthName(month) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[month - 1];
}

async function testTaskCreation() {
  try {
    console.log("🧪 Testing Direct Task Creation...");

    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Test 1: Create a monthly plan
    console.log("\n📋 Test 1: Creating monthly plan...");

    // Get next month
    const currentDate = new Date();
    let nextMonth = currentDate.getMonth() + 2; // getMonth() returns 0-11, so +2 for next month
    let nextYear = currentDate.getFullYear();

    // Handle December to January transition
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear = nextYear + 1;
    }

    const monthlyPlan = await MongoMonthlyPlanService.create({
      id: generateId(),
      title: `Test Monthly Plan - ${getMonthName(nextMonth)} ${nextYear}`,
      month: nextMonth,
      year: nextYear,
      weekCount: 4,
      status: "pending",
      assignedTo: "mdsxto8ydv4dknv25i",
      assignedRole: "mdsvs0sm4g2ebejicna",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      submittedAt: new Date().toISOString(),
      items: [],
    });

    console.log(`✅ Monthly plan created: ${monthlyPlan.title}`);
    console.log(`📋 Plan ID: ${monthlyPlan.id}`);

    // Test 2: Create a task for the monthly plan
    console.log("\n📋 Test 2: Creating task...");
    const task = await MongoProductionTaskService.create({
      id: generateId(),
      type: "monthly",
      title: monthlyPlan.title,
      assignedTo: monthlyPlan.assignedTo,
      assignedRole: monthlyPlan.assignedRole,
      planId: monthlyPlan.id,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "pending",
    });

    console.log(`✅ Task created successfully: ${task.title}`);
    console.log(`📋 Task ID: ${task.id}`);
    console.log(`📋 Task Type: ${task.type}`);
    console.log(`📋 Task Status: ${task.status}`);

    // Test 3: Verify task was saved
    console.log("\n📋 Test 3: Verifying task in database...");
    const allTasks = await MongoProductionTaskService.getAll();
    console.log(`📊 Total tasks in database: ${allTasks.length}`);

    const monthlyTasks = allTasks.filter((t) => t.type === "monthly");
    console.log(`📊 Monthly tasks: ${monthlyTasks.length}`);

    if (monthlyTasks.length > 0) {
      console.log("📋 Recent monthly tasks:");
      monthlyTasks.slice(0, 3).forEach((t, index) => {
        console.log(`  ${index + 1}. ${t.title} - ${t.status}`);
      });
    }

    console.log("\n✅ Direct task creation test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("❌ Stack trace:", error.stack);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

testTaskCreation();
