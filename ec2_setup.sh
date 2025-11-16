#!/bin/bash

# S&L News Backend - EC2 自动部署脚本
# 此脚本将自动安装所有依赖并配置后端服务

set -e  # 遇到错误立即退出

echo "=========================================="
echo "🚀 S&L News Backend 自动部署脚本"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 打印函数
print_step() {
    echo -e "${GREEN}[步骤 $1/$2]${NC} $3"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# 步骤 1: 更新系统
print_step 1 8 "更新系统包..."
sudo apt update -y
sudo apt upgrade -y
print_success "系统更新完成"
echo ""

# 步骤 2: 安装基础工具
print_step 2 8 "安装基础工具..."
sudo apt install -y software-properties-common curl wget git build-essential
print_success "基础工具安装完成"
echo ""

# 步骤 3: 安装 Python 3.11
print_step 3 8 "安装 Python 3.11..."
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt update -y
sudo apt install -y python3.11 python3.11-venv python3.11-dev
curl -sS https://bootstrap.pypa.io/get-pip.py | sudo python3.11
print_success "Python 3.11 安装完成"
python3.11 --version
pip3.11 --version
echo ""

# 步骤 4: 安装 PostgreSQL 客户端
print_step 4 8 "安装 PostgreSQL 客户端..."
sudo apt install -y postgresql-client
print_success "PostgreSQL 客户端安装完成"
psql --version
echo ""

# 步骤 5: 安装 Nginx
print_step 5 8 "安装 Nginx..."
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
print_success "Nginx 安装完成"
nginx -v
echo ""

# 步骤 6: 创建项目目录
print_step 6 8 "创建项目目录..."
mkdir -p /home/ubuntu/sl-news-platform
cd /home/ubuntu/sl-news-platform
print_success "项目目录创建完成"
echo ""

# 步骤 7: 显示系统信息
print_step 7 8 "系统信息汇总..."
echo "----------------------------------------"
echo "操作系统: $(lsb_release -d | cut -f2)"
echo "Python 版本: $(python3.11 --version)"
echo "Pip 版本: $(pip3.11 --version | cut -d' ' -f2)"
echo "Git 版本: $(git --version | cut -d' ' -f3)"
echo "Nginx 版本: $(nginx -v 2>&1 | cut -d'/' -f2)"
echo "PostgreSQL 客户端: $(psql --version | cut -d' ' -f3)"
echo "----------------------------------------"
print_success "系统信息检查完成"
echo ""

# 步骤 8: 完成
print_step 8 8 "基础环境安装完成！"
echo ""
echo "=========================================="
echo "✅ 基础环境安装成功！"
echo "=========================================="
echo ""
echo "下一步操作："
echo "1. 上传或克隆你的代码到 /home/ubuntu/sl-news-platform"
echo "2. 配置环境变量 (.env 文件)"
echo "3. 安装 Python 依赖"
echo "4. 运行数据库迁移"
echo "5. 配置 Systemd 服务"
echo ""
echo "当前目录: $(pwd)"
echo ""

