# 🚀 AWS EC2 Deployment Guide

This guide will help you deploy your RBAC3 Production Planning System to AWS EC2.

## 📋 Prerequisites

1. **AWS Account**: You need an AWS account
2. **AWS CLI**: Install the AWS CLI
3. **SSH Key Pair**: Create an EC2 key pair
4. **Node.js**: Version 16 or higher (for local builds)

## 🔧 Setup Steps

### 1. Install AWS CLI

**Windows:**
```bash
# Download and install from:
# https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
```

**macOS/Linux:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### 2. Configure AWS CLI

```bash
aws configure
```

Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., us-east-1)
- Default output format (json)

### 3. Create EC2 Key Pair

1. Go to AWS Console → EC2 → Key Pairs
2. Create a new key pair
3. Download the .pem file
4. Set proper permissions: `chmod 400 your-key.pem`

### 4. Deploy Infrastructure

#### Option A: Using CloudFormation (Recommended)

```bash
# Deploy the CloudFormation stack
aws cloudformation create-stack \
  --stack-name rbac3-production \
  --template-body file://aws-ec2/cloudformation-template.yaml \
  --parameters ParameterKey=KeyPairName,ParameterValue=your-key-pair-name \
  --capabilities CAPABILITY_NAMED_IAM

# Wait for stack creation
aws cloudformation wait stack-create-complete --stack-name rbac3-production

# Get the outputs
aws cloudformation describe-stacks --stack-name rbac3-production --query 'Stacks[0].Outputs'
```

#### Option B: Manual EC2 Setup

1. **Launch EC2 Instance:**
   - AMI: Amazon Linux 2
   - Instance Type: t3.small (or larger)
   - Security Group: Allow ports 22, 80, 443, 3000
   - Key Pair: Your created key pair

2. **Connect to Instance:**
```bash
ssh -i your-key.pem ec2-user@your-instance-public-ip
```

3. **Run Setup Script:**
```bash
# Upload setup script
scp -i your-key.pem aws-ec2/setup-ec2.sh ec2-user@your-instance-public-ip:~/

# Run setup
ssh -i your-key.pem ec2-user@your-instance-public-ip
chmod +x setup-ec2.sh
./setup-ec2.sh
```

### 5. Configure Environment Variables

Edit the `.env` file on your EC2 instance:

```bash
sudo nano /var/www/rbac3/.env
```

Replace with your actual values:
```env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
JWT_SECRET=your-jwt-secret-key-here
NODE_ENV=production
PORT=3000
TZ=Asia/Kolkata
```

### 6. Deploy Application

#### Option A: Using Deployment Script

```bash
# Update variables in deploy.sh
EC2_INSTANCE_ID="your-ec2-instance-id"
EC2_USER="ec2-user"
EC2_KEY_PATH="~/.ssh/your-key.pem"
EC2_HOST="your-ec2-public-ip"

# Run deployment
chmod +x aws-ec2/deploy.sh
./aws-ec2/deploy.sh
```

#### Option B: Manual Deployment

```bash
# Build locally
npm install
cd frontend && npm install && npm run build && cd ..
cd backend && npm install && npm run build && cd ..

# Upload to EC2
scp -r -i your-key.pem . ec2-user@your-instance-public-ip:/var/www/rbac3/

# SSH to EC2 and restart
ssh -i your-key.pem ec2-user@your-instance-public-ip
cd /var/www/rbac3
pm2 restart rbac3-production-planning
```

## 🌐 Access Your Application

After deployment, your app will be available at:
```
http://your-ec2-public-ip
```

## 📊 Monitoring

### PM2 Commands
```bash
# Check status
pm2 status

# View logs
pm2 logs

# Monitor
pm2 monit

# Restart application
pm2 restart rbac3-production-planning
```

### Nginx Commands
```bash
# Check status
sudo systemctl status nginx

# View logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Reload configuration
sudo nginx -t && sudo systemctl reload nginx
```

## 🔧 Environment Variables Setup

### MongoDB Atlas
1. Create a MongoDB Atlas cluster
2. Get your connection string
3. Add it to the `.env` file

### Firebase
1. Create a Firebase project
2. Generate a service account key
3. Add the credentials to the `.env` file

### JWT Secret
Generate a secure random string for JWT_SECRET

## 🛠️ Troubleshooting

### Common Issues

1. **Application Not Starting**
   - Check PM2 logs: `pm2 logs`
   - Verify environment variables: `cat .env`
   - Check Node.js installation: `node --version`

2. **Nginx Not Serving**
   - Check Nginx status: `sudo systemctl status nginx`
   - Test configuration: `sudo nginx -t`
   - Check error logs: `sudo tail -f /var/log/nginx/error.log`

3. **Port Issues**
   - Check if port 3000 is open: `netstat -tlnp | grep 3000`
   - Verify security group settings
   - Check firewall: `sudo firewall-cmd --list-all`

### Useful Commands

```bash
# Check system resources
htop
df -h
free -h

# Check application status
pm2 status
sudo systemctl status nginx

# View recent logs
pm2 logs --lines 100
sudo tail -f /var/log/nginx/access.log
```

## 🔒 Security Considerations

1. **SSH Access**: Use key-based authentication only
2. **Firewall**: Configure security groups properly
3. **Environment Variables**: Keep sensitive data secure
4. **SSL**: Set up HTTPS with Let's Encrypt
5. **Updates**: Keep system and packages updated

## 📈 Scaling

### Vertical Scaling
- Upgrade instance type (t3.small → t3.medium → t3.large)

### Horizontal Scaling
- Use Application Load Balancer
- Deploy multiple instances
- Use Auto Scaling Group

## 🔄 Continuous Deployment

For automatic deployments, consider:
1. GitHub Actions
2. AWS CodePipeline
3. Jenkins
4. GitLab CI/CD

## 📞 Support

If you encounter issues:
1. Check the [AWS EC2 documentation](https://docs.aws.amazon.com/ec2/)
2. Review the [PM2 documentation](https://pm2.keymetrics.io/docs/)
3. Check the application logs for specific error messages 