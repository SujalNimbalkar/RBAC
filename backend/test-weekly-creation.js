const axios = require("axios");

const API_BASE_URL = "http://localhost:5000/api";
const ADMIN_TOKEN =
  "bWRzeHRvOHA5amJrbGdmODN0ajpzYkBibGFja2NhdC5pbjoxNzU0MjM1ODg3NDQ1";

async function testWeeklyCreation() {
  try {
    console.log("🧪 Testing Weekly Plan Creation from Monthly Plan...");

    // First, get all monthly tasks
    const tasksResponse = await axios.get(`${API_BASE_URL}/production/tasks`);
    const monthlyTasks = tasksResponse.data.data.tasks.filter(
      (task) => task.type === "monthly"
    );

    if (monthlyTasks.length === 0) {
      console.log("❌ No monthly tasks found");
      return;
    }

    console.log(`📋 Found ${monthlyTasks.length} monthly tasks`);

    // Get the first monthly task
    const monthlyTask = monthlyTasks[0];
    console.log(
      `🎯 Testing with monthly task: ${monthlyTask.title} (ID: ${monthlyTask.planId})`
    );

    // Submit the monthly plan to trigger weekly plan creation
    const submitResponse = await axios.post(
      `${API_BASE_URL}/production/monthly/${monthlyTask.planId}/submit`,
      {
        month: 8, // August
        year: 2025,
        items: [
          {
            itemCode: "ITEM001",
            itemName: "Test Product 1",
            customerName: "Test Customer 1",
            monthlyQuantity: 1000,
          },
          {
            itemCode: "ITEM002",
            itemName: "Test Product 2",
            customerName: "Test Customer 2",
            monthlyQuantity: 500,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (submitResponse.data.success) {
      console.log("✅ Monthly plan submitted successfully");
      console.log(
        "📊 Weekly plans created:",
        submitResponse.data.data.weeklyPlans?.length || 0
      );

      if (submitResponse.data.data.weeklyPlans) {
        submitResponse.data.data.weeklyPlans.forEach((plan, index) => {
          console.log(`  📅 Week ${index + 1}: ${plan.title}`);
        });
      }
    } else {
      console.log(
        "❌ Failed to submit monthly plan:",
        submitResponse.data.error
      );
    }
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

testWeeklyCreation();
