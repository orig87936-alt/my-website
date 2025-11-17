# 上传前端到 S3 的解决方案

由于本地没有配置 AWS CLI，我们有两个选择：

## 方案 1：配置 AWS CLI（推荐，一次配置永久使用）

1. 安装 AWS CLI（如果还没安装）
2. 配置 AWS 凭证：
   ```powershell
   aws configure
   ```
   输入：
   - AWS Access Key ID
   - AWS Secret Access Key  
   - Default region: us-east-2
   - Default output format: json

3. 然后运行：
   ```powershell
   python simple-upload-s3.py
   ```

## 方案 2：通过服务器上传（临时方案）

由于服务器上已经配置了 AWS CLI，我们可以：

1. 将 build 文件夹打包
2. 上传到服务器
3. 在服务器上解压并上传到 S3

我已经为你准备了自动化脚本：`upload-via-server.ps1`

运行：
```powershell
.\upload-via-server.ps1
```

## 方案 3：手动上传（最简单，但慢）

1. 登录 AWS 控制台
2. 进入 S3 服务
3. 找到 bucket: sl-news-frontend-20241115
4. 点击"上传"
5. 拖拽 build 文件夹中的所有文件
6. 点击"上传"

---

**推荐使用方案 2**，因为最快且不需要额外配置。

