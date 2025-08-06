const axios = require("axios");

const API_BASE_URL =
  process.env.API_BASE_URL || "https://rbac-ma5a.onrender.com/api";
const ADMIN_TOKEN =
  "bWRzeHRvOHA5amJrbGdmODN0ajpzYkBibGFja2NhdC5pbjoxNzU0MzAxNDc4MzYy";

async function createTestPlan() {
  try {
    console.log("🧪 Creating a fresh monthly plan for testing...");

    // Create a new monthly plan
    const monthlyPlanResponse = await axios.post(
      `${API_BASE_URL}/production/monthly`,
      {
        month: 9,
        year: 2025,
        weekCount: 4,
        items: [
          {
            itemCode: "TEST001",
            itemName: "Test Product for Duplicate Prevention",
            customerName: "Test Customer",
            monthlyQuantity: 1000,
          },
          {
            itemCode: "TEST002",
            itemName: "Another Test Product",
            customerName: "Another Customer",
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

    if (monthlyPlanResponse.data.success) {
      console.log("✅ Monthly plan created successfully");
      console.log("📋 Plan ID:", monthlyPlanResponse.data.data.id);
      console.log("📋 Plan Title:", monthlyPlanResponse.data.data.title);

      // Create a task for this plan
      const taskResponse = await axios.post(
        `${API_BASE_URL}/production/tasks`,
        {
          type: "monthly",
          title: monthlyPlanResponse.data.data.title,
          assignedTo: "mdsxto8ydv4dknv25i", // Amit Kumar Parida
          assignedRole: "mdsvs0sm4g2ebejicna", // Production Manager
          planId: monthlyPlanResponse.data.data.id,
          deadline: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 30 days from now
          status: "pending",
        },
        {
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (taskResponse.data.success) {
        console.log("✅ Task created successfully");
        console.log("📋 Task ID:", taskResponse.data.data.id);
      }

      console.log("\n🎯 Now you can run: npm run test-duplicate-prevention");
    }
  } catch (error) {
    console.error(
      "❌ Failed to create test plan:",
      error.response?.data || error.message
    );
  }
}

createTestPlan();
