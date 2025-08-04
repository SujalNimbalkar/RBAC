const axios = require("axios");

const API_BASE_URL = "http://localhost:5000/api";
const ADMIN_TOKEN =
  "bWRzeHRvOHA5amJrbGdmODN0ajpzYkBibGFja2NhdC5pbjoxNzU0MjM1ODg3NDQ1";

async function testDailyCreation() {
  try {
    console.log("🧪 Testing Daily Plan Creation from Weekly Plan...");

    // First, get all weekly tasks
    const tasksResponse = await axios.get(`${API_BASE_URL}/production/tasks`);
    const weeklyTasks = tasksResponse.data.data.tasks.filter(
      (task) => task.type === "weekly"
    );

    if (weeklyTasks.length === 0) {
      console.log("❌ No weekly tasks found");
      return;
    }

    console.log(`📋 Found ${weeklyTasks.length} weekly tasks`);

    // Get the first weekly task
    const weeklyTask = weeklyTasks[0];
    console.log(
      `🎯 Testing with weekly task: ${weeklyTask.title} (ID: ${weeklyTask.planId})`
    );

    // Submit the weekly plan to trigger daily plan creation
    const submitResponse = await axios.post(
      `${API_BASE_URL}/production/weekly/${weeklyTask.planId}/submit`,
      {
        weekNumber: 1,
        weekStartDate: "2025-08-04T00:00:00.000Z",
        weekEndDate: "2025-08-10T23:59:59.999Z",
        items: [
          {
            itemCode: "ITEM001",
            itemName: "Test Product 1",
            customerName: "Test Customer 1",
            monthlyQuantity: 1000,
            weeklyQuantities: {
              day1: 50,
              day2: 50,
              day3: 50,
              day4: 50,
              day5: 50,
              day6: 25,
              day7: 25,
            },
          },
          {
            itemCode: "ITEM002",
            itemName: "Test Product 2",
            customerName: "Test Customer 2",
            monthlyQuantity: 500,
            weeklyQuantities: {
              day1: 25,
              day2: 25,
              day3: 25,
              day4: 25,
              day5: 25,
              day6: 12,
              day7: 12,
            },
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
      console.log("✅ Weekly plan submitted successfully");
      console.log(
        "📊 Daily plans created:",
        submitResponse.data.data.dailyPlans?.length || 0
      );

      if (submitResponse.data.data.dailyPlans) {
        submitResponse.data.data.dailyPlans.forEach((plan, index) => {
          console.log(`  📅 Day ${index + 1}: ${plan.title}`);
        });
      }
    } else {
      console.log(
        "❌ Failed to submit weekly plan:",
        submitResponse.data.error
      );
    }
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

testDailyCreation();
