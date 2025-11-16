#!/bin/bash

# 后端更新脚本
# 用法: ./scripts/update-backend.sh

set -e  # 遇到错误立即退出

echo "🚀 开始更新后端..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 项目目录
PROJECT_DIR="/home/ubuntu/your-repo"
BACKEND_DIR="$PROJECT_DIR/backend"

# 1. 进入项目目录
echo -e "${YELLOW}📂 进入项目目录...${NC}"
cd $PROJECT_DIR

# 2. 备份当前版本
echo -e "${YELLOW}💾 备份当前版本...${NC}"
CURRENT_COMMIT=$(git rev-parse HEAD)
echo "当前版本: $CURRENT_COMMIT"

# 3. 拉取最新代码
echo -e "${YELLOW}📥 拉取最新代码...${NC}"
git fetch origin
git pull origin main

# 4. 检查是否有更新
NEW_COMMIT=$(git rev-parse HEAD)
if [ "$CURRENT_COMMIT" == "$NEW_COMMIT" ]; then
    echo -e "${GREEN}✅ 代码已是最新版本，无需更新${NC}"
    exit 0
fi

echo "新版本: $NEW_COMMIT"

# 5. 进入后端目录
cd $BACKEND_DIR

# 6. 激活虚拟环境
echo -e "${YELLOW}🐍 激活虚拟环境...${NC}"
source venv/bin/activate

# 7. 安装/更新依赖
echo -e "${YELLOW}📦 安装依赖...${NC}"
pip install -r requirements.txt --quiet

# 8. 运行数据库迁移
echo -e "${YELLOW}🗄️ 运行数据库迁移...${NC}"
alembic upgrade head

# 9. 重启服务
echo -e "${YELLOW}🔄 重启服务...${NC}"
sudo systemctl restart sl-news-backend

# 10. 等待服务启动
echo -e "${YELLOW}⏳ 等待服务启动...${NC}"
sleep 5

# 11. 健康检查
echo -e "${YELLOW}🏥 健康检查...${NC}"
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 后端更新成功！${NC}"
    echo -e "${GREEN}版本: $CURRENT_COMMIT → $NEW_COMMIT${NC}"
else
    echo -e "${RED}❌ 健康检查失败，正在回滚...${NC}"
    
    # 回滚代码
    cd $PROJECT_DIR
    git reset --hard $CURRENT_COMMIT
    
    # 重启服务
    sudo systemctl restart sl-news-backend
    
    echo -e "${RED}已回滚到版本: $CURRENT_COMMIT${NC}"
    exit 1
fi

# 12. 显示服务状态
echo -e "${YELLOW}📊 服务状态:${NC}"
sudo systemctl status sl-news-backend --no-pager | head -n 10

echo -e "${GREEN}🎉 更新完成！${NC}"

