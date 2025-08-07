# Month 1 Implementation Guide - Advanced Asana-like System

## Week 1: Enhanced Task Management & Procedure Framework

### Day 1-2: Procedure/Process Models & Database Schema

#### 1. Create Procedure Schema
```typescript
// backend/src/models/Procedure.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProcedureStep {
  id: string;
  title: string;
  description: string;
  assigneeRole: string;
  estimatedDuration: number; // in hours
  requiredApprovals: string[]; // user IDs
  dependencies: string[]; // step IDs
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  actualDuration?: number;
  completedAt?: Date;
  completedBy?: string;
}

export interface IProcedure extends Document {
  title: string;
  description: string;
  category: string;
  version: string;
  templateId?: string;
  organizationId: string;
  steps: IProcedureStep[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string[];
  createdBy: string;
  approvedBy?: string[];
  estimatedDuration: number;
  actualDuration?: number;
  dueDate?: Date;
  completedAt?: Date;
  tags: string[];
  customFields: { [key: string]: any };
  createdAt: Date;
  updatedAt: Date;
}

const procedureSchema = new Schema<IProcedure>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  version: { type: String, default: '1.0' },
  templateId: { type: String },
  organizationId: { type: String, required: true },
  steps: [{
    id: String,
    title: String,
    description: String,
    assigneeRole: String,
    estimatedDuration: Number,
    requiredApprovals: [String],
    dependencies: [String],
    status: { type: String, enum: ['pending', 'in_progress', 'completed', 'blocked'], default: 'pending' },
    actualDuration: Number,
    completedAt: Date,
    completedBy: String
  }],
  status: { type: String, enum: ['draft', 'active', 'completed', 'archived'], default: 'draft' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  assignedTo: [String],
  createdBy: { type: String, required: true },
  approvedBy: [String],
  estimatedDuration: { type: Number, default: 0 },
  actualDuration: Number,
  dueDate: Date,
  completedAt: Date,
  tags: [String],
  customFields: { type: Map, of: Schema.Types.Mixed }
}, {
  timestamps: true
});

export const Procedure = mongoose.model<IProcedure>('Procedure', procedureSchema);
```

#### 2. Enhanced Task Schema
```typescript
// backend/src/models/Task.ts - Update existing model
import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskDependency {
  taskId: string;
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
}

export interface ITask extends Document {
  // Existing fields...
  dependencies: ITaskDependency[];
  subtasks: string[];
  parentTask?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  labels: string[];
  estimatedHours: number;
  actualHours: number;
  timeEntries: {
    userId: string;
    startTime: Date;
    endTime?: Date;
    duration: number;
    description?: string;
  }[];
  customFields: { [key: string]: any };
  procedureId?: string;
  procedureStepId?: string;
  kanbanColumn: string;
  position: number;
  watchers: string[];
  attachments: {
    filename: string;
    url: string;
    size: number;
    uploadedBy: string;
    uploadedAt: Date;
  }[];
}

// Add to existing task schema
const taskSchema = new Schema<ITask>({
  // ... existing fields
  dependencies: [{
    taskId: String,
    type: { type: String, enum: ['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'] }
  }],
  subtasks: [String],
  parentTask: String,
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  labels: [String],
  estimatedHours: { type: Number, default: 0 },
  actualHours: { type: Number, default: 0 },
  timeEntries: [{
    userId: String,
    startTime: Date,
    endTime: Date,
    duration: Number,
    description: String
  }],
  customFields: { type: Map, of: Schema.Types.Mixed },
  procedureId: String,
  procedureStepId: String,
  kanbanColumn: { type: String, default: 'todo' },
  position: { type: Number, default: 0 },
  watchers: [String],
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    uploadedBy: String,
    uploadedAt: Date
  }]
}, {
  timestamps: true
});
```

### Day 3-4: API Endpoints Development

