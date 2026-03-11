<template>
  <div class="assist-party-page">
    <!-- 面包屑 -->
    <a-breadcrumb class="page-breadcrumb">
      <a-breadcrumb-item>
        <HomeOutlined />
      </a-breadcrumb-item>
      <a-breadcrumb-item>日常业务</a-breadcrumb-item>
      <a-breadcrumb-item>协助党委</a-breadcrumb-item>
    </a-breadcrumb>

    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <h1 class="page-title">协助党委工作</h1>
      <a-button type="primary" @click="handleCreate">
        <template #icon>
          <PlusOutlined />
        </template>
        新建任务
      </a-button>
    </div>

    <!-- 筛选工具栏 -->
    <div class="page-card filter-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索任务名称、负责人..."
            class="search-input"
            allow-clear
            @search="handleSearch"
          />
        </div>
        <div class="toolbar-right">
          <a-select
            v-model:value="filterStatus"
            placeholder="全部状态"
            allow-clear
            class="status-select"
            @change="handleFilterChange"
          >
            <a-select-option :value="0">待开始</a-select-option>
            <a-select-option :value="1">进行中</a-select-option>
            <a-select-option :value="2">已完成</a-select-option>
            <a-select-option :value="3">已逾期</a-select-option>
          </a-select>
          <a-button @click="handleExport">
            <template #icon>
              <ExportOutlined />
            </template>
            批量导出
          </a-button>
          <a-button danger @click="handleBatchDelete">
            <template #icon>
              <DeleteOutlined />
            </template>
            批量删除
          </a-button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="page-card">
      <a-table
        v-model:selected-row-keys="selectedRowKeys"
        :row-selection="rowSelection"
        :columns="columns"
        :data-source="filteredTasks"
        :pagination="pagination"
        :loading="loading"
        :row-key="(record: AssistPartyTask) => record.id"
        @change="handleTableChange"
      >
        <!-- 任务名称列 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'taskName'">
            <span class="task-name">{{ record.task_name }}</span>
          </template>

          <!-- 状态列 -->
          <template v-if="column.key === 'status'">
            <a-badge
              :status="TaskStatusMap[record.status]?.color || 'default'"
              :text="TaskStatusMap[record.status]?.text || '未知'"
            />
          </template>

          <!-- 进度列 -->
          <template v-if="column.key === 'progress'">
            <div class="progress-cell">
              <a-progress
                :percent="record.progress"
                :stroke-color="'#1890FF'"
                :show-info="true"
                size="small"
              />
            </div>
          </template>

          <!-- 操作列 -->
          <template v-if="column.key === 'action'">
            <span class="action-links">
              <a class="action-link" @click="handleView(record)">
                <EyeOutlined /> 查看
              </a>
              <a class="action-link" @click="handleEdit(record)">
                <EditOutlined /> 编辑
              </a>
              <a class="action-link danger" @click="handleDelete(record)">
                <DeleteOutlined /> 删除
              </a>
            </span>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 新建/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :destroyOnClose="true"
      :getContainer="false"
      :footer="null"
      @cancel="handleModalCancel"
    >
      <a-form :model="formData" layout="vertical" :disabled="!isEdit">
        <a-form-item label="任务名称" name="taskName">
          <a-input v-model:value="formData.taskName" placeholder="请输入任务名称" />
        </a-form-item>
        <a-form-item label="负责人" name="owner">
          <a-input v-model:value="formData.owner" placeholder="请输入负责人" />
        </a-form-item>
        <a-form-item label="截止日期" name="deadline">
          <a-date-picker v-model:value="formData.deadline" style="width: 100%" />
        </a-form-item>
        <a-form-item label="任务状态" name="status">
          <a-select v-model:value="formData.status" placeholder="请选择状态">
            <a-select-option :value="0">待开始</a-select-option>
            <a-select-option :value="1">进行中</a-select-option>
            <a-select-option :value="2">已完成</a-select-option>
            <a-select-option :value="3">已逾期</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="进度" name="progress">
          <a-slider v-model:value="formData.progress" :min="0" :max="100" />
        </a-form-item>
      </a-form>
      <div class="modal-footer" v-if="!isEdit">
        <a-button @click="handleModalCancel">关闭</a-button>
      </div>
      <div class="modal-footer" v-else>
        <a-space>
          <a-button @click="handleModalCancel">取消</a-button>
          <a-button type="primary" @click="handleModalOk">保存</a-button>
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import {
  HomeOutlined,
  PlusOutlined,
  ExportOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { message, Modal } from 'ant-design-vue'
import { caseService, type AssistPartyTask, type AssistPartyTaskStatus } from '@/api'
import dayjs from 'dayjs'

// 表格列定义
const columns: TableColumnsType = [
  {
    title: '任务编号',
    dataIndex: 'task_no',
    key: 'taskNo',
    width: 140
  },
  {
    title: '任务名称',
    dataIndex: 'task_name',
    key: 'taskName',
    ellipsis: true,
    width: 280
  },
  {
    title: '负责人',
    dataIndex: 'owner',
    key: 'owner',
    width: 100
  },
  {
    title: '任务状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '截止日期',
    dataIndex: 'deadline',
    key: 'deadline',
    width: 120
  },
  {
    title: '进度',
    dataIndex: 'progress',
    key: 'progress',
    width: 160
  },
  {
    title: '操作',
    key: 'action',
    width: 150
  }
]

// 状态映射
const TaskStatusMap: Record<number, { color: string; text: string }> = {
  0: { color: 'warning', text: '待开始' },
  1: { color: 'processing', text: '进行中' },
  2: { color: 'success', text: '已完成' },
  3: { color: 'error', text: '已逾期' }
}

// 状态
const loading = ref(false)
const tasks = ref<AssistPartyTask[]>([])
const searchText = ref('')
const filterStatus = ref<number | undefined>(undefined)
const selectedRowKeys = ref<number[]>([])
const modalVisible = ref(false)
const modalTitle = ref('新建任务')
const isEdit = ref(false)

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,     // 显示每页条数切换
  showQuickJumper: true,     // 显示快速跳转
  pageSizeOptions: ['10', '20', '50'], // 每页条数选项
  showTotal: (total: number) => `共 ${total} 条`
})

