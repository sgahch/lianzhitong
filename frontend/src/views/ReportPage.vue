<template>
  <div class="report-page">
    <!-- 面包屑 -->
    <a-breadcrumb class="page-breadcrumb">
      <a-breadcrumb-item>
        <HomeOutlined />
      </a-breadcrumb-item>
      <a-breadcrumb-item>日常业务</a-breadcrumb-item>
      <a-breadcrumb-item>信访举报</a-breadcrumb-item>
    </a-breadcrumb>

    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <h1 class="page-title">信访举报</h1>
      <a-button type="primary" @click="handleCreate">
        <template #icon>
          <PlusOutlined />
        </template>
        新增举报
      </a-button>
    </div>

    <!-- 筛选工具栏 -->
    <div class="page-card filter-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索举报人、编号、内容..."
            class="search-input"
            allow-clear
          />
          <a-select v-model:value="filterType" placeholder="举报方式" allow-clear class="filter-select">
            <a-select-option v-for="opt in reportService.getReportTypeOptions()" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </a-select-option>
          </a-select>
          <a-select v-model:value="filterStatus" placeholder="受理状态" class="filter-select">
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="opt in reportService.getStatusOptions()" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </a-select-option>
          </a-select>
        </div>
        <div class="toolbar-right">
          <a-button @click="handleBatchAccept">
            <template #icon>
              <CheckOutlined />
            </template>
            批量受理
          </a-button>
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
          <template v-if="column.key === 'reportNo'">
            <span class="report-no">{{ record.reportNo }}</span>
          </template>
          <template v-if="column.key === 'reporter'">
            <span class="reporter-name">{{ record.reporter }}</span>
            <span class="reporter-anon" v-if="record.isAnonymous">(匿名)</span>
          </template>
          <template v-if="column.key === 'type'">
            <a-tag :color="getTypeColor(record.reportType)">{{ record.reportType }}</a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-badge :status="getStatusType(record.status)" :text="record.statusText" />
          </template>
          <template v-if="column.key === 'progress'">
            <a-progress :percent="record.progress" size="small" :stroke-color="'#1890FF'" />
          </template>
          <template v-if="column.key === 'action'">
            <span class="action-links">
              <a class="action-link" @click="handleView(record)">
                <EyeOutlined /> 查看
              </a>
              <a class="action-link" @click="handleAccept(record)" v-if="record.status === 'pending'">
                <CheckOutlined /> 受理
              </a>
              <a class="action-link danger" @click="handleDelete(record)">
                <DeleteOutlined /> 删除
              </a>
            </span>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 新增/查看举报弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      width="700px"
      :footer="null"
    >
      <a-form :model="formData" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="举报方式" name="report_type" :rules="[{ required: true, message: '请选择举报方式' }]">
              <a-select v-model:value="formData.report_type" placeholder="请选择">
                <a-select-option v-for="opt in reportService.getReportTypeOptions()" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="举报人" name="reporter">
              <a-input v-model:value="formData.reporter" placeholder="请输入举报人姓名" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="联系电话" name="reporter_phone">
              <a-input v-model:value="formData.reporter_phone" placeholder="请输入联系电话" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="匿名举报">
              <a-checkbox v-model:checked="formData.is_anonymous">匿名举报</a-checkbox>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="标题" name="title" :rules="[{ required: true, message: '请输入标题' }]">
          <a-input v-model:value="formData.title" placeholder="请输入举报标题" />
        </a-form-item>
        <a-form-item label="被举报人" name="suspect_name">
          <a-input v-model:value="formData.suspect_name" placeholder="请输入被举报人姓名（选填）" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="单位" name="suspect_unit">
              <a-input v-model:value="formData.suspect_unit" placeholder="请输入单位（选填）" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="职务" name="suspect_position">
              <a-input v-model:value="formData.suspect_position" placeholder="请输入职务（选填）" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="举报内容" name="content" :rules="[{ required: true, message: '请输入举报内容' }]">
          <a-textarea v-model:value="formData.content" :rows="4" placeholder="请输入举报详细内容" />
        </a-form-item>
      </a-form>
      <div class="modal-footer">
        <a-space>
          <a-button @click="handleModalCancel">取消</a-button>
          <a-button type="primary" @click="handleModalOk">保存</a-button>
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
  CheckOutlined,
  EyeOutlined,
  InboxOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { message, Modal } from 'ant-design-vue'
import { reportService, type Report, type ReportType, type ReportStatus } from '@/api'
import { caseService } from '@/api'