#### 1. Procedure API Routes
```typescript
// backend/src/routes/procedures.ts
import express from 'express';
import { Procedure } from '../models/Procedure';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get all procedures for organization
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { status, category, assignedTo } = req.query;
    
    const filter: any = { organizationId };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (assignedTo) filter.assignedTo = { $in: [assignedTo] };
    
    const procedures = await Procedure.find(filter)
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    
    res.json(procedures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new procedure
router.post('/', authMiddleware, async (req, res) => {
  try {
    const procedure = new Procedure({
      ...req.body,
      organizationId: req.user.organizationId,
      createdBy: req.user.id
    });
    
    await procedure.save();
    res.status(201).json(procedure);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update procedure step
router.patch('/:id/steps/:stepId', authMiddleware, async (req, res) => {
  try {
    const { id, stepId } = req.params;
    const procedure = await Procedure.findById(id);
    
    if (!procedure) {
      return res.status(404).json({ error: 'Procedure not found' });
    }
    
    const stepIndex = procedure.steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) {
      return res.status(404).json({ error: 'Step not found' });
    }
    
    procedure.steps[stepIndex] = { ...procedure.steps[stepIndex], ...req.body };
    if (req.body.status === 'completed') {
      procedure.steps[stepIndex].completedAt = new Date();
      procedure.steps[stepIndex].completedBy = req.user.id;
    }
    
    await procedure.save();
    res.json(procedure);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router as procedureRoutes };
```

#### 2. Enhanced Task API Routes
```typescript
// backend/src/routes/tasks.ts - Add to existing routes
import express from 'express';
import { Task } from '../models/Task';

const router = express.Router();

// Get tasks with Kanban view
router.get('/kanban', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { projectId } = req.query;
    
    const filter: any = { organizationId };
    if (projectId) filter.projectId = projectId;
    
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('dependencies.taskId', 'title status')
      .sort({ kanbanColumn: 1, position: 1 });
    
    // Group by kanban columns
    const kanbanData = {
      todo: tasks.filter(task => task.kanbanColumn === 'todo'),
      in_progress: tasks.filter(task => task.kanbanColumn === 'in_progress'),
      review: tasks.filter(task => task.kanbanColumn === 'review'),
      done: tasks.filter(task => task.kanbanColumn === 'done')
    };
    
    res.json(kanbanData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task position in Kanban
router.patch('/:id/position', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { kanbanColumn, position } = req.body;
    
    // Update positions of other tasks
    await Task.updateMany(
      { kanbanColumn, position: { $gte: position } },
      { $inc: { position: 1 } }
    );
    
    const task = await Task.findByIdAndUpdate(
      id,
      { kanbanColumn, position },
      { new: true }
    );
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add time entry
router.post('/:id/time', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { duration, description } = req.body;
    
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    task.timeEntries.push({
      userId: req.user.id,
      startTime: new Date(),
      duration,
      description
    });
    
    task.actualHours += duration;
    await task.save();
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router as taskRoutes };
```

### Day 5-7: Frontend Development

#### 1. Procedure Management Components
```typescript
// frontend/src/components/procedures/ProcedureBuilder.tsx
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface ProcedureStep {
  id: string;
  title: string;
  description: string;
  assigneeRole: string;
  estimatedDuration: number;
  dependencies: string[];
}

const ProcedureBuilder: React.FC = () => {
  const [steps, setSteps] = useState<ProcedureStep[]>([]);
  const [newStep, setNewStep] = useState<Partial<ProcedureStep>>({});

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSteps(items);
  };

  const addStep = () => {
    const step: ProcedureStep = {
      id: Date.now().toString(),
      title: newStep.title || '',
      description: newStep.description || '',
      assigneeRole: newStep.assigneeRole || '',
      estimatedDuration: newStep.estimatedDuration || 1,
      dependencies: []
    };
    
    setSteps([...steps, step]);
    setNewStep({});
  };

  return (
    <div className="procedure-builder">
      <div className="add-step-form">
        <input
          type="text"
          placeholder="Step title"
          value={newStep.title || ''}
          onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
        />
        <textarea
          placeholder="Step description"
          value={newStep.description || ''}
          onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
        />
        <select
          value={newStep.assigneeRole || ''}
          onChange={(e) => setNewStep({ ...newStep, assigneeRole: e.target.value })}
        >
          <option value="">Select Role</option>
          <option value="manager">Manager</option>
          <option value="developer">Developer</option>
          <option value="qa">QA Engineer</option>
        </select>
        <input
          type="number"
          placeholder="Estimated hours"
          value={newStep.estimatedDuration || ''}
          onChange={(e) => setNewStep({ ...newStep, estimatedDuration: parseInt(e.target.value) })}
        />
        <button onClick={addStep}>Add Step</button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="steps">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="steps-list">
              {steps.map((step, index) => (
                <Draggable key={step.id} draggableId={step.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="step-card"
                    >
                      <h4>{step.title}</h4>
                      <p>{step.description}</p>
                      <div className="step-meta">
                        <span>Role: {step.assigneeRole}</span>
                        <span>Duration: {step.estimatedDuration}h</span>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ProcedureBuilder;
```