// 表单数据
const formData = reactive({
  id: 0,
  taskName: '',
  owner: '',
  deadline: null as any,
  status: 0 as AssistPartyTaskStatus,
  progress: 0
})

// 表单验证规则
const formRules = {
  taskName: [{ required: true, message: '请输入任务名称' }],
  owner: [{ required: true, message: '请输入负责人' }],
  deadline: [{ required: true, message: '请选择截止日期' }]
}

// 行选择配置
const rowSelection = {
  selectedRowKeys: computed(() => selectedRowKeys.value),
  onChange: (keys: number[]) => {
    selectedRowKeys.value = keys
  }
}

// 筛选后的任务列表
const filteredTasks = computed(() => {
  let result = [...tasks.value]

  // 搜索筛选 - 前端过滤（因为后端可能不支持模糊搜索）
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    result = result.filter(
      t =>
        (t.task_name && t.task_name.toLowerCase().includes(keyword)) ||
        (t.owner && t.owner.toLowerCase().includes(keyword))
    )
  }

  // 状态筛选
  if (filterStatus.value !== undefined) {
    result = result.filter(t => t.status === filterStatus.value)
  }

  return result
})

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const result = await caseService.getAssistPartyTasks({
      search: searchText.value || undefined,
      status: filterStatus.value as AssistPartyTaskStatus | undefined,
      page: pagination.current,
      page_size: pagination.pageSize
    })
    tasks.value = result.results || []
    pagination.total = result.count || 0
  } catch (error) {
    message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 状态筛选变化
const handleFilterChange = () => {
  pagination.current = 1
  loadData()
}

// 表格分页变化
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

// 新建任务
const handleCreate = () => {
  isEdit.value = true  // 新建任务时也设为可编辑
  modalTitle.value = '新建任务'
  formData.id = 0
  formData.taskName = ''
  formData.owner = ''
  formData.deadline = null
  formData.status = 0
  formData.progress = 0
  modalVisible.value = true
}

// 查看详情
const handleView = (record: AssistPartyTask) => {
  modalTitle.value = '查看任务详情'
  formData.id = record.id
  formData.taskName = record.task_name
  formData.owner = record.owner
  formData.deadline = record.deadline ? dayjs(record.deadline) : null
  formData.status = record.status
  formData.progress = record.progress
  modalVisible.value = true
}

// 编辑任务
const handleEdit = (record: AssistPartyTask) => {
  isEdit.value = true
  modalTitle.value = '编辑任务'
  formData.id = record.id
  formData.taskName = record.task_name
  formData.owner = record.owner
  formData.deadline = record.deadline ? dayjs(record.deadline) : null
  formData.status = record.status
  formData.progress = record.progress
  modalVisible.value = true
}

// 删除任务
const handleDelete = (record: AssistPartyTask) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除任务"${record.task_name}"吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        await caseService.deleteAssistPartyTask(record.id)
        message.success('删除成功')
        loadData()
      } catch (error) {
        message.error('删除失败')
      }
    }
  })
}

