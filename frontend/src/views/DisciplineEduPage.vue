<template>
  <div class="education-page">
    <a-breadcrumb class="page-breadcrumb">
      <a-breadcrumb-item>
        <HomeOutlined />
      </a-breadcrumb-item>
      <a-breadcrumb-item>日常业务</a-breadcrumb-item>
      <a-breadcrumb-item>纪律教育</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">纪律教育</h1>
      <a-space>
        <a-button type="primary" @click="handleAddMaterial">
          <template #icon>
            <PlusOutlined />
          </template>
          新增资料
        </a-button>
        <a-button type="primary" @click="handleAddActivity">
          <template #icon>
            <CalendarOutlined />
          </template>
          新建活动
        </a-button>
      </a-space>
    </div>

    <div class="page-card filter-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索资料标题、活动名称..."
            class="search-input"
            allow-clear
            @search="handleSearch"
          />
        </div>
        <div class="toolbar-right">
          <a-select v-model:value="filterCategory" placeholder="资料类型" allow-clear class="filter-select" @change="handleFilterChange">
            <a-select-option value="policy">政策法规</a-select-option>
            <a-select-option value="case">典型案例</a-select-option>
            <a-select-option value="notice">通知公告</a-select-option>
            <a-select-option value="study">学习材料</a-select-option>
          </a-select>
        </div>
      </div>
    </div>

    <div class="page-card">
      <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
        <a-tab-pane key="material" tab="教育资料">
          <a-table
            :columns="materialColumns"
            :data-source="filteredMaterials"
            :pagination="materialPagination"
            :loading="loading"
            :row-key="(record: EducationMaterial) => record.id"
            @change="handleMaterialTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'title'">
                <div class="material-title">
                  <FileTextOutlined class="title-icon" />
                  <span>{{ record.title }}</span>
                </div>
              </template>
              <template v-if="column.key === 'category'">
                <a-tag :color="getCategoryColor(record.category)">{{ getCategoryLabel(record.category) }}</a-tag>
              </template>
              <template v-if="column.key === 'action'">
                <span class="action-links">
                  <a class="action-link" @click="handleViewMaterial(record)">
                    <EyeOutlined /> 查看
                  </a>
                  <a class="action-link" @click="handleEditMaterial(record)">
                    <EditOutlined /> 编辑
                  </a>
                  <a class="action-link danger" @click="handleDeleteMaterial(record)">
                    <DeleteOutlined /> 删除
                  </a>
                </span>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="activity" tab="教育活动">
          <a-table
            :columns="activityColumns"
            :data-source="filteredActivities"
            :pagination="activityPagination"
            :loading="loading"
            :row-key="(record: EducationActivity) => record.id"
            @change="handleActivityTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'title'">
                <div class="activity-title">
                  <CalendarOutlined class="title-icon" />
                  <span>{{ record.title }}</span>
                </div>
              </template>
              <template v-if="column.key === 'status'">
                <a-badge :status="getStatusType(record.status)" :text="record.status_name || record.status" />
              </template>
              <template v-if="column.key === 'action'">
                <span class="action-links">
                  <a class="action-link" @click="handleViewActivity(record)">
                    <EyeOutlined /> 查看
                  </a>
                  <a class="action-link" @click="handleEditActivity(record)">
                    <EditOutlined /> 编辑
                  </a>
                  <a class="action-link danger" @click="handleDeleteActivity(record)">
                    <DeleteOutlined /> 删除
                  </a>
                </span>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 新增/编辑资料弹窗 -->
    <a-modal
      v-model:open="materialModalVisible"
      :title="materialModalTitle"
      width="700px"
      :footer="null"
    >
      <a-form :model="materialFormData" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="资料标题" required>
          <a-input v-model:value="materialFormData.title" placeholder="请输入资料标题" />
        </a-form-item>
        <a-form-item label="资料类型" required>
          <a-select v-model:value="materialFormData.category" placeholder="请选择">
            <a-select-option value="policy">政策法规</a-select-option>
            <a-select-option value="case">典型案例</a-select-option>
            <a-select-option value="notice">通知公告</a-select-option>
            <a-select-option value="study">学习材料</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="资料来源">
          <a-input v-model:value="materialFormData.source" placeholder="请输入资料来源" />
        </a-form-item>
        <a-form-item label="资料内容">
          <a-textarea v-model:value="materialFormData.content" :rows="4" placeholder="请输入资料内容" />
        </a-form-item>
        <a-form-item label="附件上传">
          <a-upload-dragger>
            <p class="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p class="ant-upload-text">点击或拖拽上传资料文件</p>
          </a-upload-dragger>
        </a-form-item>
      </a-form>
      <div class="modal-footer">
        <a-space>
          <a-button @click="materialModalVisible = false">取消</a-button>
          <a-button type="primary" @click="handleMaterialModalOk">保存</a-button>
        </a-space>
      </div>
    </a-modal>

    <!-- 新增/编辑活动弹窗 -->
    <a-modal
      v-model:open="activityModalVisible"
      :title="activityModalTitle"
      width="700px"
      :footer="null"
    >
      <a-form :model="activityFormData" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="活动标题" required>
          <a-input v-model:value="activityFormData.title" placeholder="请输入活动标题" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="活动类型">
              <a-input v-model:value="activityFormData.activity_type" placeholder="请输入活动类型" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="活动状态">
              <a-select v-model:value="activityFormData.status" placeholder="请选择">
                <a-select-option value="upcoming">未开始</a-select-option>
                <a-select-option value="ongoing">进行中</a-select-option>
                <a-select-option value="completed">已结束</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="开始时间">
              <a-date-picker v-model:value="activityFormData.start_time" style="width: 100%" show-time />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="结束时间">
              <a-date-picker v-model:value="activityFormData.end_time" style="width: 100%" show-time />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="活动地点">
          <a-input v-model:value="activityFormData.location" placeholder="请输入活动地点" />
        </a-form-item>
        <a-form-item label="参与人员">
          <a-input v-model:value="activityFormData.participants" placeholder="请输入参与人员" />
        </a-form-item>
        <a-form-item label="活动内容">
          <a-textarea v-model:value="activityFormData.content" :rows="3" placeholder="请输入活动内容" />
        </a-form-item>
      </a-form>
      <div class="modal-footer">
        <a-space>
          <a-button @click="activityModalVisible = false">取消</a-button>
          <a-button type="primary" @click="handleActivityModalOk">保存</a-button>
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import {
  HomeOutlined,
  PlusOutlined,
  CalendarOutlined,
  FileTextOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  InboxOutlined
} from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { educationService, type EducationMaterial, type EducationActivity, type EducationCategory } from '@/api'

