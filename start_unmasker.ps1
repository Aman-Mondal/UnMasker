# UnMasker - Official PowerShell Launcher
Set-Location $PSScriptRoot

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "   UnMasker - See Beyond the Surface" -ForegroundColor Green
Write-Host "   AI-Powered Digital Trust & Web Threat Intelligence" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Clearing ports 5000 and 5001..." -ForegroundColor Yellow
$ports = @(5000, 5001)
foreach ($p in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
    if ($conn) {
        $conn.OwningProcess | Select-Object -Unique | ForEach-Object {
            Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "[2/4] Starting Python Security Engine on Port 5001..." -ForegroundColor Yellow
Start-Process python -ArgumentList "python_service/app.py" -WorkingDirectory $PSScriptRoot

Start-Sleep -Seconds 3

Write-Host "[3/4] Starting Node.js Express MERN Server on Port 5000..." -ForegroundColor Yellow
Start-Process node -ArgumentList "server/index.js" -WorkingDirectory $PSScriptRoot

Start-Sleep -Seconds 3

Write-Host "[4/4] Opening Web Interface..." -ForegroundColor Green
Start-Process "http://127.0.0.1:5000"

Write-Host "`n=======================================================" -ForegroundColor Green
Write-Host "   UnMasker is running!" -ForegroundColor Green
Write-Host "   - Web UI:    http://127.0.0.1:5000" -ForegroundColor White
Write-Host "   - Python Engine: http://127.0.0.1:5001" -ForegroundColor White
Write-Host "=======================================================" -ForegroundColor Green
