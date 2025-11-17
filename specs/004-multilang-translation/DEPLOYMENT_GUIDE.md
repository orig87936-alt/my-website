# 多语言翻译功能 - 部署指南

**版本**: 1.0.0  
**最后更新**: 2025-11-17  
**分支**: `004-multilang-translation`

---

## 📋 部署前检查清单

### 1. 环境准备

- [ ] 确认 `DEEPSEEK_API_KEY` 环境变量已配置
- [ ] 确认 `DATABASE_URL` 环境变量已配置
- [ ] 确认数据库可访问（PostgreSQL 15+）
- [ ] 确认 Node.js 18+ 已安装
- [ ] 确认 Python 3.11+ 已安装
- [ ] 确认 Git 仓库状态干净（无未提交更改）

### 2. 代码审查

- [ ] 所有测试通过
- [ ] 代码已经过审查
- [ ] 文档已更新
- [ ] 变更日志已更新

### 3. 数据库备份

- [ ] 创建生产数据库备份
- [ ] 验证备份文件完整性
- [ ] 测试备份恢复流程

---

## 🚀 部署步骤

### 方法 1: 使用自动化脚本（推荐）

```bash
# 1. 切换到功能分支
git checkout 004-multilang-translation

# 2. 拉取最新代码
git pull origin 004-multilang-translation

# 3. 设置环境变量
export DATABASE_URL="postgresql://user:password@host:port/database"
export DEEPSEEK_API_KEY="your_api_key"

# 4. 运行部署脚本
bash scripts/deploy-multilang.sh
```

脚本会自动执行以下步骤：
1. ✅ 检查Git分支和状态
2. ✅ 创建数据库备份
3. ✅ 运行数据库迁移
4. ✅ 验证迁移结果
5. ✅ 运行测试
6. ✅ 构建前端
7. ✅ 重启服务

### 方法 2: 手动部署

#### 步骤 1: 数据库备份

```bash
# 创建备份目录
mkdir -p backups

# 备份数据库
pg_dump -h your_host -U your_user -d your_database > backups/db_backup_$(date +%Y%m%d_%H%M%S).sql
```

#### 步骤 2: 运行数据库迁移

```bash
cd backend

# 查看当前迁移版本
alembic current

# 运行迁移
alembic upgrade head

# 验证迁移
alembic current
```

#### 步骤 3: 验证数据库变更

```bash
cd backend

python3 << EOF
from sqlalchemy import create_engine, text
import os

engine = create_engine(os.getenv('DATABASE_URL'))
with engine.connect() as conn:
    result = conn.execute(text("""
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'articles' 
        AND column_name LIKE '%_zh_tw'
        ORDER BY column_name;
    """))
    columns = result.fetchall()
    print(f"Found {len(columns)} zh-tw columns:")
    for col in columns:
        print(f"  - {col[0]}")
    assert len(columns) == 5, f"Expected 5 columns, found {len(columns)}"
    print("✅ Migration verification successful")
EOF
```

#### 步骤 4: 运行测试

```bash
# 后端测试
cd backend
python test_multilang_translation.py

# 前端构建测试
cd ..
npm ci
npm run build
```

#### 步骤 5: 部署前端

```bash
# 构建生产版本
npm run build

# 部署到服务器（根据你的部署方式）
# 例如：rsync, scp, AWS S3, etc.
```

#### 步骤 6: 重启后端服务

```bash
# 根据你的部署方式重启服务
# 例如：
sudo systemctl restart your-backend-service

# 或使用 PM2
pm2 restart your-backend-app
```

---

## 🧪 部署后验证

### 1. 健康检查

```bash
# 检查后端服务状态
curl http://your-backend-url/health

# 检查前端访问
curl http://your-frontend-url
```

### 2. 功能测试

#### 测试翻译服务

```bash
curl -X POST http://your-backend-url/api/v1/translation/translate-multiple \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "text": "测试文本",
    "source_lang": "zh",
    "target_langs": ["en", "ja", "es"]
  }'
```

预期响应：
```json
{
  "results": {
    "en": {"translated_text": "Test text", "cached": false, "error": null},
    "ja": {"translated_text": "テストテキスト", "cached": false, "error": null},
    "es": {"translated_text": "Texto de prueba", "cached": false, "error": null}
  },
  "source_lang": "zh",
  "total_langs": 3,
  "success_count": 3,
  "failed_count": 0
}
```

#### 测试文档上传