const activeTab = ref('material')
const searchText = ref('')
const filterCategory = ref<string | undefined>(undefined)
const loading = ref(false)

// ========== 教育资料 ==========
const materialModalVisible = ref(false)
const materialModalTitle = ref('新增资料')
const materialData = ref<EducationMaterial[]>([])

const materialFormData = reactive({
  id: undefined as number | undefined,
  title: '',
  category: undefined as EducationCategory | undefined,
  source: '',
  content: ''
})

const materialColumns: TableColumnsType = [
  { title: '资料标题', dataIndex: 'title', key: 'title', ellipsis: true },
  { title: '类型', dataIndex: 'category', key: 'category', width: 120 },
  { title: '来源', dataIndex: 'source', key: 'source', width: 150 },
  { title: '浏览次数', dataIndex: 'view_count', key: 'viewCount', width: 100 },
  { title: '操作', key: 'action', width: 180 }
]

const materialPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const fetchMaterials = async () => {
  loading.value = true
  try {
    const result = await educationService.getMaterials({
      search: searchText.value || undefined,
      category: filterCategory.value as EducationCategory || undefined,
      page: materialPagination.current,
      page_size: materialPagination.pageSize
    })
    materialData.value = result.results || []
    materialPagination.total = result.count || 0
  } catch (error: any) {
    message.error(error.response?.data?.detail || '获取资料数据失败')
  } finally {
    loading.value = false
  }
}

