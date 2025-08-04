const axios = require("axios");

const API_BASE_URL = "http://localhost:5000/api";
const ADMIN_TOKEN =
  "bWRzeHRvOHA5amJrbGdmODN0ajpzYkBibGFja2NhdC5pbjoxNzU0MzAzMjAwMDQy";

async function testCronService() {
  try {
    console.log("🧪 Testing Monthly Cron Service...");

    // Test 1: Check cron status
    console.log("\n📋 Test 1: Checking cron status...");
    const statusResponse = await axios.get(`${API_BASE_URL}/cron/status`);
    if (statusResponse.data.success) {
      console.log("✅ Cron status retrieved successfully");
      console.log(
        "📊 Status:",
        JSON.stringify(statusResponse.data.data, null, 2)
      );
    }

    // Test 2: Trigger monthly plan manually
    console.log("\n📋 Test 2: Triggering monthly plan manually...");
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
      console.log("✅ Monthly plan triggered successfully");
      console.log("📝 Message:", monthlyResponse.data.message);
    }

    // Test 3: Check if tasks were created
    console.log("\n📋 Test 3: Checking if tasks were created...");
    const tasksResponse = await axios.get(`${API_BASE_URL}/production/tasks`);
    const tasks = tasksResponse.data.data.tasks;
    console.log(`📊 Found ${tasks.length} tasks`);

    if (tasks.length > 0) {
      console.log("📋 Recent tasks:");
      tasks.slice(0, 5).forEach((task, index) => {
        console.log(
          `  ${index + 1}. ${task.title} (${task.type}) - ${task.status}`
        );
      });
    }

    console.log("\n✅ Monthly cron service tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

testCronService();
