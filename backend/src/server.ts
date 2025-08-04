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
const PORT = process.env.PORT || 5000;

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
    environment: process.env.NODE_ENV || 'development'
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

// Memory management
const logMemoryUsage = () => {
  const memUsage = process.memoryUsage();
  console.log('📊 Memory Usage:', {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(memUsage.external / 1024 / 1024)} MB`
  });
};

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB Atlas
    await connectDB();
    
    // Initialize cron service
    CronService.initialize();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Health check available at http://localhost:${PORT}/api/health`);
      console.log(`🔗 API Documentation available at http://localhost:${PORT}/`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database: MongoDB Atlas`);
      console.log(`🕐 Cron service initialized with automated production plans`);
      
      // Log initial memory usage
      logMemoryUsage();
      
      // Log memory usage every 5 minutes
      setInterval(logMemoryUsage, 5 * 60 * 1000);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 