#!/bin/bash

# 廉智通项目生产环境部署脚本
# 适用于使用 SQLite 的部署场景

set -e  # 遇到错误立即退出

# 配置变量
PROJECT_NAME="lianzhitong"
PROJECT_DIR="/var/www/$PROJECT_NAME"
BACKUP_DIR="/var/backups/$PROJECT_NAME"
VENV_DIR="$PROJECT_DIR/venv"
BACKEND_DIR="$PROJECT_DIR/backend"
DB_FILE="$PROJECT_DIR/db.sqlite3"

echo "开始部署 $PROJECT_NAME 项目..."

# 1. 创建必要目录
echo "创建项目目录..."
sudo mkdir -p $PROJECT_DIR
sudo mkdir -p $BACKUP_DIR
sudo mkdir -p $PROJECT_DIR/media
sudo mkdir -p $PROJECT_DIR/static

# 2. 设置目录权限 - 这是关键步骤
echo "设置目录权限..."
sudo chown -R www-data:www-data $PROJECT_DIR
sudo chmod -R 755 $PROJECT_DIR
# 重要：确保 www-data 对整个项目目录有写入权限
sudo chmod 775 $PROJECT_DIR

# 3. 如果是从版本控制系统部署，请取消注释以下行
# cd $PROJECT_DIR
# git clone <your-repo-url> .
# sudo chown -R www-data:www-data $PROJECT_DIR

# 4. 创建 Python 虚拟环境
echo "创建 Python 虚拟环境..."
sudo -u www-data python3 -m venv $VENV_DIR
sudo -u www-data $VENV_DIR/bin/pip install --upgrade pip

# 5. 安装依赖
echo "安装项目依赖..."
sudo -u www-data $VENV_DIR/bin/pip install -r $BACKEND_DIR/requirements.txt

# 6. 备份现有数据库（如果有）
if [ -f "$DB_FILE" ]; then
    echo "备份现有数据库..."
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    sudo cp $DB_FILE $BACKUP_DIR/db_backup_$TIMESTAMP.sqlite3
fi

# 7. 运行数据库迁移
echo "执行数据库迁移..."
sudo -u www-data $VENV_DIR/bin/python $BACKEND_DIR/manage.py migrate --settings=lianzhitong.settings

# 8. 收集静态文件
echo "收集静态文件..."
sudo -u www-data $VENV_DIR/bin/python $BACKEND_DIR/manage.py collectstatic --noinput --settings=lianzhitong.settings

# 9. 创建超级用户（可选，交互式）
echo "是否创建超级用户？(y/n)"
read -r create_superuser
if [[ $create_superuser =~ ^[Yy]$ ]]; then
    sudo -u www-data $VENV_DIR/bin/python $BACKEND_DIR/manage.py createsuperuser --settings=lianzhitong.settings
fi

# 10. 设置数据库文件权限
echo "设置数据库文件权限..."
sudo chown www-data:www-data $DB_FILE
sudo chmod 664 $DB_FILE

# 11. 开启 WAL 模式以提升 SQLite 并发性能
echo "开启 SQLite WAL 模式..."
sudo -u www-data sqlite3 $DB_FILE "PRAGMA journal_mode=WAL;"
sudo -u www-data sqlite3 $DB_FILE "PRAGMA cache_size=10000;"
sudo -u www-data sqlite3 $DB_FILE "PRAGMA synchronous=NORMAL;"

# 12. 重启服务
echo "重启服务..."
sudo systemctl restart $PROJECT_NAME
sudo systemctl restart nginx

echo "部署完成！"
echo "项目目录: $PROJECT_DIR"
echo "数据库文件: $DB_FILE"
echo "服务名称: $PROJECT_NAME"