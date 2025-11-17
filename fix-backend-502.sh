#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔧 后端 502 错误诊断和修复工具${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. 检查当前进程
echo -e "${YELLOW}1️⃣ 检查当前 uvicorn 进程...${NC}"
UVICORN_PIDS=$(ps aux | grep uvicorn | grep -v grep | awk '{print $2}')
if [ -n "$UVICORN_PIDS" ]; then
    echo -e "${GREEN}✅ 发现运行中的 uvicorn 进程:${NC}"
    ps aux | grep uvicorn | grep -v grep
    echo ""
    echo -e "${YELLOW}🔪 杀掉所有旧进程...${NC}"
    sudo pkill -9 -f uvicorn
    sleep 2
    echo -e "${GREEN}✅ 已清理旧进程${NC}"
else
    echo -e "${YELLOW}⚠️  没有发现运行中的 uvicorn 进程${NC}"
fi
echo ""

# 2. 检查端口占用
echo -e "${YELLOW}2️⃣ 检查端口 8000 占用情况...${NC}"
PORT_CHECK=$(sudo lsof -i :8000 2>/dev/null)
if [ -n "$PORT_CHECK" ]; then
    echo -e "${RED}❌ 端口 8000 仍被占用:${NC}"
    sudo lsof -i :8000
    echo ""
    echo -e "${YELLOW}🔪 强制释放端口...${NC}"
    sudo fuser -k 8000/tcp 2>/dev/null
    sleep 1
    echo -e "${GREEN}✅ 端口已释放${NC}"
else
    echo -e "${GREEN}✅ 端口 8000 空闲${NC}"
fi
echo ""

# 3. 检查 UFW 防火墙
echo -e "${YELLOW}3️⃣ 检查 UFW 防火墙...${NC}"
UFW_STATUS=$(sudo ufw status 2>/dev/null | grep "Status: active")
if [ -n "$UFW_STATUS" ]; then
    echo -e "${YELLOW}⚠️  UFW 防火墙已启用${NC}"
    UFW_8000=$(sudo ufw status | grep 8000)
    if [ -z "$UFW_8000" ]; then
        echo -e "${YELLOW}🔓 添加端口 8000 规则...${NC}"
        sudo ufw allow 8000/tcp
        echo -e "${GREEN}✅ 已允许端口 8000${NC}"
    else
        echo -e "${GREEN}✅ 端口 8000 已在防火墙规则中${NC}"
    fi
else
    echo -e "${GREEN}✅ UFW 防火墙未启用${NC}"
fi
echo ""

# 4. 检查 .env 文件
echo -e "${YELLOW}4️⃣ 检查环境配置...${NC}"
if [ -f "/home/ubuntu/backend/.env" ]; then
    echo -e "${GREEN}✅ 找到 .env 文件${NC}"
    # 检查关键配置
    if grep -q "DATABASE_URL" /home/ubuntu/backend/.env; then
        echo -e "${GREEN}✅ DATABASE_URL 已配置${NC}"
    else
        echo -e "${RED}❌ 缺少 DATABASE_URL 配置${NC}"
    fi
else
    echo -e "${RED}❌ 未找到 .env 文件${NC}"
    echo -e "${YELLOW}📝 创建 .env 文件...${NC}"
    cp /home/ubuntu/backend/.env.production /home/ubuntu/backend/.env 2>/dev/null || \
    cp /home/ubuntu/backend/.env.example /home/ubuntu/backend/.env 2>/dev/null
fi
echo ""

# 5. 检查虚拟环境
echo -e "${YELLOW}5️⃣ 检查 Python 虚拟环境...${NC}"
if [ -d "/home/ubuntu/backend/venv" ]; then
    echo -e "${GREEN}✅ 虚拟环境存在${NC}"
else
    echo -e "${RED}❌ 虚拟环境不存在${NC}"
    echo -e "${YELLOW}📦 创建虚拟环境...${NC}"
    cd /home/ubuntu/backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    echo -e "${GREEN}✅ 虚拟环境已创建${NC}"
fi
echo ""

# 6. 测试数据库连接
echo -e "${YELLOW}6️⃣ 测试数据库连接...${NC}"
cd /home/ubuntu/backend
source venv/bin/activate
python3 -c "
import asyncio
from app.database import engine

async def test_db():
    try:
        async with engine.connect() as conn:
            print('✅ 数据库连接成功')
            return True
    except Exception as e:
        print(f'❌ 数据库连接失败: {e}')
        return False

asyncio.run(test_db())
" 2>&1
echo ""

# 7. 启动后端服务
echo -e "${YELLOW}7️⃣ 启动后端服务...${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 启动 uvicorn 服务器${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}后端将在以下地址运行:${NC}"
echo -e "  • 本地: ${BLUE}http://localhost:8000${NC}"
echo -e "  • 公网: ${BLUE}http://182.221.125.254:8000${NC}"
echo -e "  • API 文档: ${BLUE}http://182.221.125.254:8000/api/docs${NC}"
echo ""
echo -e "${YELLOW}按 Ctrl+C 停止服务${NC}"
echo ""

cd /home/ubuntu/backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

