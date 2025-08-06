import { Router, Request, Response } from 'express';
import { verifyToken, hasPermission, hasRole } from '../middleware/auth';
import { MongoMonthlyPlanService } from '../services/mongoMonthlyPlanService';
import { MongoWeeklyPlanService } from '../services/mongoWeeklyPlanService';
import { MongoDailyPlanService } from '../services/mongoDailyPlanService';
import { MongoDailyReportService } from '../services/mongoDailyReportService';
import { MongoProductionTaskService } from '../services/mongoProductionTaskService';
import { MongoActionPlanService } from '../services/mongoActionPlanService';
import {
  MonthlyPlanSubmission,
  WeeklyPlanSubmission,
  DailyPlanSubmission,
  DailyReportSubmission,
  PlanApproval,
  DailyProductionPlan
} from '../types';
import { DownloadService } from '../services/downloadService';

// Helper function to generate unique IDs
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const router = Router();

// ==================== DOWNLOAD ENDPOINTS ====================

// Download monthly plan as PDF
router.get('/monthly/:id/download/pdf', async (req: Request, res: Response) => {
  try {
    const plan = await MongoMonthlyPlanService.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Monthly plan not found'
      });
    }

    // Generate PDF content
    const pdfContent = await DownloadService.generateMonthlyPlanPDF(plan);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="monthly-plan-${plan.month}-${plan.year}.pdf"`);
    res.send(pdfContent);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate PDF'
    });
  }
});

// Download monthly plan as Excel
router.get('/monthly/:id/download/excel', async (req: Request, res: Response) => {
  try {
    const plan = await MongoMonthlyPlanService.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Monthly plan not found'
      });
    }

    // Generate Excel content
    const excelBuffer = await DownloadService.generateMonthlyPlanExcel(plan);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="monthly-plan-${plan.month}-${plan.year}.xlsx"`);
    res.send(excelBuffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate Excel'
    });
  }
});

// Download weekly plan as PDF
router.get('/weekly/:id/download/pdf', async (req: Request, res: Response) => {
  try {
    const plan = await MongoWeeklyPlanService.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Weekly plan not found'
      });
    }

    const pdfContent = await DownloadService.generateWeeklyPlanPDF(plan);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="weekly-plan-${plan.weekNumber}.pdf"`);
    res.send(pdfContent);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate PDF'
    });
  }
});

// Download weekly plan as Excel
router.get('/weekly/:id/download/excel', async (req: Request, res: Response) => {
  try {
    const plan = await MongoWeeklyPlanService.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Weekly plan not found'
      });
    }

    const excelBuffer = await DownloadService.generateWeeklyPlanExcel(plan);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment: filename="weekly-plan-${plan.weekNumber}.xlsx"`);
    res.send(excelBuffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate Excel'
    });
  }
});

// Download daily plan as PDF
router.get('/daily/:id/download/pdf', async (req: Request, res: Response) => {
  try {
    const plan = await MongoDailyPlanService.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Daily plan not found'
      });
    }

    const pdfContent = await DownloadService.generateDailyPlanPDF(plan);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="daily-plan-${plan.dayNumber}.pdf"`);
    res.send(pdfContent);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate PDF'
    });
  }
});

// Download daily plan as Excel
router.get('/daily/:id/download/excel', async (req: Request, res: Response) => {
  try {
    const plan = await MongoDailyPlanService.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Daily plan not found'
      });
    }

    const excelBuffer = await DownloadService.generateDailyPlanExcel(plan);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="daily-plan-${plan.dayNumber}.xlsx"`);
    res.send(excelBuffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate Excel'
    });
  }
});

// Download daily report as PDF
router.get('/reports/:id/download/pdf', async (req: Request, res: Response) => {
  try {
    const report = await MongoDailyReportService.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Daily report not found'
      });
    }

    const pdfContent = await DownloadService.generateDailyReportPDF(report);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="daily-report-${report.id}.pdf"`);
    res.send(pdfContent);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate PDF'
    });
  }
});

// Download daily report as Excel
router.get('/reports/:id/download/excel', async (req: Request, res: Response) => {
  try {
    const report = await MongoDailyReportService.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Daily report not found'
      });
    }

    const excelBuffer = await DownloadService.generateDailyReportExcel(report);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="daily-report-${report.id}.xlsx"`);
    res.send(excelBuffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate Excel'
    });
  }
});

