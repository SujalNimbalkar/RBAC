const mongoose = require("mongoose");
require("dotenv").config();

async function cleanupMongoCollections() {
  try {
    console.log("🧹 Starting MongoDB collection cleanup...");

    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Import models
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
    const {
      MongoDailyReportService,
    } = require("./dist/services/mongoDailyReportService");

    // Clear all collections
    console.log("\n🗑️  Clearing all production collections...");

    // Clear Production Tasks
    console.log("📋 Clearing Production Tasks...");
    await MongoProductionTaskService.clearAll();
    console.log("✅ Production Tasks cleared");

    // Clear Monthly Plans
    console.log("📋 Clearing Monthly Plans...");
    await MongoMonthlyPlanService.clearAll();
    console.log("✅ Monthly Plans cleared");

    // Clear Weekly Plans
    console.log("📋 Clearing Weekly Plans...");
    await MongoWeeklyPlanService.clearAll();
    console.log("✅ Weekly Plans cleared");

    // Clear Daily Plans
    console.log("📋 Clearing Daily Plans...");
    await MongoDailyPlanService.clearAll();
    console.log("✅ Daily Plans cleared");

    // Clear Daily Reports
    console.log("📋 Clearing Daily Reports...");
    await MongoDailyReportService.clearAll();
    console.log("✅ Daily Reports cleared");

    // Verify cleanup
    console.log("\n🔍 Verifying cleanup...");

    const remainingTasks = await MongoProductionTaskService.getAll();
    const remainingMonthlyPlans = await MongoMonthlyPlanService.getAll();
    const remainingWeeklyPlans = await MongoWeeklyPlanService.getAll();
    const remainingDailyPlans = await MongoDailyPlanService.getAll();
    const remainingDailyReports = await MongoDailyReportService.getAll();

    console.log(`📊 Remaining items:`);
    console.log(`  - Tasks: ${remainingTasks.length}`);
    console.log(`  - Monthly Plans: ${remainingMonthlyPlans.length}`);
    console.log(`  - Weekly Plans: ${remainingWeeklyPlans.length}`);
    console.log(`  - Daily Plans: ${remainingDailyPlans.length}`);
    console.log(`  - Daily Reports: ${remainingDailyReports.length}`);

    if (
      remainingTasks.length === 0 &&
      remainingMonthlyPlans.length === 0 &&
      remainingWeeklyPlans.length === 0 &&
      remainingDailyPlans.length === 0 &&
      remainingDailyReports.length === 0
    ) {
      console.log("✅ All production collections cleared successfully!");
    } else {
      console.log("⚠️  Some items remain in collections");
    }

    console.log("\n🎯 MongoDB cleanup completed! You can now:");
    console.log("  1. Run: npm run create-test-plan");
    console.log("  2. Run: npm run test-duplicate-prevention");
    console.log("  3. Test the full workflow from scratch");
  } catch (error) {
    console.error("❌ MongoDB cleanup failed:", error.message);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

cleanupMongoCollections();
