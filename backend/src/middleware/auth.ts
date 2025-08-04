import { Request, Response, NextFunction } from 'express';
import { auth } from 'firebase-admin';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { UserService, RoleService, PermissionService } from '../data';
import { JwtPayload, AuthUser } from '../types';

// Initialize Firebase Admin if not already initialized
const initializeFirebase = () => {
  if (getApps().length === 0) {
    try {
      // Check if environment variables are available
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        console.log('Initializing Firebase with environment variables...');
        initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          })
        });
        console.log('Firebase initialized successfully with environment variables');
      } else {
        console.error('Firebase environment variables not found. Please check your .env file.');
        console.error('Required variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
      }
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }
};

// Initialize Firebase when this module is loaded
initializeFirebase();

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      userRoles?: string[];
      userPermissions?: string[];
    }
  }
}

// Verify Firebase ID token
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Ensure Firebase is initialized
    if (getApps().length === 0) {
      console.error('Firebase not initialized');
      return res.status(500).json({
        success: false,
        error: 'Authentication service not available'
      });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth().verifyIdToken(token);
    
    // Get user from our database
    const user = await UserService.getById(decodedToken.uid);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive'
      });
    }

    // Get user roles and permissions
    const roles = await RoleService.getAll();
    const permissions = await PermissionService.getAll();
    
    const userRoles = roles.filter(role => user.roles.includes(role.id));
    const userPermissions = permissions.filter(permission => 
      userRoles.some(role => role.permissions.includes(permission.id))
    );

    // Attach user info to request
    req.user = {
      uid: user.id,
      email: user.email,
      displayName: user.name,
      photoURL: undefined
    };
    req.userRoles = userRoles.map(role => role.id);
    req.userPermissions = userPermissions.map(permission => permission.id);

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// Check if user has specific permission
export const hasPermission = (resource: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const hasPermission = req.userPermissions?.some(permissionId => {
      const permission = req.userPermissions?.find(p => p === permissionId);
      return permission === `${resource}:${action}`;
    });

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: `Insufficient permissions: ${resource}:${action}`
      });
    }

    next();
  };
};

// Check if user has any of the specified roles
export const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const hasRole = req.userRoles?.some(roleId => roles.includes(roleId));
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: `Insufficient role permissions. Required: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Check if user is admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  return hasRole(['admin'])(req, res, next);
};

// Check if user is the owner of a resource
export const isOwner = (getResourceOwnerId: (req: Request) => string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const resourceOwnerId = getResourceOwnerId(req);
    if (req.user.uid !== resourceOwnerId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Not the owner of this resource'
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth().verifyIdToken(token);
    
    const user = await UserService.getById(decodedToken.uid);
    if (user && user.isActive) {
      req.user = {
        uid: user.id,
        email: user.email,
        displayName: user.name,
        photoURL: undefined
      };
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}; 