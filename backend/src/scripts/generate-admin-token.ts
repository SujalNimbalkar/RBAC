import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
      roles: string[];
    };
  };
  error?: string;
}

async function generateAdminToken(): Promise<void> {
  try {
    console.log('🔐 Generating admin token...');
    
    // Check if server is running
    try {
      await axios.get(`${API_BASE_URL.replace('/api', '')}`);
      console.log('✅ Server is running');
    } catch (error) {
      console.error('❌ Server is not running. Please start the server first: npm run dev');
      return;
    }

    // Get admin users from the seeded data
    const adminEmails = [
      'sb@blackcat.in',      // director
      'sujalnimbalkar09@gmail.com',  // cto
      'narendra@blackcat.in'  // plant_head (for testing)
    ];

    console.log('\n📝 Available admin emails:');
    adminEmails.forEach(email => console.log(`   - ${email}`));
    
    console.log('\n🔑 Attempting to login with sb@blackcat.in (Director)...');
    
    // Try to login with director user
    const loginResponse = await axios.post<LoginResponse>(
      `${API_BASE_URL}/auth/login-simple`,
      {
        email: 'sb@blackcat.in',
        password: 'admin123' // Any password works for testing
      }
    );

    if (loginResponse.data.success && loginResponse.data.data?.token) {
      const token = loginResponse.data.data.token;
      const user = loginResponse.data.data.user;
      
      console.log('✅ Login successful!');
      console.log(`👤 User: ${user.name} (${user.email})`);
      console.log(`🔑 Roles: ${user.roles.join(', ')}`);
      console.log(`\n🔐 Admin Token:`);
      console.log(token);
      console.log('\n📝 Add this to your .env file:');
      console.log(`ADMIN_TOKEN=${token}`);
      
      // Also save to a file for easy access
      const fs = require('fs');
      const tokenData = {
        token,
        user,
        generatedAt: new Date().toISOString(),
        note: 'Add this token to your .env file as ADMIN_TOKEN'
      };
      
      fs.writeFileSync('admin-token.json', JSON.stringify(tokenData, null, 2));
      console.log('\n💾 Token also saved to admin-token.json');
      
    } else {
      console.error('❌ Login failed:', loginResponse.data.error);
      console.log('\n📝 Manual steps:');
      console.log('1. Make sure you have seeded users: npm run seed-users');
      console.log('2. Start the server: npm run dev');
      console.log('3. Try the login again');
    }
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ API Error:', error.response?.data?.error || error.message);
      console.log('\n💡 Make sure:');
      console.log('1. Server is running (npm run dev)');
      console.log('2. Users are seeded (npm run seed-users)');
    } else {
      console.error('❌ Unexpected error:', error);
    }
  }
}

// Run the script
if (require.main === module) {
  generateAdminToken()
    .then(() => {
      console.log('\n✅ Token generation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { generateAdminToken }; 