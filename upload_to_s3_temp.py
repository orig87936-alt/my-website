#!/usr/bin/env python3
import boto3
import os
import mimetypes
from pathlib import Path

s3 = boto3.client('s3', region_name='us-east-2')
bucket_name = 'sl-news-frontend'
build_dir = '/home/ubuntu/frontend_build'

# MIME type mapping
mime_types_map = {
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
        s3_path = relative_path.replace('\\', '/')
        
        # Determine content type
        ext = os.path.splitext(file)[1].lower()
        content_type = mime_types_map.get(ext, 'application/octet-stream')
        
        # Upload file
        extra_args = {'ContentType': content_type}
        
        # Add cache control for static assets
        if ext in ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm']:
            extra_args['CacheControl'] = 'public, max-age=31536000'
        elif ext == '.html':
            extra_args['CacheControl'] = 'public, max-age=0, must-revalidate'
        
        try:
            s3.upload_file(local_path, bucket_name, s3_path, ExtraArgs=extra_args)
            print(f'✅ Uploaded: {s3_path}')
            uploaded_count += 1
        except Exception as e:
            print(f'❌ Error uploading {s3_path}: {e}')

print(f'\n✅ Total files uploaded: {uploaded_count}')
print(f'🌐 Website URL: http://{bucket_name}.s3-website.us-east-2.amazonaws.com')