// 表格列定义
const columns: TableColumnsType = [
  { title: '举报编号', dataIndex: 'report_no', key: 'reportNo', width: 150 },
  { title: '举报人', dataIndex: 'reporter', key: 'reporter', width: 120 },
  { title: '举报方式', dataIndex: 'report_type', key: 'type', width: 100 },
  { title: '举报时间', dataIndex: 'report_time', key: 'reportTime', width: 160 },
  { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
  { title: '受理状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 180, fixed: 'right' }
]

// 状态数据
const loading = ref(false)
const searchText = ref('')
const filterType = ref<string | undefined>(undefined)
const filterStatus = ref<string | undefined>('pending') // 默认显示待受理状态
const selectedRowKeys = ref<number[]>([])
const modalVisible = ref(false)
const modalTitle = ref('新增举报')
const isEdit = ref(false)
const currentRecord = ref<Report | null>(null)

// 真实数据
const reportData = ref<Report[]>([])
const totalCount = ref(0)

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// 表单数据
const formData = reactive({
  report_type: undefined as ReportType | undefined,
  reporter: '',
  reporter_phone: '',
  is_anonymous: false,
  suspect_name: '',
  suspect_unit: '',
  suspect_position: '',
  title: '',
  content: ''
})

// 获取举报列表
const fetchReports = async () => {
  loading.value = true
  try {
    const result = await reportService.getReports({
      search: searchText.value || undefined,
      report_type: filterType.value as ReportType || undefined,
      status: (filterStatus.value && filterStatus.value !== '') ? filterStatus.value as ReportStatus : undefined,
      page: pagination.current,
      page_size: pagination.pageSize
    })
    reportData.value = result.results || []
    totalCount.value = result.count || 0
    pagination.total = totalCount.value
  } catch (error: any) {
    message.error(error.response?.data?.detail || '获取数据失败')
  } finally {
    loading.value = false
  }
}

// 监听筛选条件变化
watch([searchText, filterType, filterStatus], () => {
  pagination.current = 1
  fetchReports()
}, { deep: true })

// 初始化
onMounted(() => {
  fetchReports()
})

// 筛选后的数据（用于前端本地筛选，不影响API）
const filteredData = computed(() => {
  return reportData.value.map(item => ({
    ...item,
    reportNo: item.report_no,
    reportType: getTypeLabel(item.report_type),
    reportTime: item.report_time || item.created_at?.slice(0, 16),
    statusText: getStatusLabel(item.status),
    isAnonymous: item.is_anonymous
  }))
})

// 行选择
const rowSelection = {
  selectedRowKeys: computed(() => selectedRowKeys.value),
  onChange: (keys: number[]) => {
    selectedRowKeys.value = keys
  }
}

// 状态映射
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    accepted: 'processing',
    reviewed: 'blue',
    transferred: 'orange',
    closed: 'success'
  }
  return map[status] || 'default'
}

const getTypeColor = (type: string) => {
  const map: Record<string, string> = {
    letter: 'blue',
    network: 'green',
    phone: 'orange',
    visit: 'purple'
  }
  return map[type] || 'default'
}

const getTypeLabel = (type: string) => {
  const options = reportService.getReportTypeOptions()
  return options.find(o => o.value === type)?.label || type
}

const getStatusLabel = (status: string) => {
  const options = reportService.getStatusOptions()
  return options.find(o => o.value === status)?.label || status
}

// 操作方法
const handleView = (record: Report) => {
  modalTitle.value = '查看举报详情'
  isEdit.value = false
  currentRecord.value = record
  Object.assign(formData, {
    report_type: record.report_type,
    reporter: record.reporter || '',
    reporter_phone: record.reporter_phone || '',
    is_anonymous: record.is_anonymous,
    suspect_name: record.suspect_name || '',
    suspect_unit: record.suspect_unit || '',
    suspect_position: record.suspect_position || '',
    title: record.title,
    content: record.content
  })
  modalVisible.value = true
}