// ==================== MONTHLY PRODUCTION PLANS ====================

// Get all monthly plans
router.get('/monthly', verifyToken, hasPermission('production', 'read'), async (req: Request, res: Response) => {
  try {
    const plans = await MongoMonthlyPlanService.getAll();
    res.json({
      success: true,
      data: {
        plans,
        total: plans.length,
        page: 1,
        limit: plans.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch monthly plans'
    });
  }
});

// Get monthly plan by ID (temporarily without auth for testing)
router.get('/monthly/:id', async (req: Request, res: Response) => {
  try {
    const plan = await MongoMonthlyPlanService.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Monthly plan not found'
      });
    }
    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch monthly plan'
    });
  }
});

// Create monthly plan
router.post('/monthly', verifyToken, hasPermission('production', 'create'), async (req: Request, res: Response) => {
  try {
    const submission: MonthlyPlanSubmission = req.body;
    const plan = await MongoMonthlyPlanService.create({
      ...submission,
      id: generateId(),
      items: submission.items.map(item => ({ ...item, id: generateId() })),
      status: 'pending',
      assignedTo: req.user!.uid,
      assignedRole: 'production_manager',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      weekCount: 5,
      submittedAt: new Date().toISOString()
    });
    
          // Create task for the plan
      await MongoProductionTaskService.create({
        id: generateId(),
        type: 'monthly',
        title: plan.title,
        assignedTo: plan.assignedTo,
        assignedRole: plan.assignedRole,
        planId: plan.id,
        deadline: plan.deadline,
        status: 'pending'
      });
    
    res.status(201).json({
      success: true,
      data: plan
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create monthly plan'
    });
  }
});

