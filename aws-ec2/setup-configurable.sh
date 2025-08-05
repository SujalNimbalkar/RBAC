#!/bin/bash

echo "🚀 Setting up RBAC3 Production Planning System on EC2 (Configurable Ports)..."

# Load configuration from environment file
if [ -f ".env" ]; then
    echo "📋 Loading configuration from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️  No .env file found. Using default configuration..."
    # Set default values
    export NODE_PORT=${NODE_PORT:-3000}
    export NGINX_PORT=${NGINX_PORT:-80}
    export NGINX_SSL_PORT=${NGINX_SSL_PORT:-443}
fi

echo "🔧 Configuration:"
echo "  Node.js Port: ${NODE_PORT}"
echo "  Nginx Port: ${NGINX_PORT}"
echo "  Nginx SSL Port: ${NGINX_SSL_PORT}"

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

# Create environment file with configurable ports
cat > .env << EOF
# MongoDB Configuration
MONGODB_URI=${MONGODB_URI:-mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database}

# Firebase Configuration
FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID:-your-firebase-project-id}
FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY:------BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n}
FIREBASE_CLIENT_EMAIL=${FIREBASE_CLIENT_EMAIL:-firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com}

# JWT Configuration
JWT_SECRET=${JWT_SECRET:-your-jwt-secret-key-here}

# App Configuration
NODE_ENV=production
PORT=${NODE_PORT}
NODE_PORT=${NODE_PORT}
NGINX_PORT=${NGINX_PORT}
NGINX_SSL_PORT=${NGINX_SSL_PORT}
TZ=Asia/Kolkata
EOF

# Create PM2 ecosystem file with configurable port
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'rbac3-production-planning',
    script: 'backend/dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: ${NODE_PORT}
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
echo "🌐 Your application should be running on port ${NODE_PORT}"
echo "📊 Check status with: pm2 status"
echo "📋 View logs with: pm2 logs" 