#!/bin/bash

echo "🚀 Setting up RBAC3 Production Planning System on EC2..."

# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Git
sudo yum install -y git

# Create application directory
sudo mkdir -p /var/www/rbac3
sudo chown ec2-user:ec2-user /var/www/rbac3
cd /var/www/rbac3

# Clone repository (replace with your actual repository URL)
git clone https://github.com/SujalNimbalkar/RBAC.git .

# Install dependencies and build
echo "🔨 Building application..."
npm install
cd frontend && npm install && npm run build && cd ..
cd backend && npm install && npm run build && cd ..

# Create environment file
cat > .env << EOF
# MongoDB Configuration
MONGODB_URI=mongodb+srv://sujalnimbalkar09:qeAqqWtfhOGtaCeZ@cluster0.ftdcnyq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0


# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# JWT Configuration
JWT_SECRET=27081b784b9b2716d9ebe34ffa1cb098a23a5b8c1e384184655554ac24f1b7ac1d3e97a369670746a37a7416964f75603d69efc80f1236a0e76df0e2dc9e5c01

# App Configuration
NODE_ENV=production
PORT=\${NODE_PORT:-3000}
NODE_PORT=\${NODE_PORT:-3000}
NGINX_PORT=\${NGINX_PORT:-80}
TZ=Asia/Kolkata
EOF

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'rbac3-production-planning',
    script: 'backend/dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: process.env.NODE_PORT || 3000
    },
    env_file: '.env',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Setup completed!"
echo "🌐 Your application should be running on port 3000"
echo "📊 Check status with: pm2 status"
echo "📋 View logs with: pm2 logs" 