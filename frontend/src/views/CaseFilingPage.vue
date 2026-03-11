<template>
  <div class="case-page">
    <!-- 面包屑 -->
    <a-breadcrumb class="page-breadcrumb">
      <a-breadcrumb-item>
        <HomeOutlined />
      </a-breadcrumb-item>
      <a-breadcrumb-item>日常业务</a-breadcrumb-item>
      <a-breadcrumb-item>案件立案</a-breadcrumb-item>
    </a-breadcrumb>

    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <h1 class="page-title">案件立案</h1>
      <a-button type="primary" @click="handleCreate">
        <template #icon>
          <PlusOutlined />
        </template>
        新建立案
      </a-button>
    </div>

    <!-- 筛选工具栏 -->
    <div class="page-card filter-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索案件编号、名称、被调查人..."
            class="search-input"
            allow-clear
          />
          <a-select v-model:value="filterType" placeholder="案件类型" allow-clear class="filter-select">
            <a-select-option value="discipline">违纪</a-select-option>
            <a-select-option value="illegal">违法</a-select-option>
            <a-select-option value="crime">职务犯罪</a-select-option>
          </a-select>
          <a-select v-model:value="filterStatus" placeholder="案件状态" allow-clear class="filter-select">
            <a-select-option value="preliminary">初核中</a-select-option>
            <a-select-option value="filed">已立案</a-select-option>
            <a-select-option value="closed">已结案</a-select-option>
            <a-select-option value="withdrawn">已撤案</a-select-option>
          </a-select>
          <a-select v-model:value="filterSource" placeholder="案件来源" allow-clear class="filter-select">
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="report">来自举报</a-select-option>
            <a-select-option value="other">其他来源</a-select-option>
          </a-select>
        </div>
        <div class="toolbar-right">
          <a-button @click="handleExport">
            <template #icon>
              <ExportOutlined />
            </template>
            导出
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
        :data-source="filteredData"
        :pagination="pagination"
        :loading="loading"
        :row-key="(record: any) => record.id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'caseNo'">
            <span class="case-no">{{ record.case_no }}</span>
          </template>
          <template v-if="column.key === 'suspectName'">
            <div class="person-info">
              <span class="person-name">{{ record.suspect_name }}</span>
              <span class="person-title">{{ record.suspect_position }}</span>
            </div>
          </template>
          <template v-if="column.key === 'type'">
            <a-tag>{{ record.caseType }}</a-tag>
          </template>
          <template v-if="column.key === 'caseLevel'">
            <a-tag>{{ record.caseLevel }}</a-tag>
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
              <a class="action-link" @click="handleClose(record)" v-if="record.status === 'filed'">
                <CheckOutlined /> 结案
              </a>
              <a class="action-link danger" @click="handleDelete(record)">
                <DeleteOutlined /> 删除
              </a>
            </span>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 新增/编辑案件弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      width="800px"
      :footer="null"
    >
      <a-form :model="formData" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }" :disabled="!isEdit">
        <a-tabs v-model:activeKey="activeTab">
          <a-tab-pane key="basic" tab="基本信息">
            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-item label="案件标题" required>
                  <a-input v-model:value="formData.title" placeholder="请输入案件标题" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="被调查人" required>
                  <a-input v-model:value="formData.suspect_name" placeholder="姓名" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="职务">
                  <a-input v-model:value="formData.suspect_position" placeholder="职务" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="单位">
                  <a-input v-model:value="formData.suspect_unit" placeholder="单位" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="案件类型" required>
                  <a-select v-model:value="formData.case_type" placeholder="请选择">
                    <a-select-option v-for="opt in caseService.getCaseTypeOptions()" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="案件等级">
                  <a-select v-model:value="formData.case_level" placeholder="请选择">
                    <a-select-option v-for="opt in caseService.getCaseLevelOptions()" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="案件来源">
                  <a-input v-model:value="formData.case_source" placeholder="请输入案件来源" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item label="主要内容">
              <a-textarea v-model:value="formData.main_content" :rows="4" placeholder="请输入案件主要内容" />
            </a-form-item>
            <a-form-item label="处理意见">
              <a-textarea v-model:value="formData.handling_opinion" :rows="3" placeholder="请输入处理意见" />
            </a-form-item>
          </a-tab-pane>

          <a-tab-pane key="evidence" tab="证据材料">
            <a-form-item label="附件上传">
              <a-upload-dragger>
                <p class="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p class="ant-upload-text">拖拽或点击上传证据材料</p>
              </a-upload-dragger>
            </a-form-item>
          </a-tab-pane>
        </a-tabs>
      </a-form>
      <div class="modal-footer">
        <a-space>
          <a-button danger @click="handleDelete" v-if="isEdit && currentRecord">删除</a-button>
          <a-button @click="handleModalCancel">关闭</a-button>
          <a-button type="primary" @click="handleModalOk" v-if="isEdit">保存</a-button>
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
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
  InboxOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { caseService, type Case, type CaseType, type CaseStatus } from '@/api'

