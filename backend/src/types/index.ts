// Core RBAC Types
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Permission IDs
  isSystem: boolean; // System roles cannot be deleted
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  employeeId: string;
  department: string;
  designation: string;
  roles: string[]; // Role IDs
  isActive: boolean;
  joinDate: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Task Management Types
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string; // User ID
  assignedBy: string; // User ID
  projectId: string;
  dueDate: Date;
  tags: string[];
  attachments: string[];
  comments: TaskComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskComment {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
}

// Project Management Types
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  owner: string; // User ID
  members: ProjectMember[];
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  userId: string;
  role: string; // Role ID
  joinedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication Types
export interface AuthUser {
  uid: string;
  email: string;
  displayName: string; // This will be mapped from user.name
  photoURL?: string; // This will be undefined
}

export interface JwtPayload {
  uid: string;
  email: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

// Production Planning Types
export * from './production'; 