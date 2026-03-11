<template>
  <div class="trial-page">
    <a-breadcrumb class="page-breadcrumb">
      <a-breadcrumb-item>
        <HomeOutlined />
      </a-breadcrumb-item>
      <a-breadcrumb-item>日常业务</a-breadcrumb-item>
      <a-breadcrumb-item>案件审理</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">案件审理</h1>
      <a-button type="primary" @click="handleCreate">
        <template #icon>
          <PlusOutlined />
        </template>
        受理案件
      </a-button>
    </div>

    <div class="page-card filter-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索案件名称、编号..."
            class="search-input"
            allow-clear
          />
          <a-select v-model:value="filterStatus" placeholder="审理状态" allow-clear class="filter-select">
            <a-select-option value="pending">待审理</a-select-option>
            <a-select-option value="processing">审理中</a-select-option>
            <a-select-option value="completed">已审结</a-select-option>
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
          <template v-if="column.key === 'acceptNo'">
            <span class="accept-no">{{ record.acceptNo }}</span>
          </template>
          <template v-if="column.key === 'status'">
            <a-badge :status="getStatusType(record.status)" :text="record.statusText" />
          </template>
          <template v-if="column.key === 'deadline'">
            <span :class="{ 'deadline-warning': record.daysLeft <= 3, 'deadline-overdue': record.daysLeft < 0 }">
              {{ record.daysLeft > 0 ? `剩余${record.daysLeft}天` : '已逾期' }}
            </span>
          </template>
          <template v-if="column.key === 'action'">
            <span class="action-links">
              <a class="action-link" @click="handleView(record)">
                <EyeOutlined /> 查看
              </a>
              <a class="action-link" @click="handleStartTrial(record)" v-if="record.status === 'pending'">
                <PlayCircleOutlined /> 开始审理
              </a>
              <a class="action-link" @click="handleComplete(record)" v-if="record.status === 'processing'">
                <CheckOutlined /> 审结
              </a>
              <a class="action-link danger" @click="handleDelete(record)">
                <DeleteOutlined /> 删除
              </a>
            </span>
          </template>
        </template>
      </a-table>
    </div>

    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      width="700px"
      :footer="null"
    >
      <a-form :model="formData" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
        <a-form-item label="关联案件" required>
          <a-select v-model:value="formData.caseId" placeholder="请选择要审理的案件">
            <a-select-option v-for="c in caseList" :key="c.id" :value="c.id">
              {{ c.case_no }} - {{ c.case_name || c.title }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="案件移送部门">
          <a-input v-model:value="formData.department" placeholder="请输入案件移送部门" />
        </a-form-item>
        <a-form-item label="受理时间">
          <a-date-picker v-model:value="formData.acceptDate" style="width: 100%" />
        </a-form-item>
        <a-form-item label="审理期限">
          <a-input-number v-model:value="formData.deadline" :min="1" :max="90" style="width: 100%" />
          <span class="form-hint">天</span>
        </a-form-item>
        <a-form-item label="主办审理员" required>
          <a-select v-model:value="formData.judge" placeholder="请选择主办审理员">
            <a-select-option value="张书记">张书记</a-select-option>
            <a-select-option value="李主任">李主任</a-select-option>
            <a-select-option value="王科长">王科长</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="协办人员">
          <a-select mode="multiple" v-model:value="formData.assistants" placeholder="请选择协办人员">
            <a-select-option value="赵干部">赵干部</a-select-option>
            <a-select-option value="陈处长">陈处长</a-select-option>
            <a-select-option value="刘局长">刘局长</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="审理意见">
          <a-textarea v-model:value="formData.opinion" :rows="4" placeholder="请输入审理意见" />
        </a-form-item>
      </a-form>
      <div class="modal-footer">
        <a-space>
          <a-button @click="modalVisible = false">取消</a-button>
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
  EyeOutlined,
  PlayCircleOutlined,
  CheckOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { caseService, type Trial, type TrialStatus } from '@/api'

const columns: TableColumnsType = [
  { title: '受理编号', dataIndex: 'accept_no', key: 'acceptNo', width: 140 },
  { title: '案件名称', dataIndex: 'case_name', key: 'caseName', ellipsis: true, width: 200 },
  { title: '调查部门', dataIndex: 'department', key: 'department', width: 140 },
  { title: '受理时间', dataIndex: 'accept_date', key: 'acceptDate', width: 120 },
  { title: '审理人员', dataIndex: 'judge', key: 'judge', width: 100 },
  { title: '审理状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '期限提醒', dataIndex: 'days_left', key: 'deadline', width: 100 },
  { title: '操作', key: 'action', width: 180 }
]

const loading = ref(false)
const searchText = ref('')
const filterStatus = ref<string | undefined>(undefined)
const selectedRowKeys = ref<number[]>([])
const modalVisible = ref(false)
const modalTitle = ref('受理案件')

const formData = reactive({
  // 模板绑定（驼峰命名）
  caseId: undefined as number | undefined,
  acceptDate: null as any,
  deadline: 30,
  judge: undefined as string | undefined,
  assistants: [] as string[],
  // API需要字段（下划线命名）
  case: undefined as number | undefined,
  accept_date: null as any,
  department: '',
  trial_opinion: ''
})

// 真实数据
const trialData = ref<Trial[]>([])
const totalCount = ref(0)
const caseList = ref<{ id: number; case_no: string; case_name: string; title: string }[]>([])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// 获取审理列表
const fetchTrials = async () => {
  loading.value = true
  try {
    const result = await caseService.getTrials({
      search: searchText.value || undefined,
      status: filterStatus.value as TrialStatus || undefined,
      page: pagination.current,
      page_size: pagination.pageSize
    })
    trialData.value = result.results || []
    totalCount.value = result.count || 0
    pagination.total = totalCount.value
  } catch (error: any) {
    message.error(error.response?.data?.detail || '获取数据失败')
  } finally {
    loading.value = false
  }
}

// 获取案件列表
const fetchCases = async () => {
  try {
    const result = await caseService.getCases({ page_size: 100 })
    caseList.value = (result.results || []).map((item: any) => ({
      id: item.id,
      case_no: item.case_no,
      case_name: item.case_name || item.title,
      title: item.title
    }))
  } catch (error: any) {
    console.error('获取案件列表失败', error)
  }
}

// 监听筛选条件变化
watch([searchText, filterStatus], () => {
  pagination.current = 1
  fetchTrials()
}, { deep: true })

// 初始化
onMounted(async () => {
  await fetchCases()
  fetchTrials()
})

const filteredData = computed(() => {
  return trialData.value.map(item => ({
    ...item,
    acceptNo: item.accept_no,
    caseName: item.case_name,
    acceptDate: item.accept_date || '-',
    daysLeft: item.days_left,
    statusText: getStatusLabel(item.status)
  }))
})

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    processing: 'processing',
    completed: 'success'
  }
  return map[status] || 'default'
}

