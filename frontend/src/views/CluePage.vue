<template>
  <div class="clue-page">
    <a-breadcrumb class="page-breadcrumb">
      <a-breadcrumb-item>
        <HomeOutlined />
      </a-breadcrumb-item>
      <a-breadcrumb-item>日常业务</a-breadcrumb-item>
      <a-breadcrumb-item>线索处置</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">线索处置</h1>
      <a-button type="primary" @click="handleCreateClue">
        <template #icon>
          <PlusOutlined />
        </template>
        新建线索
      </a-button>
    </div>

    <div class="page-card filter-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索线索编号、被反映人..."
            class="search-input"
            allow-clear
          />
          <a-select v-model:value="filterSource" placeholder="线索来源" allow-clear class="filter-select">
            <a-select-option v-for="opt in clueService.getSourceOptions()" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </a-select-option>
          </a-select>
          <a-select v-model:value="filterStatus" placeholder="处置状态" allow-clear class="filter-select">
            <a-select-option v-for="opt in clueService.getStatusOptions()" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </a-select-option>
          </a-select>
        </div>
        <div class="toolbar-right">
          <a-button @click="handleBatchAssign">
            <template #icon>
              <TeamOutlined />
            </template>
            批量分配
          </a-button>
          <a-button @click="handleExport">
            <template #icon>
              <ExportOutlined />
            </template>
            导出
          </a-button>
        </div>
      </div>
    </div>

    <div class="page-card">
      <a-table
        :columns="columns"
        :data-source="filteredData"
        :pagination="pagination"
        :row-key="(record: any) => record.id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'clueNo'">
            <span class="clue-no">{{ record.clueNo }}</span>
          </template>
          <template v-if="column.key === 'reportedPerson'">
            <div class="person-info">
              <span class="person-name">{{ record.reportedPerson }}</span>
              <span class="person-title">{{ record.reportedTitle }}</span>
            </div>
          </template>
          <template v-if="column.key === 'source'">
            <a-tag :color="getSourceColor(record.source)">{{ record.sourceText }}</a-tag>
          </template>
          <template v-if="column.key === 'priority'">
            <a-tag :color="getPriorityColor(record.priority)">{{ record.priorityText }}</a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-badge :status="getStatusType(record.status)" :text="record.statusText" />
          </template>
          <template v-if="column.key === 'handler'">
            <a-avatar :size="28" :style="{ backgroundColor: '#1890FF' }">
              {{ record.handler ? record.handler.charAt(0) : '未' }}
            </a-avatar>
            <span class="handler-name">{{ record.handler || '未分配' }}</span>
          </template>
          <template v-if="column.key === 'action'">
            <span class="action-links">
              <a class="action-link" @click="handleView(record)">
                <EyeOutlined /> 查看
              </a>
              <a class="action-link" @click="handleAssign(record)" v-if="!record.handler">
                <UserAddOutlined /> 分配
              </a>
              <a class="action-link" @click="handleDispose(record)" v-if="record.status === 'pending'">
                <ToolOutlined /> 处置
              </a>
            </span>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 新建线索弹窗 -->
    <a-modal
      v-model:open="createModalVisible"
      title="新建线索"
      width="700px"
      :footer="null"
    >
      <a-form :model="createFormData" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="线索标题" required>
          <a-input v-model:value="createFormData.title" placeholder="请输入线索标题" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="被反映人" required>
              <a-input v-model:value="createFormData.reportedPerson" placeholder="姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="职务">
              <a-input v-model:value="createFormData.reportedTitle" placeholder="职务" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="线索来源" required>
              <a-select v-model:value="createFormData.source" placeholder="请选择">
                <a-select-option value="report">举报</a-select-option>
                <a-select-option value="audit">审计</a-select-option>
                <a-select-option value="discover">巡视/发现</a-select-option>
                <a-select-option value="transfer">其他部门移交</a-select-option>
                <a-select-option value="other">其他</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="问题分类">
              <a-select v-model:value="createFormData.category" placeholder="请选择">
                <a-select-option value="discipline">违纪</a-select-option>
                <a-select-option value="illegal">违法</a-select-option>
                <a-select-option value="duty">失职渎职</a-select-option>
                <a-select-option value="integrity">廉洁自律</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="发现人">
              <a-input v-model:value="createFormData.discoverer" placeholder="请输入（选填）" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系电话">
              <a-input v-model:value="createFormData.phone" placeholder="请输入（选填）" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="发现时间">
          <a-date-picker v-model:value="createFormData.discoverTime" style="width: 100%" placeholder="默认当前时间" allow-clear />
        </a-form-item>
        <a-form-item label="问题摘要" required>
          <a-textarea v-model:value="createFormData.content" :rows="4" placeholder="请简要描述问题线索" />
        </a-form-item>
        <a-form-item label="附件材料">
          <a-upload-dragger>
            <p class="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p class="ant-upload-text">点击或拖拽上传相关材料</p>
          </a-upload-dragger>
        </a-form-item>
      </a-form>
      <div class="modal-footer">
        <a-space>
          <a-button @click="createModalVisible = false">取消</a-button>
          <a-button type="primary" @click="handleCreateModalOk">保存</a-button>
        </a-space>
      </div>
    </a-modal>

    <!-- 查看详情弹窗 -->
    <a-modal
      v-model:open="viewModalVisible"
      title="线索详情"
      width="700px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="线索编号" :span="2">
          <span class="clue-no">{{ currentRecord.clue_no }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="线索标题" :span="2">
          {{ currentRecord.title }}
        </a-descriptions-item>
        <a-descriptions-item label="线索来源">
          <a-tag :color="getSourceColor(currentRecord.source)">{{ currentRecord.sourceText }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="处置状态">
          <a-badge :status="getStatusType(currentRecord.status)" :text="currentRecord.statusText" />
        </a-descriptions-item>
        <a-descriptions-item label="被反映人">
          {{ currentRecord.reported_person || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="职务">
          {{ currentRecord.reported_title || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="发现人">
          {{ currentRecord.discoverer || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="发现时间">
          {{ currentRecord.discover_time || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="问题摘要" :span="2">
          {{ currentRecord.content }}
        </a-descriptions-item>
        <a-descriptions-item label="承办人">
          {{ currentRecord.handler_name || '未分配' }}
        </a-descriptions-item>
        <a-descriptions-item label="登记时间">
          {{ currentRecord.created_at?.slice(0, 10) || '-' }}
        </a-descriptions-item>
      </a-descriptions>
      <div class="modal-footer">
        <a-space>
          <a-button @click="viewModalVisible = false">关闭</a-button>
        </a-space>
      </div>
    </a-modal>

    <!-- 分配弹窗 -->
    <a-modal
      v-model:open="assignModalVisible"
      title="分配线索"
      width="500px"
      :footer="null"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="线索编号">
          <span class="clue-no">{{ currentRecord.clueNo }}</span>
        </a-form-item>
        <a-form-item label="被反映人">
          <span>{{ currentRecord.reportedPerson }}</span>
        </a-form-item>
        <a-form-item label="分配给" required>
          <a-select v-model:value="assignFormData.handler" placeholder="请选择承办人">
            <a-select-option v-for="user in userOptions" :key="user.value" :value="user.value">
              {{ user.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="初核期限">
          <a-date-picker v-model:value="assignFormData.deadline" style="width: 100%" />
        </a-form-item>
      </a-form>
      <div class="modal-footer">
        <a-space>
          <a-button @click="assignModalVisible = false">取消</a-button>
          <a-button type="primary" @click="handleAssignModalOk">确认分配</a-button>
        </a-space>
      </div>
    </a-modal>

    <!-- 处置弹窗 -->
    <a-modal
      v-model:open="disposeModalVisible"
      title="线索处置"
      width="700px"
      :footer="null"
    >
      <a-form :model="disposeFormData" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="线索编号">
          <span class="clue-no">{{ currentRecord.clueNo }}</span>
        </a-form-item>
        <a-form-item label="处置方式" required>
          <a-radio-group v-model:value="disposeFormData.disposeType">
            <a-radio value="investigate">予以初核</a-radio>
            <a-radio value="filing">予以立案</a-radio>
            <a-radio value="close">予以了结</a-radio>
            <a-radio value="transfer">暂存待查</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="处置意见">
          <a-textarea v-model:value="disposeFormData.opinion" :rows="4" placeholder="请输入处置意见" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="承办人">
              <a-select v-model:value="disposeFormData.handler" placeholder="请选择">
                <a-select-option v-for="user in userOptions" :key="user.value" :value="user.value">
                  {{ user.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="完成期限">
              <a-date-picker v-model:value="disposeFormData.deadline" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <div class="modal-footer">
        <a-space>
          <a-button @click="disposeModalVisible = false">取消</a-button>
          <a-button type="primary" @click="handleDisposeModalOk">确认处置</a-button>
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import {
  HomeOutlined,
  PlusOutlined,
  ExportOutlined,
  TeamOutlined,
  EyeOutlined,
  UserAddOutlined,
  ToolOutlined,
  InboxOutlined
} from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { message, type Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { clueService, userService, type Clue, type ClueSource, type ClueStatus, type UserOption } from '@/api'

// 用户选项（从后端获取）
const userOptions = ref<UserOption[]>([
  { label: '张书记', value: 1 },
  { label: '李主任', value: 2 },
  { label: '王科长', value: 3 }
])

const columns: TableColumnsType = [
  { title: '线索编号', dataIndex: 'clue_no', key: 'clueNo', width: 150 },
  { title: '线索标题', dataIndex: 'title', key: 'title', ellipsis: true, width: 200 },
  { title: '线索来源', dataIndex: 'source', key: 'source', width: 120 },
  { title: '处置状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '发现人', dataIndex: 'discoverer', key: 'discoverer', width: 100 },
  { title: '发现时间', dataIndex: 'discover_time', key: 'discoverTime', width: 120 },
  { title: '登记时间', dataIndex: 'created_at', key: 'createdAt', width: 120 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' }
]

const loading = ref(false)
const searchText = ref('')
const filterSource = ref<string | undefined>(undefined)
const filterStatus = ref<string | undefined>(undefined)
const currentRecord = ref<Clue | null>(null)

// 真实数据
const clueData = ref<Clue[]>([])
const totalCount = ref(0)

// 查看详情
const viewModalVisible = ref(false)

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// 新建线索
const createModalVisible = ref(false)
const createFormData = reactive({
  source: undefined as ClueSource | undefined,
  title: '',
  content: '',
  discoverer: '',
  discoverTime: null as any,  // 日期选择器
  phone: ''
})

// 分配
const assignModalVisible = ref(false)
const assignFormData = reactive({
  handler: undefined as number | undefined,
  deadline: null as any
})

// 处置
const disposeModalVisible = ref(false)
const disposeFormData = reactive({
  disposeType: 'investigate',
  opinion: '',
  handler: undefined as number | undefined,
  deadline: null as any
})

// 获取线索列表
const fetchClues = async () => {
  loading.value = true
  try {
    const result = await clueService.getClues({
      search: searchText.value || undefined,
      source: filterSource.value as ClueSource || undefined,
      status: filterStatus.value as ClueStatus || undefined,
      page: pagination.current,
      page_size: pagination.pageSize
    })
    clueData.value = result.results || []
    totalCount.value = result.count || 0
    pagination.total = totalCount.value
  } catch (error: any) {
    message.error(error.response?.data?.detail || '获取数据失败')
  } finally {
    loading.value = false
  }
}

// 监听筛选条件变化
watch([searchText, filterSource, filterStatus], () => {
  pagination.current = 1
  fetchClues()
}, { deep: true })

// 初始化
onMounted(async () => {
  await fetchClues()
  // 获取用户选项
  userOptions.value = await userService.getUserOptions()
})

// 筛选后的数据
const filteredData = computed(() => {
  return clueData.value.map(item => ({
    ...item,
    clueNo: item.clue_no,
    discoverTime: item.discover_time || item.created_at?.slice(0, 10),
    createdAt: item.created_at?.slice(0, 10),
    statusText: getStatusLabel(item.status),
    sourceText: getSourceLabel(item.source),
    // 使用后端返回的 handler_name
    handler: item.handler_name || '未分配'
  }))
})

const getSourceColor = (source: string) => {
  const map: Record<string, string> = {
    report: 'red',
    audit: 'orange',
    discover: 'green',
    transfer: 'purple',
    other: 'blue'
  }
  return map[source] || 'default'
}

const getSourceLabel = (source: string) => {
  const options = clueService.getSourceOptions()
  return options.find(o => o.value === source)?.label || source
}

const getStatusLabel = (status: string) => {
  const options = clueService.getStatusOptions()
  return options.find(o => o.value === status)?.label || status
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    reviewed: 'blue',
    assigned: 'processing',
    investigating: 'processing',
    closed: 'success',
    filed: 'default'
  }
  return map[status] || 'default'
}

const handleView = (record: Clue) => {
  currentRecord.value = record
  viewModalVisible.value = true
}

const handleAssign = (record: Clue) => {
  currentRecord.value = record
  Object.assign(assignFormData, { handler: undefined, deadline: null })
  assignModalVisible.value = true
}

const handleDispose = (record: Clue) => {
  currentRecord.value = record
  Object.assign(disposeFormData, { disposeType: 'investigate', opinion: '', handler: undefined, deadline: null })
  disposeModalVisible.value = true
}

const handleCreateClue = () => {
  Object.assign(createFormData, {
    source: undefined, title: '', content: '', discoverer: '', discoverTime: dayjs(), phone: ''  // 默认当前日期
  })
  createModalVisible.value = true
}

const handleBatchAssign = () => {
  message.info('批量分配功能开发中...')
}

const handleExport = () => {
  message.success('导出成功')
}

const handleCreateModalOk = async () => {
  if (!createFormData.source || !createFormData.title || !createFormData.content) {
    message.warning('请填写必填项')
    return
  }
  try {
    await clueService.createClue({
      source: createFormData.source,
      title: createFormData.title,
      content: createFormData.content,
      discoverer: createFormData.discoverer,
      discover_time: createFormData.discoverTime ? dayjs(createFormData.discoverTime).format('YYYY-MM-DD') : undefined
    })
    message.success('保存成功')
    createModalVisible.value = false
    fetchClues()
  } catch (error: any) {
    message.error(error.response?.data?.detail || '创建失败')
  }
}

const handleAssignModalOk = async () => {
  if (!assignFormData.handler) {
    message.warning('请选择承办人')
    return
  }
  if (!currentRecord.value) return
  try {
    await clueService.assignClue(currentRecord.value.id, assignFormData.handler)
    message.success('分配成功')
    assignModalVisible.value = false
    fetchClues()
  } catch (error: any) {
    message.error(error.response?.data?.detail || '分配失败')
  }
}

const handleDisposeModalOk = async () => {
  if (!disposeFormData.opinion) {
    message.warning('请输入处置意见')
    return
  }
  if (!currentRecord.value) return
  try {
    if (disposeFormData.disposeType === 'close') {
      await clueService.closeClue(currentRecord.value.id, disposeFormData.opinion)
    } else if (disposeFormData.disposeType === 'filed') {
      await clueService.fileClue(currentRecord.value.id, disposeFormData.opinion)
    } else {
      await clueService.startInvestigation(currentRecord.value.id)
    }
    message.success('处置成功')
    disposeModalVisible.value = false
    fetchClues()
  } catch (error: any) {
    message.error(error.response?.data?.detail || '处置失败')
  }
}
</script>

<style scoped>
.clue-page {
  padding: 0;
}
.page-breadcrumb {
  margin-bottom: 16px;
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
.filter-select {
  width: 120px;
}
.clue-no {
  font-family: monospace;
  color: #1890FF;
}
.person-info {
  display: flex;
  flex-direction: column;
}
.person-name {
  font-weight: 500;
  color: #1f1f1f;
}
.person-title {
  font-size: 12px;
  color: #8c8c8c;
}
.handler-name {
  margin-left: 8px;
  font-size: 14px;
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
.modal-footer {
  text-align: right;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
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
</style>
