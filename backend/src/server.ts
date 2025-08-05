// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { connectDB } from './config/database';
import { CronService } from './services/cronService';

// Import routes
import authRoutes from './routes/auth';
import tasksRoutes from './routes/tasks';
import projectsRoutes from './routes/projects';
import rbacRoutes from './routes/rbac';
import productionRoutes from './routes/production';

const app = express();
const PORT = process.env.PORT || 3000;

// Log environment variables for debugging
console.log('🔧 Environment Configuration:');
console.log(`   PORT: ${process.env.PORT || 'not set (using 3000)'}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? 'set' : 'not set'}`);
console.log(`   FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID ? 'set' : 'not set'}`);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    message: 'Server is running and healthy'
  });
});

// Cron status route
app.get('/api/cron/status', (req, res) => {
  const status = CronService.getStatus();
  res.json({
    success: true,
    data: status
  });
});

// Manual cron trigger routes (for testing)
app.post('/api/cron/trigger/monthly', async (req, res) => {
  try {
    await CronService.triggerMonthlyPlan();
    res.json({
      success: true,
      message: 'Monthly production plan triggered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to trigger monthly plan'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/rbac', rbacRoutes);
app.use('/api/production', productionRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to RBAC3 Backend API',
    version: '1.0.0',
    port: PORT,
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      projects: '/api/projects',
      rbac: '/api/rbac',
      health: '/api/health',
      cron: {
        status: '/api/cron/status',
        trigger: {
          monthly: '/api/cron/trigger/monthly'
        }
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.message
    });
  }
  
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized'
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
const startServer = async () => {
  try {
    console.log('🚀 Starting RBAC3 Backend Server...');
    console.log(`📋 Configuration:`);
    console.log(`   - Port: ${PORT}`);
    console.log(`   - Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   - Database: MongoDB Atlas`);
    
    // Connect to MongoDB Atlas
    await connectDB();
    console.log('✅ MongoDB Atlas connected successfully');
    
    // Initialize cron service
    CronService.initialize();
    console.log('✅ Cron service initialized with automated production plans');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🎉 Server is running on port ${PORT}`);
      console.log(`📊 Health check available at http://localhost:${PORT}/api/health`);
      console.log(`🔗 API Documentation available at http://localhost:${PORT}/`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database: MongoDB Atlas`);
      console.log(`🕐 Cron service initialized with automated production plans`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 