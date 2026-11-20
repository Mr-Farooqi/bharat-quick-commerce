$env:NODE_OPTIONS = "--openssl-legacy-provider"

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "   Starting Bharat Quick-Commerce Multi-Portal Suite" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan

Write-Host "`n[1/4] Starting Central Backend API (:5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; `$env:NODE_OPTIONS='--openssl-legacy-provider'; node server.js"

Start-Sleep -Seconds 3

Write-Host "[2/4] Starting Customer App (:3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client-customer'; `$env:NODE_OPTIONS='--openssl-legacy-provider'; npm run dev"

Start-Sleep -Seconds 2

Write-Host "[3/4] Starting Seller Terminal (:3001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client-seller'; `$env:NODE_OPTIONS='--openssl-legacy-provider'; npm run dev"

Start-Sleep -Seconds 2

Write-Host "[4/4] Starting Super Admin Console (:3002)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client-admin'; `$env:NODE_OPTIONS='--openssl-legacy-provider'; npm run dev"

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "All services started successfully in separate windows!" -ForegroundColor Green
Write-Host "Customer Portal: http://localhost:3000" -ForegroundColor White
Write-Host "Seller Hub:      http://localhost:3001" -ForegroundColor White
Write-Host "Admin Console:   http://localhost:3002" -ForegroundColor White
Write-Host "Central API:     http://localhost:5000" -ForegroundColor White
Write-Host "=======================================================" -ForegroundColor Cyan
