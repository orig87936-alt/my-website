# Deploy frontend to S3

$BUCKET_NAME = "sl-news-frontend"
$BUILD_DIR = "build"

Write-Host "Deploying frontend to S3..." -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Check if build directory exists
if (-not (Test-Path $BUILD_DIR)) {
    Write-Host "Build directory not found. Running build first..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Uploading to S3 bucket: $BUCKET_NAME" -ForegroundColor Cyan

# Use Python boto3 to upload
$uploadScript = @"
import boto3
import os
import mimetypes
from pathlib import Path

s3 = boto3.client('s3')
bucket_name = '$BUCKET_NAME'
build_dir = '$BUILD_DIR'

# MIME type mapping
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
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
}

uploaded_count = 0
for root, dirs, files in os.walk(build_dir):
    for file in files:
        local_path = os.path.join(root, file)
        relative_path = os.path.relpath(local_path, build_dir)
        s3_path = relative_path.replace('\\\\', '/')
        
        # Determine content type
        ext = os.path.splitext(file)[1].lower()
        content_type = mime_types.get(ext, 'application/octet-stream')
        
        # Upload file
        extra_args = {'ContentType': content_type}
        
        # Add cache control for static assets
        if ext in ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm']:
            extra_args['CacheControl'] = 'public, max-age=31536000'
        elif ext == '.html':
            extra_args['CacheControl'] = 'public, max-age=0, must-revalidate'
        
        try:
            s3.upload_file(local_path, bucket_name, s3_path, ExtraArgs=extra_args)
            print(f'Uploaded: {s3_path}')
            uploaded_count += 1
        except Exception as e:
            print(f'Error uploading {s3_path}: {e}')

print(f'\\nTotal files uploaded: {uploaded_count}')
print(f'Website URL: http://{bucket_name}.s3-website.us-east-2.amazonaws.com')
"@

# Save upload script
$uploadScript | Out-File -FilePath "temp_upload.py" -Encoding UTF8

# Run upload script
python temp_upload.py

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "===========================================" -ForegroundColor Cyan
    Write-Host "Deployment successful!" -ForegroundColor Green
    Write-Host "===========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Website URL:" -ForegroundColor Cyan
    Write-Host "  http://$BUCKET_NAME.s3-website.us-east-2.amazonaws.com" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Visit the website and test document upload" -ForegroundColor White
    Write-Host "2. First time visiting https://18.221.125.254:8000/api/docs" -ForegroundColor White
    Write-Host "   you need to accept the self-signed certificate" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "Deployment failed!" -ForegroundColor Red
}

# Clean up
Remove-Item "temp_upload.py" -ErrorAction SilentlyContinue

