const axios = require("axios");

const API_BASE_URL = "http://localhost:5000/api";
const ADMIN_TOKEN =
  "bWRzeHRvOHA5amJrbGdmODN0ajpzYkBibGFja2NhdC5pbjoxNzU0MzAxNDc4MzYy";

async function cleanupAllProduction() {
  try {
    console.log("🧹 Starting comprehensive production cleanup...");

    // Step 1: Get all tasks
    console.log("\n📋 Step 1: Fetching all tasks...");
    const tasksResponse = await axios.get(`${API_BASE_URL}/production/tasks`);
    const allTasks = tasksResponse.data.data.tasks;
    console.log(`📊 Found ${allTasks.length} total tasks`);

    // Step 2: Delete all tasks
    console.log("\n🗑️  Step 2: Deleting all tasks...");
    let deletedTasks = 0;
    for (const task of allTasks) {
      try {
        const deleteResponse = await axios.delete(
          `${API_BASE_URL}/production/tasks/${task.id}`,
          {
            headers: {
              Authorization: `Bearer ${ADMIN_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (deleteResponse.data.success) {
          console.log(`✅ Deleted task: ${task.title}`);
          deletedTasks++;
        }
      } catch (error) {
        console.log(
          `❌ Failed to delete task ${task.title}:`,
          error.response?.data?.error || error.message
        );
      }
    }
    console.log(`✅ Deleted ${deletedTasks} tasks`);

    // Step 3: Delete all daily reports
    console.log("\n🗑️  Step 3: Deleting all daily reports...");
    try {
      const reportsResponse = await axios.get(
        `${API_BASE_URL}/production/reports`
      );
      const allReports = reportsResponse.data.data.reports || [];
      console.log(`📊 Found ${allReports.length} daily reports`);

      let deletedReports = 0;
      for (const report of allReports) {
        try {
          const deleteResponse = await axios.delete(
            `${API_BASE_URL}/production/reports/${report.id}`,
            {
              headers: {
                Authorization: `Bearer ${ADMIN_TOKEN}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (deleteResponse.data.success) {
            console.log(`✅ Deleted report: ${report.title}`);
            deletedReports++;
          }
        } catch (error) {
          console.log(
            `❌ Failed to delete report ${report.title}:`,
            error.response?.data?.error || error.message
          );
        }
      }
      console.log(`✅ Deleted ${deletedReports} daily reports`);
    } catch (error) {
      console.log("⚠️  No reports endpoint found or no reports to delete");
    }

    // Step 4: Delete all daily plans
    console.log("\n🗑️  Step 4: Deleting all daily plans...");
    try {
      const dailyPlansResponse = await axios.get(
        `${API_BASE_URL}/production/daily`
      );
      const allDailyPlans = dailyPlansResponse.data.data.dailyPlans || [];
      console.log(`📊 Found ${allDailyPlans.length} daily plans`);

      let deletedDailyPlans = 0;
      for (const plan of allDailyPlans) {
        try {
          const deleteResponse = await axios.delete(
            `${API_BASE_URL}/production/daily/${plan.id}`,
            {
              headers: {
                Authorization: `Bearer ${ADMIN_TOKEN}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (deleteResponse.data.success) {
            console.log(`✅ Deleted daily plan: ${plan.title}`);
            deletedDailyPlans++;
          }
        } catch (error) {
          console.log(
            `❌ Failed to delete daily plan ${plan.title}:`,
            error.response?.data?.error || error.message
          );
        }
      }
      console.log(`✅ Deleted ${deletedDailyPlans} daily plans`);
    } catch (error) {
      console.log("⚠️  No daily plans endpoint found or no plans to delete");
    }

    // Step 5: Delete all weekly plans
    console.log("\n🗑️  Step 5: Deleting all weekly plans...");
    try {
      const weeklyPlansResponse = await axios.get(
        `${API_BASE_URL}/production/weekly`
      );
      const allWeeklyPlans = weeklyPlansResponse.data.data.weeklyPlans || [];
      console.log(`📊 Found ${allWeeklyPlans.length} weekly plans`);

      let deletedWeeklyPlans = 0;
      for (const plan of allWeeklyPlans) {
        try {
          const deleteResponse = await axios.delete(
            `${API_BASE_URL}/production/weekly/${plan.id}`,
            {
              headers: {
                Authorization: `Bearer ${ADMIN_TOKEN}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (deleteResponse.data.success) {
            console.log(`✅ Deleted weekly plan: ${plan.title}`);
            deletedWeeklyPlans++;
          }
        } catch (error) {
          console.log(
            `❌ Failed to delete weekly plan ${plan.title}:`,
            error.response?.data?.error || error.message
          );
        }
      }
      console.log(`✅ Deleted ${deletedWeeklyPlans} weekly plans`);
    } catch (error) {
      console.log("⚠️  No weekly plans endpoint found or no plans to delete");
    }

    // Step 6: Delete all monthly plans
    console.log("\n🗑️  Step 6: Deleting all monthly plans...");
    try {
      const monthlyPlansResponse = await axios.get(
        `${API_BASE_URL}/production/monthly`
      );
      const allMonthlyPlans = monthlyPlansResponse.data.data.monthlyPlans || [];
      console.log(`📊 Found ${allMonthlyPlans.length} monthly plans`);

      let deletedMonthlyPlans = 0;
      for (const plan of allMonthlyPlans) {
        try {
          const deleteResponse = await axios.delete(
            `${API_BASE_URL}/production/monthly/${plan.id}`,
            {
              headers: {
                Authorization: `Bearer ${ADMIN_TOKEN}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (deleteResponse.data.success) {
            console.log(`✅ Deleted monthly plan: ${plan.title}`);
            deletedMonthlyPlans++;
          }
        } catch (error) {
          console.log(
            `❌ Failed to delete monthly plan ${plan.title}:`,
            error.response?.data?.error || error.message
          );
        }
      }
      console.log(`✅ Deleted ${deletedMonthlyPlans} monthly plans`);
    } catch (error) {
      console.log("⚠️  No monthly plans endpoint found or no plans to delete");
    }

    // Step 7: Verify cleanup
    console.log("\n🔍 Step 7: Verifying cleanup...");
    try {
      const finalTasksResponse = await axios.get(
        `${API_BASE_URL}/production/tasks`
      );
      const remainingTasks = finalTasksResponse.data.data.tasks;
      console.log(`📊 Remaining tasks: ${remainingTasks.length}`);

      if (remainingTasks.length === 0) {
        console.log("✅ All tasks cleaned up successfully!");
      } else {
        console.log("⚠️  Some tasks remain:");
        remainingTasks.forEach((task) => {
          console.log(`  - ${task.title} (${task.type})`);
        });
      }
    } catch (error) {
      console.log(
        "❌ Could not verify cleanup:",
        error.response?.data || error.message
      );
    }

    console.log("\n🎯 Cleanup completed! You can now:");
    console.log("  1. Run: npm run create-test-plan");
    console.log("  2. Run: npm run test-duplicate-prevention");
    console.log("  3. Test the full workflow from scratch");
  } catch (error) {
    console.error("❌ Cleanup failed:", error.response?.data || error.message);
  }
}

cleanupAllProduction();
