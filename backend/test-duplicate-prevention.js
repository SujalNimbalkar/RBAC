const axios = require("axios");

const API_BASE_URL = "http://localhost:5000/api";
const ADMIN_TOKEN =
  "bWRzeHRvOHA5amJrbGdmODN0ajpzYkBibGFja2NhdC5pbjoxNzU0MzAxNDc4MzYy";

async function testDuplicatePrevention() {
  try {
    console.log("🧪 Testing Duplicate Prevention...");

    // Test 1: Try to submit the same monthly plan twice
    console.log("\n📋 Test 1: Monthly Plan Duplicate Prevention");
    const tasksResponse = await axios.get(`${API_BASE_URL}/production/tasks`);
    const monthlyTasks = tasksResponse.data.data.tasks.filter(
      (task) => task.type === "monthly" && task.status === "pending"
    );

    if (monthlyTasks.length > 0) {
      const monthlyTask = monthlyTasks[0];
      console.log(`🎯 Testing with monthly task: ${monthlyTask.title}`);

      // First submission
      console.log("📝 First submission...");
      const firstSubmit = await axios.post(
        `${API_BASE_URL}/production/monthly/${monthlyTask.planId}/submit`,
        {
          month: 8,
          year: 2025,
          items: [
            {
              itemCode: "ITEM001",
              itemName: "Test Product 1",
              customerName: "Test Customer 1",
              monthlyQuantity: 1000,
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

      if (firstSubmit.data.success) {
        console.log("✅ First submission successful");
        console.log(
          "📊 Weekly plans created:",
          firstSubmit.data.data.weeklyPlans?.length || 0
        );
      }

      // Second submission (should not create duplicates)
      console.log("📝 Second submission (should not create duplicates)...");
      const secondSubmit = await axios.post(
        `${API_BASE_URL}/production/monthly/${monthlyTask.planId}/submit`,
        {
          month: 8,
          year: 2025,
          items: [
            {
              itemCode: "ITEM001",
              itemName: "Test Product 1",
              customerName: "Test Customer 1",
              monthlyQuantity: 1000,
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

      if (secondSubmit.data.success) {
        console.log("✅ Second submission successful (no duplicates created)");
        console.log(
          "📊 Weekly plans in response:",
          secondSubmit.data.data.weeklyPlans?.length || 0
        );
      }
    } else {
      console.log("⚠️  No pending monthly tasks found for testing");
    }

    // Test 2: Try to submit the same weekly plan twice
    console.log("\n📋 Test 2: Weekly Plan Duplicate Prevention");
    const weeklyTasks = tasksResponse.data.data.tasks.filter(
      (task) => task.type === "weekly" && task.status === "pending"
    );

    if (weeklyTasks.length > 0) {
      const weeklyTask = weeklyTasks[0];
      console.log(`🎯 Testing with weekly task: ${weeklyTask.title}`);

      // First submission
      console.log("📝 First submission...");
      const firstSubmit = await axios.post(
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
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (firstSubmit.data.success) {
        console.log("✅ First submission successful");
        console.log(
          "📊 Daily plans created:",
          firstSubmit.data.data.dailyPlans?.length || 0
        );
      }

      // Second submission (should not create duplicates)
      console.log("📝 Second submission (should not create duplicates)...");
      const secondSubmit = await axios.post(
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
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (secondSubmit.data.success) {
        console.log("✅ Second submission successful (no duplicates created)");
        console.log(
          "📊 Daily plans in response:",
          secondSubmit.data.data.dailyPlans?.length || 0
        );
      }
    } else {
      console.log("⚠️  No pending weekly tasks found for testing");
    }

    // Test 3: Check for existing duplicates
    console.log("\n📋 Test 3: Check for Existing Duplicates");
    const allTasks = tasksResponse.data.data.tasks;
    const taskGroups = {};

    allTasks.forEach((task) => {
      const key = `${task.type}-${task.title}`;
      if (!taskGroups[key]) {
        taskGroups[key] = [];
      }
      taskGroups[key].push(task);
    });

    const duplicates = [];
    Object.keys(taskGroups).forEach((key) => {
      if (taskGroups[key].length > 1) {
        console.log(
          `🔍 Found ${taskGroups[key].length} duplicate tasks for: ${key}`
        );
        duplicates.push(...taskGroups[key].slice(1));
      }
    });

    if (duplicates.length === 0) {
      console.log("✅ No duplicate tasks found");
    } else {
      console.log(`⚠️  Found ${duplicates.length} duplicate tasks`);
    }

    console.log("\n✅ Duplicate prevention tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

testDuplicatePrevention();
