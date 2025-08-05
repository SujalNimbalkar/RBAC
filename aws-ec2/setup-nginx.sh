#!/bin/bash

echo "🔧 Setting up Nginx reverse proxy..."

# Install Nginx
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install and configure firewall
sudo yum install -y firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Allow HTTP, HTTPS, and Node.js app port
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload

# Copy the simple Nginx configuration
sudo cp aws-ec2/nginx-simple.conf /etc/nginx/conf.d/rbac3.conf

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx

echo "✅ Nginx setup completed!"
echo "🌐 Nginx is now serving your application on port 80"
echo "📋 Check status with: sudo systemctl status nginx" 