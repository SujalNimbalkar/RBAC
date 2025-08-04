# Production Planning System - Backend API

## Overview

The Production Planning System implements a sophisticated **hierarchical workflow** that manages production planning from monthly strategic planning down to daily execution and reporting. The system uses **role-based access control** with automated task triggering and data propagation.

## 🏗️ **System Architecture**

### **Workflow Hierarchy**

```
Monthly Production Plan (Plant Head)
    ↓ (Data Inheritance)
Weekly Production Plans (Plant Head)
    ↓ (Data Inheritance)
Daily Production Plans (Production Manager)
    ↓ (Approval by Plant Head)
Daily Production Reports (Production Manager)
```

### **Role-Based Access Control**

- **Plant Head (Employee ID: 2)**: Creates monthly plans, approves daily plans
- **Production Manager (Employee ID: 3)**: Submits daily plans and reports
- **Admin**: Full access to all operations

## 📅 **Workflow Process**

### **1. Monthly Production Planning**

- **Trigger**: Automated at 20:30 on 1st of each month
- **Assigned To**: Plant Head (Employee ID: 2)
- **Deadline**: 3 days before month ends
- **Form Fields**: Item Name, Item Code, Customer Name, Monthly Quantity
- **Hidden Fields**: Week-specific quantity fields
- **Status Flow**: Pending → Completed

### **2. Weekly Production Planning**

- **Trigger**: Monthly plan completion
- **Assigned To**: Plant Head (Employee ID: 2)
- **Dynamic Naming**: "Weekly Production Plan - Week X (DD-DD) - [Month] [Year]"
- **Data Inheritance**: From monthly plan
- **Dynamic Fields**: Week-specific quantity fields
- **Status Flow**: Pending → Completed

### **3. Daily Production Planning**

- **Trigger**: Weekly plan completion
- **Assigned To**: Production Manager (Employee ID: 3)
- **Form Fields**: Dept. Name, Operator Name, Work, H1 Plan, H2 Plan, OT Plan, Target (calculated)
- **Status Flow**: Pending → In Progress → Completed/Rejected

### **4. Daily Production Reporting**

- **Trigger**: Daily plan approval
- **Assigned To**: Production Manager (Employee ID: 3)
- **Form Fields**: All actual data, quality metrics, production percentage
- **Validation**: Reason mandatory if production < 85%

## 🔧 **API Endpoints**

### **Monthly Production Plans**

| Method | Endpoint                             | Description            | Auth Required       |
| ------ | ------------------------------------ | ---------------------- | ------------------- |
| GET    | `/api/production/monthly`            | Get all monthly plans  | `production:read`   |
| GET    | `/api/production/monthly/:id`        | Get monthly plan by ID | `production:read`   |
| POST   | `/api/production/monthly`            | Create monthly plan    | `production:create` |
| POST   | `/api/production/monthly/:id/submit` | Submit monthly plan    | `production:update` |
| DELETE | `/api/production/monthly/:id`        | Delete monthly plan    | `production:delete` |

### **Weekly Production Plans**

| Method | Endpoint                                        | Description                      | Auth Required       |
| ------ | ----------------------------------------------- | -------------------------------- | ------------------- |
| GET    | `/api/production/weekly`                        | Get all weekly plans             | `production:read`   |
| GET    | `/api/production/weekly/:id`                    | Get weekly plan by ID            | `production:read`   |
| GET    | `/api/production/weekly/monthly/:monthlyPlanId` | Get weekly plans by monthly plan | `production:read`   |
| POST   | `/api/production/weekly/:id/submit`             | Submit weekly plan               | `production:update` |
| DELETE | `/api/production/weekly/:id`                    | Delete weekly plan               | `production:delete` |

### **Daily Production Plans**

