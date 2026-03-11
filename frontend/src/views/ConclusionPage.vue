<template>
  <div class="conclusion-page">
    <a-breadcrumb class="page-breadcrumb">
      <a-breadcrumb-item>
        <HomeOutlined />
      </a-breadcrumb-item>
      <a-breadcrumb-item>日常业务</a-breadcrumb-item>
      <a-breadcrumb-item>结案报告</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">结案报告</h1>
      <a-button type="primary" @click="handleCreate">
        <template #icon>
          <PlusOutlined />
        </template>
        新结案
      </a-button>
    </div>

    <div class="page-card filter-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索案件名称、被处分人..."
            class="search-input"
            allow-clear
          />
          <a-select v-model:value="filterStatus" placeholder="执行状态" allow-clear class="filter-select">
            <a-select-option value="pending">执行中</a-select-option>
            <a-select-option value="completed">已执行</a-select-option>
          </a-select>
          <a-select v-model:value="filterArchive" placeholder="归档状态" allow-clear class="filter-select">
            <a-select-option value="no">未归档</a-select-option>
            <a-select-option value="yes">已归档</a-select-option>
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
          <template v-if="column.key === 'conclusionNo'">
            <span class="conclusion-no">{{ record.conclusionNo }}</span>
          </template>
          <template v-if="column.key === 'punishment'">
            <a-tag :color="getPunishmentColor(record.punishmentType)">{{ record.punishmentType }}</a-tag>
          </template>
          <template v-if="column.key === 'execution'">
            <a-badge :status="record.executionStatus === 'completed' ? 'success' : 'processing'" :text="record.executionText" />
          </template>
          <template v-if="column.key === 'archive'">
            <a-badge :status="record.archived ? 'success' : 'default'" :text="record.archived ? '已归档' : '未归档'" />
          </template>
          <template v-if="column.key === 'action'">
            <span class="action-links">
              <a class="action-link" @click="handleView(record)">
                <EyeOutlined /> 查看
              </a>
              <a class="action-link" @click="handleArchive(record)" v-if="!record.archived">
                <InboxOutlined /> 归档
              </a>
              <a class="action-link" @click="handlePrint(record)">
                <PrinterOutlined /> 打印
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
      width="800px"
      :footer="null"
    >
      <a-form :model="formData" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="结案案件" required>
              <a-select v-model:value="formData.caseId" placeholder="请选择要结案的案件">
                <a-select-option v-for="c in caseList" :key="c.id" :value="c.id">
                  {{ c.case_name }} - {{ c.suspect_name || '未知' }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="结案时间" required>
              <a-date-picker v-model:value="formData.conclusionDate" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="结案方式">
              <a-select v-model:value="formData.conclusionType" placeholder="请选择">
                <a-select-option value="party_discipline">党纪处分</a-select-option>
                <a-select-option value="administrative">政务处分</a-select-option>
                <a-select-option value="judicial">移送司法机关</a-select-option>
                <a-select-option value="criticism">批评教育</a-select-option>
                <a-select-option value="concluded">予以了结</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="处分决定">
          <a-textarea v-model:value="formData.decision" :rows="3" placeholder="请输入处分决定内容" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="执行状态">
              <a-select v-model:value="formData.executionStatus" placeholder="请选择">
                <a-select-option value="pending">执行中</a-select-option>
                <a-select-option value="completed">已执行</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="执行时间">
              <a-date-picker v-model:value="formData.executeDate" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="案件总结">
          <a-textarea v-model:value="formData.summary" :rows="4" placeholder="请输入案件办理总结" />
        </a-form-item>
        <a-form-item label="附件">
          <a-upload-dragger>
            <p class="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p class="ant-upload-text">上传结案报告及相关材料</p>
          </a-upload-dragger>
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
  InboxOutlined,
  PrinterOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { caseService, type Conclusion, type ConclusionType, type ExecutionStatus } from '@/api'

const columns: TableColumnsType = [
  { title: '结案编号', dataIndex: 'conclusion_no', key: 'conclusionNo', width: 140 },
  { title: '案件名称', dataIndex: 'case_name', key: 'caseName', ellipsis: true, width: 180 },
  { title: '被处分人', dataIndex: 'suspect_name', key: 'personName', width: 100 },
  { title: '结案方式', dataIndex: 'conclusion_type', key: 'punishment', width: 100 },
  { title: '结案时间', dataIndex: 'conclusion_date', key: 'conclusionDate', width: 120 },
  { title: '执行状态', dataIndex: 'execution_status', key: 'execution', width: 100 },
  { title: '归档状态', dataIndex: 'archived', key: 'archive', width: 100 },
  { title: '操作', key: 'action', width: 180 }
]

const loading = ref(false)
const searchText = ref('')
const filterStatus = ref<string | undefined>(undefined)
const filterArchive = ref<string | undefined>(undefined)
const selectedRowKeys = ref<number[]>([])
const modalVisible = ref(false)
const modalTitle = ref('新结案')

const formData = reactive({
  // 模板绑定（驼峰命名）
  caseId: undefined as number | undefined,
  conclusionDate: null as any,
  conclusionType: undefined as ConclusionType | undefined,
  executionStatus: undefined as ExecutionStatus | undefined,
  executeDate: null as any,
  // API需要字段（下划线命名）
  case: undefined as number | undefined,
  conclusion_date: null as any,
  conclusion_type: undefined as ConclusionType | undefined,
  decision: '',
  execution_status: undefined as ExecutionStatus | undefined,
  execute_date: null as any,
  summary: ''
})

// 真实数据
const conclusionData = ref<Conclusion[]>([])
const totalCount = ref(0)
const caseList = ref<{ id: number; case_name: string; suspect_name: string }[]>([])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// 获取结案列表
const fetchConclusions = async () => {
  loading.value = true
  try {
    const result = await caseService.getConclusions({
      search: searchText.value || undefined,
      execution_status: filterStatus.value as ExecutionStatus || undefined,
      archived: filterArchive.value,
      page: pagination.current,
      page_size: pagination.pageSize
    })
    conclusionData.value = result.results || []
    totalCount.value = result.count || 0
    pagination.total = totalCount.value
  } catch (error: any) {
    message.error(error.response?.data?.detail || '获取数据失败')
  } finally {
    loading.value = false
  }
}

// 获取案件列表用于下拉选择
const fetchCaseList = async () => {
  try {
    const result = await caseService.getCases({ page_size: 100 })
    caseList.value = result.results || []
  } catch (error: any) {
    console.error('获取案件列表失败', error)
  }
}

// 监听筛选条件变化
watch([searchText, filterStatus, filterArchive], () => {
  pagination.current = 1
  fetchConclusions()
}, { deep: true })

// 初始化
onMounted(() => {
  fetchConclusions()
  fetchCaseList()
})

const filteredData = computed(() => {
  return conclusionData.value.map(item => ({
    ...item,
    conclusionNo: item.conclusion_no,
    caseName: item.case_name,
    personName: item.suspect_name,
    conclusionType: getConclusionTypeLabel(item.conclusion_type),
    conclusionDate: item.conclusion_date || '-',
    executionText: item.execution_status === 'completed' ? '已执行' : '执行中'
  }))
})

const getPunishmentColor = (type: string) => {
  const map: Record<string, string> = {
    party_discipline: 'blue',
    administrative: 'orange',
    judicial: 'red',
    criticism: 'green',
    concluded: 'default'
  }
  return map[type] || 'default'
}

const getConclusionTypeLabel = (type: string) => {
  const options = caseService.getConclusionTypeOptions()
  return options.find(o => o.value === type)?.label || type
}

const handleView = (record: Conclusion) => {
  modalTitle.value = '查看结案详情'
  Object.assign(formData, {
    // 模板绑定
    caseId: record.case,
    conclusionDate: dayjs(record.conclusion_date),
    conclusionType: record.conclusion_type,
    executionStatus: record.execution_status,
    executeDate: record.execute_date ? dayjs(record.execute_date) : null,
    // API字段
    case: record.case,
    conclusion_date: dayjs(record.conclusion_date),
    conclusion_type: record.conclusion_type,
    decision: record.decision || '',
    execution_status: record.execution_status,
    execute_date: record.execute_date ? dayjs(record.execute_date) : null,
    summary: record.summary || ''
  })
  modalVisible.value = true
}

const handleArchive = async (record: Conclusion) => {
  Modal.confirm({
    title: '确认归档',
    content: `确定要将结案报告 "${record.case_name}" 归档吗？`,
    onOk: async () => {
      try {
        await caseService.updateConclusion(record.id, { archived: true })
        message.success('归档成功')
        fetchConclusions()
      } catch (error: any) {
        message.error(error.response?.data?.detail || '归档失败')
      }
    }
  })
}

const handlePrint = (record: Conclusion) => {
  message.success(`正在打印: ${record.conclusion_no}`)
}

const handleCreate = () => {
  modalTitle.value = '新结案'
  Object.assign(formData, {
    // 模板绑定
    caseId: undefined,
    conclusionDate: null,
    conclusionType: undefined,
    executionStatus: undefined,
    executeDate: null,
    // API字段
    case: undefined,
    conclusion_date: null,
    conclusion_type: undefined,
    decision: '',
    execution_status: undefined,
    execute_date: null,
    summary: ''
  })
  modalVisible.value = true
}

const handleExport = () => {
  message.success('导出成功')
}

// 删除结案
const handleDelete = (record: Conclusion) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除结案报告"${record.case_name}"吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        await caseService.deleteConclusion(record.id)
        message.success('删除成功')
        fetchConclusions()
      } catch (error: any) {
        message.error(error.response?.data?.detail || '删除失败')
      }
    }
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的结案报告')
    return
  }
  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个结案报告吗？`,
    okText: '确认',
    cancelText: '取消',
    okType: 'danger',
    onOk: async () => {
      try {
        for (const id of selectedRowKeys.value) {
          await caseService.deleteConclusion(id)
        }
        message.success('批量删除成功')
        selectedRowKeys.value = []
        fetchConclusions()
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
  fetchConclusions()
}

const handleModalOk = async () => {
  if (!formData.caseId || !formData.conclusionDate || !formData.conclusionType) {
    message.warning('请填写必填项')
    return
  }
  try {
    await caseService.createConclusion({
      case: Number(formData.caseId),
      conclusion_date: formData.conclusionDate ? dayjs(formData.conclusionDate).format('YYYY-MM-DD') : new Date().toISOString().slice(0, 10),
      conclusion_type: formData.conclusionType,
      decision: formData.decision,
      execution_status: formData.executionStatus,
      execute_date: formData.executeDate ? dayjs(formData.executeDate).format('YYYY-MM-DD') : undefined,
      summary: formData.summary
    })
    message.success('保存成功')
    modalVisible.value = false
    fetchConclusions()
  } catch (error: any) {
    message.error(error.response?.data?.detail || '保存失败')
  }
}
</script>

<style scoped>
.conclusion-page {
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
.conclusion-no {
  font-family: monospace;
  color: #1890FF;
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