// Submit monthly plan
router.post('/monthly/:id/submit', async (req: Request, res: Response) => {
  try {
    const submission: MonthlyPlanSubmission = req.body;
    
    // Update the monthly plan with the submitted data
    const updatedPlan = await MongoMonthlyPlanService.updateById(req.params.id, {
      month: submission.month,
      year: submission.year,
      items: submission.items.map(item => ({ ...item, id: generateId() })),
      status: 'completed',
      submittedAt: new Date().toISOString()
    });
    
    // Update task status
    const tasks = await MongoProductionTaskService.findByType('monthly');
    const task = tasks.find(t => t.planId === req.params.id);
    if (task) {
      await MongoProductionTaskService.updateById(task.id, { status: 'completed' });
    }
    
    // Update or create weekly plans
    const weeklyPlans: any[] = [];
    
    // Create weekly plans based on the monthly plan
    const monthlyPlan = await MongoMonthlyPlanService.findById(req.params.id);
    if (monthlyPlan) {
      const weekCount = monthlyPlan.weekCount || 4;
      
      for (let weekNumber = 1; weekNumber <= weekCount; weekNumber++) {
        // Check if weekly plan already exists for this week and monthly plan
        const existingWeeklyPlan = await MongoWeeklyPlanService.findByMonthlyPlanId(monthlyPlan.id);
        const existingPlanForWeek = existingWeeklyPlan.find(plan => plan.weekNumber === weekNumber);
        
        if (existingPlanForWeek) {
          console.log(`Weekly plan already exists for Week ${weekNumber} of monthly plan ${monthlyPlan.id}`);
          weeklyPlans.push(existingPlanForWeek);
          continue;
        }
        
        // Calculate week start and end dates
        const monthStart = new Date(monthlyPlan.year, monthlyPlan.month - 1, 1);
        const weekStart = new Date(monthStart);
        weekStart.setDate(monthStart.getDate() + (weekNumber - 1) * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        // Create weekly plan items with distributed quantities
        const weeklyItems = monthlyPlan.items.map(item => {
          const weeklyQuantity = Math.ceil(item.monthlyQuantity / weekCount);
          const weeklyQuantities: Record<string, number> = {};
          
          // Distribute quantities across days of the week
          for (let day = 1; day <= 7; day++) {
            weeklyQuantities[`day${day}`] = Math.ceil(weeklyQuantity / 7);
          }
          
          return {
            ...item,
            weeklyQuantities
          };
        });
        
        // Create weekly plan
        const weeklyPlan = await MongoWeeklyPlanService.create({
          id: generateId(),
          title: `Weekly Production Plan - Week ${weekNumber}`,
          weekNumber,
          weekStartDate: weekStart.toISOString(),
          weekEndDate: weekEnd.toISOString(),
          month: monthlyPlan.month,
          year: monthlyPlan.year,
          status: 'pending',
          assignedTo: monthlyPlan.assignedTo,
          assignedRole: monthlyPlan.assignedRole,
          monthlyPlanId: monthlyPlan.id,
          submittedAt: new Date().toISOString(),
          items: weeklyItems
        });
        
        weeklyPlans.push(weeklyPlan);
        
        // Check if task already exists for this weekly plan
        const existingTasks = await MongoProductionTaskService.findByType('weekly');
        const existingTask = existingTasks.find(t => t.planId === weeklyPlan.id);
        
        if (!existingTask) {
          // Create task for this weekly plan
          await MongoProductionTaskService.create({
            id: generateId(),
            type: 'weekly',
            title: `Weekly Production Plan - Week ${weeklyPlan.weekNumber}`,
            assignedTo: weeklyPlan.assignedTo,
            assignedRole: weeklyPlan.assignedRole,
            planId: weeklyPlan.id,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            status: 'pending'
          });
        }
      }
    }
    
    res.json({
      success: true,
      data: {
        plan: updatedPlan,
        weeklyPlans
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit monthly plan'
    });
  }
});

// Delete monthly plan
router.delete('/monthly/:id', verifyToken, hasPermission('production', 'delete'), async (req: Request, res: Response) => {
  try {
    await MongoMonthlyPlanService.deleteById(req.params.id);
    res.json({
      success: true,
      message: 'Monthly plan deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete monthly plan'
    });
  }
});

// ==================== WEEKLY PRODUCTION PLANS ====================

// Get all weekly plans
router.get('/weekly', verifyToken, hasPermission('production', 'read'), async (req: Request, res: Response) => {
  try {
    const plans = await MongoWeeklyPlanService.getAll();
    res.json({
      success: true,
      data: {
        plans,
        total: plans.length,
        page: 1,
        limit: plans.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch weekly plans'
    });
  }
});

// Get weekly plan by ID (temporarily without auth for testing)
router.get('/weekly/:id', async (req: Request, res: Response) => {
  try {
    const plan = await MongoWeeklyPlanService.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Weekly plan not found'
      });
    }
    console.log('Weekly plan data:', JSON.stringify(plan, null, 2));
    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error fetching weekly plan:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch weekly plan'
    });
  }
});

