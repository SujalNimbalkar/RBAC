import { Router, Request, Response } from 'express';
import { auth } from 'firebase-admin';
import { MongoUserService } from '../services/mongoUserService';
import { MongoRoleService } from '../services/mongoRoleService';
import { verifyToken, optionalAuth } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = Router();

// Register new user
router.post('/register', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { email, name, phone, employeeId, department, designation, firebaseUid } = req.body;

    if (!email || !name || !firebaseUid) {
      return res.status(400).json({
        success: false,
        error: 'Email, name, and firebaseUid are required'
      });
    }

    // Check if user already exists
    const existingUser = await MongoUserService.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Get default role (user role)
    const roles = await MongoRoleService.getAll();
    const defaultRole = roles.find(role => role.name === 'user');
    if (!defaultRole) {
      return res.status(500).json({
        success: false,
        error: 'Default user role not found'
      });
    }

    // Create user
    const newUser = await MongoUserService.create({
      email,
      name,
      phone,
      employeeId: employeeId || `EMP${Date.now()}`,
      department: department || 'General',
      designation: designation || 'Employee',
      roles: [defaultRole.id],
      isActive: true,
      joinDate: new Date()
    });

    res.status(201).json({
      success: true,
      data: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        employeeId: newUser.employeeId,
        department: newUser.department,
        designation: newUser.designation,
        roles: newUser.roles
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get current user profile
router.get('/profile', verifyToken, async (req: Request, res: Response) => {
  try {
    const user = await MongoUserService.findByUid(req.user!.uid);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user roles with details
    const roles = await MongoRoleService.getAll();
    const userRoles = roles.filter(role => user.roles.includes(role.id));

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        employeeId: user.employeeId,
        department: user.department,
        designation: user.designation,
        roles: userRoles,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req: Request, res: Response) => {
  try {
    const { name, phone, department, designation } = req.body;
    const updates: any = {};

    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (department !== undefined) updates.department = department;
    if (designation !== undefined) updates.designation = designation;

    const updatedUser = await MongoUserService.updateByUid(req.user!.uid, updates);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        department: updatedUser.department,
        designation: updatedUser.designation
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update last login
router.post('/login', verifyToken, async (req: Request, res: Response) => {
  try {
    await MongoUserService.updateByUid(req.user!.uid, {
      lastLogin: new Date()
    });

    res.json({
      success: true,
      message: 'Login recorded successfully'
    });
  } catch (error) {
    console.error('Login recording error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user permissions
router.get('/permissions', verifyToken, async (req: Request, res: Response) => {
  try {
    const user = await MongoUserService.findByUid(req.user!.uid);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user roles and permissions
    const roles = await MongoRoleService.getAll();
    const userRoles = roles.filter(role => user.roles.includes(role.id));

    res.json({
      success: true,
      data: {
        roles: userRoles,
        permissions: req.userPermissions
      }
    });
  } catch (error) {
    console.error('Permissions fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Verify token endpoint
router.get('/verify', verifyToken, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      user: req.user,
      roles: req.userRoles,
      permissions: req.userPermissions
    }
  });
});

// Simple login endpoint for testing (returns token)
router.post('/login-simple', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Get user by email
    const user = await MongoUserService.findByEmail(email);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // For testing purposes, accept any password
    // In production, you should verify the password properly
    
    // Get user roles
    const roles = await MongoRoleService.getAll();
    const userRoles = roles.filter(role => user.roles.includes(role.id));

    // Check if user has admin role
    const isAdmin = userRoles.some(role => role.name === 'admin' || role.name === 'director' || role.name === 'cto');
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    // Create a simple token (in production, use proper JWT)
    const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64');

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: userRoles.map(role => role.name)
        }
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router; 