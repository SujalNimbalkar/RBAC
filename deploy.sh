#!/bin/bash

echo "🚀 Starting deployment to Google App Engine..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK is not installed. Please install it first:"
    echo "https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Not authenticated with Google Cloud. Please run:"
    echo "gcloud auth login"
    exit 1
fi

# Set the project ID (replace with your actual project ID)
PROJECT_ID="rbac-bef5f"
echo "📋 Using project: $PROJECT_ID"

# Set the project
gcloud config set project $PROJECT_ID

echo "🔨 Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "🔨 Building backend..."
cd backend
npm install
npm run build
cd ..

echo "📦 Deploying to Google App Engine..."
gcloud app deploy app.yaml --quiet

echo "✅ Deployment completed!"
echo "🌐 Your app should be available at: https://$PROJECT_ID.appspot.com"
echo "📊 View logs at: https://console.cloud.google.com/appengine/logs?project=$PROJECT_ID" 