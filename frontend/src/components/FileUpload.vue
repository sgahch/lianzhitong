<template>
  <div class="file-upload-component">
    <a-upload-dragger
      v-model:fileList="fileList"
      name="file"
      :multiple="false"
      :before-upload="beforeUpload"
      :custom-request="customUpload"
      :show-upload-list="false"
      @change="handleChange"
    >
      <p class="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
      <p class="ant-upload-hint">
        支持格式：PDF、Word、Excel、图片（JPG、PNG、GIF）
        <br />
        文件大小不超过 10MB
      </p>
    </a-upload-dragger>

    <!-- 上传进度 -->
    <div v-if="uploading" class="upload-progress">
      <a-progress :percent="uploadProgress" status="active" />
      <p>正在上传...</p>
    </div>

    <!-- 已上传文件列表 -->
    <div v-if="uploadedFiles.length > 0" class="uploaded-files">
      <h4>已上传文件</h4>
      <div v-for="file in uploadedFiles" :key="file.url" class="file-item">
        <div class="file-info">
          <FileOutlined class="file-icon" />
          <span class="file-name">{{ file.filename }}</span>
          <span class="file-size">{{ formatFileSize(file.size) }}</span>
        </div>
        <div class="file-actions">
          <a-button type="link" size="small" @click="previewFile(file)">
            <EyeOutlined /> 预览
          </a-button>
          <a-button type="link" size="small" @click="downloadFile(file)">
            <DownloadOutlined /> 下载
          </a-button>
          <a-button type="link" size="small" danger @click="deleteFile(file)">
            <DeleteOutlined /> 删除
          </a-button>
        </div>
      </div>
    </div>

    <!-- 文件预览模态框 -->
    <a-modal
      v-model:visible="previewVisible"
      title="文件预览"
      :footer="null"
      width="80%"
      :body-style="{ height: '70vh', overflow: 'auto' }"
    >
      <div v-if="previewFile" class="file-preview">
        <!-- PDF 预览 -->
        <iframe
          v-if="isPDF(previewFile.filename)"
          :src="previewFile.url"
          style="width: 100%; height: 100%; border: none;"
        ></iframe>

        <!-- 图片预览 -->
        <img
          v-else-if="isImage(previewFile.filename)"
          :src="previewFile.url"
          style="max-width: 100%; height: auto;"
        />

        <!-- 其他文件类型提示 -->
        <div v-else class="unsupported-preview">
          <FileOutlined style="font-size: 48px; color: #999;" />
          <p>此文件类型不支持在线预览</p>
          <a-button type="primary" @click="downloadFile(previewFile)">
            <DownloadOutlined /> 下载文件
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  InboxOutlined,
  FileOutlined,
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import axios from 'axios'

interface UploadedFile {
  url: string
  filename: string
  size: number
  object_name: string
}

const props = defineProps<{
  folder?: string
  modelValue?: UploadedFile[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: UploadedFile[]): void
  (e: 'upload-success', file: UploadedFile): void
  (e: 'upload-error', error: any): void
}>()

const fileList = ref<any[]>([])
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadedFiles = ref<UploadedFile[]>(props.modelValue || [])
const previewVisible = ref(false)
const previewFile = ref<UploadedFile | null>(null)

// 上传前验证
const beforeUpload = (file: File) => {
  // 验证文件大小
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error('文件大小不能超过 10MB')
    return false
  }

  // 验证文件类型
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    message.error('不支持的文件类型')
    return false
  }

  return true
}

// 自定义上传
const customUpload = async (options: any) => {
  const { file, onSuccess, onError, onProgress } = options

  uploading.value = true
  uploadProgress.value = 0

  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', props.folder || 'files')

  try {
    const response = await axios.post('/api/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress({ percent: uploadProgress.value })
        }
      }
    })

    const uploadedFile: UploadedFile = response.data
    uploadedFiles.value.push(uploadedFile)
    emit('update:modelValue', uploadedFiles.value)
    emit('upload-success', uploadedFile)

    message.success('文件上传成功')
    onSuccess(response.data, file)
  } catch (error: any) {
    message.error(error.response?.data?.detail || '文件上传失败')
    emit('upload-error', error)
    onError(error)
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

// 处理文件变化
const handleChange = (info: any) => {
  fileList.value = info.fileList
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 判断是否为 PDF
const isPDF = (filename: string) => {
  return filename.toLowerCase().endsWith('.pdf')
}

// 判断是否为图片
const isImage = (filename: string) => {
  const ext = filename.toLowerCase()
  return ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png') || ext.endsWith('.gif')
}

// 预览文件
const handlePreviewFile = (file: UploadedFile) => {
  previewFile.value = file
  previewVisible.value = true
}

// 下载文件
const downloadFile = (file: UploadedFile) => {
  window.open(file.url, '_blank')
}

// 删除文件
const deleteFile = async (file: UploadedFile) => {
  try {
    await axios.delete('/api/delete-file/', {
      data: { object_name: file.object_name }
    })

    const index = uploadedFiles.value.findIndex(f => f.url === file.url)
    if (index > -1) {
      uploadedFiles.value.splice(index, 1)
      emit('update:modelValue', uploadedFiles.value)
    }

    message.success('文件删除成功')
  } catch (error: any) {
    message.error(error.response?.data?.detail || '文件删除失败')
  }
}
</script>

<style scoped>
.file-upload-component {
  width: 100%;
}

.upload-progress {
  margin-top: 16px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
}

.upload-progress p {
  margin-top: 8px;
  text-align: center;
  color: #666;
}

.uploaded-files {
  margin-top: 16px;
}

.uploaded-files h4 {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #1f1f1f;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  transition: all 0.3s;
}

.file-item:hover {
  background: #f5f5f5;
  border-color: #d9d9d9;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.file-icon {
  font-size: 20px;
  color: #1890ff;
}

.file-name {
  font-size: 14px;
  color: #1f1f1f;
  font-weight: 500;
}

.file-size {
  font-size: 12px;
  color: #8c8c8c;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.file-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.unsupported-preview {
  text-align: center;
  padding: 40px;
}

.unsupported-preview p {
  margin: 16px 0;
  color: #666;
}
</style>


