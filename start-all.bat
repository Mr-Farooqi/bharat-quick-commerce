@echo off
echo =======================================================
echo    Starting Bharat Quick-Commerce Multi-Portal Suite
echo =======================================================
echo.

set NODE_OPTIONS=--openssl-legacy-provider

echo [1/4] Starting Central Backend API (:5000)...
start "Bharat Backend (5000)" cmd /k "cd /d %~dp0backend && node server.js"

timeout /t 3 /nobreak >nul

echo [2/4] Starting Customer App (:3000)...
start "Bharat Customer Web (3000)" cmd /k "cd /d %~dp0client-customer && npm run dev"

timeout /t 2 /nobreak >nul

echo [3/4] Starting Seller Terminal (:3001)...
start "Bharat Seller Hub (3001)" cmd /k "cd /d %~dp0client-seller && npm run dev"

timeout /t 2 /nobreak >nul

echo [4/4] Starting Super Admin Console (:3002)...
start "Bharat Admin Console (3002)" cmd /k "cd /d %~dp0client-admin && npm run dev"

echo.
echo =======================================================
echo All services launched!
echo - Customer Portal: http://localhost:3000
echo - Seller Hub:      http://localhost:3001
echo - Admin Console:   http://localhost:3002
echo - Central API:     http://localhost:5000
echo =======================================================
pause
