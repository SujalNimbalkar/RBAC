@echo off
echo ========================================
echo Windows Task Scheduler Setup for Production Automation
echo ========================================
echo.
echo This script will help you set up a scheduled task to run the production automation
echo at 21:18 on the 3rd of each month.
echo.
echo Prerequisites:
echo 1. Make sure you're running this as Administrator
echo 2. Make sure the backend server is properly configured
echo 3. Make sure admin-token.json exists
echo.
pause

echo.
echo Creating scheduled task...
echo.

REM Create the scheduled task
schtasks /create /tn "Production Automation" /tr "npm run automate-production" /sc monthly /d 3 /st 21:18 /f /ru "SYSTEM" /rp "" /it

if %errorlevel% equ 0 (
    echo.
    echo ✅ Task created successfully!
    echo.
    echo Task Details:
    echo - Name: Production Automation
    echo - Schedule: Monthly on the 3rd at 21:18
    echo - Action: npm run automate-production
    echo.
    echo To view the task:
    echo 1. Open Task Scheduler
    echo 2. Look for "Production Automation" under Task Scheduler Library
    echo.
    echo To test the task manually:
    echo 1. Right-click on the task
    echo 2. Select "Run"
    echo.
    echo To delete the task if needed:
    echo schtasks /delete /tn "Production Automation" /f
) else (
    echo.
    echo ❌ Failed to create task. Please run as Administrator.
    echo.
    echo Manual setup:
    echo 1. Open Task Scheduler as Administrator
    echo 2. Create Basic Task
    echo 3. Name: Production Automation
    echo 4. Trigger: Monthly on the 3rd at 21:18
    echo 5. Action: Start a program
    echo 6. Program: npm
    echo 7. Arguments: run automate-production
    echo 8. Start in: %cd%
)

echo.
pause 