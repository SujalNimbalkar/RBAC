#!/bin/bash

echo "🚀 Deploying RBAC3 to EC2..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first:"
    echo "https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if user is authenticated
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Not authenticated with AWS. Please run:"
    echo "aws configure"
    exit 1
fi

# Variables (update these with your values)
EC2_INSTANCE_ID="your-ec2-instance-id"
EC2_USER="ec2-user"
EC2_KEY_PATH="~/.ssh/your-key.pem"
EC2_HOST="your-ec2-public-ip"

echo "📋 Using EC2 instance: $EC2_INSTANCE_ID"
echo "🌐 EC2 host: $EC2_HOST"

# Build application locally
echo "🔨 Building application..."
npm install
cd frontend && npm install && npm run build && cd ..
cd backend && npm install && npm run build && cd ..

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf rbac3-deployment.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=*.log \
    --exclude=dist \
    --exclude=build \
    .

# Upload to EC2
echo "📤 Uploading to EC2..."
scp -i $EC2_KEY_PATH rbac3-deployment.tar.gz $EC2_USER@$EC2_HOST:/tmp/

# Deploy on EC2
echo "🚀 Deploying on EC2..."
ssh -i $EC2_KEY_PATH $EC2_USER@$EC2_HOST << 'EOF'
    cd /var/www/rbac3
    
    # Backup current version
    if [ -d "current" ]; then
        mv current backup-$(date +%Y%m%d-%H%M%S)
    fi
    
    # Extract new version
    tar -xzf /tmp/rbac3-deployment.tar.gz -C /tmp/
    mv /tmp/* current/
    cd current
    
    # Install dependencies and build
    npm install
    cd frontend && npm install && npm run build && cd ..
    cd backend && npm install && npm run build && cd ..
    
    # Restart application
    pm2 restart rbac3-production-planning || pm2 start ecosystem.config.js
    
    # Cleanup
    rm /tmp/rbac3-deployment.tar.gz
    
    echo "✅ Deployment completed!"
EOF

# Cleanup local files
rm rbac3-deployment.tar.gz

echo "🎉 Deployment completed!"
echo "🌐 Your application should be available at: http://$EC2_HOST"
echo "📊 Check status with: ssh -i $EC2_KEY_PATH $EC2_USER@$EC2_HOST 'pm2 status'" 