# Schedule Monthly Production Automation for 14:20 on the 4th
# This script creates a Windows Task Scheduler job

$TaskName = "MonthlyProductionAutomation"
$ScriptPath = Join-Path $PSScriptRoot "src\scripts\automate-production.ts"
$NodePath = "npm"
$Arguments = "run automate-production test"

Write-Host "📅 Scheduling Monthly Production Automation..." -ForegroundColor Green
Write-Host "⏰ Time: 14:20 on the 4th of each month" -ForegroundColor Yellow
Write-Host "📁 Script: $ScriptPath" -ForegroundColor Cyan

# Create the scheduled task
$Action = New-ScheduledTaskAction -Execute $NodePath -Argument $Arguments -WorkingDirectory $PSScriptRoot
$Trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At "14:20" -WeeksInterval 1

# Set task settings
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Register the task
try {
    Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Automated monthly production task creation" -Force
    Write-Host "✅ Task scheduled successfully!" -ForegroundColor Green
    Write-Host "📋 Task Name: $TaskName" -ForegroundColor Cyan
    Write-Host "🕐 Next Run: $(Get-ScheduledTask -TaskName $TaskName | Get-ScheduledTaskInfo).NextRunTime" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Failed to schedule task: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📝 To manually run the automation now, use:" -ForegroundColor Green
Write-Host "   npm run test-automation" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 To run the automation for a specific month:" -ForegroundColor Green
Write-Host "   npm run automate-production 8 2025" -ForegroundColor Cyan 