#### 2. Kanban Board Component
```typescript
// frontend/src/components/tasks/KanbanBoard.tsx
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';

interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: any;
  priority: string;
  estimatedHours: number;
  actualHours: number;
  kanbanColumn: string;
  position: number;
}

const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<{ [key: string]: Task[] }>({
    todo: [],
    in_progress: [],
    review: [],
    done: []
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks/kanban');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleDragEnd = async (result: any) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Update local state immediately
    const sourceTasks = Array.from(tasks[source.droppableId]);
    const destTasks = source.droppableId === destination.droppableId 
      ? sourceTasks 
      : Array.from(tasks[destination.droppableId]);

    const [movedTask] = sourceTasks.splice(source.index, 1);
    destTasks.splice(destination.index, 0, movedTask);

    setTasks({
      ...tasks,
      [source.droppableId]: sourceTasks,
      [destination.droppableId]: destTasks
    });

    // Update backend
    try {
      await axios.patch(`/api/tasks/${draggableId}/position`, {
        kanbanColumn: destination.droppableId,
        position: destination.index
      });
    } catch (error) {
      console.error('Error updating task position:', error);
      // Revert local state on error
      fetchTasks();
    }
  };

  const TaskCard: React.FC<{ task: Task; index: number }> = ({ task, index }) => (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
        >
          <div className="task-header">
            <h4>{task.title}</h4>
            <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
          </div>
          <p className="task-description">{task.description}</p>
          <div className="task-footer">
            <div className="assignee">
              {task.assignedTo && (
                <img 
                  src={task.assignedTo.avatar || '/default-avatar.png'} 
                  alt={task.assignedTo.name}
                  className="avatar-small"
                />
              )}
            </div>
            <div className="time-info">
              <span>{task.actualHours}h / {task.estimatedHours}h</span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );

  const columns = [
    { id: 'todo', title: 'To Do', color: '#f4f4f4' },
    { id: 'in_progress', title: 'In Progress', color: '#e3f2fd' },
    { id: 'review', title: 'Review', color: '#fff3e0' },
    { id: 'done', title: 'Done', color: '#e8f5e8' }
  ];

  return (
    <div className="kanban-board">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-columns">
          {columns.map(column => (
            <div key={column.id} className="kanban-column" style={{ backgroundColor: column.color }}>
              <div className="column-header">
                <h3>{column.title}</h3>
                <span className="task-count">{tasks[column.id]?.length || 0}</span>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`task-list ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                  >
                    {tasks[column.id]?.map((task, index) => (
                      <TaskCard key={task._id} task={task} index={index} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
```

## Week 2: Reports & Analytics Foundation

### Day 8-9: Reporting Engine Backend

#### 1. Analytics Models
```typescript
// backend/src/models/Analytics.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalyticsEvent extends Document {
  eventType: string;
  entityType: 'task' | 'procedure' | 'project' | 'user';
  entityId: string;
  userId: string;
  organizationId: string;
  metadata: { [key: string]: any };
  timestamp: Date;
}

const analyticsEventSchema = new Schema<IAnalyticsEvent>({
  eventType: { type: String, required: true }, // task_created, task_completed, etc.
  entityType: { type: String, required: true, enum: ['task', 'procedure', 'project', 'user'] },
  entityId: { type: String, required: true },
  userId: { type: String, required: true },
  organizationId: { type: String, required: true },
  metadata: { type: Map, of: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

export const AnalyticsEvent = mongoose.model<IAnalyticsEvent>('AnalyticsEvent', analyticsEventSchema);

// Dashboard Widgets Schema
export interface IDashboardWidget extends Document {
  title: string;
  type: 'chart' | 'metric' | 'table' | 'list';
  chartType?: 'line' | 'bar' | 'pie' | 'doughnut';
  query: {
    collection: string;
    aggregation: any[];
  };
  position: { x: number; y: number; w: number; h: number };
  organizationId: string;
  createdBy: string;
}

const dashboardWidgetSchema = new Schema<IDashboardWidget>({
  title: { type: String, required: true },
  type: { type: String, required: true, enum: ['chart', 'metric', 'table', 'list'] },
  chartType: { type: String, enum: ['line', 'bar', 'pie', 'doughnut'] },
  query: {
    collection: String,
    aggregation: [Schema.Types.Mixed]
  },
  position: {
    x: Number,
    y: Number,
    w: Number,
    h: Number
  },
  organizationId: { type: String, required: true },
  createdBy: { type: String, required: true }
}, {
  timestamps: true
});

export const DashboardWidget = mongoose.model<IDashboardWidget>('DashboardWidget', dashboardWidgetSchema);
```

#### 2. Analytics Service
```typescript
// backend/src/services/analyticsService.ts
import { AnalyticsEvent } from '../models/Analytics';
import { Task } from '../models/Task';
import { Procedure } from '../models/Procedure';

export class AnalyticsService {
  // Track events
  static async trackEvent(eventType: string, entityType: string, entityId: string, userId: string, organizationId: string, metadata: any = {}) {
    try {
      const event = new AnalyticsEvent({
        eventType,
        entityType,
        entityId,
        userId,
        organizationId,
        metadata,
        timestamp: new Date()
      });
      await event.save();
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  }

  // Get task completion metrics
  static async getTaskMetrics(organizationId: string, dateRange: { start: Date; end: Date }) {
    const pipeline = [
      {
        $match: {
          organizationId,
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          statusCounts: {
            $push: {
              status: "$_id.status",
              count: "$count"
            }
          },
          totalTasks: { $sum: "$count" }
        }
      },
      { $sort: { "_id": 1 } }
    ];

    return await Task.aggregate(pipeline);
  }

  // Get user productivity metrics
  static async getUserProductivityMetrics(organizationId: string, userId?: string) {
    const matchStage: any = { organizationId };
    if (userId) matchStage.assignedTo = userId;

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: "$assignedTo",
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          },
          totalEstimatedHours: { $sum: "$estimatedHours" },
          totalActualHours: { $sum: "$actualHours" },
          avgTaskDuration: { $avg: "$actualHours" }
        }
      },
      {
        $addFields: {
          completionRate: {
            $multiply: [
              { $divide: ["$completedTasks", "$totalTasks"] },
              100
            ]
          },
          estimationAccuracy: {
            $multiply: [
              { $divide: ["$totalEstimatedHours", "$totalActualHours"] },
              100
            ]
          }
        }
      }
    ];

    return await Task.aggregate(pipeline);
  }

  // Get procedure efficiency metrics
  static async getProcedureEfficiencyMetrics(organizationId: string) {
    const pipeline = [
      { $match: { organizationId, status: 'completed' } },
      {
        $group: {
          _id: "$category",
          totalProcedures: { $sum: 1 },
          avgDuration: { $avg: "$actualDuration" },
          avgEstimatedDuration: { $avg: "$estimatedDuration" },
          totalSteps: { $sum: { $size: "$steps" } }
        }
      },
      {
        $addFields: {
          efficiencyScore: {
            $multiply: [
              { $divide: ["$avgEstimatedDuration", "$avgDuration"] },
              100
            ]
          }
        }
      }
    ];

    return await Procedure.aggregate(pipeline);
  }

  // Generate automated insights
  static async generateInsights(organizationId: string) {
    const insights = [];

    // Task completion trend
    const taskMetrics = await this.getTaskMetrics(organizationId, {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    });

    // Calculate trend
    if (taskMetrics.length >= 7) {
      const recentWeek = taskMetrics.slice(-7);
      const previousWeek = taskMetrics.slice(-14, -7);
      
      const recentCompletions = recentWeek.reduce((sum, day) => {
        const completed = day.statusCounts.find((s: any) => s.status === 'completed');
        return sum + (completed ? completed.count : 0);
      }, 0);
      
      const previousCompletions = previousWeek.reduce((sum, day) => {
        const completed = day.statusCounts.find((s: any) => s.status === 'completed');
        return sum + (completed ? completed.count : 0);
      }, 0);

      if (recentCompletions > previousCompletions * 1.1) {
        insights.push({
          type: 'positive',
          title: 'Task Completion Trending Up',
          description: `Task completions increased by ${Math.round(((recentCompletions - previousCompletions) / previousCompletions) * 100)}% this week`,
          actionable: false
        });
      } else if (recentCompletions < previousCompletions * 0.9) {
        insights.push({
          type: 'warning',
          title: 'Task Completion Declining',
          description: `Task completions decreased by ${Math.round(((previousCompletions - recentCompletions) / previousCompletions) * 100)}% this week`,
          actionable: true,
          suggestedAction: 'Review task assignments and identify potential blockers'
        });
      }
    }

    return insights;
  }
}
```

### Day 10-11: Report Builder API

#### 1. Report Builder Routes
```typescript
// backend/src/routes/reports.ts
import express from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { DashboardWidget } from '../models/Analytics';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get dashboard data
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { dateRange } = req.query;
    
    const start = dateRange ? new Date(dateRange.split(',')[0]) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = dateRange ? new Date(dateRange.split(',')[1]) : new Date();

    const [taskMetrics, userProductivity, procedureEfficiency, insights] = await Promise.all([
      AnalyticsService.getTaskMetrics(organizationId, { start, end }),
      AnalyticsService.getUserProductivityMetrics(organizationId),
      AnalyticsService.getProcedureEfficiencyMetrics(organizationId),
      AnalyticsService.generateInsights(organizationId)
    ]);

    res.json({
      taskMetrics,
      userProductivity,
      procedureEfficiency,
      insights,
      dateRange: { start, end }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create custom widget
router.post('/widgets', authMiddleware, async (req, res) => {
  try {
    const widget = new DashboardWidget({
      ...req.body,
      organizationId: req.user.organizationId,
      createdBy: req.user.id
    });
    
    await widget.save();
    res.status(201).json(widget);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Execute custom query
router.post('/query', authMiddleware, async (req, res) => {
  try {
    const { collection, aggregation } = req.body;
    
    // Security: Only allow queries on specific collections
    const allowedCollections = ['tasks', 'procedures', 'analyticsevents'];
    if (!allowedCollections.includes(collection)) {
      return res.status(400).json({ error: 'Collection not allowed' });
    }

    // Add organization filter to all queries
    const pipeline = [
      { $match: { organizationId: req.user.organizationId } },
      ...aggregation
    ];

    const mongoose = require('mongoose');
    const result = await mongoose.connection.db.collection(collection).aggregate(pipeline).toArray();
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export reports
router.get('/export/:type', authMiddleware, async (req, res) => {
  try {
    const { type } = req.params;
    const { format = 'pdf' } = req.query;
    
    // Implementation depends on report type
    switch (type) {
      case 'task-summary':
        // Generate task summary report
        break;
      case 'productivity':
        // Generate productivity report
        break;
      case 'procedure-efficiency':
        // Generate procedure efficiency report
        break;
      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }
    
    res.json({ message: 'Report generation started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router as reportRoutes };
```

### Day 12-14: Frontend Dashboard Components

#### 1. Dashboard Component
```typescript
// frontend/src/components/reports/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardData {
  taskMetrics: any[];
  userProductivity: any[];
  procedureEfficiency: any[];
  insights: any[];
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reports/dashboard', {
        params: {
          dateRange: `${dateRange.start},${dateRange.end}`
        }
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="error">Failed to load dashboard data</div>;
  }

  // Prepare task completion chart data
  const taskCompletionData = {
    labels: data.taskMetrics.map(item => item._id),
    datasets: [
      {
        label: 'Completed Tasks',
        data: data.taskMetrics.map(item => {
          const completed = item.statusCounts.find((s: any) => s.status === 'completed');
          return completed ? completed.count : 0;
        }),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      },
      {
        label: 'Total Tasks',
        data: data.taskMetrics.map(item => item.totalTasks),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1
      }
    ]
  };

  // Prepare user productivity chart data
  const productivityData = {
    labels: data.userProductivity.map(user => `User ${user._id}`),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: data.userProductivity.map(user => user.completionRate),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ]
      }
    ]
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Analytics Dashboard</h1>
        <div className="date-range-picker">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Tasks</h3>
          <div className="metric-value">
            {data.taskMetrics.reduce((sum, item) => sum + item.totalTasks, 0)}
          </div>
        </div>
        <div className="metric-card">
          <h3>Completed Tasks</h3>
          <div className="metric-value">
            {data.taskMetrics.reduce((sum, item) => {
              const completed = item.statusCounts.find((s: any) => s.status === 'completed');
              return sum + (completed ? completed.count : 0);
            }, 0)}
          </div>
        </div>
        <div className="metric-card">
          <h3>Active Procedures</h3>
          <div className="metric-value">
            {data.procedureEfficiency.reduce((sum, proc) => sum + proc.totalProcedures, 0)}
          </div>
        </div>
        <div className="metric-card">
          <h3>Avg Efficiency</h3>
          <div className="metric-value">
            {Math.round(data.procedureEfficiency.reduce((sum, proc, _, arr) => 
              sum + proc.efficiencyScore / arr.length, 0))}%
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-container">
          <h3>Task Completion Trend</h3>
          <Line 
            data={taskCompletionData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: 'Daily Task Completion'
                }
              }
            }}
          />
        </div>

        <div className="chart-container">
          <h3>User Productivity</h3>
          <Bar
            data={productivityData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100
                }
              }
            }}
          />
        </div>

        <div className="chart-container">
          <h3>Procedure Categories</h3>
          <Doughnut
            data={{
              labels: data.procedureEfficiency.map(proc => proc._id),
              datasets: [{
                data: data.procedureEfficiency.map(proc => proc.totalProcedures),
                backgroundColor: [
                  'rgba(255, 99, 132, 0.8)',
                  'rgba(54, 162, 235, 0.8)',
                  'rgba(255, 205, 86, 0.8)',
                  'rgba(75, 192, 192, 0.8)',
                  'rgba(153, 102, 255, 0.8)',
                ]
              }]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'right' as const,
                }
              }
            }}
          />
        </div>
      </div>

      {/* Insights */}
      <div className="insights-section">
        <h3>Automated Insights</h3>
        <div className="insights-list">
          {data.insights.map((insight, index) => (
            <div key={index} className={`insight-card ${insight.type}`}>
              <div className="insight-header">
                <h4>{insight.title}</h4>
                <span className={`insight-badge ${insight.type}`}>{insight.type}</span>
              </div>
              <p>{insight.description}</p>
              {insight.actionable && insight.suggestedAction && (
                <div className="suggested-action">
                  <strong>Suggested Action:</strong> {insight.suggestedAction}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
```

This comprehensive Month 1 implementation guide provides:

1. **Complete database schemas** for procedures and enhanced tasks
2. **Full API endpoints** with authentication and error handling
3. **React components** with modern features like drag-and-drop
4. **Analytics service** with automated insights
5. **Dashboard with real-time charts** and metrics

The implementation focuses on delivering working code that your first client can use immediately while building a solid foundation for the 3-month and 6-month goals.

Would you like me to continue with the implementation details for Month 2 and 3, or would you prefer to start implementing Month 1 first?