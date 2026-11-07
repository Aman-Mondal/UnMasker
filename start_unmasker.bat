@echo off
title UnMasker Launcher
cd /d "%~dp0"

echo =======================================================
echo    UnMasker - See Beyond the Surface
echo    AI-Powered Digital Trust & Web Threat Intelligence
echo =======================================================
echo.

echo [1/4] Freeing ports 5000 and 5001 from any background processes...
powershell -NoProfile -Command "$ports = @(5000, 5001); foreach ($p in $ports) { $conn = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue; if ($conn) { $conn.OwningProcess | Select-Object -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } } }"

echo [2/4] Starting Python Security Analysis Engine (Port 5001)...
start "UnMasker - Python Engine (Port 5001)" cmd /k "title UnMasker Python Engine && cd /d "%~dp0" && python python_service/app.py"

echo [3/4] Waiting for Python engine to initialize...
timeout /t 3 /nobreak >nul

echo [4/4] Starting MERN Backend & Web Gateway (Port 5000)...
start "UnMasker - Web Server (Port 5000)" cmd /k "title UnMasker Web Server && cd /d "%~dp0" && node server/index.js"

echo Waiting for Web Server to be ready...
timeout /t 3 /nobreak >nul

echo Opening UnMasker in your browser...
start http://127.0.0.1:5000

echo.
echo =======================================================
echo    UnMasker is ACTIVE and running!
echo    - Web Interface: http://127.0.0.1:5000
echo    - Python API:    http://127.0.0.1:5001
echo =======================================================
echo Keep the server windows open while using the platform.
echo Press any key to exit this launcher window.
pause >nul
