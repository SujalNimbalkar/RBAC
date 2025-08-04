@echo off
echo 🧪 Testing Monthly Production Automation...
echo 🕐 Current time: %date% %time%
echo.

cd /d "%~dp0"
npm run test-automation

echo.
echo ✅ Test completed!
pause 