// 表格列定义
const columns: TableColumnsType = [
  { title: '案件编号', dataIndex: 'case_no', key: 'caseNo', width: 150 },
  { title: '案件标题', dataIndex: 'title', key: 'title', ellipsis: true, width: 200 },
  { title: '被调查人', dataIndex: 'suspect_name', key: 'suspectName', width: 120 },
  { 
    title: '案件来源', 
    dataIndex: 'case_source', 
    key: 'caseSource', 
    width: 150,
    customRender: ({ record }) => {
      if (record.case_source && record.case_source.startsWith('举报：')) {
        return record.case_source
      }
      return record.case_source || '自行发现'
    }
  },
  { title: '案件类型', dataIndex: 'case_type', key: 'type', width: 100 },
  { title: '案件等级', dataIndex: 'case_level', key: 'caseLevel', width: 100 },
  { title: '立案日期', dataIndex: 'filing_date', key: 'filingDate', width: 120 },
  { title: '案件状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 180 }
]

// 状态数据
const loading = ref(false)
const searchText = ref('')
const filterType = ref<string | undefined>(undefined)
const filterStatus = ref<string | undefined>(undefined)
const filterSource = ref<string | undefined>(undefined)
const selectedRowKeys = ref<number[]>([])
const modalVisible = ref(false)
const modalTitle = ref('新建立案')
const activeTab = ref('basic')
const isEdit = ref(false)
const currentRecord = ref<Case | null>(null)

// 真实数据
const caseData = ref<Case[]>([])
const totalCount = ref(0)

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// 获取案件列表
const fetchCases = async () => {
  loading.value = true
  try {
    const result = await caseService.getCases({
      search: searchText.value || undefined,
      case_type: filterType.value as CaseType || undefined,
      status: filterStatus.value as CaseStatus || undefined,
      page: pagination.current,
      page_size: pagination.pageSize
    })
    caseData.value = result.results || []
    totalCount.value = result.count || 0
    pagination.total = totalCount.value
  } catch (error: any) {
    message.error(error.response?.data?.detail || '获取数据失败')
  } finally {
    loading.value = false
  }
}

// 监听筛选条件变化
watch([searchText, filterType, filterStatus, filterSource], () => {
  pagination.current = 1
  fetchCases()
}, { deep: true })

// 初始化
onMounted(() => {
  fetchCases()
})

// 表单数据
const formData = reactive({
  title: '',
  suspect_name: '',
  suspect_unit: '',
  suspect_position: '',
  case_type: undefined as CaseType | undefined,
  case_level: undefined as string | undefined,
  case_source: '',
  main_content: '',
  handling_opinion: ''
})

// 筛选后的数据（用于前端展示）
const filteredData = computed(() => {
  return caseData.value
    .filter(item => {
      // 案件来源筛选
      if (filterSource.value === 'report') {
        return item.case_source && item.case_source.startsWith('举报：')
      } else if (filterSource.value === 'other') {
        return !(item.case_source && item.case_source.startsWith('举报：'))
      }
      return true // 'all' 或未选择时不过滤
    })
    .map(item => ({
      ...item,
      caseNo: item.case_no,
      caseType: getTypeLabel(item.case_type),
      caseLevel: getLevelLabel(item.case_level),
      filingDate: item.filing_date,
      statusText: getStatusLabel(item.status)
    }))
})

// 状态映射
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    filed: 'processing',
    investigating: 'blue',
    reviewing: 'purple',
    closed: 'success',
    archived: 'default'
  }
  return map[status] || 'default'
}

const getTypeLabel = (type: string) => {
  const options = caseService.getCaseTypeOptions()
  return options.find(o => o.value === type)?.label || type
}

const getLevelLabel = (level: string) => {
  const options = caseService.getCaseLevelOptions()
  return options.find(o => o.value === level)?.label || level
}

const getStatusLabel = (status: string) => {
  const options = caseService.getStatusOptions()
  return options.find(o => o.value === status)?.label || status
}

