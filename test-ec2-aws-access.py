#!/usr/bin/env python3
import boto3
import sys

try:
    # Test STS access
    sts = boto3.client('sts', region_name='us-east-2')
    identity = sts.get_caller_identity()
    print("✅ AWS credentials are working!")
    print(f"Account: {identity['Account']}")
    print(f"User ARN: {identity['Arn']}")
    print()
    
    # Test S3 access
    s3 = boto3.client('s3', region_name='us-east-2')
    response = s3.list_objects_v2(Bucket='sl-news-frontend', MaxKeys=5)
    print("✅ S3 access is working!")
    print(f"Bucket: sl-news-frontend")
    if 'Contents' in response:
        print(f"Files found: {len(response.get('Contents', []))}")
    else:
        print("Bucket is empty or no files found")
    
    sys.exit(0)
    
except Exception as e:
    print(f"❌ Error: {e}")
    print()
    print("Please configure AWS credentials:")
    print("1. Use IAM role (recommended)")
    print("2. Configure ~/.aws/credentials")
    sys.exit(1)

