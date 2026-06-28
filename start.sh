#!/bin/bash
# Health Prediction System - Quick Start Guide

echo "================================"
echo "Health Prediction System - Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node -v)"
echo ""

# Start Backend
echo "Starting Backend Server..."
echo "📍 Backend will run on http://localhost:5000"
echo ""

cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

echo "Starting backend with npm run dev..."
npm run dev &
BACKEND_PID=$!

sleep 3

# Start Frontend
echo ""
echo "Starting Frontend Development Server..."
echo "📍 Frontend will run on http://localhost:5173"
echo ""

cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "Starting frontend with npm run dev..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "================================"
echo "✅ Both servers are starting!"
echo "================================"
echo ""
echo "🌐 Open your browser and visit:"
echo "   http://localhost:5173"
echo ""
echo "📦 Backend API: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for processes
wait

# Cleanup
kill $BACKEND_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null
