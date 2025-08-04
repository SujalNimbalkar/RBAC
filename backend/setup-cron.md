# Cron Job Setup for Production Automation

## Overview

The production automation script is configured to run at **21:18 on the 3rd of each month**.

## Setup Instructions

### 1. For Windows (Task Scheduler)

#### Option A: Using PowerShell Script (Recommended)

1. Open PowerShell as Administrator
2. Navigate to your backend folder
3. Run: `.\setup-windows-task.ps1`

#### Option B: Using Batch Script

1. Open Command Prompt as Administrator
2. Navigate to your backend folder
3. Run: `setup-windows-task.bat`

#### Option C: Manual Setup

1. Open Task Scheduler as Administrator
2. Create a new Basic Task
3. Name: "Production Automation"
4. Set the trigger to run monthly on the 3rd at 21:18
5. Set the action to run: `npm run automate-production`
6. Set the working directory to your backend folder

### 2. For Linux/Mac (Cron)

Add this line to your crontab:

```bash
18 21 3 * * cd /path/to/backend && npm run automate-production
```

### 3. Manual Testing

You can test the automation manually:

```bash
# Test current month
npm run automate-production

# Test specific month
npm run automate-production 9 2025
```

## Environment Setup

Make sure your `.env` file contains:

```
ADMIN_TOKEN=your_generated_token_here
```

The token can be generated using:

```bash
npm run generate-token
```

## What the Automation Does

1. Creates a monthly production task for the specified month
2. Assigns it to Plant Head (Employee ID: 2)
3. Sets deadline to 3 days before month end
4. Status starts as "pending"

## Verification

Check the generated tasks in:

- `backend/data/production/tasks.json`
- `backend/data/production/monthly-plans.json`
