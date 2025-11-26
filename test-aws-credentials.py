#!/usr/bin/env python3
"""
Test AWS credentials
"""
import boto3
import os

print("=" * 60)
print("🔍 检查 AWS 凭证")
print("=" * 60)
print()

# 检查环境变量
print("📋 环境变量:")
aws_vars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_DEFAULT_REGION', 'AWS_REGION']
for var in aws_vars:
    value = os.environ.get(var)
    if value:
        # 只显示前几个字符
        masked = value[:4] + '...' if len(value) > 4 else '***'
        print(f"  ✓ {var}: {masked}")
    else:
        print(f"  ✗ {var}: 未设置")

print()

# 检查 AWS 配置文件
print("📁 AWS 配置文件:")
aws_config_path = os.path.expanduser('~/.aws/credentials')
if os.path.exists(aws_config_path):
    print(f"  ✓ 找到配置文件: {aws_config_path}")
else:
    print(f"  ✗ 未找到配置文件: {aws_config_path}")

print()

# 尝试连接 AWS
print("🔌 测试 AWS 连接:")
try:
    sts = boto3.client('sts')
    identity = sts.get_caller_identity()
    print("  ✅ 连接成功!")
    print(f"  账户 ID: {identity['Account']}")
    print(f"  用户 ARN: {identity['Arn']}")
    print()
    
    # 测试 S3 访问
    print("🪣 测试 S3 访问:")
    s3 = boto3.client('s3', region_name='us-east-2')
    buckets = s3.list_buckets()
    print(f"  ✅ 可以访问 S3")
    print(f"  找到 {len(buckets['Buckets'])} 个 bucket:")
    for bucket in buckets['Buckets']:
        print(f"    - {bucket['Name']}")
    
except Exception as e:
    print(f"  ❌ 连接失败: {e}")
    print()
    print("💡 解决方法:")
    print("  1. 运行: aws configure")
    print("  2. 或设置环境变量:")
    print("     $env:AWS_ACCESS_KEY_ID='your-key-id'")
    print("     $env:AWS_SECRET_ACCESS_KEY='your-secret-key'")
    print("     $env:AWS_DEFAULT_REGION='us-east-2'")

print()
print("=" * 60)

