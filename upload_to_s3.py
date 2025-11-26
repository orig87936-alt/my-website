import boto3
import os
from pathlib import Path

# 配置
BUCKET_NAME = 'sl-news-frontend'
REGION = 'us-east-2'
BUILD_DIR = 'build'

# 创建 S3 客户端（使用 sl-news profile）
session = boto3.Session(profile_name='sl-news')
s3 = session.client('s3', region_name=REGION)

# MIME 类型映射
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

def upload_directory(directory_path):
    """递归上传目录到 S3"""
    for root, dirs, files in os.walk(directory_path):
        for file in files:
            local_path = os.path.join(root, file)
            relative_path = os.path.relpath(local_path, directory_path)
            s3_path = relative_path.replace('\\', '/')
            
            # 获取文件扩展名
            ext = os.path.splitext(file)[1].lower()
            content_type = MIME_TYPES.get(ext, 'application/octet-stream')
            
            # 上传文件
            extra_args = {
                'ContentType': content_type,
                'CacheControl': 'no-cache, no-store, must-revalidate' if file == 'index.html' else 'public, max-age=31536000'
            }
            
            print(f"Uploading {s3_path}...")
            s3.upload_file(
                local_path,
                BUCKET_NAME,
                s3_path,
                ExtraArgs=extra_args
            )
            print(f"  ✓ Uploaded with Content-Type: {content_type}")

if __name__ == '__main__':
    print(f"Starting upload from {BUILD_DIR} to s3://{BUCKET_NAME}/")
    upload_directory(BUILD_DIR)
    print("\n✅ Upload complete!")
    print(f"Website URL: http://{BUCKET_NAME}.s3-website.{REGION}.amazonaws.com")

