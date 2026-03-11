<template>
  <div class="template-page">
    <!-- 面包屑 -->
    <a-breadcrumb class="page-breadcrumb">
      <a-breadcrumb-item>
        <HomeOutlined />
      </a-breadcrumb-item>
      <a-breadcrumb-item>{{ parentMenu }}</a-breadcrumb-item>
      <a-breadcrumb-item>{{ pageTitle }}</a-breadcrumb-item>
    </a-breadcrumb>

    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <h1 class="page-title">{{ pageTitle }}</h1>
      <a-button type="primary" @click="handleCreate">
        <template #icon>
          <PlusOutlined />
        </template>
        新建
      </a-button>
    </div>

    <!-- 筛选工具栏 -->
    <div class="page-card filter-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索..."
            class="search-input"
            allow-clear
          />
        </div>
        <div class="toolbar-right">
          <a-button @click="handleExport">
            <template #icon>
              <ExportOutlined />
            </template>
            批量导出
          </a-button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="page-card data-card">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="pagination"
        :loading="loading"
        :row-key="(record: any) => record.id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'title'">
            <span class="record-title">{{ record.title }}</span>
          </template>
          <template v-if="column.key === 'status'">
            <a-badge :status="getStatusType(record.status)" :text="record.statusText" />
          </template>
          <template v-if="column.key === 'action'">
            <span class="action-links">
              <a class="action-link" @click="handleView(record)">
                <EyeOutlined /> 查看
              </a>
              <a class="action-link" @click="handleEdit(record)">
                <EditOutlined /> 编辑
              </a>
            </span>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  HomeOutlined,
  PlusOutlined,
  ExportOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { message } from 'ant-design-vue'

const props = defineProps<{
  pageTitle: string
  parentMenu: string
}>()

const searchText = ref('')
const loading = ref(false)
const dataSource = ref([
  { id: 1, title: '示例数据1', owner: '张三', status: 'processing', statusText: '处理中', date: '2025-01-20' },
  { id: 2, title: '示例数据2', owner: '李四', status: 'success', statusText: '已完成', date: '2025-01-18' },
  { id: 3, title: '示例数据3', owner: '王五', status: 'error', statusText: '待处理', date: '2025-01-22' },
])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: dataSource.value.length,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const columns: TableColumnsType = [
  { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true, width: 300 },
  { title: '负责人', dataIndex: 'owner', key: 'owner', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '日期', dataIndex: 'date', key: 'date', width: 120 },
  { title: '操作', key: 'action', width: 140 }
]

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    processing: 'processing',
    success: 'success',
    error: 'error'
  }
  return map[status] || 'default'
}

const handleCreate = () => {
  message.info(`新建${props.pageTitle}`)
}

const handleView = (record: any) => {
  message.info(`查看: ${record.title}`)
}

const handleEdit = (record: any) => {
  message.info(`编辑: ${record.title}`)
}

const handleExport = () => {
  message.success('导出成功')
}
</script>

<style scoped>
.template-page {
  padding: 0;
}

.page-breadcrumb {
  margin-bottom: 16px;
}

.page-breadcrumb :deep(.ant-breadcrumb) {
  color: #8c8c8c;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f1f1f;
  margin: 0;
}

.page-card {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
}

.filter-card {
  border-radius: 4px 4px 0 0;
  margin-bottom: 0;
}

.data-card {
  border-radius: 0 0 4px 4px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  width: 280px;
}

.record-title {
  font-weight: 500;
  color: #1f1f1f;
}

.action-links {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.action-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-right: 16px;
  color: #1890ff;
  cursor: pointer;
  font-size: 14px;
}

.action-link:hover {
  color: #40a9ff;
}

:deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  font-weight: 600;
  color: #1f1f1f;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background: #e6f7ff !important;
}
</style>
