# MinIO 文件上传功能部署指南

## 概述

本指南将帮助您在服务器上部署 MinIO 文件上传功能。

## 前置条件

- MinIO 容器已运行（端口 9000-9001）
- 后端服务已部署
- 数据库可访问

## 部署步骤

### 步骤1：上传代码到服务器

**方案A：使用 Git 同步（推荐）**

```bash
# 在本地提交代码
git add .
git commit -m "feat: 集成MinIO文件上传功能"
git push origin main

# 在服务器上拉取最新代码
cd /root/lianzhitong
git pull origin main
```

**方案B：使用 SCP 上传**

```bash
# 从本地上传到服务器
scp -r ./廉智通/backend/core/minio_client.py root@your-server-ip:/root/lianzhitong/backend/core/
scp -r ./廉智通/backend/core/views.py root@your-server-ip:/root/lianzhitong/backend/core/
scp -r ./廉智通/backend/core/urls.py root@your-server-ip:/root/lianzhitong/backend/core/
scp -r ./廉智通/backend/cases/models.py root@your-server-ip:/root/lianzhitong/backend/cases/
scp -r ./廉智通/backend/reports/models.py root@your-server-ip:/root/lianzhitong/backend/reports/
scp -r ./廉智通/backend/lianzhitong/settings.py root@your-server-ip:/root/lianzhitong/backend/lianzhitong/
scp -r ./廉智通/requirements.txt root@your-server-ip:/root/lianzhitong/
```

### 步骤2：安装依赖

```bash
# SSH 连接到服务器
ssh root@your-server-ip

# 进入项目目录
cd /root/lianzhitong

# 激活虚拟环境
source venv/bin/activate

# 安装 MinIO SDK
pip install minio>=7.2.0
```

### 步骤3：配置 MinIO

**检查 MinIO 容器状态：**

```bash
docker ps | grep minio
```

**访问 MinIO 控制台：**

打开浏览器访问：`http://192.168.182.128:9001`

- 默认用户名：`minioadmin`
- 默认密码：`minioadmin`

**（可选）修改 MinIO 访问凭证：**

如果您修改了 MinIO 的用户名和密码，需要更新 `settings.py` 中的配置：

```python
MINIO_ACCESS_KEY = 'your-access-key'
MINIO_SECRET_KEY = 'your-secret-key'
```

### 步骤4：创建数据库迁移

```bash
# 进入后端目录
cd /root/lianzhitong/backend

# 创建迁移文件
python3 manage.py makemigrations cases reports

# 应该看到类似输出：
# Migrations for 'cases':
#   cases/migrations/0005_alter_conclusion_and_evidence.py
#     - Add field report_file_url on conclusion
#     - Add field report_file_name on conclusion
#     - Add field report_object_name on conclusion
#     - Remove field file from evidence
#     - Add field file_url on evidence
#     - Add field file_name on evidence
#     - Add field object_name on evidence
# Migrations for 'reports':
#   reports/migrations/0005_alter_report_attachment.py
#     - Remove field attachment from report
#     - Add field attachment_url on report
#     - Add field attachment_name on report
#     - Add field attachment_object_name on report
```

### 步骤5：应用数据库迁移

```bash
# 备份数据库（重要！）
mysqldump -u root -p lianzhitong_db > /root/backup_before_minio_$(date +%Y%m%d_%H%M%S).sql

# 应用迁移
python3 manage.py migrate cases
python3 manage.py migrate reports

# 验证迁移结果
python3 manage.py showmigrations cases
python3 manage.py showmigrations reports
```

### 步骤6：测试 MinIO 连接

```bash
# 进入 Django shell
python3 manage.py shell

# 测试 MinIO 连接
from core.minio_client import minio_client
print("MinIO 客户端初始化成功")
print(f"存储桶名称: {minio_client.bucket_name}")
print(f"存储桶是否存在: {minio_client.client.bucket_exists(minio_client.bucket_name)}")

# 退出
exit()
```

### 步骤7：重启后端服务

```bash
# 如果使用 systemctl
systemctl restart gunicorn

# 如果使用 supervisorctl
supervisorctl restart lianzhitong

# 如果使用 Docker
docker restart backend

# 查看日志确认启动成功
tail -f /var/log/gunicorn/error.log
# 或
docker logs -f backend
```

### 步骤8：测试文件上传 API

```bash
# 测试文件上传
curl -X POST http://localhost:8000/api/upload/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/test.pdf" \
  -F "folder=conclusions"

# 预期返回：
# {
#   "url": "http://192.168.182.128:9000/lianzhitong/conclusions/xxxxx.pdf",
#   "filename": "test.pdf",
#   "size": 12345,
#   "object_name": "conclusions/xxxxx.pdf"
# }
```

## 前端集成

前端文件上传组件将在下一步创建，包括：

1. 文件上传组件（支持拖拽上传）
2. 文件预览功能
3. 上传进度显示
4. 文件下载功能

## 故障排查

### 问题1：MinIO 连接失败

**错误信息：** `Connection refused` 或 `Unable to connect to MinIO`

**解决方案：**

```bash
# 检查 MinIO 容器状态
docker ps | grep minio

# 如果容器未运行，启动容器
docker start minio

# 检查端口是否开放
netstat -tuln | grep 9000
```

### 问题2：存储桶创建失败

**错误信息：** `Access Denied` 或 `Bucket creation failed`

**解决方案：**

1. 检查 MinIO 访问凭证是否正确
2. 手动在 MinIO 控制台创建存储桶 `lianzhitong`
3. 设置存储桶策略为公开读取

### 问题3：文件上传失败

**错误信息：** `File upload failed`

**解决方案：**

```bash
# 检查文件大小限制
# 修改 settings.py 中的配置
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB

# 检查 MinIO 存储空间
docker exec minio df -h
```

### 问题4：数据库迁移失败

**错误信息：** `Migration failed`

**解决方案：**

```bash
# 查看详细错误信息
python3 manage.py migrate --verbosity 2

# 如果需要回滚
python3 manage.py migrate cases 0004
python3 manage.py migrate reports 0004

# 恢复数据库备份
mysql -u root -p lianzhitong_db < /root/backup_before_minio_20250111_120000.sql
```

## 安全建议

1. **修改 MinIO 默认密码**：
   ```bash
   docker exec -it minio mc admin user add myminio newuser newpassword
   ```

2. **配置 HTTPS**：
   - 为 MinIO 配置 SSL 证书
   - 修改 `settings.py` 中的 `MINIO_SECURE = True`

3. **限制文件类型**：
   - 在 `FileUploadView` 中配置允许的文件类型
   - 添加文件内容验证

4. **设置文件大小限制**：
   - 配置 Nginx 的 `client_max_body_size`
   - 配置 Django 的 `FILE_UPLOAD_MAX_MEMORY_SIZE`

## 下一步

完成后端部署后，继续进行前端集成：

1. 创建文件上传组件
2. 集成到结案报告页面
3. 实现文件预览功能
4. 测试完整流程

## 联系支持

如果在部署过程中遇到问题，请提供：

1. 错误日志
2. MinIO 容器状态
3. 数据库迁移状态
4. 服务器环境信息

