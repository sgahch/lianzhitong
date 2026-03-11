# MinIO 文件上传功能测试指南

## 测试清单

- [x] MinIO 容器运行正常
- [ ] 后端 API 测试（文件上传/删除）
- [ ] 前端组件测试（上传/预览/下载）
- [ ] 数据库迁移测试
- [ ] 完整流程测试

---

## 测试1：MinIO 容器运行正常 ✅

### 验证步骤

在服务器上执行：

```bash
# 检查 MinIO 容器状态
docker ps | grep minio

# 预期输出：
# 069b06eb4f49   minio/minio:RELEASE.2024-06-22T05-26-45Z   Up XX minutes   0.0.0.0:9000-9001->9000-9001/tcp
```

### 访问 MinIO 控制台

打开浏览器访问：`http://192.168.182.128:9001`

- 用户名：`minioadmin`
- 密码：`minioadmin`

### 验证结果

✅ MinIO 容器正常运行
✅ 端口 9000-9001 已映射
✅ 可以访问 MinIO 控制台

---

## 测试2：后端 API 测试（文件上传/删除）

### 准备工作

1. 确保已安装 MinIO SDK：

```bash
cd /root/lianzhitong
source venv/bin/activate
pip install minio>=7.2.0
```

2. 确保已安装 requests 库（用于测试）：

```bash
pip install requests
```

### 执行测试脚本

```bash
cd /root/lianzhitong/backend
python3 test_minio_api.py
```

### 预期输出

```
🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 
MinIO 文件上传功能测试
🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 

==================================================
测试1：MinIO 连接
==================================================
✅ MinIO 连接成功
   存储桶名称: lianzhitong
   存储桶存在: True

==================================================
测试2：文件上传
==================================================
✅ 文件上传成功
   文件URL: http://192.168.182.128:9000/lianzhitong/test/xxxxx.txt
   文件名: test_upload.txt
   文件大小: 38 字节
   对象名称: test/xxxxx.txt

==================================================
测试3：文件存在性检查
==================================================
✅ 文件存在: test/xxxxx.txt

==================================================
测试4：文件 URL 访问
==================================================
✅ 文件可访问
   URL: http://192.168.182.128:9000/lianzhitong/test/xxxxx.txt
   状态码: 200
   内容长度: 38 字节

==================================================
测试5：文件删除
==================================================
✅ 文件删除成功: test/xxxxx.txt
✅ 验证：文件已不存在

==================================================
测试总结
==================================================
✅ 所有测试完成
```

### 故障排查

**问题1：MinIO 连接失败**

```bash
# 检查 MinIO 容器
docker ps | grep minio

# 启动 MinIO 容器
docker start minio

# 查看 MinIO 日志
docker logs minio
```

**问题2：存储桶不存在**

手动在 MinIO 控制台创建存储桶：
1. 访问 `http://192.168.182.128:9001`
2. 登录后点击 "Buckets" → "Create Bucket"
3. 输入存储桶名称：`lianzhitong`
4. 点击 "Create Bucket"

**问题3：文件上传失败**

检查 settings.py 中的配置：
```python
MINIO_ENDPOINT = '192.168.182.128:9000'
MINIO_ACCESS_KEY = 'minioadmin'
MINIO_SECRET_KEY = 'minioadmin'
MINIO_BUCKET_NAME = 'lianzhitong'
MINIO_SECURE = False
```

---

## 测试3：数据库迁移测试

### 执行测试脚本

```bash
cd /root/lianzhitong/backend
python3 test_database_models.py
```

### 预期输出

```
🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 
数据库模型测试
🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 🔍 

==================================================
测试1：Conclusion 模型字段
==================================================
✅ Conclusion 模型字段完整
   包含字段: report_file_url, report_file_name, report_object_name

==================================================
测试2：Evidence 模型字段
==================================================
✅ Evidence 模型字段完整
   包含字段: file_url, file_name, object_name

==================================================
测试3：Report 模型字段
==================================================
✅ Report 模型字段完整
   包含字段: attachment_url, attachment_name, attachment_object_name

==================================================
测试4：模型实例化测试
==================================================
✅ Conclusion 模型实例化成功
✅ Evidence 模型实例化成功
✅ Report 模型实例化成功

==================================================
测试总结
==================================================
✅ 所有测试通过 (4/4)
```

