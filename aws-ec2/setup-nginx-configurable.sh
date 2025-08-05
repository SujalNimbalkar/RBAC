#!/bin/bash

echo "🔧 Setting up Nginx reverse proxy (Configurable Ports)..."

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
sudo firewall-cmd --permanent --add-port=${NODE_PORT}/tcp
sudo firewall-cmd --reload

# Create configurable Nginx configuration
cat > nginx.conf << EOF
server {
    listen ${NGINX_PORT};
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS (if SSL is configured)
    # return 301 https://\$server_name\$request_uri;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # API routes - proxy to Node.js backend
    location /api/ {
        proxy_pass http://localhost:${NODE_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files from React build
    location /static/ {
        alias /var/www/rbac3/frontend/build/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /favicon.ico {
        alias /var/www/rbac3/frontend/build/favicon.ico;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /manifest.json {
        alias /var/www/rbac3/frontend/build/manifest.json;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # All other routes - serve React app
    location / {
        root /var/www/rbac3/frontend/build;
        try_files \$uri \$uri/ /index.html;
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}

# SSL Configuration (uncomment and configure if you have SSL certificates)
# server {
#     listen ${NGINX_SSL_PORT} ssl http2;
#     server_name your-domain.com www.your-domain.com;
#
#     # SSL Configuration
#     ssl_certificate /etc/ssl/certs/your-domain.crt;
#     ssl_certificate_key /etc/ssl/private/your-domain.key;
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
#     ssl_prefer_server_ciphers off;
#
#     # Include the same location blocks as above
#     include /etc/nginx/conf.d/rbac3-locations.conf;
# }
EOF

# Copy Nginx configuration
sudo cp nginx.conf /etc/nginx/conf.d/rbac3.conf

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

echo "✅ Nginx setup completed!"
echo "🌐 Nginx is now serving your application on port ${NGINX_PORT}"
echo "📋 Check status with: sudo systemctl status nginx" 