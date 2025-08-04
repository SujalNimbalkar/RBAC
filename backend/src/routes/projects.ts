import { Router, Request, Response } from 'express';
import { ProjectService } from '../data';
import { MongoUserService } from '../services/mongoUserService';
import { MongoProductionTaskService } from '../services/mongoProductionTaskService';
import { verifyToken, hasPermission, isOwner } from '../middleware/auth';
import { Project } from '../types';

const router = Router();

// Get all projects (with filtering and pagination)
router.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      owner,
      search
    } = req.query;

    let projects = await ProjectService.getAll();

    // Filter by user access (if not admin, only show user's projects)
    if (!req.userRoles?.includes('admin')) {
      projects = projects.filter(project => 
        project.owner === req.user!.uid || 
        project.members.some(member => member.userId === req.user!.uid)
      );
    }

    // Apply filters
    if (status) {
      projects = projects.filter(project => project.status === status);
    }
    if (owner) {
      projects = projects.filter(project => project.owner === owner);
    }
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      projects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm)
      );
    }

    // Pagination
    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedProjects = projects.slice(startIndex, endIndex);

    // Get user details for owner and members
    const users = await MongoUserService.getAll();

    const projectsWithDetails = paginatedProjects.map(project => {
      const ownerUser = users.find(u => u.id === project.owner);
      const membersWithDetails = project.members.map(member => {
        const memberUser = users.find(u => u.id === member.userId);
        return {
          ...member,
          user: memberUser ? {
            id: memberUser.id,
            displayName: memberUser.name,
            email: memberUser.email
          } : null
        };
      });

      return {
        ...project,
        owner: ownerUser ? {
          id: ownerUser.id,
          displayName: ownerUser.name,
          email: ownerUser.email
        } : null,
        members: membersWithDetails
      };
    });

    res.json({
      success: true,
      data: projectsWithDetails,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: projects.length,
        totalPages: Math.ceil(projects.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Projects fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get single project
router.get('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const project = await ProjectService.getById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check if user can access this project
    const canAccess = project.owner === req.user!.uid || 
                     project.members.some(member => member.userId === req.user!.uid) ||
                     req.userRoles?.includes('admin');

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get user details
    const users = await MongoUserService.getAll();
    const ownerUser = users.find(u => u.id === project.owner);
    const membersWithDetails = project.members.map(member => {
      const memberUser = users.find(u => u.id === member.userId);
      return {
        ...member,
        user: memberUser ? {
          id: memberUser.id,
          displayName: memberUser.name,
          email: memberUser.email
        } : null
      };
    });

    // Get project tasks count
    const tasks = await MongoProductionTaskService.getAll();
    const projectTasks = tasks.filter(task => task.projectId === project.id);

    res.json({
      success: true,
      data: {
        ...project,
        owner: ownerUser ? {
          id: ownerUser.id,
          displayName: ownerUser.name,
          email: ownerUser.email
        } : null,
        members: membersWithDetails,
        tasksCount: projectTasks.length
      }
    });
  } catch (error) {
    console.error('Project fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create new project
router.post('/', verifyToken, hasPermission('project', 'create'), async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      status = 'active',
      startDate,
      endDate,
      members = []
    } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        error: 'Name and description are required'
      });
    }

    // Validate members if provided
    if (members.length > 0) {
      const users = await MongoUserService.getAll();
      for (const member of members) {
        const user = users.find(u => u.id === member.userId);
        if (!user) {
          return res.status(400).json({
            success: false,
            error: `User ${member.userId} not found`
          });
        }
      }
    }

    const newProject = await ProjectService.create({
      name,
      description,
      status,
      owner: req.user!.uid,
      members,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined
    });

    res.status(201).json({
      success: true,
      data: newProject,
      message: 'Project created successfully'
    });
  } catch (error) {
    console.error('Project creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update project
router.put('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const project = await ProjectService.getById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check permissions
    const canEdit = project.owner === req.user!.uid || 
                   req.userRoles?.includes('admin') ||
                   req.userPermissions?.includes('project:update');

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to update this project'
      });
    }

    const updates: Partial<Project> = {};
    const allowedFields = ['name', 'description', 'status', 'startDate', 'endDate'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field as keyof Project] = req.body[field];
      }
    });

    // Handle date fields
    if (updates.startDate) {
      updates.startDate = new Date(updates.startDate);
    }
    if (updates.endDate) {
      updates.endDate = new Date(updates.endDate);
    }

    const updatedProject = await ProjectService.update(req.params.id, updates);
    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: updatedProject,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Project update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete project
