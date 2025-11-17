# 为 EC2 配置 IAM 角色以访问 S3

## 方法 1: 使用 IAM 角色（推荐）

### 步骤 1: 创建 IAM 角色

1. 打开 AWS 控制台: https://console.aws.amazon.com/iam/
2. 点击左侧菜单 "Roles" (角色)
3. 点击 "Create role" (创建角色)
4. 选择 "AWS service" -> "EC2"
5. 点击 "Next"
6. 搜索并选择 "AmazonS3FullAccess" 策略
7. 点击 "Next"
8. 角色名称: `EC2-S3-Access-Role`
9. 点击 "Create role"

### 步骤 2: 将角色附加到 EC2 实例

1. 打开 EC2 控制台: https://console.aws.amazon.com/ec2/
2. 找到您的 EC2 实例 (IP: 18.221.125.254)
3. 选中实例，点击 "Actions" -> "Security" -> "Modify IAM role"
4. 选择刚创建的角色 `EC2-S3-Access-Role`
5. 点击 "Update IAM role"

### 步骤 3: 验证配置

在本地运行以下命令验证:

```powershell
ssh -i D:\download\sl-news-key.pem ubuntu@18.221.125.254 'aws sts get-caller-identity'
```

如果看到 AWS 账户信息，说明配置成功！

---

## 方法 2: 配置 AWS 凭证文件

如果您不想使用 IAM 角色，可以直接配置 AWS 凭证：

### 步骤 1: 获取 AWS 访问密钥

1. 打开 IAM 控制台: https://console.aws.amazon.com/iam/
2. 点击 "Users" -> 选择您的用户
3. 点击 "Security credentials" 标签
4. 点击 "Create access key"
5. 记录 Access Key ID 和 Secret Access Key

### 步骤 2: 在 EC2 上配置凭证

运行以下命令（替换为您的实际密钥）:

```powershell
# 连接到 EC2
ssh -i D:\download\sl-news-key.pem ubuntu@18.221.125.254

# 在 EC2 上执行
mkdir -p ~/.aws
cat > ~/.aws/credentials << 'EOF'
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
EOF

cat > ~/.aws/config << 'EOF'
[default]
region = us-east-2
output = json
EOF

chmod 600 ~/.aws/credentials
chmod 600 ~/.aws/config

# 验证
aws sts get-caller-identity
aws s3 ls s3://sl-news-frontend/
```

---

## 完成后

配置完成后，运行以下命令重新部署网站:

```powershell
.\upload-via-server.ps1
```

