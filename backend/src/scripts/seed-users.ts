import { UserService, RoleService } from '../data';

const userData = [
  {
    "id": 1,
    "name": "Shashank Bajaj",
    "email": "sb@blackcat.in",
    "phone": "+91-9876543210",
    "employeeId": "EMP001",
    "department": "Director",
    "designation": "System Administrator",
    "roles": ["director"],
    "isActive": true,
    "joinDate": "2020-01-15",
    "lastLogin": "2025-01-28T10:30:00.000Z"
  },
  {
    "id": 3,
    "name": "Sujal Nimbalkar",
    "email": "sujalnimbalkar09@gmail.com",
    "phone": "+91-9876543210",
    "employeeId": "EMP003",
    "department": "CTO",
    "designation": "System Administrator",
    "roles": ["cto"],
    "isActive": true,
    "joinDate": "2020-01-15",
    "lastLogin": "2025-01-28T10:30:00.000Z"
  },
  {
    "id": 2,
    "name": "Amit Kumar Parida",
    "email": "qc6@blackcat.in",
    "phone": "+91-9876543211",
    "employeeId": "EMP002",
    "department": "Production",
    "designation": "Production Manager",
    "roles": ["production_manager"],
    "isActive": true,
    "joinDate": "2021-03-20",
    "lastLogin": "2025-01-28T09:15:00.000Z"
  },
  {
    "id": 4,
    "name": "Narendra Chauhan",
    "email": "narendra@blackcat.in",
    "phone": "+91-9876543213",
    "employeeId": "EMP004",
    "department": "Production",
    "designation": "Plant Head",
    "roles": ["plant_head"],
    "isActive": true,
    "joinDate": "2019-11-05",
    "lastLogin": "2025-01-28T11:20:00.000Z"
  }
];

async function seedUsers() {
  try {
    console.log('🌱 Starting user seeding process...');

    // Get all roles to map role names to role IDs
    const roles = await RoleService.getAll();
    const roleNameToId: { [key: string]: string } = {};
    
    roles.forEach(role => {
      roleNameToId[role.name] = role.id;
    });

    console.log('📋 Available roles:', Object.keys(roleNameToId));

    // Clear existing users to ensure clean slate
    const existingUsers = await UserService.getAll();
    console.log(`📊 Found ${existingUsers.length} existing users - clearing all existing users...`);
    
    // Delete all existing users
    for (const user of existingUsers) {
      await UserService.delete(user.id);
    }
    console.log('🗑️  Cleared all existing users');

    let createdCount = 0;
    let skippedCount = 0;

    for (const userDataItem of userData) {
      // Map role names to role IDs
      const roleIds = userDataItem.roles
        .map(roleName => roleNameToId[roleName])
        .filter(id => id); // Remove undefined values

      if (roleIds.length === 0) {
        console.log(`⚠️  No valid roles found for user: ${userDataItem.email}`);
        skippedCount++;
        continue;
      }

      // Create user data
      const userToCreate = {
        name: userDataItem.name,
        email: userDataItem.email,
        phone: userDataItem.phone,
        employeeId: userDataItem.employeeId,
        department: userDataItem.department,
        designation: userDataItem.designation,
        roles: roleIds,
        isActive: userDataItem.isActive,
        joinDate: new Date(userDataItem.joinDate),
        lastLogin: userDataItem.lastLogin ? new Date(userDataItem.lastLogin) : undefined
      };

      // Create the user
      const newUser = await UserService.create(userToCreate);
      console.log(`✅ Created user: ${newUser.name} (${newUser.email}) with roles: ${userDataItem.roles.join(', ')}`);
      createdCount++;
    }

    console.log('\n🎉 User seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Users created: ${createdCount}`);
    console.log(`   - Users skipped: ${skippedCount}`);
    console.log(`   - Total users in system: ${(await UserService.getAll()).length}`);

  } catch (error) {
    console.error('❌ User seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if this script is executed directly
if (require.main === module) {
  seedUsers();
}

export { seedUsers }; 