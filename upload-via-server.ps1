# Upload frontend to S3 via EC2 server

$SERVER_IP = "18.221.125.254"
$SSH_KEY = "D:\download\sl-news-key.pem"
$BUILD_DIR = "build"
$BUCKET_NAME = "sl-news-frontend"

Write-Host "Upload Frontend to S3 via Server" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check build directory
if (-not (Test-Path $BUILD_DIR)) {
    Write-Host "Build directory not found. Running build..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Step 1: Creating archive..." -ForegroundColor Cyan
# Create a zip file
Compress-Archive -Path "$BUILD_DIR\*" -DestinationPath "frontend-build.zip" -Force
Write-Host "Archive created: frontend-build.zip" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Uploading to server..." -ForegroundColor Cyan
# Upload to server
scp -i $SSH_KEY frontend-build.zip ubuntu@${SERVER_IP}:/tmp/
if ($LASTEXITCODE -ne 0) {
    Write-Host "Upload to server failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Uploaded to server" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Extracting and uploading to S3..." -ForegroundColor Cyan
$uploadCommand = @"
cd /tmp
rm -rf frontend-build
mkdir -p frontend-build
cd frontend-build
python3 -m zipfile -e /tmp/frontend-build.zip .
echo 'Files extracted'
echo ''
echo 'Uploading to S3 using Python...'
/home/ubuntu/backend/venv/bin/python3 << 'PYTHON_EOF'
import boto3
import os
import mimetypes

s3 = boto3.client('s3', region_name='us-east-2')
bucket = '$BUCKET_NAME'

mime_types = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
}

count = 0
for root, dirs, files in os.walk('.'):
    for file in files:
        local_path = os.path.join(root, file)
        s3_path = os.path.relpath(local_path, '.').replace('\\\\', '/')
        ext = os.path.splitext(file)[1].lower()
        content_type = mime_types.get(ext, 'application/octet-stream')

        extra_args = {'ContentType': content_type}
        if ext in ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.mp4']:
            extra_args['CacheControl'] = 'public, max-age=31536000'
        elif ext == '.html':
            extra_args['CacheControl'] = 'no-cache, no-store, must-revalidate'

        s3.upload_file(local_path, bucket, s3_path, ExtraArgs=extra_args)
        count += 1
        if count % 10 == 0:
            print(f'Uploaded {count} files...')

print(f'Total files uploaded: {count}')
PYTHON_EOF
echo ''
echo 'Upload complete!'
cd /tmp
rm -rf frontend-build frontend-build.zip
"@

ssh -i $SSH_KEY ubuntu@$SERVER_IP $uploadCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "===========================================" -ForegroundColor Cyan
    Write-Host "Deployment Successful!" -ForegroundColor Green
    Write-Host "===========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Website URL:" -ForegroundColor Cyan
    Write-Host "  http://$BUCKET_NAME.s3-website.us-east-2.amazonaws.com" -ForegroundColor White
    Write-Host ""
    Write-Host "IMPORTANT - First Time Setup:" -ForegroundColor Yellow
    Write-Host "1. Open a new browser tab" -ForegroundColor White
    Write-Host "2. Visit: https://18.221.125.254:8000/api/docs" -ForegroundColor White
    Write-Host "3. You will see a security warning" -ForegroundColor White
    Write-Host "4. Click 'Advanced' -> 'Continue to 18.221.125.254 (unsafe)'" -ForegroundColor White
    Write-Host "5. This accepts the self-signed certificate" -ForegroundColor White
    Write-Host "6. Then go back to your website and try uploading" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "Deployment failed!" -ForegroundColor Red
}

# Clean up local zip file
Remove-Item "frontend-build.zip" -ErrorAction SilentlyContinue

