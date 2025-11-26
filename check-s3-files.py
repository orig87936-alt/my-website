#!/usr/bin/env python3
"""
Check files in S3 bucket
"""
import boto3

s3 = boto3.client('s3', region_name='us-east-2')
bucket = 'sl-news-frontend'

print("=" * 60)
print("Checking S3 bucket:", bucket)
print("=" * 60)
print()

try:
    response = s3.list_objects_v2(Bucket=bucket)
    
    if 'Contents' not in response:
        print("❌ Bucket is empty!")
    else:
        objects = response['Contents']
        print(f"✅ Found {len(objects)} objects")
        print()
        print("Files:")
        for obj in sorted(objects, key=lambda x: x['Key']):
            print(f"  - {obj['Key']} ({obj['Size']} bytes)")
            
except Exception as e:
    print(f"❌ Error: {e}")

print()
print("=" * 60)

