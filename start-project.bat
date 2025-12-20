@echo off
REM Flairr Project Startup Script
REM This batch file starts the frontend development server

setlocal enabledelayedexpansion

echo.
echo ================================
echo Starting Flairr Project
echo ================================
echo.

REM Get the project root directory
set "projectRoot=%~dp0"

REM Frontend setup
echo Setting up Frontend...
cd /d "%projectRoot%frontend"

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install --legacy-peer-deps
) else (
    echo Frontend dependencies already installed
)

echo.
echo ================================
echo Starting frontend server...
echo ================================
echo Frontend will run on: http://localhost:4200
echo.
REM Start frontend
cd /d "%projectRoot%frontend"
call ng serve -o
pause