const handleAccept = async (record: Report) => {
  Modal.confirm({
    title: '确认受理',
    content: `确定要受理举报件 "${record.report_no}" 吗？受理后将自动创建对应的案件。`,
    onOk: async () => {
      try {
        // 1. 受理举报
        await reportService.acceptReport(record.id)

        // 2. 自动创建案件
        try {
          await caseService.createCase({
            case_type: 'discipline', // 默认为纪律审查
            title: record.title,
            suspect_name: record.accused_name || '未知',
            suspect_unit: record.accused_unit,
            suspect_position: record.accused_position,
            case_level: 'ordinary', // 默认为一般案件（后端使用 'ordinary'）
            case_source: `举报：${record.report_no}`, // 记录举报编号
            main_content: record.content,
            handling_opinion: `来自举报：${record.report_no}，举报人：${record.is_anonymous ? '匿名' : record.reporter_name || '未知'}`
          })
          message.success('受理成功，已自动创建案件')
        } catch (caseError: any) {
          // 如果创建案件失败，提示用户但不回滚举报状态
          console.error('创建案件失败详情：', caseError.response?.data)
          message.warning(`受理成功，但创建案件失败：${caseError.response?.data?.detail || caseError.message}。请手动在案件立案页面创建案件。`)
        }

        // 3. 刷新列表
        fetchReports()
      } catch (error: any) {
        message.error(error.response?.data?.detail || '受理失败')
      }
    }
  })
}

const handleCreate = () => {
  modalTitle.value = '新增举报'
  isEdit.value = true
  currentRecord.value = null
  Object.assign(formData, {
    report_type: undefined,
    reporter: '',
    reporter_phone: '',
    is_anonymous: false,
    suspect_name: '',
    suspect_unit: '',
    suspect_position: '',
    title: '',
    content: ''
  })
  modalVisible.value = true
}

const handleBatchAccept = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要受理的举报件')
    return
  }
  Modal.confirm({
    title: '批量受理',
    content: `确定要受理选中的 ${selectedRowKeys.value.length} 条举报件吗？`,
    onOk: async () => {
      try {
        for (const id of selectedRowKeys.value) {
          await reportService.acceptReport(id)
        }
        message.success('批量受理成功')
        selectedRowKeys.value = []
        fetchReports()
      } catch (error: any) {
        message.error(error.response?.data?.detail || '批量受理失败')
      }
    }
  })
}

const handleExport = () => {
  message.success('导出成功')
}

// 删除举报（软删除，移入回收箱）
const handleDelete = (record: Report) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除举报"${record.title}"吗？删除后将移入回收箱。`,
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        // 软删除：将状态改为 recycled
        await reportService.updateReport(record.id, { status: 'recycled' })
        message.success('已移入回收箱')
        fetchReports()
      } catch (error: any) {
        message.error(error.response?.data?.detail || '删除失败')
      }
    }
  })
}

// 批量删除（软删除，移入回收箱）
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的举报')
    return
  }
  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个举报吗？删除后将移入回收箱。`,
    okText: '确认',
    cancelText: '取消',
    okType: 'danger',
    onOk: async () => {
      try {
        for (const id of selectedRowKeys.value) {
          // 软删除：将状态改为 recycled
          await reportService.updateReport(id, { status: 'recycled' })
        }
        message.success('已批量移入回收箱')
        selectedRowKeys.value = []
        fetchReports()
      } catch (error: any) {
        message.error(error.response?.data?.detail || '批量删除失败')
      }
    }
  })
}

const handleModalOk = async () => {
  if (!formData.report_type || !formData.title || !formData.content) {
    message.warning('请填写必填项')
    return
  }
  try {
    if (isEdit.value && currentRecord.value) {
      // 更新
      await reportService.updateReport(currentRecord.value.id, {
        report_type: formData.report_type,
        title: formData.title,
        content: formData.content,
        reporter: formData.reporter,
        reporter_phone: formData.reporter_phone,
        is_anonymous: formData.is_anonymous,
        suspect_name: formData.suspect_name,
        suspect_unit: formData.suspect_unit,
        suspect_position: formData.suspect_position
      })
      message.success('更新成功')
    } else {
      // 新增
      await reportService.createReport({
        report_type: formData.report_type,
        title: formData.title,
        content: formData.content,
        reporter: formData.reporter,
        reporter_phone: formData.reporter_phone,
        is_anonymous: formData.is_anonymous,
        suspect_name: formData.suspect_name,
        suspect_unit: formData.suspect_unit,
        suspect_position: formData.suspect_position
      })
      message.success('保存成功')
    }
    modalVisible.value = false
    fetchReports()
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
  fetchReports()
}
</script>

<style scoped>
.report-page {
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

.report-no {
  font-family: monospace;
  color: #1890FF;
}

.reporter-name {
  font-weight: 500;
}

.reporter-anon {
  color: #8c8c8c;
  font-size: 12px;
  margin-left: 4px;
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
