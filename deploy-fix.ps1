# Deploy Frontend Fix to EC2
param(
    [string]$ServerIP = "18.221.125.254",
    [string]$KeyPath = "D:\download\sl-news-key.pem",
    [string]$ServerUser = "ubuntu",
    [string]$RemotePath = "/home/ubuntu/frontend"
)

Write-Host "Deploying frontend to EC2..." -ForegroundColor Cyan

# Check SSH key
if (-not (Test-Path $KeyPath)) {
    Write-Host "ERROR: SSH key not found: $KeyPath" -ForegroundColor Red
    exit 1
}

# Step 1: Build
Write-Host "Step 1: Building..." -ForegroundColor Yellow
if (Test-Path "build") {
    Remove-Item -Recurse -Force "build"
}

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "Build complete" -ForegroundColor Green

# Step 2: Create zip
Write-Host "Step 2: Creating archive..." -ForegroundColor Yellow
$ZipFile = "frontend-build.zip"
if (Test-Path $ZipFile) {
    Remove-Item $ZipFile -Force
}
Compress-Archive -Path "build\*" -DestinationPath $ZipFile
Write-Host "Archive created" -ForegroundColor Green

# Step 3: Upload
Write-Host "Step 3: Uploading..." -ForegroundColor Yellow
scp -i $KeyPath $ZipFile "${ServerUser}@${ServerIP}:/tmp/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Upload failed" -ForegroundColor Red
    exit 1
}
Write-Host "Upload complete" -ForegroundColor Green

# Step 4: Deploy
Write-Host "Step 4: Deploying..." -ForegroundColor Yellow

$deployScript = @"
sudo rm -rf ${RemotePath}.backup
sudo mv ${RemotePath} ${RemotePath}.backup 2>/dev/null || true
sudo mkdir -p ${RemotePath}
cd /tmp
unzip -q -o frontend-build.zip -d frontend-temp
sudo mv frontend-temp/* ${RemotePath}/
sudo rm -rf frontend-temp
sudo chown -R www-data:www-data ${RemotePath}
sudo chmod -R 755 ${RemotePath}
rm /tmp/frontend-build.zip
ls -lh ${RemotePath} | head -10
"@

ssh -i $KeyPath "${ServerUser}@${ServerIP}" $deployScript

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deploy failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Deployment successful!" -ForegroundColor Green
Write-Host "Frontend: http://www.s-l.ai" -ForegroundColor Cyan
Write-Host "Backend: http://api.s-l.ai" -ForegroundColor Cyan
Write-Host ""

# Cleanup
Remove-Item $ZipFile -ErrorAction SilentlyContinue

