<template>
  <div class="regulation-page">
    <a-breadcrumb class="page-breadcrumb">
      <a-breadcrumb-item>
        <HomeOutlined />
      </a-breadcrumb-item>
      <a-breadcrumb-item>系统管理</a-breadcrumb-item>
      <a-breadcrumb-item>法规库</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">法规库</h1>
      <a-button type="primary" @click="handleAdd">
        <template #icon>
          <PlusOutlined />
        </template>
        新增法规
      </a-button>
    </div>

    <div class="page-card filter-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索法规名称、文号..."
            class="search-input"
            allow-clear
          />
          <a-select v-model:value="filterType" placeholder="法规类型" allow-clear class="filter-select">
            <a-select-option value="law">法律</a-select-option>
            <a-select-option value="regulation">法规</a-select-option>
            <a-select-option value="rule">规章</a-select-option>
            <a-select-option value="policy">规范性文件</a-select-option>
          </a-select>
          <a-select v-model:value="filterLevel" placeholder="效力层级" allow-clear class="filter-select">
            <a-select-option value="national">国家级</a-select-option>
            <a-select-option value="provincial">省级</a-select-option>
            <a-select-option value="city">市级</a-select-option>
            <a-select-option value="district">区县级</a-select-option>
          </a-select>
        </div>
        <div class="toolbar-right">
          <a-button @click="handleImport">
            <template #icon>
              <ImportOutlined />
            </template>
            导入
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
          <template v-if="column.key === 'title'">
            <div class="regulation-title">
              <FileTextOutlined class="title-icon" />
              <span>{{ record.title }}</span>
            </div>
          </template>
          <template v-if="column.key === 'type'">
            <a-tag :color="getTypeColor(record.type)">{{ record.type }}</a-tag>
          </template>
          <template v-if="column.key === 'level'">
            <a-tag :color="getLevelColor(record.level)">{{ record.level }}</a-tag>
          </template>
          <template v-if="column.key === 'effectiveDate'">
            <span>{{ record.effectiveDate }}</span>
          </template>
          <template v-if="column.key === 'action'">
            <span class="action-links">
              <a class="action-link" @click="handleView(record)">
                <EyeOutlined /> 查看
              </a>
              <a class="action-link" @click="handleDownload(record)">
                <DownloadOutlined /> 下载
              </a>
              <a class="action-link" @click="handleEdit(record)">
                <EditOutlined /> 编辑
              </a>
            </span>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      width="800px"
      :footer="null"
    >
      <a-form :model="formData" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="法规标题" required>
          <a-input v-model:value="formData.title" placeholder="请输入法规标题" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="法规文号">
              <a-input v-model:value="formData.document_no" placeholder="如：主席令第XX号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="法规类型" required>
              <a-select v-model:value="formData.category" placeholder="请选择">
                <a-select-option value="law">法律</a-select-option>
                <a-select-option value="regulation">法规</a-select-option>
                <a-select-option value="rule">规章</a-select-option>
                <a-select-option value="policy">规范性文件</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="效力层级">
              <a-select v-model:value="formData.level" placeholder="请选择">
                <a-select-option value="national">国家级</a-select-option>
                <a-select-option value="provincial">省级</a-select-option>
                <a-select-option value="city">市级</a-select-option>
                <a-select-option value="district">区县级</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="发布日期">
              <a-date-picker v-model:value="formData.publish_date" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="施行日期">
              <a-date-picker v-model:value="formData.effective_date" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="发布部门">
              <a-input v-model:value="formData.issuing_authority" placeholder="请输入发布部门" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="法规内容">
          <a-textarea v-model:value="formData.content" :rows="4" placeholder="请输入法规内容" />
        </a-form-item>
        <a-form-item label="附件上传">
          <a-upload-dragger>
            <p class="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p class="ant-upload-text">点击或拖拽上传法规文件</p>
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
  ImportOutlined,
  ExportOutlined,
  FileTextOutlined,
  EyeOutlined,
  DownloadOutlined,
  EditOutlined,
  TagOutlined,
  InboxOutlined
} from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { regulationService, type Regulation, type RegulationCategory, type RegulationLevel } from '@/api'

const columns: TableColumnsType = [
  { title: '法规标题', dataIndex: 'title', key: 'title', ellipsis: true },
  { title: '法规文号', dataIndex: 'document_no', key: 'documentNo', width: 180 },
  { title: '类型', dataIndex: 'category', key: 'type', width: 100 },
  { title: '效力层级', dataIndex: 'level', key: 'level', width: 100 },
  { title: '发布日期', dataIndex: 'publish_date', key: 'publishDate', width: 120 },
  { title: '施行日期', dataIndex: 'effective_date', key: 'effectiveDate', width: 120 },
  { title: '发布部门', dataIndex: 'issuing_authority', key: 'department', width: 150 },
  { title: '操作', key: 'action', width: 180 }
]

