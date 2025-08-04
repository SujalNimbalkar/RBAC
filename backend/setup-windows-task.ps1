# PowerShell script to set up Windows Task Scheduler for Production Automation
# Run this script as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Windows Task Scheduler Setup for Production Automation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you set up a scheduled task to run the production automation" -ForegroundColor Yellow
Write-Host "at 21:18 on the 3rd of each month." -ForegroundColor Yellow
Write-Host ""

Write-Host "Prerequisites:" -ForegroundColor Green
Write-Host "1. Make sure you're running this as Administrator" -ForegroundColor White
Write-Host "2. Make sure the backend server is properly configured" -ForegroundColor White
Write-Host "3. Make sure admin-token.json exists" -ForegroundColor White
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click on PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Running as Administrator" -ForegroundColor Green

# Check if admin-token.json exists
if (-not (Test-Path "admin-token.json")) {
    Write-Host "❌ admin-token.json not found!" -ForegroundColor Red
    Write-Host "Please run 'npm run generate-token' first" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ admin-token.json found" -ForegroundColor Green

# Get current directory
$currentDir = Get-Location
Write-Host "📁 Working directory: $currentDir" -ForegroundColor Cyan

Write-Host ""
Write-Host "Creating scheduled task..." -ForegroundColor Yellow
Write-Host ""

# Create the scheduled task
$taskName = "Production Automation"
$action = New-ScheduledTaskAction -Execute "npm" -Argument "run automate-production" -WorkingDirectory $currentDir
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At "21:18" -WeeksInterval 4

# Create the task
try {
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Description "Automated monthly production task creation" -Force
    
    Write-Host "✅ Task created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Task Details:" -ForegroundColor Cyan
    Write-Host "- Name: $taskName" -ForegroundColor White
    Write-Host "- Schedule: Monthly on the 3rd at 21:18" -ForegroundColor White
    Write-Host "- Action: npm run automate-production" -ForegroundColor White
    Write-Host "- Working Directory: $currentDir" -ForegroundColor White
    Write-Host ""
    Write-Host "To view the task:" -ForegroundColor Yellow
    Write-Host "1. Open Task Scheduler" -ForegroundColor White
    Write-Host "2. Look for '$taskName' under Task Scheduler Library" -ForegroundColor White
    Write-Host ""
    Write-Host "To test the task manually:" -ForegroundColor Yellow
    Write-Host "1. Right-click on the task" -ForegroundColor White
    Write-Host "2. Select 'Run'" -ForegroundColor White
    Write-Host ""
    Write-Host "To delete the task if needed:" -ForegroundColor Yellow
    Write-Host "Unregister-ScheduledTask -TaskName '$taskName' -Confirm:$false" -ForegroundColor White
    
} catch {
    Write-Host "❌ Failed to create task: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual setup:" -ForegroundColor Yellow
    Write-Host "1. Open Task Scheduler as Administrator" -ForegroundColor White
    Write-Host "2. Create Basic Task" -ForegroundColor White
    Write-Host "3. Name: $taskName" -ForegroundColor White
    Write-Host "4. Trigger: Monthly on the 3rd at 21:18" -ForegroundColor White
    Write-Host "5. Action: Start a program" -ForegroundColor White
    Write-Host "6. Program: npm" -ForegroundColor White
    Write-Host "7. Arguments: run automate-production" -ForegroundColor White
    Write-Host "8. Start in: $currentDir" -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to exit" 