// Get weekly plans by monthly plan
router.get('/weekly/monthly/:monthlyPlanId', verifyToken, hasPermission('production', 'read'), async (req: Request, res: Response) => {
  try {
    const plans = await MongoWeeklyPlanService.findByMonthlyPlanId(req.params.monthlyPlanId);
    res.json({
      success: true,
      data: {
        plans,
        total: plans.length,
        page: 1,
        limit: plans.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch weekly plans'
    });
  }
});

// Submit weekly plan
router.post('/weekly/:id/submit', async (req: Request, res: Response) => {
  try {
    console.log('Received weekly plan submission:', JSON.stringify(req.body, null, 2));
    const submission: WeeklyPlanSubmission = req.body;
    
    // Validate required fields
    if (!submission.weekNumber || !submission.weekStartDate || !submission.weekEndDate || !submission.items) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: weekNumber, weekStartDate, weekEndDate, items'
      });
    }
    
    // Check if plan exists and its current status
    const existingPlan = await MongoWeeklyPlanService.findById(req.params.id);
    if (!existingPlan) {
      return res.status(404).json({
        success: false,
        error: 'Weekly plan not found'
      });
    }
    
    console.log('Existing plan status:', existingPlan.status);
    if (existingPlan.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'This weekly plan has already been completed and submitted. You cannot submit it again.'
      });
    }
    
    // Validate date format
    const startDate = new Date(submission.weekStartDate);
    const endDate = new Date(submission.weekEndDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format for weekStartDate or weekEndDate'
      });
    }
    
    // Update the weekly plan with the submitted data
    const updatedPlan = await MongoWeeklyPlanService.updateById(req.params.id, {
      weekNumber: submission.weekNumber,
      weekStartDate: startDate.toISOString(),
      weekEndDate: endDate.toISOString(),
      items: submission.items.map(item => ({ ...item, id: generateId() })),
      status: 'completed',
      submittedAt: new Date().toISOString()
    });
    
    // Update task status
    const tasks = await MongoProductionTaskService.findByType('weekly');
    const task = tasks.find(t => t.planId === req.params.id);
    if (task) {
      await MongoProductionTaskService.updateById(task.id, { status: 'completed' });
    }
    
    // Create daily plans
    let dailyPlans: any[] = [];
    try {
      // Get the weekly plan to create daily plans from
      const weeklyPlan = await MongoWeeklyPlanService.findById(req.params.id);
      if (weeklyPlan) {
        // Create daily plans for each day of the week (7 days)
        for (let dayNumber = 1; dayNumber <= 7; dayNumber++) {
          // Check if daily plan already exists for this day and weekly plan
          const existingDailyPlans = await MongoDailyPlanService.findByWeeklyPlanId(weeklyPlan.id);
          const existingPlanForDay = existingDailyPlans.find(plan => plan.dayNumber === dayNumber);
          
          if (existingPlanForDay) {
            console.log(`Daily plan already exists for Day ${dayNumber} of weekly plan ${weeklyPlan.id}`);
            dailyPlans.push(existingPlanForDay);
            continue;
          }
          
          // Calculate the date for this day
          const weekStart = new Date(weeklyPlan.weekStartDate);
          const dayDate = new Date(weekStart);
          dayDate.setDate(weekStart.getDate() + (dayNumber - 1));
          
          // Create daily plan items with quantities for this specific day
          const dailyItems = weeklyPlan.items.map(item => {
            const dayKey = `day${dayNumber}`;
            const dailyQuantity = item.weeklyQuantities[dayKey] || Math.ceil(item.monthlyQuantity / 35); // 35 = 5 weeks * 7 days
            
            return {
              ...item,
              dailyQuantity,
              target: dailyQuantity,
              h1Plan: Math.ceil(dailyQuantity * 0.4), // 40% in first half
              h2Plan: Math.ceil(dailyQuantity * 0.4), // 40% in second half
              otPlan: Math.ceil(dailyQuantity * 0.2)  // 20% in overtime
            };
          });
          
          // Create daily plan
          const dailyPlan = await MongoDailyPlanService.create({
            id: generateId(),
            title: `Daily Production Plan - Day ${dayNumber} (Week ${weeklyPlan.weekNumber})`,
            dayNumber,
            date: dayDate.toISOString(),
            weekNumber: weeklyPlan.weekNumber,
            month: weeklyPlan.month,
            year: weeklyPlan.year,
            status: 'pending',
            assignedTo: weeklyPlan.assignedTo,
            assignedRole: weeklyPlan.assignedRole,
            weeklyPlanId: weeklyPlan.id,
            submittedAt: new Date().toISOString(),
            entries: dailyItems.map(item => ({
              id: generateId(),
              itemCode: item.itemCode,
              itemName: item.itemName,
              customerName: item.customerName,
              target: item.target,
              h1Plan: item.h1Plan,
              h2Plan: item.h2Plan,
              otPlan: item.otPlan,
              work: `Production of ${item.itemName}`,
              operatorName: 'Production Team',
              deptName: 'Production',
              productionPercentage: 0
            }))
          });
          
          dailyPlans.push(dailyPlan);
        }
      }
      
      // Assign daily plans to production managers and create tasks
      const productionManagerId = 'mdsxto8ydv4dknv25i'; // Amit Kumar Parida - Production Manager
      const productionManagerRole = 'mdsvs0sm4g2ebejicna'; // Production Manager role
      
      // Create tasks for daily plans and assign to production managers
      for (const dailyPlan of dailyPlans) {
        // Update daily plan to assign to production manager
        await MongoDailyPlanService.updateById(dailyPlan.id, {
          assignedTo: productionManagerId,
          assignedRole: productionManagerRole
        });
        
        // Check if task already exists for this daily plan
        const existingTasks = await MongoProductionTaskService.findByType('daily');
        const existingTask = existingTasks.find(t => t.planId === dailyPlan.id);
        
        if (!existingTask) {
          await MongoProductionTaskService.create({
            id: generateId(),
            type: 'daily',
            title: `Daily Production Plan - Day ${dailyPlan.dayNumber} (Week ${dailyPlan.weekNumber})`,
            assignedTo: productionManagerId,
            assignedRole: productionManagerRole,
            planId: dailyPlan.id,
            deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
            status: 'pending'
          });
        }
      }
    } catch (error) {
      console.error('Error creating daily plans:', error);
      // Continue with the response even if daily plan creation fails
    }
    
    console.log('Weekly plan submitted successfully:', {
      planId: req.params.id,
      dailyPlansCreated: dailyPlans.length,
      dailyPlans: dailyPlans.map(p => ({ id: p.id, title: p.title, assignedTo: p.assignedTo }))
    });
    
    res.json({
      success: true,
      data: {
        plan: updatedPlan,
        dailyPlans
      }
    });
  } catch (error) {
    console.error('Error submitting weekly plan:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit weekly plan'
    });
  }
});

