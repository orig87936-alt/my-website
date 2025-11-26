# 修复繁体中文翻译字数限制问题

## 问题描述

用户上传包含繁体中文的 DOCX 文档后,繁体中文的正文内容无法正常显示在文本框中,只显示占位文本"繁体中文管理"。

## 根本原因

**DeepSeek API 的 `max_tokens` 限制导致长文本翻译被截断**

### 详细分析

1. **配置问题**:
   - `backend/.env` 中设置了 `DEEPSEEK_MAX_TOKENS=1000`
   - 这个值太小,无法处理长文本翻译

2. **代码问题**:
   - `backend/app/services/deepseek.py` 中虽然动态计算了 `max_tokens`,但上限设置为 16000
   - DeepSeek API 的实际限制是 **4096 tokens**,超过这个值会被截断

3. **翻译流程**:
   ```
   文档上传 → 解析内容块 → 逐块翻译 → 返回翻译结果
   ```
   - 每个内容块(段落)单独翻译
   - 如果单个段落超过 4096 tokens (~1300 字符),翻译会被截断

## 修复方案

### 1. 提升默认 `max_tokens` 值

**文件**: `backend/.env`

```bash
# 修改前
DEEPSEEK_MAX_TOKENS=1000

# 修改后
DEEPSEEK_MAX_TOKENS=4000
```

### 2. 调整代码中的 `max_tokens` 上限

**文件**: `backend/app/services/deepseek.py`

```python
# 修改前
max_tokens = max(2000, min(estimated_tokens, 16000))  # 最少 2000，最多 16000

# 修改后
max_tokens = max(2000, min(estimated_tokens, 4096))  # 最少 2000，最多 4096
```

### 3. 添加长文本警告

**文件**: `backend/app/services/deepseek.py`

```python
# 警告：如果文本太长，可能会被截断
if estimated_tokens > 4096:
    print(f"⚠️  WARNING: Text is too long ({len(text)} chars, ~{estimated_tokens} tokens). Translation may be truncated!")
    print(f"⚠️  Consider splitting the text into smaller chunks (max ~1300 chars per chunk)")
```

## 部署步骤

### 方法 1: 使用部署脚本(推荐)

```powershell
.\deploy-fix-translation-limit.ps1
```

### 方法 2: 手动部署

1. **上传修改后的文件**:
   ```powershell
   scp -i D:\download\sl-news-key.pem backend/.env ubuntu@18.221.125.254:/home/ubuntu/backend/.env
   scp -i D:\download\sl-news-key.pem backend/app/services/deepseek.py ubuntu@18.221.125.254:/home/ubuntu/backend/app/services/deepseek.py
   ```

2. **重启后端服务**:
   ```bash
   ssh -i D:\download\sl-news-key.pem ubuntu@18.221.125.254
   cd /home/ubuntu/backend
   sudo systemctl restart backend
   sudo systemctl status backend
   ```

## 测试验证

### 1. 上传测试文档

1. 访问: http://sl-news-frontend.s3-website.us-east-2.amazonaws.com
2. 登录管理员账号
3. 点击"创建新文章" → "上传文档"
4. 上传包含繁体中文的 DOCX 文档
5. 勾选"自动翻译"并选择"繁体中文"

### 2. 检查翻译结果

1. 等待上传和翻译完成
2. 检查繁体中文文本框中的内容是否完整
3. 对比原文档,确认没有内容被截断

### 3. 查看后端日志

```bash
ssh -i D:\download\sl-news-key.pem ubuntu@18.221.125.254
sudo journalctl -u backend -f
```

查找以下日志:
- `📊 Translation params:` - 查看 `text_length` 和 `max_tokens`
- `⚠️  WARNING: Text is too long` - 如果出现,说明段落太长

## 限制和建议

### DeepSeek API 限制

- **max_tokens**: 4096 tokens
- **估算**: 1 个中文字符 ≈ 2 tokens
- **建议**: 单个段落不超过 **1300 字符**

### 文档编写建议

1. **分段**: 将长段落拆分为多个短段落
2. **结构化**: 使用标题、列表等结构化内容
3. **测试**: 上传前先测试小文档

### 如果仍然被截断

如果单个段落超过 1300 字符,建议:

1. **手动分段**: 在 Word 文档中将长段落拆分
2. **使用列表**: 将长段落改为列表格式
3. **分批翻译**: 先上传部分内容,翻译后再补充

## 技术细节

### Token 估算公式

```python
estimated_tokens = int(len(text) * 3)  # 保守估计
```

- 中文: 1 字符 ≈ 2 tokens
- 英文: 1 字符 ≈ 0.5 tokens
- 翻译结果通常比原文长 20-50%
- 乘以 3 是为了保守估计

### 翻译流程

```python
# 文档上传 API (documents.py)
async def translate_to_language(target_lang: str):
    # 1. 翻译标题
    translated_title = await translation_service.translate_text(title, 'zh', target_lang)
    
    # 2. 翻译摘要
    translated_summary = await translation_service.translate_text(summary, 'zh', target_lang)
    
    # 3. 逐块翻译内容
    for block in content_blocks:
        if block.type in ['paragraph', 'heading', 'quote', 'list']:
            translated_text = await translation_service.translate_text(block.content, 'zh', target_lang)
```

## 相关文件

- `backend/.env` - 环境变量配置
- `backend/app/services/deepseek.py` - DeepSeek API 服务
- `backend/app/routers/documents.py` - 文档上传 API
- `backend/app/services/translation.py` - 翻译服务
- `deploy-fix-translation-limit.ps1` - 部署脚本

## 参考资料

- [DeepSeek API 文档](https://platform.deepseek.com/api-docs/)
- [OpenAI Tokenizer](https://platform.openai.com/tokenizer) - 用于估算 token 数量