1. 访问新闻管理页面
2. 点击"上传文档"
3. 选择一个Markdown文件
4. 勾选"自动翻译"
5. 选择多种目标语言
6. 上传并验证翻译结果

#### 测试新闻编辑

1. 访问新闻页面
2. 点击焦点新闻的"编辑"按钮
3. 输入简体中文内容
4. 点击"翻译到其他 7 种语言"
5. 验证所有语言字段自动填充
6. 保存并验证

#### 测试语言切换

1. 访问首页
2. 切换到阿拉伯语（ar）
3. 验证页面布局切换到RTL
4. 验证文本对齐正确
5. 切换回其他语言验证恢复正常

### 3. 性能监控

```bash
# 检查翻译缓存命中率
cd backend
python3 << EOF
from app.database import SessionLocal
from app.models.translation import TranslationCache
from datetime import datetime, timedelta

db = SessionLocal()

# 总缓存条目
total = db.query(TranslationCache).count()

# 最近24小时的缓存
recent = db.query(TranslationCache).filter(
    TranslationCache.created_at >= datetime.utcnow() - timedelta(days=1)
).count()

print(f"Total cache entries: {total}")
print(f"Cache entries (last 24h): {recent}")

db.close()
EOF
```

---

## 🔄 回滚步骤

如果部署后发现问题，可以使用以下方法回滚：

### 方法 1: 使用回滚脚本（推荐）

```bash
bash scripts/rollback-multilang.sh
```

脚本会：
1. 显示当前迁移版本
2. 确认回滚操作
3. 回滚数据库迁移
4. 验证回滚结果
5. 可选：从备份恢复数据库

### 方法 2: 手动回滚

#### 步骤 1: 回滚数据库迁移

```bash
cd backend

# 查看当前版本
alembic current

# 回滚一个版本
alembic downgrade -1

# 验证回滚
alembic current
```

#### 步骤 2: 从备份恢复（如果需要）

```bash
# 找到最新的备份文件
ls -lt backups/

# 恢复数据库
psql -h your_host -U your_user -d your_database < backups/db_backup_YYYYMMDD_HHMMSS.sql
```

#### 步骤 3: 重新部署旧版本

```bash
# 切换到主分支
git checkout main

# 重新构建和部署
npm run build
# ... 部署步骤
```

---

## 📊 监控指标

部署后需要监控以下指标：

### 1. 翻译服务性能

- 平均翻译时间（目标：< 2秒/语言）
- 缓存命中率（目标：> 80%）
- 翻译失败率（目标：< 1%）

### 2. 数据库性能

- 查询响应时间
- 连接池使用率
- 新增列的索引性能

### 3. 前端性能

- 页面加载时间
- 语言切换响应时间（目标：< 200ms）
- RTL布局渲染性能

---

## 🐛 常见问题

### 问题 1: 迁移失败

**症状**: `alembic upgrade head` 失败

**解决方案**:
```bash
# 检查当前版本
alembic current

# 查看迁移历史
alembic history

# 如果卡在某个版本，尝试手动修复
alembic stamp head
```

### 问题 2: 翻译服务不可用

**症状**: 翻译API返回错误

**解决方案**:
1. 检查 `DEEPSEEK_API_KEY` 是否正确
2. 检查API配额是否用完
3. 检查网络连接
4. 查看后端日志

### 问题 3: RTL布局错乱

**症状**: 阿拉伯语页面布局不正确

**解决方案**:
1. 清除浏览器缓存
2. 检查 `document.documentElement.dir` 是否设置为 "rtl"
3. 检查CSS是否正确加载
4. 使用浏览器开发工具检查元素样式

### 问题 4: 缓存未生效

**症状**: 相同内容重复翻译

**解决方案**:
```bash
# 检查缓存表
cd backend
python3 << EOF
from app.database import SessionLocal
from app.models.translation import TranslationCache

db = SessionLocal()
count = db.query(TranslationCache).count()
print(f"Cache entries: {count}")

# 查看最近的缓存
recent = db.query(TranslationCache).order_by(
    TranslationCache.created_at.desc()
).limit(5).all()

for cache in recent:
    print(f"  {cache.source_lang} -> {cache.target_lang}: {cache.cache_key[:16]}...")

db.close()
EOF
```

---

## 📞 支持

如有问题，请联系：
- 开发团队
- 查看日志文件
- 查看 GitHub Issues

---

**部署成功后，请更新此文档的部署日期和版本号！**

