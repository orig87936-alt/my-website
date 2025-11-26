#!/usr/bin/env python3
"""
Quick S3 upload script for Windows
"""
import boto3
import os
from pathlib import Path

# 配置
BUCKET_NAME = 'sl-news-frontend'
REGION = 'us-east-2'
BUILD_DIR = 'build'

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

def upload_directory(directory_path, bucket_name, region):
    """递归上传目录到 S3"""
    # 创建 S3 客户端
    s3 = boto3.client('s3', region_name=region)
    
    uploaded_count = 0
    
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
            
            try:
                print(f"上传 {s3_path}...")
                s3.upload_file(
                    local_path,
                    bucket_name,
                    s3_path,
                    ExtraArgs=extra_args
                )
                uploaded_count += 1
                print(f"  ✓ 已上传 (Content-Type: {content_type})")
            except Exception as e:
                print(f"  ✗ 上传失败: {e}")
    
    return uploaded_count

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 开始上传前端到 S3")
    print("=" * 60)
    print()
    
    # 检查 build 目录是否存在
    if not os.path.exists(BUILD_DIR):
        print(f"❌ 错误: {BUILD_DIR} 目录不存在")
        print("请先运行: npm run build")
        exit(1)
    
    print(f"📁 找到 {BUILD_DIR} 目录")
    
    # 统计文件数量
    file_count = sum(len(files) for _, _, files in os.walk(BUILD_DIR))
    print(f"📊 总共需要上传 {file_count} 个文件")
    print()
    
    # 上传
    uploaded = upload_directory(BUILD_DIR, BUCKET_NAME, REGION)
    
    print()
    print("=" * 60)
    print(f"✅ 上传完成! 成功上传 {uploaded} 个文件")
    print("=" * 60)
    print()
    print(f"🌐 网站 URL: http://{BUCKET_NAME}.s3-website.{REGION}.amazonaws.com")
    print()