// Delete weekly plan
router.delete('/weekly/:id', verifyToken, hasPermission('production', 'delete'), async (req: Request, res: Response) => {
  try {
    await MongoWeeklyPlanService.deleteById(req.params.id);
    res.json({
      success: true,
      message: 'Weekly plan deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete weekly plan'
    });
  }
});

// ==================== DAILY PRODUCTION PLANS ====================

// Get all daily plans
router.get('/daily', verifyToken, hasPermission('production', 'read'), async (req: Request, res: Response) => {
  try {
    const plans = await MongoDailyPlanService.getAll();
    res.json({
      success: true,
      data: {
        plans,
        total: plans.length,
        page: 1,
        limit: plans.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch daily plans'
    });
  }
});

// Get daily plan by ID (temporarily without auth for testing)
router.get('/daily/:id', async (req: Request, res: Response) => {
  console.log('Daily plan fetch request received:', {
    id: req.params.id,
    headers: req.headers
  });
  
  try {
    const plan = await MongoDailyPlanService.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Daily plan not found'
      });
    }
    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch daily plan'
    });
  }
});

// Get daily plans by status (for Plant Head to see inProgress plans)
router.get('/daily/status/:status', verifyToken, hasPermission('production', 'read'), async (req: Request, res: Response) => {
  try {
    const plans = await MongoDailyPlanService.findByStatus(req.params.status);
    res.json({
      success: true,
      data: {
        plans,
        total: plans.length,
        page: 1,
        limit: plans.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch daily plans'
    });
  }
});

// Get daily plans by weekly plan
router.get('/daily/weekly/:weeklyPlanId', verifyToken, hasPermission('production', 'read'), async (req: Request, res: Response) => {
  try {
    const plans = await MongoDailyPlanService.findByWeeklyPlanId(req.params.weeklyPlanId);
    res.json({
      success: true,
      data: {
        plans,
        total: plans.length,
        page: 1,
        limit: plans.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch daily plans'
    });
  }
});

// Submit daily plan
router.post('/daily/:id/submit', async (req: Request, res: Response) => {
  try {
    const submission: DailyPlanSubmission = req.body;
    
    // Validate that entries array is not empty
    if (!submission.entries || submission.entries.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one entry is required for daily plan submission'
      });
    }
    
    // Update the daily plan with the submitted data
    const updatedPlan = await MongoDailyPlanService.updateById(req.params.id, {
      date: submission.date instanceof Date ? submission.date.toISOString() : submission.date,
      entries: submission.entries.map(entry => ({ ...entry, id: generateId() })),
      status: 'inProgress',
      submittedAt: new Date().toISOString()
    });
    
    // Update task status
    const tasks = await MongoProductionTaskService.findByType('daily');
    const task = tasks.find(t => t.planId === req.params.id);
    if (task) {
      await MongoProductionTaskService.updateById(task.id, { status: 'inProgress' });
    }
    
    res.json({
      success: true,
      data: updatedPlan
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit daily plan'
    });
  }
});

