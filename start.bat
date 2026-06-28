@echo off
REM Health Prediction System - Quick Start for Windows

echo.
echo ================================
echo Health Prediction System - Setup
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo Error: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo Node.js found
echo.

REM Start Backend
echo Starting Backend Server...
echo Location: http://localhost:5000
echo.

cd backend

if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
)

echo Starting backend...
start "Backend - Health Prediction System" cmd /k npm run dev

REM Wait a bit for backend to start
timeout /t 3 /nobreak

REM Start Frontend
echo.
echo Starting Frontend Development Server...
echo Location: http://localhost:5173
echo.

cd ..\frontend

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

echo Starting frontend...
start "Frontend - Health Prediction System" cmd /k npm run dev

echo.
echo ================================
echo Both servers are starting!
echo ================================
echo.
echo Open your browser:
echo    http://localhost:5173
echo.
echo Backend API: http://localhost:5000
echo.
echo To stop servers, close the terminal windows.
echo.
pause
