<template>
  <div class="test-page">
    <a-breadcrumb class="page-breadcrumb">
      <a-breadcrumb-item>
        <HomeOutlined />
      </a-breadcrumb-item>
      <a-breadcrumb-item>测试</a-breadcrumb-item>
      <a-breadcrumb-item>文件上传测试</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">MinIO 文件上传功能测试</h1>
    </div>

    <div class="page-card">
      <a-alert
        message="测试说明"
        description="此页面用于测试 MinIO 文件上传功能，包括文件上传、预览、下载和删除。"
        type="info"
        show-icon
        style="margin-bottom: 24px;"
      />

      <a-divider>文件上传组件测试</a-divider>

      <FileUpload
        v-model="uploadedFiles"
        folder="test"
        @upload-success="handleUploadSuccess"
        @upload-error="handleUploadError"
      />

      <a-divider>测试结果</a-divider>

      <div class="test-results">
        <h3>测试日志</h3>
        <div class="log-container">
          <div v-for="(log, index) in logs" :key="index" class="log-item" :class="log.type">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>

      <a-divider>测试统计</a-divider>

      <a-row :gutter="16">
        <a-col :span="6">
          <a-statistic title="上传成功" :value="stats.uploadSuccess" :value-style="{ color: '#3f8600' }">
            <template #prefix>
              <CheckCircleOutlined />
            </template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="上传失败" :value="stats.uploadError" :value-style="{ color: '#cf1322' }">
            <template #prefix>
              <CloseCircleOutlined />
            </template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="已上传文件" :value="uploadedFiles.length" :value-style="{ color: '#1890ff' }">
            <template #prefix>
              <FileOutlined />
            </template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic title="总文件大小" :value="totalSize" suffix="KB" :value-style="{ color: '#722ed1' }">
            <template #prefix>
              <CloudUploadOutlined />
            </template>
          </a-statistic>
        </a-col>
      </a-row>

      <a-divider>操作按钮</a-divider>

      <a-space>
        <a-button type="primary" @click="clearLogs">
          清空日志
        </a-button>
        <a-button @click="clearFiles">
          清空文件列表
        </a-button>
        <a-button type="dashed" @click="exportLogs">
          导出日志
        </a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  HomeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileOutlined,
  CloudUploadOutlined
} from '@ant-design/icons-vue'
import FileUpload from '@/components/FileUpload.vue'

interface UploadedFile {
  url: string
  filename: string
  size: number
  object_name: string
}

interface LogItem {
  time: string
  message: string
  type: 'success' | 'error' | 'info'
}

const uploadedFiles = ref<UploadedFile[]>([])
const logs = ref<LogItem[]>([])
const stats = ref({
  uploadSuccess: 0,
  uploadError: 0
})

// 计算总文件大小（KB）
const totalSize = computed(() => {
  const bytes = uploadedFiles.value.reduce((sum, file) => sum + file.size, 0)
  return Math.round(bytes / 1024)
})

// 添加日志
const addLog = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  
  logs.value.unshift({
    time,
    message,
    type
  })

  // 限制日志数量
  if (logs.value.length > 50) {
    logs.value.pop()
  }
}

// 上传成功回调
const handleUploadSuccess = (file: UploadedFile) => {
  stats.value.uploadSuccess++
  addLog(`文件上传成功：${file.filename} (${Math.round(file.size / 1024)} KB)`, 'success')
  message.success(`文件上传成功：${file.filename}`)
}

// 上传失败回调
const handleUploadError = (error: any) => {
  stats.value.uploadError++
  const errorMsg = error.response?.data?.detail || error.message || '未知错误'
  addLog(`文件上传失败：${errorMsg}`, 'error')
  message.error(`文件上传失败：${errorMsg}`)
}

// 清空日志
const clearLogs = () => {
  logs.value = []
  stats.value = {
    uploadSuccess: 0,
    uploadError: 0
  }
  addLog('日志已清空', 'info')
}

// 清空文件列表
const clearFiles = () => {
  uploadedFiles.value = []
  addLog('文件列表已清空', 'info')
}

// 导出日志
const exportLogs = () => {
  const logText = logs.value.map(log => `[${log.time}] [${log.type.toUpperCase()}] ${log.message}`).join('\n')
  const blob = new Blob([logText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `minio-test-logs-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
  addLog('日志已导出', 'success')
}

// 初始化日志
addLog('MinIO 文件上传测试页面已加载', 'info')
</script>

<style scoped>
.test-page {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}

.page-breadcrumb {
  margin-bottom: 16px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f1f1f;
  margin: 0;
}

.page-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.test-results {
  margin-top: 16px;
}

.test-results h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1f1f1f;
}

.log-container {
  max-height: 400px;
  overflow-y: auto;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 12px;
}

.log-item {
  display: flex;
  gap: 12px;
  padding: 8px;
  margin-bottom: 4px;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'Consolas', 'Monaco', monospace;
}

.log-item.success {
  background: #f6ffed;
  border-left: 3px solid #52c41a;
}

.log-item.error {
  background: #fff2f0;
  border-left: 3px solid #ff4d4f;
}

.log-item.info {
  background: #e6f7ff;
  border-left: 3px solid #1890ff;
}

.log-time {
  color: #8c8c8c;
  font-weight: 600;
  min-width: 60px;
}

.log-message {
  color: #1f1f1f;
  flex: 1;
}
</style>


