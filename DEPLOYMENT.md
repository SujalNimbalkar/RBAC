# 🚀 Google App Engine Deployment Guide

This guide will help you deploy your RBAC3 Production Planning System to Google App Engine.

## 📋 Prerequisites

1. **Google Cloud Account**: You need a Google Cloud account
2. **Google Cloud SDK**: Install the Google Cloud SDK
3. **Node.js**: Version 16 or higher
4. **Git**: For version control

## 🔧 Setup Steps

### 1. Install Google Cloud SDK

**Windows:**
```bash
# Download and install from:
# https://cloud.google.com/sdk/docs/install
```

**macOS/Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### 2. Authenticate with Google Cloud

```bash
gcloud auth login
gcloud auth application-default login
```

### 3. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your **Project ID**

### 4. Enable Required APIs

```bash
# Replace YOUR_PROJECT_ID with your actual project ID
gcloud config set project YOUR_PROJECT_ID

# Enable App Engine API
gcloud services enable appengine.googleapis.com

# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com
```

### 5. Configure Environment Variables

Edit `env_variables.yaml` and replace the placeholder values:

```yaml
env_variables:
  # MongoDB Configuration
  MONGODB_URI: "mongodb+srv://username:password@cluster.mongodb.net/database"
  
  # Firebase Configuration
  FIREBASE_PROJECT_ID: "your-firebase-project-id"
  FIREBASE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
  FIREBASE_CLIENT_EMAIL: "firebase-adminsdk@project.iam.gserviceaccount.com"
  
  # JWT Configuration
  JWT_SECRET: "your-super-secret-jwt-key"
  
  # App Configuration
  NODE_ENV: "production"
  PORT: "8080"
  
  # Timezone
  TZ: "Asia/Kolkata"
```

### 6. Update Project ID

Edit `deploy.sh` (Linux/macOS) or `deploy.bat` (Windows) and replace:
```bash
PROJECT_ID="your-google-cloud-project-id"
```
with your actual project ID.

## 🚀 Deployment

### Option 1: Using Deployment Scripts

**Windows:**
```bash
deploy.bat
```

**Linux/macOS:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Deployment

1. **Build Frontend:**
```bash
cd frontend
npm install
npm run build
cd ..
```

2. **Build Backend:**
```bash
cd backend
npm install
npm run build
cd ..
```

3. **Deploy to App Engine:**
```bash
gcloud app deploy app.yaml
```

## 🌐 Access Your Application

After successful deployment, your app will be available at:
```
https://YOUR_PROJECT_ID.appspot.com
```

## 📊 Monitoring

- **Logs**: https://console.cloud.google.com/appengine/logs
- **Metrics**: https://console.cloud.google.com/appengine/versions
- **Settings**: https://console.cloud.google.com/appengine/settings

## 🔧 Environment Variables Setup

### MongoDB Atlas
1. Create a MongoDB Atlas cluster
2. Get your connection string
3. Add it to `env_variables.yaml`

### Firebase
1. Create a Firebase project
2. Generate a service account key
3. Add the credentials to `env_variables.yaml`

### JWT Secret
Generate a secure random string for JWT_SECRET

## 🛠️ Troubleshooting

### Common Issues

1. **Build Errors**
   - Ensure all dependencies are installed
   - Check TypeScript compilation errors
   - Verify environment variables

2. **Runtime Errors**
   - Check App Engine logs
   - Verify MongoDB connection
   - Ensure Firebase credentials are correct

3. **Authentication Issues**
   - Re-authenticate with `gcloud auth login`
   - Check service account permissions

### Useful Commands

```bash
# View logs
gcloud app logs tail

# Check app status
gcloud app describe

# List versions
gcloud app versions list

# Rollback to previous version
gcloud app versions migrate VERSION_ID
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit sensitive data to Git
2. **Firebase**: Use service account keys, not user credentials
3. **MongoDB**: Use connection strings with proper authentication
4. **JWT**: Use a strong, random secret key

## 📈 Scaling

The `app.yaml` configuration includes automatic scaling:
- Min instances: 1
- Max instances: 10
- Target CPU utilization: 65%

Adjust these values based on your traffic patterns.

## 🔄 Continuous Deployment

For automatic deployments, consider setting up:
1. GitHub Actions
2. Cloud Build triggers
3. Automated testing

## 📞 Support

If you encounter issues:
1. Check the [App Engine documentation](https://cloud.google.com/appengine/docs)
2. Review the [Google Cloud Console](https://console.cloud.google.com/)
3. Check the application logs for specific error messages 