// Approve daily plan (Plant Head) - temporarily without auth for testing
// TODO: Re-enable authentication after testing
router.post('/daily/:id/approve', async (req: Request, res: Response) => {
  console.log('Approval request received:', {
    id: req.params.id,
    headers: req.headers,
    body: req.body
  });
  
  try {
    const plan = await MongoDailyPlanService.approve(req.params.id);
    
    // Update task status
    const tasks = await MongoProductionTaskService.findByType('daily');
    const task = tasks.find(t => t.planId === req.params.id);
    if (task) {
      await MongoProductionTaskService.updateById(task.id, { status: 'completed' });
    }
    
    // Create daily report
    const dailyPlan = await MongoDailyPlanService.findById(req.params.id);
    if (dailyPlan) {
      // Check if a daily report already exists for this daily plan
      const existingDailyReport = await MongoDailyReportService.findByDailyPlanId(dailyPlan.id);
      
      if (existingDailyReport) {
        console.log('Daily report already exists for this daily plan:', existingDailyReport.id);
        res.json({
          success: true,
          data: {
            plan,
            existingDailyReport
          }
        });
        return;
      }
      
      // Check if a report task already exists for this daily plan
      const existingReportTasks = await MongoProductionTaskService.findByType('report');
      const existingReportTask = existingReportTasks.find(t => t.planId && t.title.includes(dailyPlan.title));
      
      if (existingReportTask) {
        console.log('Report task already exists for this daily plan:', existingReportTask.id);
        res.json({
          success: true,
          data: {
            plan,
            existingReportTask
          }
        });
        return;
      }
      
      // Create daily report with the same entries as the daily plan
      const dailyReport = await MongoDailyReportService.create({
        id: generateId(),
        title: `Daily Production Report - ${dailyPlan.title}`,
        status: 'pending',
        assignedTo: dailyPlan.assignedTo,
        assignedRole: dailyPlan.assignedRole,
        dailyPlanId: dailyPlan.id,
        submittedAt: new Date().toISOString(),
        entries: dailyPlan.entries.map(entry => ({
          id: generateId(),
          deptName: entry.deptName,
          operatorName: entry.operatorName,
          work: entry.work,
          h1Plan: entry.h1Plan,
          h2Plan: entry.h2Plan,
          otPlan: entry.otPlan,
          target: entry.target,
          h1Actual: 0,
          h2Actual: 0,
          otActual: 0,
          actualProduction: 0,
          qualityDefect: 0,
          productionPercentage: 0,
          reason: '',
          correctiveActions: '',
          responsiblePerson: '',
          targetCompletionDate: ''
        }))
      });
      
      // Create report task
      const reportTask = await MongoProductionTaskService.create({
        id: generateId(),
        type: 'report',
        title: `Daily Production Report - ${dailyPlan.title}`,
        assignedTo: dailyPlan.assignedTo,
        assignedRole: dailyPlan.assignedRole,
        planId: dailyReport.id, // Use the report ID as the planId
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        status: 'pending'
      });
      
      res.json({
        success: true,
        data: {
          plan,
          dailyReport,
          reportTask
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          plan
        }
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve daily plan'
    });
  }
});

// Reject daily plan (Plant Head) - temporarily without auth for testing
// TODO: Re-enable authentication after testing
router.post('/daily/:id/reject', async (req: Request, res: Response) => {
  console.log('Rejection request received:', {
    id: req.params.id,
    headers: req.headers,
    body: req.body
  });
  
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason is required'
      });
    }
    
    const plan = await MongoDailyPlanService.reject(req.params.id);
    
    // Update task status
    const tasks = await MongoProductionTaskService.findByType('daily');
    const task = tasks.find(t => t.planId === req.params.id);
    if (task) {
      await MongoProductionTaskService.updateById(task.id, { status: 'rejected' });
    }
    
    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reject daily plan'
    });
  }
});

// Delete daily plan
router.delete('/daily/:id', verifyToken, hasPermission('production', 'delete'), async (req: Request, res: Response) => {
  try {
    await MongoDailyPlanService.deleteById(req.params.id);
    res.json({
      success: true,
      message: 'Daily plan deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete daily plan'
    });
  }
});

// ==================== DAILY PRODUCTION REPORTS ====================