// 批量导出
const handleExport = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要导出的任务')
    return
  }
  message.success(`导出 ${selectedRowKeys.value.length} 条任务`)
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的任务')
    return
  }
  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个任务吗？`,
    okText: '确认',
    cancelText: '取消',
    okType: 'danger',
    onOk: async () => {
      try {
        for (const id of selectedRowKeys.value) {
          await caseService.deleteAssistPartyTask(id)
        }
        message.success('批量删除成功')
        selectedRowKeys.value = []
        loadData()
      } catch (error) {
        message.error('批量删除失败')
      }
    }
  })
}

// 弹窗确认
const handleModalOk = async () => {
  if (!formData.taskName || !formData.owner) {
    message.warning('请填写任务名称和负责人')
    return
  }

  try {
    const data = {
      task_name: formData.taskName,
      owner: formData.owner,
      deadline: formData.deadline ? dayjs(formData.deadline).format('YYYY-MM-DD') : undefined,
      status: formData.status,
      progress: formData.progress
    }

    if (isEdit.value) {
      await caseService.updateAssistPartyTask(formData.id, data)
      message.success('更新成功')
    } else {
      await caseService.createAssistPartyTask(data)
      message.success('创建成功')
    }

    modalVisible.value = false
    loadData()
  } catch (error) {
    message.error('保存失败')
  }
}

// 弹窗取消
const handleModalCancel = () => {
  modalVisible.value = false
}

// 初始化
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.assist-party-page {
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
  margin-bottom: 0;
  border-radius: 4px 4px 0 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  width: 280px;
}

.status-select {
  width: 120px;
}

/* 任务名称加粗 */
.task-name {
  font-weight: 500;
  color: #1f1f1f;
}

/* 进度条容器 */
.progress-cell {
  width: 150px;
}

/* 进度条样式优化 */
:deep(.ant-progress-inner) {
  background-color: #f0f0f0;
}

/* 操作链接样式 */
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
  transition: color 0.2s;
}

.action-link:hover {
  color: #40a9ff;
}

.action-link.danger {
  color: #f5222d;
  margin-right: 0;
}

.action-link.danger:hover {
  color: #ff4d4f;
}

/* 防止操作链接换行 */
:deep(.ant-table-tbody > tr > td:last-child) {
  white-space: nowrap;
}

/* 表格行样式 */
:deep(.ant-table-tbody > tr:hover > td) {
  background: #e6f7ff !important;
}

/* 表格头样式 - 简洁无边框 */
:deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  font-weight: 600;
  color: #1f1f1f;
  border-bottom: 1px solid #f0f0f0;
}

/* 无边框平铺设计 - 表格内容区 */
:deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px;
}

/* 移除表格外边框 */
:deep(.ant-table) {
  border: none;
  border-radius: 0;
}

/* 状态Badge样式优化 */
:deep(.ant-badge-status-text) {
  font-size: 14px;
}

/* 批量删除按钮样式 - 红色 */
:deep(.ant-btn-danger) {
  border-color: #f5222d;
  color: #f5222d;
}

:deep(.ant-btn-danger:hover) {
  border-color: #ff4d4f;
  color: #ff4d4f;
}

/* 分页样式优化 */
:deep(.ant-pagination) {
  margin: 16px 0;
}

/* 弹窗底部样式 */
.modal-footer {
  text-align: right;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