const filteredMaterials = computed(() => {
  return materialData.value.map(item => ({
    ...item,
    category: getCategoryLabel(item.category),
    viewCount: item.view_count
  }))
})

const getCategoryColor = (category: string) => {
  const map: Record<string, string> = {
    policy: 'blue',
    case: 'red',
    notice: 'orange',
    study: 'green'
  }
  return map[category] || 'default'
}

const getCategoryLabel = (category: string) => {
  const options = educationService.getCategoryOptions()
  return options.find(o => o.value === category)?.label || category
}

const handleSearch = () => {
  materialPagination.current = 1
  fetchMaterials()
}

const handleFilterChange = () => {
  materialPagination.current = 1
  fetchMaterials()
}

const handleMaterialTableChange = (pag: any) => {
  materialPagination.current = pag.current
  materialPagination.pageSize = pag.pageSize
  fetchMaterials()
}

const handleAddMaterial = () => {
  materialModalTitle.value = '新增资料'
  Object.assign(materialFormData, { id: undefined, title: '', category: undefined, source: '', content: '' })
  materialModalVisible.value = true
}

const handleViewMaterial = (record: EducationMaterial) => {
  message.info(`查看资料: ${record.title}`)
}

const handleEditMaterial = (record: EducationMaterial) => {
  materialModalTitle.value = '编辑资料'
  Object.assign(materialFormData, {
    id: record.id,
    title: record.title,
    category: record.category,
    source: record.source || '',
    content: record.content
  })
  materialModalVisible.value = true
}

const handleDeleteMaterial = (record: EducationMaterial) => {
  educationService.deleteMaterial(record.id).then(() => {
    message.success('删除成功')
    fetchMaterials()
  }).catch((error: any) => {
    message.error(error.response?.data?.detail || '删除失败')
  })
}

const handleMaterialModalOk = async () => {
  if (!materialFormData.title || !materialFormData.category) {
    message.warning('请填写必填项')
    return
  }
  try {
    if (materialFormData.id) {
      await educationService.updateMaterial(materialFormData.id, {
        title: materialFormData.title,
        category: materialFormData.category,
        source: materialFormData.source,
        content: materialFormData.content
      })
      message.success('更新成功')
    } else {
      await educationService.createMaterial({
        title: materialFormData.title,
        category: materialFormData.category,
        source: materialFormData.source,
        content: materialFormData.content
      })
      message.success('保存成功')
    }
    materialModalVisible.value = false
    fetchMaterials()
  } catch (error: any) {
    message.error(error.response?.data?.detail || '操作失败')
  }
}

// ========== 教育活动 ==========
const activityModalVisible = ref(false)
const activityModalTitle = ref('新建活动')
const activityData = ref<EducationActivity[]>([])

const activityFormData = reactive({
  id: undefined as number | undefined,
  title: '',
  content: '',
  activity_type: '',
  start_time: null as any,
  end_time: null as any,
  location: '',
  participants: '',
  status: 'upcoming' as any
})

const activityColumns: TableColumnsType = [
  { title: '活动标题', dataIndex: 'title', key: 'title', ellipsis: true },
  { title: '活动类型', dataIndex: 'activity_type', key: 'activityType', width: 120 },
  { title: '活动时间', dataIndex: 'timeRange', key: 'timeRange', width: 180 },
  { title: '活动地点', dataIndex: 'location', key: 'location', width: 150 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 180 }
]

const activityPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const fetchActivities = async () => {
  loading.value = true
  try {
    const result = await educationService.getActivities({
      search: searchText.value || undefined,
      page: activityPagination.current,
      page_size: activityPagination.pageSize
    })
    activityData.value = result.results || []
    activityPagination.total = result.count || 0
  } catch (error: any) {
    message.error(error.response?.data?.detail || '获取活动数据失败')
  } finally {
    loading.value = false
  }
}

const filteredActivities = computed(() => {
  return activityData.value.map(item => ({
    ...item,
    timeRange: item.start_time && item.end_time
      ? `${dayjs(item.start_time).format('YYYY-MM-DD HH:mm')} 至 ${dayjs(item.end_time).format('YYYY-MM-DD HH:mm')}`
      : '-',
    location: item.location || '-'
  }))
})

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    upcoming: 'default',
    ongoing: 'processing',
    completed: 'success'
  }
  return map[status] || 'default'
}

const handleTabChange = (key: string) => {
  if (key === 'material') {
    materialPagination.current = 1
    fetchMaterials()
  } else {
    activityPagination.current = 1
    fetchActivities()
  }
}

const handleActivityTableChange = (pag: any) => {
  activityPagination.current = pag.current
  activityPagination.pageSize = pag.pageSize
  fetchActivities()
}

const handleAddActivity = () => {
  activityModalTitle.value = '新建活动'
  Object.assign(activityFormData, {
    id: undefined, title: '', content: '', activity_type: '',
    start_time: null, end_time: null, location: '', participants: '', status: 'upcoming'
  })
  activityModalVisible.value = true
}

const handleViewActivity = (record: EducationActivity) => {
  message.info(`查看活动: ${record.title}`)
}

const handleEditActivity = (record: EducationActivity) => {
  activityModalTitle.value = '编辑活动'
  Object.assign(activityFormData, {
    id: record.id,
    title: record.title,
    content: record.content,
    activity_type: record.activity_type || '',
    start_time: record.start_time ? dayjs(record.start_time) : null,
    end_time: record.end_time ? dayjs(record.end_time) : null,
    location: record.location || '',
    participants: record.participants || '',
    status: record.status
  })
  activityModalVisible.value = true
}

const handleDeleteActivity = (record: EducationActivity) => {
  educationService.deleteActivity(record.id).then(() => {
    message.success('删除成功')
    fetchActivities()
  }).catch((error: any) => {
    message.error(error.response?.data?.detail || '删除失败')
  })
}

const handleActivityModalOk = async () => {
  if (!activityFormData.title) {
    message.warning('请填写活动标题')
    return
  }
  try {
    if (activityFormData.id) {
      await educationService.updateActivity(activityFormData.id, {
        title: activityFormData.title,
        content: activityFormData.content,
        activity_type: activityFormData.activity_type,
        start_time: activityFormData.start_time ? dayjs(activityFormData.start_time).format('YYYY-MM-DD HH:mm:ss') : undefined,
        end_time: activityFormData.end_time ? dayjs(activityFormData.end_time).format('YYYY-MM-DD HH:mm:ss') : undefined,
        location: activityFormData.location,
        participants: activityFormData.participants,
        status: activityFormData.status
      })
      message.success('更新成功')
    } else {
      await educationService.createActivity({
        title: activityFormData.title,
        content: activityFormData.content,
        activity_type: activityFormData.activity_type,
        start_time: activityFormData.start_time ? dayjs(activityFormData.start_time).format('YYYY-MM-DD HH:mm:ss') : undefined,
        end_time: activityFormData.end_time ? dayjs(activityFormData.end_time).format('YYYY-MM-DD HH:mm:ss') : undefined,
        location: activityFormData.location,
        participants: activityFormData.participants,
        status: activityFormData.status
      })
      message.success('保存成功')
    }
    activityModalVisible.value = false
    fetchActivities()
  } catch (error: any) {
    message.error(error.response?.data?.detail || '操作失败')
  }
}

// 初始化
onMounted(() => {
  fetchMaterials()
})
</script>

<style scoped>
.education-page {
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
.material-title,
.activity-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.title-icon {
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
