# MinIO 文件上传功能实现总结

## 已完成的工作

### 后端实现 ✅

1. **依赖安装**
   - 已添加 `minio>=7.2.0` 到 `requirements.txt`

2. **MinIO 配置**
   - 已在 `settings.py` 中添加 MinIO 配置
   - 端点：`192.168.182.128:9000`
   - 存储桶：`lianzhitong`

3. **MinIO 客户端工具类**
   - 文件：`backend/core/minio_client.py`
   - 功能：文件上传、下载、删除、URL 生成

4. **文件上传 API**
   - 文件：`backend/core/views.py`
   - 端点：`POST /api/upload/`
   - 端点：`DELETE /api/delete-file/`

5. **数据库模型修改**
   - `Conclusion` 模型：添加 `report_file_url`, `report_file_name`, `report_object_name`
   - `Evidence` 模型：添加 `file_url`, `file_name`, `object_name`
   - `Report` 模型：添加 `attachment_url`, `attachment_name`, `attachment_object_name`

### 前端实现 ✅

1. **文件上传组件**
   - 文件：`frontend/src/components/FileUpload.vue`
   - 功能：
     - 拖拽上传
     - 上传进度显示
     - 文件列表展示
     - 文件预览（PDF、图片）
     - 文件下载
     - 文件删除

## 下一步操作

### 服务器部署

请按照 `MINIO_DEPLOYMENT_GUIDE.md` 中的步骤操作：

1. 上传代码到服务器
2. 安装 MinIO SDK：`pip install minio>=7.2.0`
3. 创建数据库迁移
4. 应用数据库迁移
5. 重启后端服务
6. 测试文件上传 API

### 前端集成

需要在结案报告页面集成文件上传组件：

```vue
<template>
  <a-form-item label="结案报告">
    <FileUpload
      v-model="formData.reportFiles"
      folder="conclusions"
      @upload-success="handleUploadSuccess"
    />
  </a-form-item>
</template>

<script setup>
import FileUpload from '@/components/FileUpload.vue'

const formData = reactive({
  reportFiles: []
})

const handleUploadSuccess = (file) => {
  console.log('文件上传成功：', file)
}
</script>
```

## API 使用示例

### 上传文件

```bash
curl -X POST http://localhost:8000/api/upload/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/file.pdf" \
  -F "folder=conclusions"
```

**响应：**
```json
{
  "url": "http://192.168.182.128:9000/lianzhitong/conclusions/xxxxx.pdf",
  "filename": "file.pdf",
  "size": 12345,
  "object_name": "conclusions/xxxxx.pdf"
}
```

### 删除文件

```bash
curl -X DELETE http://localhost:8000/api/delete-file/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"object_name": "conclusions/xxxxx.pdf"}'
```

## 文件预览支持

- ✅ PDF 文件：iframe 在线预览
- ✅ 图片文件：直接显示
- ❌ Word/Excel：提示下载（需要额外的预览服务）

## 安全配置

1. **文件类型限制**：PDF、Word、Excel、图片
2. **文件大小限制**：10MB
3. **访问权限**：需要登录认证
4. **存储桶策略**：公开读取

## 注意事项

1. **数据库迁移**：需要在服务器上执行迁移，会修改表结构
2. **MinIO 访问**：确保 MinIO 容器正在运行
3. **网络访问**：确保前端可以访问 MinIO 的 9000 端口
4. **文件清理**：删除记录时需要同时删除 MinIO 中的文件

## 故障排查

### MinIO 连接失败

```bash
# 检查容器状态
docker ps | grep minio

# 启动容器
docker start minio

# 查看日志
docker logs minio
```

### 文件上传失败

1. 检查文件大小是否超过限制
2. 检查文件类型是否支持
3. 检查 MinIO 存储空间
4. 查看后端日志

### 文件预览失败

1. 检查文件 URL 是否可访问
2. 检查浏览器控制台错误
3. 确认文件类型是否支持预览

## 后续优化建议

1. **添加文件压缩**：上传前压缩图片
2. **添加缩略图**：为图片生成缩略图
3. **添加文件转换**：Word/Excel 转 PDF 预览
4. **添加文件加密**：敏感文件加密存储
5. **添加访问日志**：记录文件访问历史
6. **添加文件版本**：支持文件版本管理

## 联系支持

如有问题，请提供：
1. 错误日志
2. MinIO 容器状态
3. 数据库迁移状态
4. 文件上传请求详情