| Method | Endpoint                                     | Description                    | Auth Required           |
| ------ | -------------------------------------------- | ------------------------------ | ----------------------- |
| GET    | `/api/production/daily`                      | Get all daily plans            | `production:read`       |
| GET    | `/api/production/daily/:id`                  | Get daily plan by ID           | `production:read`       |
| GET    | `/api/production/daily/status/:status`       | Get daily plans by status      | `production:read`       |
| GET    | `/api/production/daily/weekly/:weeklyPlanId` | Get daily plans by weekly plan | `production:read`       |
| POST   | `/api/production/daily/:id/submit`           | Submit daily plan              | `production:update`     |
| POST   | `/api/production/daily/:id/approve`          | Approve daily plan             | `plant_head` or `admin` |
| POST   | `/api/production/daily/:id/reject`           | Reject daily plan              | `plant_head` or `admin` |
| DELETE | `/api/production/daily/:id`                  | Delete daily plan              | `production:delete`     |

### **Daily Production Reports**

| Method | Endpoint                                     | Description                    | Auth Required       |
| ------ | -------------------------------------------- | ------------------------------ | ------------------- |
| GET    | `/api/production/reports`                    | Get all daily reports          | `production:read`   |
| GET    | `/api/production/reports/:id`                | Get daily report by ID         | `production:read`   |
| GET    | `/api/production/reports/daily/:dailyPlanId` | Get daily report by daily plan | `production:read`   |
| POST   | `/api/production/reports/:id/submit`         | Submit daily report            | `production:update` |
| DELETE | `/api/production/reports/:id`                | Delete daily report            | `production:delete` |

### **Production Tasks**

| Method | Endpoint                                 | Description                | Auth Required       |
| ------ | ---------------------------------------- | -------------------------- | ------------------- |
| GET    | `/api/production/tasks`                  | Get all tasks              | `production:read`   |
| GET    | `/api/production/tasks/assigned/:userId` | Get tasks by assigned user | `production:read`   |
| GET    | `/api/production/tasks/status/:status`   | Get tasks by status        | `production:read`   |
| GET    | `/api/production/tasks/type/:type`       | Get tasks by type          | `production:read`   |
| GET    | `/api/production/tasks/:id`              | Get task by ID             | `production:read`   |
| DELETE | `/api/production/tasks/:id`              | Delete task                | `production:delete` |

### **Production Workflows**

| Method | Endpoint                        | Description        | Auth Required       |
| ------ | ------------------------------- | ------------------ | ------------------- |
| GET    | `/api/production/workflows`     | Get all workflows  | `production:read`   |
| GET    | `/api/production/workflows/:id` | Get workflow by ID | `production:read`   |
| POST   | `/api/production/workflows`     | Create workflow    | `production:create` |
| DELETE | `/api/production/workflows/:id` | Delete workflow    | `production:delete` |

### **Automation**

| Method | Endpoint                                | Description                       | Auth Required |
| ------ | --------------------------------------- | --------------------------------- | ------------- |
| POST   | `/api/production/automate/monthly-task` | Create monthly task automatically | `admin`       |

## 📊 **Data Models**

### **Monthly Production Plan**

```typescript
{
  id: string;
  title: string; // "Monthly Production Plan - [Month] [Year]"
  month: number; // 1-12
  year: number;
  status: 'pending' | 'completed';
  assignedTo: string; // employee ID
  assignedRole: string; // role ID
  deadline: Date; // 3 days before month ends
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  items: ProductionItem[];
  weekCount: number; // dynamic number of weeks
}
```

### **Production Item**

```typescript
{
  id: string;
  itemName: string;
  itemCode: string;
  customerName: string;
  monthlyQuantity: number;
  weeklyQuantities: { [weekKey: string]: number };
}
```

### **Production Entry**

```typescript
{
  id: string;
  deptName: string;
  operatorName: string;
  work: string;
  h1Plan: number;
  h2Plan: number;
  otPlan: number;
  target: number; // calculated: h1Plan + h2Plan + otPlan
  h1Actual?: number;
  h2Actual?: number;
  otActual?: number;
  qualityDefect?: number;
  defectDetails?: string;
  responsiblePerson?: string;
  actualProduction?: number;
  productionPercentage?: number;
  reason?: string;
  rework?: number;
}
```

