# 稳定启动脚本 - 前后端服务
# 此脚本会检查依赖、端口占用，并稳定启动服务

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   前后端服务启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 设置错误处理
$ErrorActionPreference = "Continue"

# ============================================
# 1. 检查后端依赖
# ============================================
Write-Host "📦 检查后端依赖..." -ForegroundColor Yellow

$backendPath = Join-Path $PSScriptRoot "backend"
$venvPath = Join-Path $backendPath "venv"
$pythonExe = Join-Path $venvPath "Scripts\python.exe"
$pipExe = Join-Path $venvPath "Scripts\pip.exe"

if (-not (Test-Path $venvPath)) {
    Write-Host "❌ 虚拟环境不存在！" -ForegroundColor Red
    Write-Host "请先运行以下命令创建虚拟环境：" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor White
    Write-Host "  python -m venv venv" -ForegroundColor White
    Write-Host "  .\venv\Scripts\activate" -ForegroundColor White
    Write-Host "  pip install -r requirements.txt" -ForegroundColor White
    exit 1
}

# 检查关键依赖
Write-Host "   检查关键 Python 包..." -ForegroundColor Gray
$requiredPackages = @("fastapi", "uvicorn", "sqlalchemy", "pydantic", "langdetect", "google-auth", "PyJWT", "beautifulsoup4", "openai")
$missingPackages = @()

foreach ($package in $requiredPackages) {
    $installed = & $pipExe list | Select-String -Pattern "^$package\s" -Quiet
    if (-not $installed) {
        $missingPackages += $package
    }
}

if ($missingPackages.Count -gt 0) {
    Write-Host "   ⚠️  缺少以下包: $($missingPackages -join ', ')" -ForegroundColor Yellow
    Write-Host "   正在安装缺失的依赖..." -ForegroundColor Yellow
    
    Push-Location $backendPath
    & $pipExe install -r requirements.txt --quiet
    Pop-Location
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ 依赖安装失败！" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✅ 依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "   ✅ 所有依赖已安装" -ForegroundColor Green
}

# ============================================
# 2. 检查前端依赖
# ============================================
Write-Host ""
Write-Host "📦 检查前端依赖..." -ForegroundColor Yellow

if (-not (Test-Path "node_modules")) {
    Write-Host "   ⚠️  node_modules 不存在，正在安装..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ 前端依赖安装失败！" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✅ 前端依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "   ✅ 前端依赖已安装" -ForegroundColor Green
}

# ============================================
# 3. 检查端口占用
# ============================================
Write-Host ""
Write-Host "🔍 检查端口占用..." -ForegroundColor Yellow

function Test-PortInUse {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

function Stop-ProcessOnPort {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connection) {
        $processId = $connection.OwningProcess
        Write-Host "   发现端口 $Port 被进程 $processId 占用，正在停止..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        return $true
    }
    return $false
}

# 检查后端端口 8000
if (Test-PortInUse -Port 8000) {
    Write-Host "   ⚠️  端口 8000 已被占用" -ForegroundColor Yellow
    $response = Read-Host "   是否停止占用进程？(Y/N)"
    if ($response -eq 'Y' -or $response -eq 'y') {
        Stop-ProcessOnPort -Port 8000
        Write-Host "   ✅ 端口 8000 已释放" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  后端可能无法启动" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✅ 端口 8000 可用" -ForegroundColor Green
}

# 检查前端端口 3000
if (Test-PortInUse -Port 3000) {
    Write-Host "   ⚠️  端口 3000 已被占用" -ForegroundColor Yellow
    $response = Read-Host "   是否停止占用进程？(Y/N)"
    if ($response -eq 'Y' -or $response -eq 'y') {
        Stop-ProcessOnPort -Port 3000
        Write-Host "   ✅ 端口 3000 已释放" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  前端可能无法启动" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✅ 端口 3000 可用" -ForegroundColor Green
}

# ============================================
# 4. 启动服务
# ============================================
Write-Host ""
Write-Host "🚀 启动服务..." -ForegroundColor Cyan
Write-Host ""

# 启动后端
Write-Host "   启动后端服务 (端口 8000)..." -ForegroundColor Yellow
$backendCmd = "cd '$backendPath'; & '$pythonExe' -m uvicorn app.main:app --reload --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -WindowStyle Normal
Start-Sleep -Seconds 3

# 启动前端
Write-Host "   启动前端服务 (端口 3000)..." -ForegroundColor Yellow
$frontendCmd = "cd '$PSScriptRoot'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd -WindowStyle Normal
Start-Sleep -Seconds 5

# ============================================
# 5. 验证服务状态
# ============================================
Write-Host ""
Write-Host "🔍 验证服务状态..." -ForegroundColor Yellow

Start-Sleep -Seconds 3

# 检查后端
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:8000/docs" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ 后端服务运行正常" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  后端服务可能未正常启动，请检查后端窗口" -ForegroundColor Yellow
}

# 检查前端
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ 前端服务运行正常" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  前端服务可能未正常启动，请检查前端窗口" -ForegroundColor Yellow
}

# ============================================
# 6. 完成
# ============================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ✨ 启动完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 访问地址：" -ForegroundColor Cyan
Write-Host "   前端：http://localhost:3000" -ForegroundColor White
Write-Host "   后端 API 文档：http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "💡 提示：" -ForegroundColor Cyan
Write-Host "   - 两个服务窗口会保持打开状态" -ForegroundColor Gray
Write-Host "   - 按 Ctrl+C 可以停止对应的服务" -ForegroundColor Gray
Write-Host "   - 关闭窗口也会停止服务" -ForegroundColor Gray
Write-Host ""

# 打开浏览器
Write-Host "🌐 正在打开浏览器..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "按任意键退出此窗口..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

