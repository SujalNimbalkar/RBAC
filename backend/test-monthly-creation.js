const axios = require("axios");

const API_BASE_URL = "http://localhost:5000/api";
const ADMIN_TOKEN =
  "bWRzeHRvOHA5amJrbGdmODN0ajpzYkBibGFja2NhdC5pbjoxNzU0MzAzMjAwMDQy";

async function testMonthlyCreation() {
  try {
    console.log("🧪 Testing Monthly Production Plan Creation...");

    // Test 1: Trigger monthly plan creation
    console.log("\n📋 Test 1: Triggering monthly plan creation...");
    const monthlyResponse = await axios.post(
      `${API_BASE_URL}/cron/trigger/monthly`,
      {},
      {
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (monthlyResponse.data.success) {
      console.log("✅ Monthly plan creation triggered successfully");
      console.log("📝 Message:", monthlyResponse.data.message);
    }

    // Test 2: Check if monthly plans were created
    console.log("\n📋 Test 2: Checking monthly plans...");
    const monthlyPlansResponse = await axios.get(
      `${API_BASE_URL}/production/monthly`,
      {
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    const monthlyPlans = monthlyPlansResponse.data.data.monthlyPlans || [];
    console.log(`📊 Found ${monthlyPlans.length} monthly plans`);

    if (monthlyPlans.length > 0) {
      console.log("📋 Recent monthly plans:");
      monthlyPlans.slice(0, 3).forEach((plan, index) => {
        console.log(
          `  ${index + 1}. ${plan.title} (${plan.month}/${plan.year}) - ${
            plan.status
          }`
        );
        console.log(`     Items: ${plan.items?.length || 0} (should be empty)`);
      });
    }

    // Test 3: Check if tasks were created
    console.log("\n📋 Test 3: Checking tasks...");
    const tasksResponse = await axios.get(`${API_BASE_URL}/production/tasks`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    const tasks = tasksResponse.data.data.tasks;
    console.log(`📊 Found ${tasks.length} tasks`);

    const monthlyTasks = tasks.filter((task) => task.type === "monthly");
    console.log(`📊 Found ${monthlyTasks.length} monthly tasks`);

    if (monthlyTasks.length > 0) {
      console.log("📋 Monthly tasks:");
      monthlyTasks.slice(0, 3).forEach((task, index) => {
        console.log(`  ${index + 1}. ${task.title} - ${task.status}`);
      });
    }

    // Test 4: Check cron status
    console.log("\n📋 Test 4: Checking cron status...");
    const statusResponse = await axios.get(`${API_BASE_URL}/cron/status`);
    if (statusResponse.data.success) {
      console.log("✅ Cron status:");
      console.log(
        "📊 Schedules:",
        JSON.stringify(statusResponse.data.data.schedules, null, 2)
      );
    }

    console.log("\n✅ Monthly production plan creation tests completed!");
    console.log("\n🎯 Next steps:");
    console.log("  1. Submit the monthly plan to create weekly plans");
    console.log("  2. Submit weekly plans to create daily plans");
    console.log("  3. Approve daily plans to create reports");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

testMonthlyCreation();
