#!/bin/bash

echo "🔧 Setting up Nginx reverse proxy..."

# Install Nginx
sudo yum install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Configure firewall
sudo yum install -y firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=\${NODE_PORT:-3000}/tcp
sudo firewall-cmd --reload

# Copy Nginx configuration
sudo cp nginx.conf /etc/nginx/conf.d/rbac3.conf

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

echo "✅ Nginx setup completed!"
echo "🌐 Nginx is now serving your application"
echo "📋 Check status with: sudo systemctl status nginx" 