// Get all daily reports
router.get('/reports', verifyToken, hasPermission('production', 'read'), async (req: Request, res: Response) => {
  try {
    const reports = await MongoDailyReportService.getAll();
    res.json({
      success: true,
      data: {
        reports,
        total: reports.length,
        page: 1,
        limit: reports.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch daily reports'
    });
  }
});

// Get daily report by ID (temporarily without auth for testing)
router.get('/reports/:id', async (req: Request, res: Response) => {
  try {
    const report = await MongoDailyReportService.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Daily report not found'
      });
    }
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch daily report'
    });
  }
});

// Get daily report by daily plan
router.get('/reports/daily/:dailyPlanId', verifyToken, hasPermission('production', 'read'), async (req: Request, res: Response) => {
  try {
    const report = await MongoDailyReportService.findByDailyPlanId(req.params.dailyPlanId);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Daily report not found'
      });
    }
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch daily report'
    });
  }
});

// Submit daily report
router.post('/reports/:id/submit', async (req: Request, res: Response) => {
  try {
    const submission: DailyReportSubmission = req.body;
    const report = await MongoDailyReportService.submit(req.params.id, submission);
    
    // Update the corresponding task status to completed
    const tasks = await MongoProductionTaskService.findByType('report');
    const task = tasks.find(t => t.planId === req.params.id);
    if (task) {
      await MongoProductionTaskService.updateById(task.id, { status: 'completed' });
      console.log('Updated report task status to completed:', task.id);
    }
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error submitting daily report:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit daily report'
    });
  }
});

// Delete daily report
router.delete('/reports/:id', verifyToken, hasPermission('production', 'delete'), async (req: Request, res: Response) => {
  try {
    await MongoDailyReportService.deleteById(req.params.id);
    res.json({
      success: true,
      message: 'Daily report deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete daily report'
    });
  }
});

// ==================== PRODUCTION TASKS ====================

// Test endpoint to check if backend is working
router.get('/test', async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Production API is working'
  });
});

// Get all tasks (temporarily without auth for testing)
router.get('/tasks', async (req: Request, res: Response) => {
  try {
    console.log('User authenticated:', req.user);
    console.log('User roles:', req.userRoles);
    console.log('User permissions:', req.userPermissions);
    
    let tasks = await MongoProductionTaskService.getAll();
    // Backend safeguard: if Plant Head or Admin, only return inProgress daily tasks and exclude reports
    const PLANT_HEAD_ROLE = 'mdsvs0slz4dazf7jn7';
    const ADMIN_ROLE = 'mdsvs0skbcqbxhv87o';
    const PRODUCTION_MANAGER_ROLE = 'mdsvs0sm4g2ebejicna';
    
    if (req.userRoles && (req.userRoles.includes(PLANT_HEAD_ROLE) || req.userRoles.includes(ADMIN_ROLE))) {
      tasks = tasks.filter(t => {
        // Exclude daily reports completely
        if (t.type === 'report') return false;
        // For daily plans, only show inProgress
        if (t.type === 'daily') return t.status === 'inProgress';
        // Show all other task types (monthly, weekly)
        return true;
      });
    }
    // Backend safeguard: if Production Manager, only return daily plans and reports
    else if (req.userRoles && req.userRoles.includes(PRODUCTION_MANAGER_ROLE)) {
      tasks = tasks.filter(t => {
        // Only show daily plans and reports
        return t.type === 'daily' || t.type === 'report';
      });
    }
    res.json({
      success: true,
      data: {
        tasks,
        total: tasks.length,
        page: 1,
        limit: tasks.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tasks'
    });
  }
});



// Get tasks by assigned user
router.get('/tasks/assigned/:userId', verifyToken, hasPermission('production', 'read'), async (req: Request, res: Response) => {
  try {
    const tasks = await MongoProductionTaskService.findByAssignedTo(req.params.userId);
    res.json({
      success: true,
      data: {
        tasks,
        total: tasks.length,
        page: 1,
        limit: tasks.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tasks'
    });
  }
});

// Get tasks by status
router.get('/tasks/status/:status', verifyToken, hasPermission('production', 'read'), async (req: Request, res: Response) => {
  try {
    const tasks = await MongoProductionTaskService.findByStatus(req.params.status);
    res.json({
      success: true,
      data: {
        tasks,
        total: tasks.length,
        page: 1,
        limit: tasks.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tasks'
    });
  }
});

// Get tasks by type
router.get('/tasks/type/:type', verifyToken, hasPermission('production', 'read'), async (req: Request, res: Response) => {
  try {
    const tasks = await MongoProductionTaskService.findByType(req.params.type);
    res.json({
      success: true,
      data: {
        tasks,
        total: tasks.length,
        page: 1,
        limit: tasks.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tasks'
    });
  }
});

// Get task by ID
router.get('/tasks/:id', verifyToken, hasPermission('production', 'read'), async (req: Request, res: Response) => {
  try {
    const task = await MongoProductionTaskService.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch task'
    });
  }
});

// Delete task
router.delete('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await MongoProductionTaskService.deleteById(req.params.id);
    if (deleted) {
      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete task'
    });
  }
});



