import fs from 'fs/promises';
import path from 'path';
import { User, Role, Permission, Task, Project } from '../types';

// Data file paths
const DATA_DIR = path.join(__dirname, '../../database');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ROLES_FILE = path.join(DATA_DIR, 'roles.json');
const PERMISSIONS_FILE = path.join(DATA_DIR, 'permissions.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Generic file operations
async function readJsonFile<T>(filePath: string): Promise<T[]> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    return [];
  }
}

async function writeJsonFile<T>(filePath: string, data: T[]): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Generate unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// User operations
export class UserService {
  static async getAll(): Promise<User[]> {
    await ensureDataDir();
    return readJsonFile<User>(USERS_FILE);
  }

  static async getById(id: string): Promise<User | null> {
    const users = await this.getAll();
    return users.find(user => user.id === id) || null;
  }

  static async getByEmail(email: string): Promise<User | null> {
    const users = await this.getAll();
    return users.find(user => user.email === email) || null;
  }

  static async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const users = await this.getAll();
    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.push(newUser);
    await writeJsonFile(USERS_FILE, users);
    return newUser;
  }

  static async update(id: string, updates: Partial<User>): Promise<User | null> {
    const users = await this.getAll();
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date()
    };
    await writeJsonFile(USERS_FILE, users);
    return users[index];
  }

  static async delete(id: string): Promise<boolean> {
    const users = await this.getAll();
    const filteredUsers = users.filter(user => user.id !== id);
    if (filteredUsers.length === users.length) return false;
    
    await writeJsonFile(USERS_FILE, filteredUsers);
    return true;
  }
}

// Role operations
export class RoleService {
  static async getAll(): Promise<Role[]> {
    await ensureDataDir();
    return readJsonFile<Role>(ROLES_FILE);
  }

  static async getById(id: string): Promise<Role | null> {
    const roles = await this.getAll();
    return roles.find(role => role.id === id) || null;
  }

  static async create(roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    const roles = await this.getAll();
    const newRole: Role = {
      ...roleData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    roles.push(newRole);
    await writeJsonFile(ROLES_FILE, roles);
    return newRole;
  }

  static async update(id: string, updates: Partial<Role>): Promise<Role | null> {
    const roles = await this.getAll();
    const index = roles.findIndex(role => role.id === id);
    if (index === -1) return null;

    roles[index] = {
      ...roles[index],
      ...updates,
      updatedAt: new Date()
    };
    await writeJsonFile(ROLES_FILE, roles);
    return roles[index];
  }

  static async delete(id: string): Promise<boolean> {
    const roles = await this.getAll();
    const role = roles.find(r => r.id === id);
    if (role?.isSystem) return false; // Cannot delete system roles
    
    const filteredRoles = roles.filter(role => role.id !== id);
    if (filteredRoles.length === roles.length) return false;
    
    await writeJsonFile(ROLES_FILE, filteredRoles);
    return true;
  }
}

// Permission operations
export class PermissionService {
  static async getAll(): Promise<Permission[]> {
    await ensureDataDir();
    return readJsonFile<Permission>(PERMISSIONS_FILE);
  }

  static async getById(id: string): Promise<Permission | null> {
    const permissions = await this.getAll();
    return permissions.find(permission => permission.id === id) || null;
  }

  static async create(permissionData: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Permission> {
    const permissions = await this.getAll();
    const newPermission: Permission = {
      ...permissionData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    permissions.push(newPermission);
    await writeJsonFile(PERMISSIONS_FILE, permissions);
    return newPermission;
  }
}

// Task operations
export class TaskService {
  static async getAll(): Promise<Task[]> {
    await ensureDataDir();
    return readJsonFile<Task>(TASKS_FILE);
  }

  static async getById(id: string): Promise<Task | null> {
    const tasks = await this.getAll();
    return tasks.find(task => task.id === id) || null;
  }

  static async getByUser(userId: string): Promise<Task[]> {
    const tasks = await this.getAll();
    return tasks.filter(task => task.assignedTo === userId);
  }

  static async create(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments'>): Promise<Task> {
    const tasks = await this.getAll();
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    tasks.push(newTask);
    await writeJsonFile(TASKS_FILE, tasks);
    return newTask;
  }

  static async update(id: string, updates: Partial<Task>): Promise<Task | null> {
    const tasks = await this.getAll();
    const index = tasks.findIndex(task => task.id === id);
    if (index === -1) return null;

    tasks[index] = {
      ...tasks[index],
      ...updates,
      updatedAt: new Date()
    };
    await writeJsonFile(TASKS_FILE, tasks);
    return tasks[index];
  }

  static async delete(id: string): Promise<boolean> {
    const tasks = await this.getAll();
    const filteredTasks = tasks.filter(task => task.id !== id);
    if (filteredTasks.length === tasks.length) return false;
    
    await writeJsonFile(TASKS_FILE, filteredTasks);
    return true;
  }

  static async addComment(taskId: string, userId: string, content: string): Promise<Task | null> {
    const tasks = await this.getAll();
    const index = tasks.findIndex(task => task.id === taskId);
    if (index === -1) return null;

    const comment = {
      id: generateId(),
      userId,
      content,
      createdAt: new Date()
    };

    tasks[index].comments.push(comment);
    tasks[index].updatedAt = new Date();
    await writeJsonFile(TASKS_FILE, tasks);
    return tasks[index];
  }
}

// Project operations
export class ProjectService {
  static async getAll(): Promise<Project[]> {
    await ensureDataDir();
    return readJsonFile<Project>(PROJECTS_FILE);
  }

  static async getById(id: string): Promise<Project | null> {
    const projects = await this.getAll();
    return projects.find(project => project.id === id) || null;
  }

  static async getByUser(userId: string): Promise<Project[]> {
    const projects = await this.getAll();
    return projects.filter(project => 
      project.owner === userId || 
      project.members.some(member => member.userId === userId)
    );
  }

  static async create(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const projects = await this.getAll();
    const newProject: Project = {
      ...projectData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    projects.push(newProject);
    await writeJsonFile(PROJECTS_FILE, projects);
    return newProject;
  }

  static async update(id: string, updates: Partial<Project>): Promise<Project | null> {
    const projects = await this.getAll();
    const index = projects.findIndex(project => project.id === id);
    if (index === -1) return null;

    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date()
    };
    await writeJsonFile(PROJECTS_FILE, projects);
    return projects[index];
  }

  static async delete(id: string): Promise<boolean> {
    const projects = await this.getAll();
    const filteredProjects = projects.filter(project => project.id !== id);
    if (filteredProjects.length === projects.length) return false;
    
    await writeJsonFile(PROJECTS_FILE, filteredProjects);
    return true;
  }

  static async addMember(projectId: string, userId: string, roleId: string): Promise<Project | null> {
    const projects = await this.getAll();
    const index = projects.findIndex(project => project.id === projectId);
    if (index === -1) return null;

    const member = {
      userId,
      role: roleId,
      joinedAt: new Date()
    };

    projects[index].members.push(member);
    projects[index].updatedAt = new Date();
    await writeJsonFile(PROJECTS_FILE, projects);
    return projects[index];
  }

  static async removeMember(projectId: string, userId: string): Promise<Project | null> {
    const projects = await this.getAll();
    const index = projects.findIndex(project => project.id === projectId);
    if (index === -1) return null;

    projects[index].members = projects[index].members.filter(member => member.userId !== userId);
    projects[index].updatedAt = new Date();
    await writeJsonFile(PROJECTS_FILE, projects);
    return projects[index];
  }
} 

// Production Planning Services
export * from './production'; 