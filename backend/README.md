# RBAC3 Backend API

A comprehensive Role-Based Access Control (RBAC) backend system built with Node.js, Express, and TypeScript. This API provides authentication, task management, project management, and role-based access control functionality.

## Features

- 🔐 **Firebase Authentication Integration**
- 👥 **Role-Based Access Control (RBAC)**
- 📋 **Task Management System**
- 🏗️ **Project Management**
- 👤 **User Management**
- 🔒 **Permission-Based Authorization**
- 📊 **Pagination and Filtering**
- 🗄️ **JSON File Storage** (easily migratable to MongoDB)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: Firebase Admin SDK
- **Storage**: JSON Files (designed for MongoDB migration)
- **CORS**: Enabled for frontend integration

## Installation

1. **Clone the repository**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

4. **Firebase Setup**

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing one
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file and extract the values to your `.env` file

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint       | Description                 | Auth Required |
| ------ | -------------- | --------------------------- | ------------- |
| POST   | `/register`    | Register new user           | No            |
| GET    | `/profile`     | Get user profile            | Yes           |
| PUT    | `/profile`     | Update user profile         | Yes           |
| POST   | `/login`       | Record user login           | Yes           |
| GET    | `/permissions` | Get user permissions        | Yes           |
| GET    | `/verify`      | Verify authentication token | Yes           |

### Tasks (`/api/tasks`)

| Method | Endpoint        | Description                  | Auth Required |
| ------ | --------------- | ---------------------------- | ------------- |
| GET    | `/`             | Get all tasks (with filters) | Yes           |
| GET    | `/:id`          | Get single task              | Yes           |
| POST   | `/`             | Create new task              | Yes           |
| PUT    | `/:id`          | Update task                  | Yes           |
| DELETE | `/:id`          | Delete task                  | Yes           |
| POST   | `/:id/comments` | Add comment to task          | Yes           |
| GET    | `/user/me`      | Get user's tasks             | Yes           |

### Projects (`/api/projects`)

| Method | Endpoint               | Description                     | Auth Required |
| ------ | ---------------------- | ------------------------------- | ------------- |
| GET    | `/`                    | Get all projects (with filters) | Yes           |
| GET    | `/:id`                 | Get single project              | Yes           |
| POST   | `/`                    | Create new project              | Yes           |
| PUT    | `/:id`                 | Update project                  | Yes           |
| DELETE | `/:id`                 | Delete project                  | Yes           |
| POST   | `/:id/members`         | Add member to project           | Yes           |
| DELETE | `/:id/members/:userId` | Remove member from project      | Yes           |
| GET    | `/:id/tasks`           | Get project tasks               | Yes           |
| GET    | `/user/me`             | Get user's projects             | Yes           |

### RBAC Management (`/api/rbac`)

| Method | Endpoint                       | Description                         | Auth Required |
| ------ | ------------------------------ | ----------------------------------- | ------------- |
| GET    | `/roles`                       | Get all roles                       | Admin         |
| GET    | `/roles/:id`                   | Get single role                     | Admin         |
| POST   | `/roles`                       | Create new role                     | Admin         |
| PUT    | `/roles/:id`                   | Update role                         | Admin         |
| DELETE | `/roles/:id`                   | Delete role                         | Admin         |
| GET    | `/permissions`                 | Get all permissions                 | Admin         |
| GET    | `/permissions/:id`             | Get single permission               | Admin         |
| POST   | `/permissions`                 | Create new permission               | Admin         |
| GET    | `/users/:userId/roles`         | Get user roles                      | Admin         |
| POST   | `/users/:userId/roles`         | Assign role to user                 | Admin         |
| DELETE | `/users/:userId/roles/:roleId` | Remove role from user               | Admin         |
| POST   | `/init`                        | Initialize system roles/permissions | Admin         |

## RBAC System

### Default Roles

1. **Admin** - Full system access

   - Can manage users, roles, permissions
   - Can access all projects and tasks
   - Can perform all operations

2. **Manager** - Project management access

   - Can create and manage projects
   - Can manage project members
   - Can manage tasks within their projects

3. **User** - Basic access
   - Can create projects
   - Can manage assigned tasks
   - Limited access to system features

### Default Permissions

- `task:create` - Create new tasks
- `task:update` - Update existing tasks
- `task:delete` - Delete tasks
- `task:comment` - Add comments to tasks
- `project:create` - Create new projects
- `project:update` - Update existing projects
- `project:delete` - Delete projects
- `project:manage_members` - Manage project members
- `user:manage` - Manage user accounts
- `role:manage` - Manage roles and permissions

## Data Models

### User

```typescript
{
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  roles: string[]; // Role IDs
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Task

```typescript
{
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
```

### Project

```typescript
{
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
```

### Role

```typescript
{
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Permission IDs
  isSystem: boolean; // System roles cannot be deleted
  createdAt: Date;
  updatedAt: Date;
}
```

### Permission

```typescript
{
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Authentication

The API uses Firebase Authentication for user authentication. All protected endpoints require a valid Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## Error Handling

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message"
}
```

## Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (not implemented yet)

### Database Migration

The current implementation uses JSON files for data storage. To migrate to MongoDB:

1. Update the data layer in `src/data/index.ts`
2. Replace JSON file operations with MongoDB operations
3. Update environment variables for MongoDB connection
4. No changes needed in API routes (abstraction layer)

## Security Features

- ✅ Firebase Authentication
- ✅ Role-Based Access Control
- ✅ Permission-Based Authorization
- ✅ Input Validation
- ✅ CORS Protection
- ✅ Error Handling
- ✅ Request Logging

## API Examples

### Create a Task

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <firebase-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete API documentation",
    "description": "Write comprehensive API docs",
    "assignedTo": "user-id",
    "projectId": "project-id",
    "priority": "high",
    "dueDate": "2024-01-15"
  }'
```

### Get User's Tasks

```bash
curl -X GET http://localhost:5000/api/tasks/user/me \
  -H "Authorization: Bearer <firebase-token>"
```

### Initialize RBAC System

```bash
curl -X POST http://localhost:5000/api/rbac/init \
  -H "Authorization: Bearer <admin-firebase-token>"
```

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation
4. Write comprehensive tests
5. Update documentation

## License

This project is part of the RBAC3 system.
