# Production Planning Workflow - Comprehensive Description

## Overview

Your production planning system implements a sophisticated **hierarchical workflow** that manages production planning from monthly strategic planning down to daily execution and reporting. The system uses **role-based access control** with automated task triggering and data propagation.

## 🏗️ **Workflow Architecture**

### **1. Process Structure**

- **Main Process**: "Production Planning Workflow"
- **Hierarchy**: Monthly → Weekly → Daily → Action Plans
- **Roles**: Plant Head, Production Manager, Admin
- **Automation**: Event-driven task triggering with data inheritance

---

## 📅 **Monthly Planning Phase**

### **Task**: Monthly Production Plan

- **Assigned To**: Plant Head (User ID: 4)
- **Form**: F-PRODUCTION-PLAN-ENTRY
- **Trigger**: Automatic (30th of each month)
- **Purpose**: Strategic planning for the entire month

### **Process Flow**:

1. **Automatic Creation**: System creates monthly plan task on 30th of each month
2. **Data Entry**: Plant Head enters:
   - Month Start Date
   - Item Names
   - Customer Names
   - Monthly Quantities
3. **Submission**: When submitted, triggers weekly plan creation
4. **Data Propagation**: Monthly data flows down to weekly plans

---

## 📊 **Weekly Planning Phase**

### **Task**: Weekly Production Plans

- **Assigned To**: Production Manager
- **Form**: F-PRODUCTION-PLAN-ENTRY (Weekly Mode)
- **Trigger**: Monthly plan completion
- **Quantity**: 4-5 weeks per month (calculated automatically)

### **Process Flow**:

1. **Automatic Generation**: System calculates weeks in the month
2. **Task Creation**: Creates weekly tasks for each week
3. **Data Inheritance**:
   - Item names copied from monthly plan
   - Customer names copied from monthly plan
   - Monthly quantities copied (read-only)
   - Weekly quantities calculated automatically
4. **Week Calculation**:
   - Week 1: Days 1-6
   - Week 2: Days 7-12
   - Week 3: Days 13-18
   - Week 4: Days 19-24
   - Week 5: Days 25-31 (remaining days)

---

## 📋 **Daily Planning Phase**

### **Task**: Daily Production Plans

- **Assigned To**: Production Manager
- **Form**: F-DAILY-PRODUCTION-ENTRY
- **Trigger**: Weekly plan completion
- **Quantity**: 6 days per week (Monday to Saturday)

### **Process Flow**:

1. **Automatic Generation**: System creates 6 daily tasks per week
2. **Data Pre-filling**:
   - Date automatically set
   - Department and operator information
   - Work descriptions
   - Target quantities from weekly plan
3. **Execution**: Production Manager fills actual production data
4. **Reporting**: Generates daily production reports

---

## 📈 **Daily Production Reporting**

### **Task**: Daily Production Report

- **Assigned To**: Production Manager
- **Form**: F-DAILY-PRODUCTION-ENTRY (Report Mode)
- **Trigger**: Daily plan approval by Plant Head
- **Purpose**: Track actual vs planned production

### **Data Fields**:

- **Planning**: H1 Plan, H2 Plan, OT Plan, Target Qty
- **Actual**: H1 Actual, H2 Actual, OT Actual, Actual Production
- **Quality**: Quality Defects, Defect Details
- **Analysis**: Production Percentage, Reason, Rework
- **Responsibility**: Responsible Person

---

## ⚠️ **Action Plan Phase**

### **Task**: Action Plan for Low Production

- **Assigned To**: Production Manager
- **Form**: F-ACTION-PLAN
- **Trigger**: Production below 85% of target
- **Purpose**: Corrective action planning

### **Process Flow**:

1. **Condition Check**: System monitors production percentage
2. **Automatic Trigger**: When production < 85%, creates action plan
3. **Data Pre-filling**:
   - Production data from daily report
   - Achievement percentage calculated
   - Department and operator details
4. **Action Planning**: Manager fills:
   - Reason for low production
   - Corrective actions
   - Responsible person
   - Target completion date

---

## 🔄 **Workflow Automation Features**

### **1. Template System**

- **Template Tasks**: ID 1001 (Monthly), 2001 (Weekly), 2002 (Daily)
- **Purpose**: Prevent user deletion, serve as blueprints
- **Visibility**: Hidden from user interface
- **Function**: Automatically create new tasks monthly

### **2. Data Inheritance**

- **Monthly → Weekly**: Item names, customer names, monthly quantities
- **Weekly → Daily**: Target quantities, work descriptions
- **Daily → Report**: All production data
- **Report → Action Plan**: Production data when conditions met

### **3. Conditional Triggers**

- **Time-based**: Monthly tasks created on 30th of month
- **Event-based**: Weekly tasks triggered by monthly completion
- **Condition-based**: Action plans triggered by low production (<85%)

### **4. Status Management**

- **Pending**: Newly created tasks
- **In Progress**: Tasks being worked on
- **Completed**: Finished tasks
- **Rejected**: Failed tasks (can be reassigned)

---

## 👥 **Role-Based Access Control**

### **Plant Head**

- **Can Do**:
  - Create and submit monthly plans
  - Approve daily production plans
  - View all tasks and reports
  - Delete tasks (admin privileges)
- **Cannot Do**: Submit daily plans or reports

### **Production Manager**

- **Can Do**:
  - Submit weekly production plans
  - Submit daily production plans and reports
  - Create action plans for low production
  - View assigned tasks
- **Cannot Do**: Approve tasks or delete them

### **Admin**

- **Can Do**: Everything (full access)
- **Special**: Can manage users and system settings

---

## 📊 **Data Flow Architecture**

```
Monthly Plan (Plant Head)
    ↓ (Data Inheritance)
Weekly Plans (Production Manager)
    ↓ (Data Inheritance)
Daily Plans (Production Manager)
    ↓ (Approval by Plant Head)
Daily Reports (Production Manager)
    ↓ (Condition: <85% Production)
Action Plans (Production Manager)
```

---

## 🔧 **Technical Implementation**

### **Task Triggers**

- **Monthly Trigger**: `calculateWeeksInMonth()` function
- **Weekly Trigger**: `generateWeeklyTaskIds()` function
- **Daily Trigger**: `generateDailyTaskIds()` function
- **Action Trigger**: Production percentage calculation

### **Form Handling**

- **Dynamic Forms**: Adapt based on mode (monthly/weekly/daily/report)
- **Field Visibility**: Week fields hidden in monthly mode
- **Data Validation**: Required field checking
- **Unique Inputs**: Row-specific field names prevent cross-contamination

### **Database Structure**

- **Process Collection**: Stores workflow definitions
- **Form Submissions**: Stores actual form data
- **User Management**: Role-based access control
- **Task Status**: Tracks progress through workflow

---

## 🎯 **Key Benefits**

1. **Automated Workflow**: Reduces manual task creation
2. **Data Consistency**: Inherited data prevents errors
3. **Role Clarity**: Clear responsibilities for each role
4. **Conditional Logic**: Smart triggering based on conditions
5. **Template Protection**: Prevents accidental deletion of system tasks
6. **Scalable**: Can handle multiple months and weeks simultaneously

This workflow ensures **systematic production planning** with **automated task management** and **data-driven decision making** throughout the production cycle.
