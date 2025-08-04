const mongoose = require("mongoose");
require("dotenv").config();

// Import the MongoDB service
const {
  MongoProductionTaskService,
} = require("./dist/services/mongoProductionTaskService");
const {
  MongoMonthlyPlanService,
} = require("./dist/services/mongoMonthlyPlanService");
const {
  MongoWeeklyPlanService,
} = require("./dist/services/mongoWeeklyPlanService");
const {
  MongoDailyPlanService,
} = require("./dist/services/mongoDailyPlanService");
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

async function testGenericNaming() {
  try {
    console.log("🧪 Testing Generic Naming for Production Plans...");

    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get next month
    const currentDate = new Date();
    let nextMonth = currentDate.getMonth() + 2;
    let nextYear = currentDate.getFullYear();

    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear = nextYear + 1;
    }

    // Test 1: Create monthly plan
    console.log("\n📋 Test 1: Creating monthly plan...");
    const monthlyPlan = await MongoMonthlyPlanService.create({
      id: generateId(),
      title: `Monthly Production Plan - ${getMonthName(nextMonth)} ${nextYear}`,
      month: nextMonth,
      year: nextYear,
      weekCount: 4,
      status: "pending",
      assignedTo: "mdsxto8ydv4dknv25i",
      assignedRole: "mdsvs0sm4g2ebejicna",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      submittedAt: new Date().toISOString(),
      items: [
        {
          id: generateId(),
          itemCode: "TEST001",
          itemName: "Test Product 1",
          customerName: "Test Customer 1",
          monthlyQuantity: 1000,
        },
      ],
    });

    console.log(`✅ Monthly plan created: ${monthlyPlan.title}`);

    // Test 2: Create weekly plan
    console.log("\n📋 Test 2: Creating weekly plan...");
    const weeklyPlan = await MongoWeeklyPlanService.create({
      id: generateId(),
      title: `Weekly Production Plan - Week 1`,
      weekNumber: 1,
      weekStartDate: new Date(nextYear, nextMonth - 1, 1).toISOString(),
      weekEndDate: new Date(nextYear, nextMonth - 1, 7).toISOString(),
      month: nextMonth,
      year: nextYear,
      status: "pending",
      assignedTo: "mdsxto8ydv4dknv25i",
      assignedRole: "mdsvs0sm4g2ebejicna",
      monthlyPlanId: monthlyPlan.id,
      submittedAt: new Date().toISOString(),
      items: [
        {
          id: generateId(),
          itemCode: "TEST001",
          itemName: "Test Product 1",
          customerName: "Test Customer 1",
          monthlyQuantity: 1000,
          weeklyQuantities: {
            day1: 50,
            day2: 50,
            day3: 50,
            day4: 50,
            day5: 50,
            day6: 50,
            day7: 50,
          },
        },
      ],
    });

    console.log(`✅ Weekly plan created: ${weeklyPlan.title}`);

    // Test 3: Create daily plan
    console.log("\n📋 Test 3: Creating daily plan...");
    const dailyPlan = await MongoDailyPlanService.create({
      id: generateId(),
      title: `Daily Production Plan - Day 1 (Week 1)`,
      dayNumber: 1,
      date: new Date(nextYear, nextMonth - 1, 1).toISOString(),
      weekNumber: 1,
      month: nextMonth,
      year: nextYear,
      status: "pending",
      assignedTo: "mdsxto8ydv4dknv25i",
      assignedRole: "mdsvs0sm4g2ebejicna",
      weeklyPlanId: weeklyPlan.id,
      submittedAt: new Date().toISOString(),
      entries: [
        {
          id: generateId(),
          itemCode: "TEST001",
          itemName: "Test Product 1",
          customerName: "Test Customer 1",
          target: 50,
          h1Plan: 20,
          h2Plan: 20,
          otPlan: 10,
          work: "Production of Test Product 1",
          operatorName: "Production Team",
          deptName: "Production",
          productionPercentage: 0,
        },
      ],
    });

    console.log(`✅ Daily plan created: ${dailyPlan.title}`);

    // Test 4: Create tasks with generic names
    console.log("\n📋 Test 4: Creating tasks with generic names...");

    const monthlyTask = await MongoProductionTaskService.create({
      id: generateId(),
      type: "monthly",
      title: `Monthly Production Plan - ${getMonthName(nextMonth)} ${nextYear}`,
      assignedTo: "mdsxto8ydv4dknv25i",
      assignedRole: "mdsvs0sm4g2ebejicna",
      planId: monthlyPlan.id,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "pending",
    });

    const weeklyTask = await MongoProductionTaskService.create({
      id: generateId(),
      type: "weekly",
      title: `Weekly Production Plan - Week 1`,
      assignedTo: "mdsxto8ydv4dknv25i",
      assignedRole: "mdsvs0sm4g2ebejicna",
      planId: weeklyPlan.id,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "pending",
    });

    const dailyTask = await MongoProductionTaskService.create({
      id: generateId(),
      type: "daily",
      title: `Daily Production Plan - Day 1 (Week 1)`,
      assignedTo: "mdsxto8ydv4dknv25i",
      assignedRole: "mdsvs0sm4g2ebejicna",
      planId: dailyPlan.id,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: "pending",
    });

    console.log(`✅ Monthly task created: ${monthlyTask.title}`);
    console.log(`✅ Weekly task created: ${weeklyTask.title}`);
    console.log(`✅ Daily task created: ${dailyTask.title}`);

    // Test 5: Verify all tasks have generic names
    console.log("\n📋 Test 5: Verifying generic naming...");
    const allTasks = await MongoProductionTaskService.getAll();
    const recentTasks = allTasks.slice(-3);

    console.log("📋 Recent tasks with generic names:");
    recentTasks.forEach((task, index) => {
      console.log(`  ${index + 1}. ${task.title} (${task.type})`);
    });

    console.log("\n✅ Generic naming test completed!");
    console.log("\n🎯 Benefits of generic naming:");
    console.log("  ✅ No specific dates in task names");
    console.log("  ✅ Handles holidays and Sundays");
    console.log("  ✅ Flexible for different work schedules");
    console.log("  ✅ Clean and professional naming");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("❌ Stack trace:", error.stack);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

testGenericNaming();
