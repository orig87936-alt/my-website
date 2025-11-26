# 🔍 S3 网站诊断指南

## 问题：网站无法访问

根据你的截图，EC2 实例正在运行，但网站可能无法访问。让我们逐步检查：

## 步骤 1: 确认 S3 Bucket 名称

你的脚本中有两个不同的 bucket 名称：
- `upload-to-s3.ps1`: `sl-news-frontend-20241115`
- `simple-upload-s3.py`: `sl-news-frontend-20241115`

**请在 AWS 控制台检查**：
1. 打开 https://s3.console.aws.amazon.com/s3/buckets?region=us-east-2
2. 查看你实际创建的 bucket 名称是什么

## 步骤 2: 检查 S3 Bucket 配置

### 2.1 检查静态网站托管是否启用

1. 在 S3 控制台，点击你的 bucket
2. 点击 **Properties** (属性) 标签
3. 滚动到底部，找到 **Static website hosting** (静态网站托管)
4. 确认状态是 **Enabled** (已启用)
5. 记下网站端点 URL，应该类似：
   ```
   http://sl-news-frontend-20241115.s3-website.us-east-2.amazonaws.com
   ```

**如果未启用，请启用它**：
- 点击 **Edit**
- 选择 **Enable**
- Index document: `index.html`
- Error document: `index.html`
- 点击 **Save changes**

### 2.2 检查 Bucket 权限

1. 点击 **Permissions** (权限) 标签
2. 检查 **Block public access** (阻止公共访问)
   - 确保所有选项都是 **Off** (关闭)
   - 如果是 On，点击 **Edit** 并关闭所有选项

3. 检查 **Bucket policy** (存储桶策略)
   - 应该有类似这样的策略：
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Sid": "PublicReadGetObject",
               "Effect": "Allow",
               "Principal": "*",
               "Action": "s3:GetObject",
               "Resource": "arn:aws:s3:::sl-news-frontend-20241115/*"
           }
       ]
   }
   ```
   - 如果没有，点击 **Edit** 并添加上述策略（记得替换 bucket 名称）

### 2.3 检查文件是否已上传

1. 点击 **Objects** (对象) 标签
2. 确认你看到以下文件：
   - `index.html`
   - `assets/` 文件夹（包含 JS 和 CSS 文件）
   - 其他静态资源

**如果文件不存在，需要上传**。

## 步骤 3: 上传前端文件到 S3

### 方法 1: 使用 AWS 控制台（最简单）

1. 在本地运行构建：
   ```powershell
   npm run build
   ```

2. 在 S3 控制台，点击你的 bucket
3. 点击 **Upload** (上传)
4. 点击 **Add files** 或 **Add folder**
5. 选择 `build` 文件夹中的所有文件
6. 点击 **Upload**

### 方法 2: 使用 AWS CLI

首先配置 AWS CLI（如果还没有）：

```powershell
# 检查是否已安装
aws --version

# 如果未安装，下载安装：
# https://awscli.amazonaws.com/AWSCLIV2.msi

# 配置 AWS CLI
aws configure
```

然后上传文件：

```powershell
# 确认 bucket 名称
$BUCKET_NAME = "sl-news-frontend-20241115"  # 或你的实际 bucket 名称

# 构建前端
npm run build

# 上传到 S3
aws s3 sync build/ s3://$BUCKET_NAME/ --delete --region us-east-2

# 设置 index.html 不缓存
aws s3 cp build/index.html s3://$BUCKET_NAME/index.html --cache-control "no-cache" --region us-east-2
```

## 步骤 4: 测试网站

访问 S3 网站端点：
```
http://sl-news-frontend-20241115.s3-website.us-east-2.amazonaws.com
```

## 步骤 5: 如果还是不行

### 检查浏览器控制台

1. 打开浏览器开发者工具 (F12)
2. 查看 Console 标签，看是否有错误
3. 查看 Network 标签，看哪些请求失败了

### 常见问题

**问题 1: 403 Forbidden**
- 原因：Bucket 策略未正确配置
- 解决：检查步骤 2.2

**问题 2: 404 Not Found**
- 原因：文件未上传或路径错误
- 解决：检查步骤 2.3

**问题 3: CORS 错误**
- 原因：后端 API 的 CORS 配置问题
- 解决：检查后端的 CORS 设置

**问题 4: API 连接失败**
- 原因：前端配置的 API URL 不正确
- 解决：检查 `.env.production` 文件中的 `VITE_API_BASE_URL`

## 快速修复脚本

我为你创建了一个快速修复脚本，运行它来自动检查和修复常见问题：

```powershell
# 运行诊断
.\diagnose-s3-website.ps1
```

## 需要我帮助的信息

请告诉我：
1. 你的 S3 bucket 实际名称是什么？
2. 静态网站托管是否已启用？
3. 文件是否已上传到 S3？
4. 访问 S3 网站端点时看到什么错误？

有了这些信息，我可以帮你快速解决问题！