router.delete('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const project = await ProjectService.getById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check permissions
    const canDelete = project.owner === req.user!.uid || 
                     req.userRoles?.includes('admin') ||
                     req.userPermissions?.includes('project:delete');

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to delete this project'
      });
    }

    const deleted = await ProjectService.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Project deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Add member to project
router.post('/:id/members', verifyToken, async (req: Request, res: Response) => {
  try {
    const { userId, roleId } = req.body;
    
    if (!userId || !roleId) {
      return res.status(400).json({
        success: false,
        error: 'userId and roleId are required'
      });
    }

    const project = await ProjectService.getById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check permissions
    const canManageMembers = project.owner === req.user!.uid || 
                            req.userRoles?.includes('admin') ||
                            req.userPermissions?.includes('project:manage_members');

    if (!canManageMembers) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to manage project members'
      });
    }

    // Check if user already exists
    const existingMember = project.members.find(member => member.userId === userId);
    if (existingMember) {
      return res.status(409).json({
        success: false,
        error: 'User is already a member of this project'
      });
    }

    const updatedProject = await ProjectService.addMember(req.params.id, userId, roleId);
    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: updatedProject,
      message: 'Member added successfully'
    });
  } catch (error) {
    console.error('Member addition error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Remove member from project
router.delete('/:id/members/:userId', verifyToken, async (req: Request, res: Response) => {
  try {
    const project = await ProjectService.getById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check permissions
    const canManageMembers = project.owner === req.user!.uid || 
                            req.userRoles?.includes('admin') ||
                            req.userPermissions?.includes('project:manage_members');

    if (!canManageMembers) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to manage project members'
      });
    }

    // Prevent removing the owner
    if (project.owner === req.params.userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot remove project owner'
      });
    }

    const updatedProject = await ProjectService.removeMember(req.params.id, req.params.userId);
    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: updatedProject,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Member removal error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get project tasks
router.get('/:id/tasks', verifyToken, async (req: Request, res: Response) => {
  try {
    const project = await ProjectService.getById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check if user can access this project
    const canAccess = project.owner === req.user!.uid || 
                     project.members.some(member => member.userId === req.user!.uid) ||
                     req.userRoles?.includes('admin');

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const tasks = await MongoProductionTaskService.getAll();
    const projectTasks = tasks.filter(task => task.projectId === req.params.id);

    // Get user details for assignedTo
    const users = await MongoUserService.getAll();

    const tasksWithDetails = projectTasks.map(task => {
      const assignedUser = users.find(u => u.id === task.assignedTo);
      
      return {
        ...task,
        assignedUser: assignedUser ? {
          id: assignedUser.id,
          displayName: assignedUser.name,
          email: assignedUser.email
        } : null
      };
    });

    res.json({
      success: true,
      data: tasksWithDetails
    });
  } catch (error) {
    console.error('Project tasks fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user's projects
router.get('/user/me', verifyToken, async (req: Request, res: Response) => {
  try {
    const projects = await ProjectService.getByUser(req.user!.uid);
    
    // Get user details for owner and members
    const users = await MongoUserService.getAll();

    const projectsWithDetails = projects.map(project => {
      const ownerUser = users.find(u => u.id === project.owner);
      const membersWithDetails = project.members.map(member => {
        const memberUser = users.find(u => u.id === member.userId);
        return {
          ...member,
          user: memberUser ? {
            id: memberUser.id,
            displayName: memberUser.name,
            email: memberUser.email
          } : null
        };
      });

      return {
        ...project,
        owner: ownerUser ? {
          id: ownerUser.id,
          displayName: ownerUser.name,
          email: ownerUser.email
        } : null,
        members: membersWithDetails
      };
    });

    res.json({
      success: true,
      data: projectsWithDetails
    });
  } catch (error) {
    console.error('User projects fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router; 