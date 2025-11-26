#!/usr/bin/env python3
"""
Deploy frontend to S3 using boto3
"""
import os
import sys
import mimetypes
from pathlib import Path

try:
    import boto3
    from botocore.exceptions import ClientError, NoCredentialsError
except ImportError:
    print("❌ boto3 not installed. Installing...")
    os.system("pip install boto3")
    import boto3
    from botocore.exceptions import ClientError, NoCredentialsError

# Configuration
BUCKET_NAME = "sl-news-frontend"
BUILD_DIR = "build"

# MIME type mapping
MIME_TYPES = {
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

def get_content_type(file_path):
    """Get content type for file"""
    ext = Path(file_path).suffix.lower()
    return MIME_TYPES.get(ext, 'application/octet-stream')

def upload_to_s3():
    """Upload build directory to S3"""
    print("🚀 Deploying frontend to S3...")
    print("=" * 60)
    
    # Initialize S3 client
    try:
        s3 = boto3.client('s3')
        print(f"✅ Connected to AWS")
    except NoCredentialsError:
        print("❌ AWS credentials not found!")
        print("Please configure AWS credentials:")
        print("  1. Run: aws configure")
        print("  2. Or set environment variables:")
        print("     - AWS_ACCESS_KEY_ID")
        print("     - AWS_SECRET_ACCESS_KEY")
        return False
    
    # Check if build directory exists
    if not os.path.exists(BUILD_DIR):
        print(f"❌ Build directory '{BUILD_DIR}' not found!")
        print("Please run 'npm run build' first.")
        return False
    
    # Get all files to upload
    files_to_upload = []
    for root, dirs, files in os.walk(BUILD_DIR):
        for file in files:
            local_path = os.path.join(root, file)
            # S3 key (relative path from build dir)
            s3_key = os.path.relpath(local_path, BUILD_DIR).replace('\\', '/')
            files_to_upload.append((local_path, s3_key))
    
    print(f"📦 Found {len(files_to_upload)} files to upload")
    print()
    
    # Upload files
    uploaded = 0
    failed = 0
    
    for local_path, s3_key in files_to_upload:
        try:
            content_type = get_content_type(local_path)
            
            # Upload file
            s3.upload_file(
                local_path,
                BUCKET_NAME,
                s3_key,
                ExtraArgs={
                    'ContentType': content_type,
                    'CacheControl': 'max-age=31536000' if '/assets/' in s3_key else 'max-age=0'
                }
            )
            
            uploaded += 1
            if uploaded % 10 == 0:
                print(f"  Uploaded {uploaded}/{len(files_to_upload)} files...")
                
        except ClientError as e:
            print(f"❌ Failed to upload {s3_key}: {e}")
            failed += 1
        except Exception as e:
            print(f"❌ Error uploading {s3_key}: {e}")
            failed += 1
    
    print()
    print("=" * 60)
    print(f"✅ Upload complete!")
    print(f"   Uploaded: {uploaded} files")
    if failed > 0:
        print(f"   Failed: {failed} files")
    print()
    print(f"🌐 Website URL:")
    print(f"   http://{BUCKET_NAME}.s3-website.us-east-2.amazonaws.com")
    print("=" * 60)
    
    return failed == 0

if __name__ == "__main__":
    success = upload_to_s3()
    sys.exit(0 if success else 1)

