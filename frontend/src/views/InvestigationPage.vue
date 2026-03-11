<template>
  <div class="investigation-page">
    <a-breadcrumb class="page-breadcrumb">
      <a-breadcrumb-item>
        <HomeOutlined />
      </a-breadcrumb-item>
      <a-breadcrumb-item>日常业务</a-breadcrumb-item>
      <a-breadcrumb-item>审查调查</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">审查调查</h1>
      <a-button type="primary" @click="handleCreate">
        <template #icon>
          <PlusOutlined />
        </template>
        新增证据
      </a-button>
    </div>

    <div class="page-card filter-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索证据名称、编号..."
            class="search-input"
            allow-clear
          />
          <a-select v-model:value="filterType" placeholder="证据类型" allow-clear class="filter-select">
            <a-select-option value="document">书证</a-select-option>
            <a-select-option value="material">物证</a-select-option>
            <a-select-option value="testimony">证人证言</a-select-option>
            <a-select-option value="audio">视听资料</a-select-option>
            <a-select-option value="expert">鉴定意见</a-select-option>
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
        :row-key="(record: any) => record.id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'evidenceNo'">
            <span class="evidence-no">{{ record.evidenceNo }}</span>
          </template>
          <template v-if="column.key === 'type'">
            <a-tag :color="getTypeColor(record.evidenceType)">{{ record.evidenceType }}</a-tag>
          </template>
          <template v-if="column.key === 'collector'">
            <a-avatar :size="24" :style="{ backgroundColor: '#1890FF' }">
              {{ record.collector.charAt(0) }}
            </a-avatar>
            <span class="collector-name">{{ record.collector }}</span>
          </template>
          <template v-if="column.key === 'action'">
            <span class="action-links">
              <a class="action-link" @click="handleView(record)">
                <EyeOutlined /> 查看
              </a>
              <a class="action-link" @click="handleDownload(record)">
                <DownloadOutlined /> 下载
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
      <a-form :model="formData" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="证据名称" required>
              <a-input v-model:value="formData.evidenceName" placeholder="请输入证据名称" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="证据类型" required>
              <a-select v-model:value="formData.evidenceType" placeholder="请选择">
                <a-select-option value="document">书证</a-select-option>
                <a-select-option value="material">物证</a-select-option>
                <a-select-option value="testimony">证人证言</a-select-option>
                <a-select-option value="audio">视听资料</a-select-option>
                <a-select-option value="expert">鉴定意见</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="关联案件">
              <a-select v-model:value="formData.caseId" placeholder="请选择关联案件">
                <a-select-option v-for="c in caseList" :key="c.id" :value="c.id">
                  {{ c.case_no }} - {{ c.case_name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="取证时间">
          <a-date-picker v-model:value="formData.collectDate" style="width: 100%" />
        </a-form-item>
        <a-form-item label="取证地点">
          <a-input v-model:value="formData.location" placeholder="请输入取证地点" />
        </a-form-item>
        <a-form-item label="取证人">
          <a-select v-model:value="formData.collector" placeholder="请选择取证人">
            <a-select-option value="张书记">张书记</a-select-option>
            <a-select-option value="李主任">李主任</a-select-option>
            <a-select-option value="王科长">王科长</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="证据描述">
          <a-textarea v-model:value="formData.description" :rows="3" placeholder="请输入证据描述" />
        </a-form-item>
        <a-form-item label="附件">
          <a-upload-dragger>
            <p class="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p class="ant-upload-text">点击或拖拽上传证据材料</p>
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
  DownloadOutlined,
  InboxOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { caseService, type Evidence, type EvidenceType } from '@/api'

const columns: TableColumnsType = [
  { title: '证据编号', dataIndex: 'id', key: 'evidenceNo', width: 140 },
  { title: '证据名称', dataIndex: 'name', key: 'evidenceName', ellipsis: true, width: 200 },
  { title: '关联案件', dataIndex: 'case', key: 'caseId', width: 180 },
  { title: '证据类型', dataIndex: 'evidence_type', key: 'type', width: 100 },
  { title: '取证时间', dataIndex: 'created_at', key: 'uploadDate', width: 120 },
  { title: '取证人', dataIndex: 'submitter', key: 'collector', width: 100 },
  { title: '操作', key: 'action', width: 140 }
]

const loading = ref(false)
const searchText = ref('')
const filterType = ref<string | undefined>(undefined)
const selectedRowKeys = ref<number[]>([])
const modalVisible = ref(false)
const modalTitle = ref('新增证据')

const formData = reactive({
  evidenceName: '',          // 证据名称（模板绑定）
  evidenceType: undefined as string | undefined,  // 证据类型（模板绑定）
  caseId: undefined as number | undefined,  // 关联案件（模板绑定）
  collectDate: undefined,    // 取证时间（模板绑定）
  location: '',              // 取证地点（模板绑定）
  collector: '',             // 取证人（模板绑定）
  description: '',           // 证据描述（模板绑定）
  // 后端API需要的字段
  evidence_name: '',         // 证据名称
  evidence_type: undefined as string | undefined,  // 证据类型
  case: undefined as number | undefined,
  evidence_desc: '',
  file: undefined as File | undefined
})

// 真实数据
const evidenceData = ref<Evidence[]>([])
const totalCount = ref(0)
const selectedCaseId = ref<number | undefined>(undefined) // 默认关联案件
const caseList = ref<{ id: number; case_no: string; case_name: string }[]>([]) // 案件列表

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// 获取证据列表
const fetchEvidences = async () => {
  if (!selectedCaseId.value) return
  loading.value = true
  try {
    const result = await caseService.getEvidences(selectedCaseId.value)
    evidenceData.value = result.results || []
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
    caseList.value = (result.results || []).map(item => ({
      id: item.id,
      case_no: item.case_no,
      case_name: item.case_name || item.title
    }))
  } catch (error: any) {
    console.error('获取案件列表失败', error)
  }
}

// 监听筛选条件变化
watch([searchText, filterType], () => {
  pagination.current = 1
  fetchEvidences()
}, { deep: true })

// 监听案件选择变化
watch(selectedCaseId, () => {
  pagination.current = 1
  fetchEvidences()
})

// 初始化
onMounted(async () => {
  await fetchCases()
  // 如果有案件，默认选择第一个
  if (caseList.value.length > 0) {
    selectedCaseId.value = caseList.value[0].id
    fetchEvidences()
  }
})

const filteredData = computed(() => {
  return evidenceData.value.map(item => ({
    ...item,
    evidenceNo: item.id,
    evidenceName: item.name,
    evidenceType: getTypeLabel(item.evidence_type),
    uploadDate: item.created_at ? item.created_at.split('T')[0] : '-',
    collector: item.submitter || '-'
  }))
})

const getTypeColor = (type: string) => {
  const map: Record<string, string> = {
    document: 'blue',
    material: 'green',
    testimony: 'orange',
    audio: 'purple',
    expert: 'cyan'
  }
  return map[type] || 'default'
}

const getTypeLabel = (type: string) => {
  const options = caseService.getEvidenceTypeOptions()
  return options.find(o => o.value === type)?.label || type
}

const handleView = (record: Evidence) => {
  modalTitle.value = '查看证据详情'
  Object.assign(formData, {
    evidence_name: record.name,
    evidence_type: record.evidence_type,
    case: record.case,
    evidence_desc: record.description || '',
    file: undefined
  })
  modalVisible.value = true
}

const handleDownload = (record: Evidence) => {
  if (record.file) {
    // 打开文件链接
    window.open(record.file, '_blank')
    message.success(`正在下载: ${record.name}`)
  } else {
    message.info('该证据暂无附件')
  }
}

const handleCreate = () => {
  modalTitle.value = '新增证据'
  Object.assign(formData, {
    evidenceName: '',
    evidenceType: undefined,
    caseId: selectedCaseId.value,
    collectDate: undefined,
    location: '',
    collector: '',
    description: '',
    evidence_name: '',
    evidence_type: undefined,
    case: selectedCaseId.value,
    evidence_desc: '',
    file: undefined
  })
  modalVisible.value = true
}

const handleExport = () => {
  message.success('导出成功')
}

// 删除证据
const handleDelete = (record: Evidence) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除证据"${record.name}"吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        await caseService.deleteEvidence(record.id)
        message.success('删除成功')
        fetchEvidences()
      } catch (error: any) {
        message.error(error.response?.data?.detail || '删除失败')
      }
    }
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的证据')
    return
  }
  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个证据吗？`,
    okText: '确认',
    cancelText: '取消',
    okType: 'danger',
    onOk: async () => {
      try {
        for (const id of selectedRowKeys.value) {
          await caseService.deleteEvidence(id)
        }
        message.success('批量删除成功')
        selectedRowKeys.value = []
        fetchEvidences()
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

const handleModalOk = async () => {
  if (!formData.evidenceName || !formData.evidenceType) {
    message.warning('请填写必填项')
    return
  }
  try {
    await caseService.addEvidence({
      name: formData.evidenceName,
      evidence_type: formData.evidenceType,
      case: formData.caseId || selectedCaseId.value,
      description: formData.description,
      file: formData.file
    })
    message.success('保存成功')
    modalVisible.value = false
    fetchEvidences()
  } catch (error: any) {
    message.error(error.response?.data?.detail || '保存失败')
  }
}
</script>

<style scoped>
.investigation-page {
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
.evidence-no {
  font-family: monospace;
  color: #1890FF;
}
.collector-name {
  margin-left: 8px;
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