const loading = ref(false)
const searchText = ref('')
const filterType = ref<string | undefined>(undefined)
const filterLevel = ref<string | undefined>(undefined)
const modalVisible = ref(false)
const modalTitle = ref('新增法规')

const formData = reactive({
  id: undefined as number | undefined,
  title: '',
  document_no: '',
  category: undefined as RegulationCategory | undefined,
  level: undefined as RegulationLevel | undefined,
  publish_date: null as any,
  effective_date: null as any,
  issuing_authority: '',
  content: ''
})

// 真实数据
const regulationData = ref<Regulation[]>([])
const totalCount = ref(0)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// 获取法规列表
const fetchRegulations = async () => {
  loading.value = true
  try {
    const result = await regulationService.getRegulations({
      search: searchText.value || undefined,
      category: filterType.value as RegulationCategory || undefined,
      is_valid: filterLevel.value === 'valid' ? true : undefined,
      page: pagination.current,
      page_size: pagination.pageSize
    })
    regulationData.value = result.results || []
    totalCount.value = result.count || 0
    pagination.total = totalCount.value
  } catch (error: any) {
    message.error(error.response?.data?.detail || '获取数据失败')
  } finally {
    loading.value = false
  }
}

// 监听筛选条件变化
watch([searchText, filterType, filterLevel], () => {
  pagination.current = 1
  fetchRegulations()
}, { deep: true })

// 初始化
onMounted(() => {
  fetchRegulations()
})

const filteredData = computed(() => {
  return regulationData.value.map(item => ({
    ...item,
    type: getTypeLabel(item.category),
    level: getLevelLabel(item.level),
    publishDate: item.publish_date || '-',
    effectiveDate: item.effective_date || '-',
    documentNo: item.document_no || '-'
  }))
})

const getTypeColor = (type: string) => {
  const map: Record<string, string> = {
    law: 'red',
    regulation: 'orange',
    rule: 'blue',
    policy: 'green'
  }
  return map[type] || 'default'
}

const getTypeLabel = (type: string) => {
  const options = regulationService.getTypeOptions()
  return options.find(o => o.value === type)?.label || type
}

const getLevelColor = (level: string) => {
  const map: Record<string, string> = {
    national: 'purple',
    provincial: 'cyan',
    city: 'blue',
    district: 'geekblue'
  }
  return map[level] || 'default'
}

const getLevelLabel = (level: string) => {
  const options = regulationService.getLevelOptions()
  return options.find(o => o.value === level)?.label || level
}

const handleView = (record: Regulation) => {
  message.info(`查看法规: ${record.title}`)
}

const handleDownload = (record: Regulation) => {
  message.success(`下载法规: ${record.title}`)
}

const handleAdd = () => {
  modalTitle.value = '新增法规'
  Object.assign(formData, {
    id: undefined, title: '', document_no: '', category: undefined, level: undefined,
    publish_date: null, effective_date: null, issuing_authority: '', content: ''
  })
  modalVisible.value = true
}

const handleEdit = (record: Regulation) => {
  modalTitle.value = '编辑法规'
  Object.assign(formData, {
    id: record.id,
    title: record.title,
    document_no: record.document_no,
    category: record.category,
    level: record.level,
    publish_date: record.publish_date ? dayjs(record.publish_date) : null,
    effective_date: record.effective_date ? dayjs(record.effective_date) : null,
    issuing_authority: record.issuing_authority || '',
    content: record.content
  })
  modalVisible.value = true
}

const handleImport = () => {
  message.info('导入功能开发中...')
}

const handleExport = () => {
  message.success('导出成功')
}

const handleModalOk = async () => {
  if (!formData.title || !formData.category) {
    message.warning('请填写必填项')
    return
  }
  try {
    if (formData.id) {
      await regulationService.updateRegulation(formData.id, {
        title: formData.title,
        document_no: formData.document_no,
        category: formData.category,
        level: formData.level,
        issuing_authority: formData.issuing_authority,
        content: formData.content,
        publish_date: formData.publish_date ? dayjs(formData.publish_date).format('YYYY-MM-DD') : undefined,
        effective_date: formData.effective_date ? dayjs(formData.effective_date).format('YYYY-MM-DD') : undefined
      })
      message.success('更新成功')
    } else {
      await regulationService.createRegulation({
        title: formData.title,
        document_no: formData.document_no,
        category: formData.category,
        level: formData.level,
        issuing_authority: formData.issuing_authority,
        content: formData.content,
        publish_date: formData.publish_date ? dayjs(formData.publish_date).format('YYYY-MM-DD') : undefined,
        effective_date: formData.effective_date ? dayjs(formData.effective_date).format('YYYY-MM-DD') : undefined
      })
      message.success('保存成功')
    }
    modalVisible.value = false
    fetchRegulations()
  } catch (error: any) {
    message.error(error.response?.data?.detail || '操作失败')
  }
}
</script>

<style scoped>
.regulation-page {
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
.regulation-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.title-icon {
  color: #1890FF;
}
.effective-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #52C41A;
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