### 创建数据库迁移

```bash
cd /root/lianzhitong/backend

# 创建迁移文件
python3 manage.py makemigrations cases reports

# 预期输出：
# Migrations for 'cases':
#   cases/migrations/0005_alter_conclusion_and_evidence.py
#     - Add field report_file_url on conclusion
#     - Add field report_file_name on conclusion
#     - Add field report_object_name on conclusion
#     - Alter field file on evidence
# Migrations for 'reports':
#   reports/migrations/0005_alter_report_attachment.py
#     - Add field attachment_url on report
#     - Add field attachment_name on report
#     - Add field attachment_object_name on report
```

### 应用数据库迁移

```bash
# 备份数据库（重要！）
mysqldump -u root -p lianzhitong_db > /root/backup_minio_$(date +%Y%m%d_%H%M%S).sql

# 应用迁移
python3 manage.py migrate cases
python3 manage.py migrate reports

# 验证迁移
python3 manage.py showmigrations cases
python3 manage.py showmigrations reports
```

---

## 测试4：前端组件测试（上传/预览/下载）

### 访问测试页面

1. 启动前端开发服务器（如果还没启动）：

```bash
cd /root/lianzhitong/frontend
npm run dev
```

2. 打开浏览器访问测试页面：

```
http://localhost:5173/test-file-upload
```

### 测试步骤

**测试1：文件上传**
1. 点击上传区域或拖拽文件
2. 选择一个测试文件（PDF、图片、Word 等）
3. 观察上传进度
4. 验证上传成功提示
5. 检查文件列表中是否显示已上传文件

**测试2：文件预览**
1. 点击已上传文件的"预览"按钮
2. 验证 PDF 文件是否能在 iframe 中预览
3. 验证图片文件是否能直接显示
4. 验证其他文件类型是否提示下载

**测试3：文件下载**
1. 点击已上传文件的"下载"按钮
2. 验证文件是否能正常下载
3. 验证下载的文件是否完整

**测试4：文件删除**
1. 点击已上传文件的"删除"按钮
2. 确认删除操作
3. 验证文件是否从列表中移除
4. 验证 MinIO 中的文件是否已删除

### 验证测试日志

在测试页面的"测试日志"区域，应该能看到：
- ✅ 文件上传成功的日志
- ✅ 文件大小信息
- ✅ 操作时间戳

### 验证测试统计

在测试页面的"测试统计"区域，应该能看到：
- 上传成功次数
- 上传失败次数
- 已上传文件数量
- 总文件大小

---

## 测试5：完整流程测试

### 场景1：结案报告文件上传

1. 登录系统
2. 进入"案件审理"页面
3. 创建或编辑一个结案报告
4. 在"结案报告"字段中上传文件
5. 保存结案报告
6. 验证文件 URL 是否正确保存到数据库
7. 重新打开结案报告，验证文件是否能预览/下载

### 场景2：证据材料上传

1. 进入"审查调查"页面
2. 选择一个案件
3. 添加证据材料
4. 上传证据文件
5. 保存证据
6. 验证证据文件是否正确保存

### 场景3：举报附件上传

1. 进入"信访举报"页面
2. 创建新举报
3. 上传举报附件
4. 保存举报
5. 验证附件是否正确保存

---

## 测试报告模板

### 测试环境

- 服务器IP：192.168.182.128
- MinIO 版本：RELEASE.2024-06-22T05-26-45Z
- Django 版本：4.2.x
- 数据库：MySQL 8.0

### 测试结果

| 测试项 | 状态 | 备注 |
|--------|------|------|
| MinIO 容器运行 | ✅ | 正常运行 |
| 后端 API 测试 | ⏳ | 待测试 |
| 数据库迁移 | ⏳ | 待测试 |
| 前端组件测试 | ⏳ | 待测试 |
| 完整流程测试 | ⏳ | 待测试 |

### 发现的问题

1. 问题描述
   - 解决方案
   - 状态

### 测试结论

- [ ] 所有测试通过，可以上线
- [ ] 部分测试失败，需要修复
- [ ] 测试未完成，需要继续

---

## 下一步

完成所有测试后：

1. 提交测试报告
2. 修复发现的问题
3. 部署到生产环境
4. 监控系统运行状态

## 联系支持

如有问题，请提供：
1. 测试日志
2. 错误截图
3. 服务器环境信息

