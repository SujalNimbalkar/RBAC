#!/bin/bash

# Set Node.js memory limit for production
export NODE_OPTIONS="--max-old-space-size=2048"

# Build the project
echo "Building the project..."
npm run build

# Start the server
echo "Starting the server..."
npm start 