#!/bin/bash

# BQC Generator Deployment Script

set -e

echo "🚀 Starting BQC Generator deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the frontend
echo "🔧 Building frontend..."
npm run build

# Set environment variables
export JWT_SECRET=${JWT_SECRET:-$(openssl rand -base64 32)}
export NODE_ENV=production
export PORT=3001

echo "🏃 Starting production server..."
npm run start:server &
SERVER_PID=$!

echo "⏳ Waiting for server to be ready..."
sleep 5

# Health check
echo "🏥 Performing health check..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ BQC Generator is running successfully!"
    echo "🔌 API: http://localhost:3001"
    echo "🏥 Health Check: http://localhost:3001/health"
    echo "📁 Serve frontend files from: ./dist"
    echo "🛑 To stop: kill $SERVER_PID"
else
    echo "❌ Health check failed. Please check the server logs."
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi
