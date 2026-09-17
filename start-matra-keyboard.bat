@echo off
title Matra Keyboard — Development Launcher
cd /d "%~dp0"

echo ======================================================================
echo   Matra Keyboard — Modern Bengali Desktop Keyboard Application
echo ======================================================================
echo.
echo Launching development environment (Vite + Electron)...
echo (Default Browser Policy: Microsoft Edge / Brave. Chrome is disabled.)
echo.

call npm run dev

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [ERROR] Application terminated with error code %ERRORLEVEL%.
  echo Please inspect the logs above.
)

echo.
echo ======================================================================
echo Matra Keyboard process exited.
echo Press any key to close this terminal window...
pause >nul
