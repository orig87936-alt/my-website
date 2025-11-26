import boto3

# 配置
BUCKET_NAME = 'sl-news-frontend'
REGION = 'us-east-2'

# 创建 S3 客户端（使用默认凭证）
s3 = boto3.client('s3', region_name=REGION)

# 上传诊断页面
print("📤 上传诊断页面到 S3...")
s3.upload_file(
    'public/diagnostic.html',
    BUCKET_NAME,
    'diagnostic.html',
    ExtraArgs={
        'ContentType': 'text/html',
        'CacheControl': 'no-cache, no-store, must-revalidate'
    }
)

print("✅ 上传成功！")
print(f"🌐 访问: http://{BUCKET_NAME}.s3-website.{REGION}.amazonaws.com/diagnostic.html")

