import { Router, Request, Response } from 'express';
import { MongoProductionTaskService } from '../services/mongoProductionTaskService';
import { MongoUserService } from '../services/mongoUserService';
import { ProjectService } from '../data';
import { verifyToken, hasPermission, isOwner } from '../middleware/auth';
import { Task } from '../types';
import { IProductionTask } from '../models/ProductionTask';

const router = Router();

// Get all tasks (with filtering and pagination)
router.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      assignedTo,
      projectId,
      search
    } = req.query;

    let tasks = await MongoProductionTaskService.getAll();

    // Filter by assigned user (if not admin, only show user's tasks)
    if (!req.userRoles?.includes('admin')) {
      tasks = tasks.filter(task => task.assignedTo === req.user!.uid);
    }

    // Apply filters
    if (status) {
      // Map old status values to new ones
      const statusMap: Record<string, string> = {
        'todo': 'pending',
        'in_progress': 'inProgress',
        'review': 'inProgress',
        'completed': 'completed'
      };
      const mappedStatus = statusMap[status.toString()] || status.toString();
      tasks = tasks.filter(task => task.status === mappedStatus);
    }
    if (priority) {
      tasks = tasks.filter(task => task.priority === priority);
    }
    if (assignedTo) {
      tasks = tasks.filter(task => task.assignedTo === assignedTo);
    }
    if (projectId) {
      tasks = tasks.filter(task => task.projectId === projectId);
    }
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      tasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm) ||
        (task.description || '').toLowerCase().includes(searchTerm)
      );
    }

    // Pagination
    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedTasks = tasks.slice(startIndex, endIndex);

    // Get user details for assignedTo
    const users = await MongoUserService.getAll();
    const projects = await ProjectService.getAll();

    const tasksWithDetails = paginatedTasks.map(task => {
      const assignedUser = users.find(u => u.id === task.assignedTo);
      const project = projects.find(p => p.id === task.projectId);
      
      return {
        ...task,
        assignedUser: assignedUser ? {
          id: assignedUser.id,
          displayName: assignedUser.name,
          email: assignedUser.email
        } : null,
        project: project ? {
          id: project.id,
          name: project.name
        } : null
      };
    });

    res.json({
      success: true,
      data: tasksWithDetails,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: tasks.length,
        totalPages: Math.ceil(tasks.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Tasks fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get single task
router.get('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const task = await MongoProductionTaskService.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if user can access this task
    if (task.assignedTo !== req.user!.uid && !req.userRoles?.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get user and project details
    const users = await MongoUserService.getAll();
    const projects = await ProjectService.getAll();
    
    const assignedUser = users.find(u => u.id === task.assignedTo);
    const project = projects.find(p => p.id === task.projectId);

    res.json({
      success: true,
      data: {
        ...task,
        assignedUser: assignedUser ? {
          id: assignedUser.id,
          displayName: assignedUser.name,
          email: assignedUser.email
        } : null,
        project: project ? {
          id: project.id,
          name: project.name
        } : null
      }
    });
  } catch (error) {
    console.error('Task fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create new task
router.post('/', verifyToken, hasPermission('task', 'create'), async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      status = 'pending',
      priority = 'medium',
      assignedTo,
      projectId,
      dueDate,
      tags = []
    } = req.body;

    if (!title || !description || !assignedTo || !projectId) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, assignedTo, and projectId are required'
      });
    }

    // Validate assigned user exists
    const assignedUser = await MongoUserService.getById(assignedTo);
    if (!assignedUser) {
      return res.status(400).json({
        success: false,
        error: 'Assigned user not found'
      });
    }

    // Validate project exists
    const project = await ProjectService.getById(projectId);
    if (!project) {
      return res.status(400).json({
        success: false,
        error: 'Project not found'
      });
    }

    const newTask = await MongoProductionTaskService.create({
      title,
      description,
      status,
      priority,
      assignedTo,
      assignedBy: req.user!.uid,
      projectId,
      dueDate: dueDate ? new Date(dueDate) : new Date(),
      tags,
      attachments: []
    });

    res.status(201).json({
      success: true,
      data: newTask,
      message: 'Task created successfully'
    });
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update task
router.put('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const task = await MongoProductionTaskService.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check permissions
    const canEdit = task.assignedTo === req.user!.uid || 
                   req.userRoles?.includes('admin') ||
                   req.userPermissions?.includes('task:update');

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to update this task'
      });
    }

    const updates: Partial<IProductionTask> = {};
    const allowedFields = ['title', 'description', 'status', 'priority', 'assignedTo', 'dueDate', 'tags'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'status') {
          // Map old status values to new ones
          const statusMap: Record<string, string> = {
            'todo': 'pending',
            'in_progress': 'inProgress',
            'review': 'inProgress',
            'completed': 'completed'
          };
          const oldStatus = req.body[field];
          updates[field as keyof IProductionTask] = statusMap[oldStatus] || oldStatus;
        } else {
          updates[field as keyof IProductionTask] = req.body[field];
        }
      }
    });

    // Validate assigned user if being changed
    if (updates.assignedTo) {
      const assignedUser = await MongoUserService.getById(updates.assignedTo);
      if (!assignedUser) {
        return res.status(400).json({
          success: false,
          error: 'Assigned user not found'
        });
      }
    }

    const updatedTask = await MongoProductionTaskService.updateById(req.params.id, updates);
    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: updatedTask,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Task update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete task
router.delete('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const task = await MongoProductionTaskService.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check permissions
    const canDelete = task.assignedTo === req.user!.uid || 
                     req.userRoles?.includes('admin') ||
                     req.userPermissions?.includes('task:delete');

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to delete this task'
      });
    }

    const deleted = await MongoProductionTaskService.deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Task deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Add comment to task
router.post('/:id/comments', verifyToken, async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Comment content is required'
      });
    }

    const task = await MongoProductionTaskService.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if user can comment (assigned to task or admin)
    const canComment = task.assignedTo === req.user!.uid || 
                      req.userRoles?.includes('admin') ||
                      req.userPermissions?.includes('task:comment');

    if (!canComment) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to comment on this task'
      });
    }

    const updatedTask = await MongoProductionTaskService.addComment(req.params.id, req.user!.uid, content);
    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: updatedTask,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Comment addition error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user's tasks
router.get('/user/me', verifyToken, async (req: Request, res: Response) => {
  try {
    const tasks = await MongoProductionTaskService.getByUser(req.user!.uid);
    
    // Get user and project details
    const users = await MongoUserService.getAll();
    const projects = await ProjectService.getAll();

    const tasksWithDetails = tasks.map(task => {
      const assignedUser = users.find(u => u.id === task.assignedTo);
      const project = projects.find(p => p.id === task.projectId);
      
      return {
        ...task,
        assignedUser: assignedUser ? {
          id: assignedUser.id,
          displayName: assignedUser.name,
          email: assignedUser.email
        } : null,
        project: project ? {
          id: project.id,
          name: project.name
        } : null
      };
    });

    res.json({
      success: true,
      data: tasksWithDetails
    });
  } catch (error) {
    console.error('User tasks fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router; 