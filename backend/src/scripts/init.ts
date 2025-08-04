import { PermissionService, RoleService, UserService } from '../data';

async function initializeSystem() {
  try {
    console.log('🚀 Initializing RBAC3 System...');

    // Create default permissions
    const defaultPermissions = [
      { name: 'Create Tasks', description: 'Can create new tasks', resource: 'task', action: 'create' },
      { name: 'Update Tasks', description: 'Can update existing tasks', resource: 'task', action: 'update' },
      { name: 'Delete Tasks', description: 'Can delete tasks', resource: 'task', action: 'delete' },
      { name: 'Comment on Tasks', description: 'Can add comments to tasks', resource: 'task', action: 'comment' },
      { name: 'Create Projects', description: 'Can create new projects', resource: 'project', action: 'create' },
      { name: 'Update Projects', description: 'Can update existing projects', resource: 'project', action: 'update' },
      { name: 'Delete Projects', description: 'Can delete projects', resource: 'project', action: 'delete' },
      { name: 'Manage Project Members', description: 'Can add/remove project members', resource: 'project', action: 'manage_members' },
      { name: 'Manage Users', description: 'Can manage user accounts', resource: 'user', action: 'manage' },
      { name: 'Manage Roles', description: 'Can manage roles and permissions', resource: 'role', action: 'manage' },
      // Production planning permissions
      { name: 'Create Production Plans', description: 'Can create production plans', resource: 'production', action: 'create' },
      { name: 'Read Production Plans', description: 'Can read production plans', resource: 'production', action: 'read' },
      { name: 'Update Production Plans', description: 'Can update production plans', resource: 'production', action: 'update' },
      { name: 'Delete Production Plans', description: 'Can delete production plans', resource: 'production', action: 'delete' },
      { name: 'Approve Production Plans', description: 'Can approve production plans', resource: 'production', action: 'approve' },
      { name: 'Reject Production Plans', description: 'Can reject production plans', resource: 'production', action: 'reject' }
    ];

    console.log('📝 Creating default permissions...');
    const createdPermissions = [];
    for (const perm of defaultPermissions) {
      const existing = await PermissionService.getAll();
      const exists = existing.find(p => p.resource === perm.resource && p.action === perm.action);
      if (!exists) {
        const newPerm = await PermissionService.create(perm);
        createdPermissions.push(newPerm);
        console.log(`✅ Created permission: ${newPerm.name}`);
      } else {
        console.log(`⏭️  Permission already exists: ${perm.name}`);
      }
    }

    // Get all permissions for role creation
    const allPermissions = await PermissionService.getAll();
    
    // Create default roles
    const defaultRoles = [
      {
        name: 'admin',
        description: 'System administrator with full access',
        permissions: allPermissions.map(p => p.id),
        isSystem: true
      },
      {
        name: 'director',
        description: 'Director with open access to everything',
        permissions: allPermissions.map(p => p.id),
        isSystem: true
      },
      {
        name: 'cto',
        description: 'CTO with open access to everything',
        permissions: allPermissions.map(p => p.id),
        isSystem: true
      },
      {
        name: 'manager',
        description: 'Project manager with project management permissions',
        permissions: allPermissions
          .filter(p => p.resource === 'project' || p.resource === 'task')
          .map(p => p.id),
        isSystem: true
      },
      {
        name: 'user',
        description: 'Regular user with basic permissions',
        permissions: allPermissions
          .filter(p => (p.resource === 'task' && p.action !== 'delete') || 
                      (p.resource === 'project' && p.action === 'create'))
          .map(p => p.id),
        isSystem: true
      },
      {
        name: 'plant_head',
        description: 'Plant Head with production planning and approval permissions',
        permissions: allPermissions
          .filter(p => p.resource === 'production' || p.resource === 'task')
          .map(p => p.id),
        isSystem: true
      },
      {
        name: 'production_manager',
        description: 'Production Manager with production planning permissions',
        permissions: allPermissions
          .filter(p => (p.resource === 'production' && p.action !== 'approve' && p.action !== 'reject') || 
                      (p.resource === 'task' && p.action !== 'delete'))
          .map(p => p.id),
        isSystem: true
      }
    ];

    console.log('👥 Creating default roles...');
    const createdRoles = [];
    for (const role of defaultRoles) {
      const existing = await RoleService.getAll();
      const exists = existing.find(r => r.name === role.name);
      if (!exists) {
        const newRole = await RoleService.create(role);
        createdRoles.push(newRole);
        console.log(`✅ Created role: ${newRole.name}`);
      } else {
        console.log(`⏭️  Role already exists: ${role.name}`);
      }
    }

    console.log('\n🎉 System initialization completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Permissions created: ${createdPermissions.length}`);
    console.log(`   - Roles created: ${createdRoles.length}`);
    console.log(`   - Total permissions: ${allPermissions.length}`);
    console.log(`   - Total roles: ${(await RoleService.getAll()).length}`);

    console.log('\n🔧 Next steps:');
    console.log('   1. Set up Firebase Admin SDK credentials');
    console.log('   2. Start the server with: npm run dev');
    console.log('   3. Test the API endpoints');

  } catch (error) {
    console.error('❌ System initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeSystem();
}

export { initializeSystem }; 