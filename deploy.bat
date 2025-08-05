@echo off
echo 🚀 Starting deployment to Google App Engine...

REM Check if gcloud is installed
where gcloud >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Google Cloud SDK is not installed. Please install it first:
    echo https://cloud.google.com/sdk/docs/install
    pause
    exit /b 1
)

REM Check if user is authenticated
gcloud auth list --filter=status:ACTIVE --format="value(account)" | findstr /r "." >nul
if %errorlevel% neq 0 (
    echo ❌ Not authenticated with Google Cloud. Please run:
    echo gcloud auth login
    pause
    exit /b 1
)

REM Set the project ID (replace with your actual project ID)
set PROJECT_ID=rbac-bef5f
echo 📋 Using project: %PROJECT_ID%

REM Set the project
gcloud config set project %PROJECT_ID%

echo 🔨 Building frontend...
cd frontend
call npm install
call npm run build
cd ..

echo 🔨 Building backend...
cd backend
call npm install
call npm run build
cd ..

echo 📦 Deploying to Google App Engine...
gcloud app deploy app.yaml --quiet

echo ✅ Deployment completed!
echo 🌐 Your app should be available at: https://%PROJECT_ID%.appspot.com
echo 📊 View logs at: https://console.cloud.google.com/appengine/logs?project=%PROJECT_ID%

pause 