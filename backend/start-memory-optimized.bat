@echo off
echo Starting RBAC3 Backend with Memory Optimization...
echo.

REM Set Node.js memory limit to 4GB
set NODE_OPTIONS=--max-old-space-size=4096

REM Set garbage collection options
set NODE_OPTIONS=%NODE_OPTIONS% --expose-gc

REM Start the server
npm run dev

pause 