// 操作方法
const handleView = (record: Case) => {
  modalTitle.value = '查看案件详情'
  isEdit.value = false
  currentRecord.value = record
  Object.assign(formData, {
    title: record.title,
    suspect_name: record.suspect_name,
    suspect_unit: record.suspect_unit || '',
    suspect_position: record.suspect_position || '',
    case_type: record.case_type,
    case_level: record.case_level,
    case_source: record.case_source,
    main_content: record.main_content,
    handling_opinion: record.handling_opinion || ''
  })
  activeTab.value = 'basic'
  modalVisible.value = true
}

const handleEdit = (record: Case) => {
  modalTitle.value = '编辑案件'
  isEdit.value = true
  currentRecord.value = record
  Object.assign(formData, {
    title: record.title,
    suspect_name: record.suspect_name,
    suspect_unit: record.suspect_unit || '',
    suspect_position: record.suspect_position || '',
    case_type: record.case_type,
    case_level: record.case_level,
    case_source: record.case_source,
    main_content: record.main_content,
    handling_opinion: record.handling_opinion || ''
  })
  activeTab.value = 'basic'
  modalVisible.value = true
}

const handleClose = async (record: Case) => {
  Modal.confirm({
    title: '确认结案',
    content: `确定要将案件 "${record.title}" 结案吗？`,
    onOk: async () => {
      try {
        await caseService.changeStatus(record.id, 'closed')
        message.success('结案成功')
        fetchCases()
      } catch (error: any) {
        message.error(error.response?.data?.detail || '结案失败')
      }
    }
  })
}

// 删除案件
const handleDelete = (record: Case) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除案件"${record.title}"吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        await caseService.deleteCase(record.id)
        message.success('删除成功')
        fetchCases()
      } catch (error: any) {
        message.error(error.response?.data?.detail || '删除失败')
      }
    }
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的案件')
    return
  }
  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个案件吗？`,
    okText: '确认',
    cancelText: '取消',
    okType: 'danger',
    onOk: async () => {
      try {
        for (const id of selectedRowKeys.value) {
          await caseService.deleteCase(id)
        }
        message.success('批量删除成功')
        selectedRowKeys.value = []
        fetchCases()
      } catch (error: any) {
        message.error(error.response?.data?.detail || '批量删除失败')
      }
    }
  })
}

// 行选择配置
const rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys: number[]) => {
    selectedRowKeys.value = keys
  }
}

const handleCreate = () => {
  modalTitle.value = '新建立案'
  isEdit.value = true
  currentRecord.value = null
  Object.assign(formData, {
    title: '',
    suspect_name: '',
    suspect_unit: '',
    suspect_position: '',
    case_type: undefined,
    case_level: undefined,
    case_source: '',
    main_content: '',
    handling_opinion: ''
  })
  activeTab.value = 'basic'
  modalVisible.value = true
}

const handleExport = () => {
  message.success('导出成功')
}

const handleModalOk = async () => {
  if (!formData.title || !formData.suspect_name || !formData.case_type) {
    message.warning('请填写必填项')
    return
  }
  try {
    if (isEdit.value && currentRecord.value) {
      await caseService.updateCase(currentRecord.value.id, {
        title: formData.title,
        suspect_name: formData.suspect_name,
        suspect_unit: formData.suspect_unit,
        suspect_position: formData.suspect_position,
        case_type: formData.case_type,
        case_level: formData.case_level,
        case_source: formData.case_source,
        main_content: formData.main_content,
        handling_opinion: formData.handling_opinion
      })
      message.success('更新成功')
    } else {
      await caseService.createCase({
        title: formData.title,
        suspect_name: formData.suspect_name,
        suspect_unit: formData.suspect_unit,
        suspect_position: formData.suspect_position,
        case_type: formData.case_type,
        case_level: formData.case_level || 'general',
        case_source: formData.case_source || '自行发现',
        main_content: formData.main_content,
        handling_opinion: formData.handling_opinion
      })
      message.success('保存成功')
    }
    modalVisible.value = false
    fetchCases()
  } catch (error: any) {
    message.error(error.response?.data?.detail || '操作失败')
  }
}

const handleModalCancel = () => {
  modalVisible.value = false
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchCases()
}
</script>

<style scoped>
.case-page {
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
  width: 300px;
}

.filter-select {
  width: 120px;
}

.case-no {
  font-family: monospace;
  color: #1890FF;
  font-weight: 500;
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

.amount {
  font-weight: 500;
  color: #f5222d;
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

.action-link.danger {
  color: #f5222d;
}

.action-link.danger:hover {
  color: #ff4d4f;
}

.modal-footer {
  text-align: right;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.form-hint {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
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
