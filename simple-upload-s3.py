#!/usr/bin/env python3
"""
Simple S3 upload script using AWS CLI
"""
import os
import subprocess
import sys

BUCKET_NAME = "sl-news-frontend-20241115"
BUILD_DIR = "build"
REGION = "us-east-2"

def run_command(cmd):
    """Run a shell command and return the result"""
    print(f"Running: {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return False
    print(result.stdout)
    return True

def main():
    print("=" * 50)
    print("Uploading frontend to S3")
    print("=" * 50)
    print()
    
    # Check if build directory exists
    if not os.path.exists(BUILD_DIR):
        print(f"Error: {BUILD_DIR} directory not found")
        print("Please run: npm run build")
        sys.exit(1)
    
    print(f"Found {BUILD_DIR} directory")
    print()
    
    # Count files
    file_count = sum(len(files) for _, _, files in os.walk(BUILD_DIR))
    print(f"Total files to upload: {file_count}")
    print()
    
    # Upload all files except index.html with caching
    print("Uploading static assets (with caching)...")
    cmd1 = f'aws s3 sync {BUILD_DIR} s3://{BUCKET_NAME}/ --delete --cache-control "public, max-age=31536000" --exclude "index.html" --region {REGION}'
    if not run_command(cmd1):
        print("Failed to upload static assets")
        sys.exit(1)
    
    print()
    
    # Upload index.html without caching
    print("Uploading index.html (no cache)...")
    cmd2 = f'aws s3 cp {BUILD_DIR}/index.html s3://{BUCKET_NAME}/index.html --cache-control "no-cache, no-store, must-revalidate" --region {REGION}'
    if not run_command(cmd2):
        print("Failed to upload index.html")
        sys.exit(1)
    
    print()
    print("=" * 50)
    print("Upload complete!")
    print("=" * 50)
    print()
    print(f"Website URL: http://{BUCKET_NAME}.s3-website.{REGION}.amazonaws.com")
    print()
    print("Next steps:")
    print("1. Visit the website and test document upload")
    print("2. First time, you need to accept the self-signed certificate")
    print("   by visiting: https://18.221.125.254:8000/api/docs")
    print("   and clicking 'Advanced' -> 'Continue'")
    print()

if __name__ == "__main__":
    main()