// ==================== AUTOMATED TASK CREATION ====================

// Create monthly task automatically (to be called by cron job at 20:30 on 1st of each month)
router.post('/automate/monthly-task', async (req: Request, res: Response) => {
  try {
    const { month, year } = req.body;
    
    // Check if monthly plan already exists
    const existingPlan = await MongoMonthlyPlanService.findByMonthAndYear(month, year);
    if (existingPlan) {
      return res.status(400).json({
        success: false,
        error: `Monthly plan already exists for ${month}/${year}`
      });
    }
    
    // Create empty monthly plan
    const submission: MonthlyPlanSubmission = {
      month,
      year,
      items: []
    };
    
    const plan = await MongoMonthlyPlanService.create({
      ...submission,
      id: generateId(),
      title: `Monthly Production Plan - ${new Date(year, month + 1).toLocaleString('default', { month: 'long' })} ${year}`,
      items: submission.items.map(item => ({ ...item, id: generateId() })),
      status: 'pending',
      assignedTo: 'mdsxto92x27xubljkc', // Plant Head
      assignedRole: 'plant_head',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      weekCount: 5,
      submittedAt: new Date().toISOString()
    });
    
    // Create task
          await MongoProductionTaskService.create({
        id: generateId(),
        type: 'monthly',
        title: plan.title,
        assignedTo: plan.assignedTo,
        assignedRole: plan.assignedRole,
        planId: plan.id,
        deadline: plan.deadline,
        status: 'pending'
      });
    
    res.json({
      success: true,
      data: plan,
      message: `Monthly production plan created for ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create automated monthly task'
    });
  }
});

// ==================== ACTION PLANS ====================

// Get all action plans
router.get('/action-plans', async (req: Request, res: Response) => {
  try {
    const { actionPlanService } = await import('../services/actionPlanService');
    const actionPlans = await actionPlanService.getAll();
    res.json({
      success: true,
      data: {
        actionPlans,
        total: actionPlans.length,
        page: 1,
        limit: actionPlans.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch action plans'
    });
  }
});

// Get action plan by ID
router.get('/action-plans/:id', async (req: Request, res: Response) => {
  try {
    const { actionPlanService } = await import('../services/actionPlanService');
    const actionPlan = await actionPlanService.getById(req.params.id);
    if (!actionPlan) {
      return res.status(404).json({
        success: false,
        error: 'Action plan not found'
      });
    }
    res.json({
      success: true,
      data: actionPlan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch action plan'
    });
  }
});

// Get action plans by daily report
router.get('/action-plans/report/:dailyReportId', async (req: Request, res: Response) => {
  try {
    const { actionPlanService } = await import('../services/actionPlanService');
    const actionPlans = await actionPlanService.getByDailyReport(req.params.dailyReportId);
    res.json({
      success: true,
      data: {
        actionPlans,
        total: actionPlans.length,
        page: 1,
        limit: actionPlans.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch action plans'
    });
  }
});

// Update action plan
router.put('/action-plans/:id', async (req: Request, res: Response) => {
  try {
    const { actionPlanService } = await import('../services/actionPlanService');
    const actionPlan = await actionPlanService.update(req.params.id, req.body);
    if (!actionPlan) {
      return res.status(404).json({
        success: false,
        error: 'Action plan not found'
      });
    }
    res.json({
      success: true,
      data: actionPlan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update action plan'
    });
  }
});



export default router; 