## 🚀 **Usage Examples**

### **1. Create Monthly Production Plan**

```bash
curl -X POST http://localhost:5000/api/production/monthly \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "month": 8,
    "year": 2025,
    "items": [
      {
        "itemName": "Product A",
        "itemCode": "PROD001",
        "customerName": "Customer 1",
        "monthlyQuantity": 1000
      }
    ]
  }'
```

### **2. Submit Monthly Plan**

```bash
curl -X POST http://localhost:5000/api/production/monthly/MONTHLY_PLAN_ID/submit \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **3. Submit Daily Plan**

```bash
curl -X POST http://localhost:5000/api/production/daily/DAILY_PLAN_ID/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dayNumber": 1,
    "date": "2025-08-01",
    "entries": [
      {
        "deptName": "Production",
        "operatorName": "John Doe",
        "work": "Assembly",
        "h1Plan": 50,
        "h2Plan": 50,
        "otPlan": 20
      }
    ]
  }'
```

### **4. Approve Daily Plan**

```bash
curl -X POST http://localhost:5000/api/production/daily/DAILY_PLAN_ID/approve \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **5. Submit Daily Report**

```bash
curl -X POST http://localhost:5000/api/production/reports/REPORT_ID/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entries": [
      {
        "h1Actual": 45,
        "h2Actual": 48,
        "otActual": 18,
        "qualityDefect": 2,
        "defectDetails": "Minor scratches",
        "responsiblePerson": "John Doe",
        "actualProduction": 111,
        "reason": "Machine maintenance"
      }
    ]
  }'
```

## 🔄 **Automation**

### **Automated Monthly Task Creation**

The system includes an automation script that can be run as a cron job:

```bash
# Create task for next month
npm run automate-production

# Create task for specific month
npm run automate-production 8 2025
```

### **Cron Job Setup**

Add to your crontab to run at 20:30 on the 1st of each month:

```bash
30 20 1 * * cd /path/to/backend && npm run automate-production
```

## 🔐 **Permissions**

The system uses the following permissions:

- `production:create` - Create production plans
- `production:read` - View production plans
- `production:update` - Submit/update production plans
- `production:delete` - Delete production plans

## 📁 **Data Storage**

All production data is stored in JSON files in the `backend/data/production/` directory:

- `monthly-plans.json` - Monthly production plans
- `weekly-plans.json` - Weekly production plans
- `daily-plans.json` - Daily production plans
- `daily-reports.json` - Daily production reports
- `tasks.json` - Production tasks
- `workflows.json` - Production workflows

## 🎯 **Key Features**

1. **Automated Workflow**: Reduces manual task creation
2. **Data Inheritance**: Inherited data prevents errors
3. **Role Clarity**: Clear responsibilities for each role
4. **Conditional Logic**: Smart triggering based on conditions
5. **Validation**: Production percentage validation with mandatory reasons
6. **Dynamic Fields**: Week-specific quantity fields
7. **Status Management**: Comprehensive status tracking
8. **Approval Workflow**: Plant Head approval for daily plans

## 🚨 **Important Notes**

1. **Employee IDs**: Plant Head is Employee ID 2, Production Manager is Employee ID 3
2. **Deadlines**: Monthly plans have 3-day deadline before month ends
3. **Validation**: Production < 85% requires mandatory reason
4. **Automation**: Monthly tasks are created automatically at 20:30 on 1st of each month
5. **Data Inheritance**: Weekly plans inherit from monthly, daily plans inherit from weekly
6. **Status Flow**: Strict status progression with proper validation

This system ensures **systematic production planning** with **automated task management** and **data-driven decision making** throughout the production cycle.