const getStatusLabel = (status: string) => {
  const options = caseService.getTrialStatusOptions()
  return options.find(o => o.value === status)?.label || status
}

const handleView = (record: Trial) => {
  modalTitle.value = '查看审理详情'
  Object.assign(formData, {
    caseId: record.case,
    acceptDate: dayjs(record.accept_date),
    deadline: record.deadline,
    judge: record.judge,
    assistants: record.assistants ? record.assistants.split(',') : [],
    // API字段
    case: record.case,
    accept_date: dayjs(record.accept_date),
    department: record.department || '',
    trial_opinion: record.trial_opinion || ''
  })
  modalVisible.value = true
}

const handleStartTrial = async (record: Trial) => {
  Modal.confirm({
    title: '确认开始审理',
    content: `确定要开始审理案件 "${record.case_name}" 吗？`,
    onOk: async () => {
      try {
        await caseService.changeTrialStatus(record.id, 'processing')
        message.success('已开始审理')
        fetchTrials()
      } catch (error: any) {
        message.error(error.response?.data?.detail || '操作失败')
      }
    }
  })
}

const handleComplete = async (record: Trial) => {
  Modal.confirm({
    title: '确认审结',
    content: `确定要将案件 "${record.case_name}" 审结吗？`,
    onOk: async () => {
      try {
        await caseService.changeTrialStatus(record.id, 'completed')
        message.success('审结成功')
        fetchTrials()
      } catch (error: any) {
        message.error(error.response?.data?.detail || '操作失败')
      }
    }
  })
}

const handleCreate = () => {
  modalTitle.value = '受理案件'
  Object.assign(formData, {
    // 模板绑定
    caseId: undefined,
    acceptDate: null,
    deadline: 30,
    judge: undefined,
    assistants: [],
    // API字段
    case: undefined,
    accept_date: null,
    department: '',
    trial_opinion: ''
  })
  modalVisible.value = true
}

const handleExport = () => {
  message.success('导出成功')
}

// 删除审理
const handleDelete = (record: Trial) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除审理记录"${record.case_name}"吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        await caseService.deleteTrial(record.id)
        message.success('删除成功')
        fetchTrials()
      } catch (error: any) {
        message.error(error.response?.data?.detail || '删除失败')
      }
    }
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的审理记录')
    return
  }
  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个审理记录吗？`,
    okText: '确认',
    cancelText: '取消',
    okType: 'danger',
    onOk: async () => {
      try {
        for (const id of selectedRowKeys.value) {
          await caseService.deleteTrial(id)
        }
        message.success('批量删除成功')
        selectedRowKeys.value = []
        fetchTrials()
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

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchTrials()
}

const handleModalOk = async () => {
  if (!formData.caseId || !formData.judge) {
    message.warning('请填写必填项')
    return
  }
  try {
    await caseService.createTrial({
      case: Number(formData.caseId),
      department: formData.department,
      accept_date: formData.acceptDate ? dayjs(formData.acceptDate).format('YYYY-MM-DD') : new Date().toISOString().slice(0, 10),
      deadline: formData.deadline,
      judge: formData.judge,
      assistants: formData.assistants.join(','),
      trial_opinion: formData.trial_opinion
    })
    message.success('受理成功')
    modalVisible.value = false
    fetchTrials()
  } catch (error: any) {
    message.error(error.response?.data?.detail || '保存失败')
  }
}
</script>

<style scoped>
.trial-page {
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
.accept-no {
  font-family: monospace;
  color: #1890FF;
}
.deadline-warning {
  color: #fa8c16;
  font-weight: 500;
}
.deadline-overdue {
  color: #f5222d;
  font-weight: 500;
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
  margin-left: 8px;
  color: #8c8c8c;
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
