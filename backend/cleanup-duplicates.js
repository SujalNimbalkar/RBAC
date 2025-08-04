const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';
const ADMIN_TOKEN = 'bWRzeHRvOHA5amJrbGdmODN0ajpzYkBibGFja2NhdC5pbjoxNzU0MjM1ODg3NDQ1';

async function cleanupDuplicateTasks() {
  try {
    console.log('🧹 Cleaning up duplicate tasks...');
    
    // Get all tasks
    const tasksResponse = await axios.get(`${API_BASE_URL}/production/tasks`);
    const tasks = tasksResponse.data.data.tasks;
    
    console.log(`📋 Found ${tasks.length} total tasks`);
    
    // Group tasks by type and title to find duplicates
    const taskGroups = {};
    tasks.forEach(task => {
      const key = `${task.type}-${task.title}`;
      if (!taskGroups[key]) {
        taskGroups[key] = [];
      }
      taskGroups[key].push(task);
    });
    
    // Find duplicates
    const duplicates = [];
    Object.keys(taskGroups).forEach(key => {
      if (taskGroups[key].length > 1) {
        console.log(`🔍 Found ${taskGroups[key].length} duplicate tasks for: ${key}`);
        // Keep the first one (oldest), mark the rest as duplicates
        duplicates.push(...taskGroups[key].slice(1));
      }
    });
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate tasks found');
      return;
    }
    
    console.log(`🗑️  Found ${duplicates.length} duplicate tasks to remove:`);
    duplicates.forEach(task => {
      console.log(`  - ${task.title} (ID: ${task.id})`);
    });
    
    // Delete the duplicates
    console.log('\n🗑️  Deleting duplicate tasks...');
    let deletedCount = 0;
    
    for (const task of duplicates) {
      try {
        const deleteResponse = await axios.delete(`${API_BASE_URL}/production/tasks/${task.id}`, {
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (deleteResponse.data.success) {
          console.log(`✅ Deleted: ${task.title}`);
          deletedCount++;
        } else {
          console.log(`❌ Failed to delete: ${task.title} - ${deleteResponse.data.error}`);
        }
      } catch (error) {
        console.log(`❌ Error deleting ${task.title}:`, error.response?.data?.error || error.message);
      }
    }
    
    console.log(`\n✅ Cleanup completed! Deleted ${deletedCount} duplicate tasks.`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.response?.data || error.message);
  }
}

cleanupDuplicateTasks(); 