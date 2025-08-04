import { Router, Request, Response } from 'express';
import { MongoUserService } from '../services/mongoUserService';
import { MongoRoleService } from '../services/mongoRoleService';
import { MongoPermissionService } from '../services/mongoPermissionService';
import { verifyToken, hasRole, isAdmin } from '../middleware/auth';

const router = Router();

// ==================== ROLES MANAGEMENT ====================

// Get all roles
router.get('/roles', verifyToken, hasRole(['admin']), async (req: Request, res: Response) => {
  try {
    const roles = await MongoRoleService.getAll();
    const permissions = await MongoPermissionService.getAll();

    const rolesWithPermissions = roles.map(role => {
      const rolePermissions = permissions.filter(permission => 
        role.permissions.includes(permission.id)
      );
      
      return {
        ...role,
        permissions: rolePermissions
      };
    });

    res.json({
      success: true,
      data: rolesWithPermissions
    });
  } catch (error) {
    console.error('Roles fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get single role
router.get('/roles/:id', verifyToken, hasRole(['admin']), async (req: Request, res: Response) => {
  try {
    const role = await MongoRoleService.getById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    const permissions = await MongoPermissionService.getAll();
    const rolePermissions = permissions.filter(permission => 
      role.permissions.includes(permission.id)
    );

    res.json({
      success: true,
      data: {
        ...role,
        permissions: rolePermissions
      }
    });
  } catch (error) {
    console.error('Role fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create new role
router.post('/roles', verifyToken, hasRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { name, description, permissions = [] } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        error: 'Name and description are required'
      });
    }

    // Check if role name already exists
    const existingRoles = await MongoRoleService.getAll();
    const existingRole = existingRoles.find(role => role.name === name);
    if (existingRole) {
      return res.status(409).json({
        success: false,
        error: 'Role with this name already exists'
      });
    }

    // Validate permissions exist
    if (permissions.length > 0) {
      const allPermissions = await MongoPermissionService.getAll();
      for (const permissionId of permissions) {
        const permission = allPermissions.find(p => p.id === permissionId);
        if (!permission) {
          return res.status(400).json({
            success: false,
            error: `Permission ${permissionId} not found`
          });
        }
      }
    }

    const newRole = await MongoRoleService.create({
      name,
      description,
      permissions,
      isSystem: false
    });

    res.status(201).json({
      success: true,
      data: newRole,
      message: 'Role created successfully'
    });
  } catch (error) {
    console.error('Role creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update role
router.put('/roles/:id', verifyToken, hasRole(['admin']), async (req: Request, res: Response) => {
  try {
    const role = await MongoRoleService.getById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Prevent updating system roles
    if (role.isSystem) {
      return res.status(403).json({
        success: false,
        error: 'Cannot update system roles'
      });
    }

    const { name, description, permissions } = req.body;
    const updates: any = {};

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (permissions !== undefined) {
      // Validate permissions exist
      const allPermissions = await MongoPermissionService.getAll();
      for (const permissionId of permissions) {
        const permission = allPermissions.find(p => p.id === permissionId);
        if (!permission) {
          return res.status(400).json({
            success: false,
            error: `Permission ${permissionId} not found`
          });
        }
      }
      updates.permissions = permissions;
    }

    const updatedRole = await MongoRoleService.update(req.params.id, updates);
    if (!updatedRole) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    res.json({
      success: true,
      data: updatedRole,
      message: 'Role updated successfully'
    });
  } catch (error) {
    console.error('Role update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete role
router.delete('/roles/:id', verifyToken, hasRole(['admin']), async (req: Request, res: Response) => {
  try {
    const role = await MongoRoleService.getById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Prevent deleting system roles
    if (role.isSystem) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete system roles'
      });
    }

    // Check if role is assigned to any users
    const users = await MongoUserService.getAll();
    const usersWithRole = users.filter(user => user.roles.includes(role.id));
    if (usersWithRole.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete role. It is assigned to ${usersWithRole.length} user(s)`
      });
    }

    const deleted = await MongoRoleService.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Role deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ==================== PERMISSIONS MANAGEMENT ====================

// Get all permissions
router.get('/permissions', verifyToken, hasRole(['admin']), async (req: Request, res: Response) => {
  try {
    const permissions = await MongoPermissionService.getAll();
    res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error('Permissions fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get single permission
router.get('/permissions/:id', verifyToken, hasRole(['admin']), async (req: Request, res: Response) => {
  try {
    const permission = await MongoPermissionService.getById(req.params.id);
    if (!permission) {
      return res.status(404).json({
        success: false,
        error: 'Permission not found'
      });
    }

    res.json({
      success: true,
      data: permission
    });
  } catch (error) {
    console.error('Permission fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create new permission
router.post('/permissions', verifyToken, hasRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { name, description, resource, action } = req.body;

    if (!name || !description || !resource || !action) {
      return res.status(400).json({
        success: false,
        error: 'Name, description, resource, and action are required'
      });
    }

    // Check if permission already exists
    const existingPermissions = await MongoPermissionService.getAll();
    const existingPermission = existingPermissions.find(
      p => p.resource === resource && p.action === action
    );
    if (existingPermission) {
      return res.status(409).json({
        success: false,
        error: 'Permission with this resource and action already exists'
      });
    }

    const newPermission = await MongoPermissionService.create({
      name,
      description,
      resource,
      action
    });

    res.status(201).json({
      success: true,
      data: newPermission,
      message: 'Permission created successfully'
    });
  } catch (error) {
    console.error('Permission creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ==================== USER ROLES MANAGEMENT ====================

// Get user roles
router.get('/users/:userId/roles', verifyToken, hasRole(['admin']), async (req: Request, res: Response) => {
  try {
    const user = await MongoUserService.getById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const roles = await MongoRoleService.getAll();
    const userRoles = roles.filter(role => user.roles.includes(role.id));

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.name
        },
        roles: userRoles
      }
    });
  } catch (error) {
    console.error('User roles fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Assign role to user
router.post('/users/:userId/roles', verifyToken, hasRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { roleId } = req.body;
    
    if (!roleId) {
      return res.status(400).json({
        success: false,
        error: 'roleId is required'
      });
    }

    const user = await MongoUserService.getById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const role = await MongoRoleService.getById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Check if user already has this role
    if (user.roles.includes(roleId)) {
      return res.status(409).json({
        success: false,
        error: 'User already has this role'
      });
    }

    const updatedUser = await MongoUserService.update(req.params.userId, {
      roles: [...user.roles, roleId]
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Role assigned successfully'
    });
  } catch (error) {
    console.error('Role assignment error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Remove role from user
router.delete('/users/:userId/roles/:roleId', verifyToken, hasRole(['admin']), async (req: Request, res: Response) => {
  try {
    const user = await MongoUserService.getById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const role = await MongoRoleService.getById(req.params.roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Check if user has this role
    if (!user.roles.includes(req.params.roleId)) {
      return res.status(404).json({
        success: false,
        error: 'User does not have this role'
      });
    }

    // Prevent removing system roles from users
    if (role.isSystem) {
      return res.status(403).json({
        success: false,
        error: 'Cannot remove system roles from users'
      });
    }

    const updatedUser = await MongoUserService.update(req.params.userId, {
      roles: user.roles.filter(roleId => roleId !== req.params.roleId)
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Role removed successfully'
    });
  } catch (error) {
    console.error('Role removal error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ==================== SYSTEM INITIALIZATION ====================

// Initialize system roles and permissions (admin only)
router.post('/init', verifyToken, hasRole(['admin']), async (req: Request, res: Response) => {
  try {
    const permissions = await MongoPermissionService.getAll();
    const roles = await MongoRoleService.getAll();

    // Create default permissions if they don't exist
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
      { name: 'Manage Roles', description: 'Can manage roles and permissions', resource: 'role', action: 'manage' }
    ];

    const createdPermissions = [];
    for (const perm of defaultPermissions) {
      const existing = permissions.find(p => p.resource === perm.resource && p.action === perm.action);
      if (!existing) {
        const newPerm = await MongoPermissionService.create(perm);
        createdPermissions.push(newPerm);
      }
    }

    // Create default roles if they don't exist
    const allPermissions = await MongoPermissionService.getAll();
    
    const defaultRoles = [
      {
        name: 'admin',
        description: 'System administrator with full access',
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
      }
    ];

    const createdRoles = [];
    for (const role of defaultRoles) {
      const existing = roles.find(r => r.name === role.name);
      if (!existing) {
        const newRole = await MongoRoleService.create(role);
        createdRoles.push(newRole);
      }
    }

    res.json({
      success: true,
      data: {
        permissionsCreated: createdPermissions.length,
        rolesCreated: createdRoles.length,
        permissions: createdPermissions,
        roles: createdRoles
      },
      message: 'System initialized successfully'
    });
  } catch (error) {
    console.error('System initialization error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router; 