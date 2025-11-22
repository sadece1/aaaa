#!/bin/bash

# Hostinger VPS Deployment Script
# Run this script on your VPS server

cd /var/www/campscape

# Update remote URL if needed
git remote set-url origin https://github.com/sadece1/amk.git

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install

# Build the frontend
echo "🔨 Building frontend..."
npm run build

# If you have a backend, you might want to restart it
# For example, if using PM2:
# pm2 restart campscape-backend

echo "✅ Deployment completed successfully!"

