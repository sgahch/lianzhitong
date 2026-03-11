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
        <a-button type="primary" @click="handleCreateMaterial">
          <template #icon>
            <PlusOutlined />
          </template>
          新建资料
        </a-button>
        <a-button type="primary" @click="handleCreateActivity">
          <template #icon>
            <CalendarOutlined />
          </template>
          创建活动
        </a-button>
      </a-space>
    </div>

    <div class="page-card filter-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索资料名称、活动..."
            class="search-input"
            allow-clear
          />
          <a-select v-model:value="filterType" placeholder="资料类型" allow-clear class="filter-select">
            <a-select-option value="policy">政策法规</a-select-option>
            <a-select-option value="case">典型案例</a-select-option>
            <a-select-option value="notice">警示教育</a-select-option>
            <a-select-option value="study">学习资料</a-select-option>
          </a-select>
          <a-select v-model:value="filterStatus" placeholder="发布状态" allow-clear class="filter-select">
            <a-select-option value="published">已发布</a-select-option>
            <a-select-option value="draft">草稿</a-select-option>
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
      <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
        <a-tab-pane key="material" tab="教育资料">
          <a-table
            v-model:selected-row-keys="selectedMaterialKeys"
            :row-selection="materialRowSelection"
            :columns="materialColumns"
            :data-source="filteredMaterials"
            :pagination="materialPagination"
            :row-key="(record: any) => record.id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'title'">
                <div class="material-title">
                  <FileTextOutlined class="material-icon" />
                  <span>{{ record.title }}</span>
                </div>
              </template>
              <template v-if="column.key === 'category'">
                <a-tag :color="getCategoryColor(record.category)">{{ record.category }}</a-tag>
              </template>
              <template v-if="column.key === 'status'">
                <a-badge :status="record.published ? 'success' : 'warning'" :text="record.published ? '已发布' : '草稿'" />
              </template>
              <template v-if="column.key === 'views'">
                <span class="view-count">
                  <EyeOutlined /> {{ record.views }}
                </span>
              </template>
              <template v-if="column.key === 'action'">
                <span class="action-links">
                  <a class="action-link" @click="handleViewMaterial(record)">
                    <EyeOutlined /> 查看
                  </a>
                  <a class="action-link" @click="handleEditMaterial(record)">
                    <EditOutlined /> 编辑
                  </a>
                  <a class="action-link" @click="handlePublishMaterial(record)" v-if="!record.published">
                    <CloudUploadOutlined /> 发布
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
            v-model:selected-row-keys="selectedActivityKeys"
            :row-selection="activityRowSelection"
            :columns="activityColumns"
            :data-source="filteredActivities"
            :pagination="activityPagination"
            :row-key="(record: any) => record.id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'title'">
                <div class="activity-title">
                  <CalendarOutlined class="activity-icon" />
                  <span>{{ record.title }}</span>
                </div>
              </template>
              <template v-if="column.key === 'status'">
                <a-badge :status="getActivityStatus(record)" :text="record.statusText" />
              </template>
              <template v-if="column.key === 'participants'">
                <a-progress :percent="record.enrolledCount / record.maxParticipants * 100" size="small" />
                <span class="participant-count">{{ record.enrolledCount }}/{{ record.maxParticipants }}人</span>
              </template>
              <template v-if="column.key === 'action'">
                <span class="action-links">
                  <a class="action-link" @click="handleViewActivity(record)">
                    <EyeOutlined /> 查看
                  </a>
                  <a class="action-link" @click="handleEditActivity(record)">
                    <EditOutlined /> 编辑
                  </a>
                  <a class="action-link" @click="handleManageActivity(record)">
                    <TeamOutlined /> 管理
                  </a>
                  <a class="action-link danger" @click="handleDeleteActivity(record)">
                    <DeleteOutlined /> 删除
                  </a>
                </span>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="statistics" tab="学习统计">
          <a-row :gutter="16" class="stats-row">
            <a-col :span="6">
              <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%)">
                  <FileTextOutlined />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ materialData.length }}</div>
                  <div class="stat-label">教育资料总数</div>
                </div>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #52C41A 0%, #389E0D 100%)">
                  <CalendarOutlined />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ activityData.filter(a => a.status !== 'ended').length }}</div>
                  <div class="stat-label">进行中活动</div>
                </div>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #FA8C16 0%, #D46B08 100%)">
                  <TeamOutlined />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ totalParticipants }}</div>
                  <div class="stat-label">参与人次</div>
                </div>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #722ED1 0%, #531DAB 100%)">
                  <CheckCircleOutlined />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ completedCount }}</div>
                  <div class="stat-label">完成人数</div>
                </div>
              </div>
            </a-col>
          </a-row>

          <div class="charts-section">
            <a-card title="部门学习排名" class="chart-card">
              <a-table
                :columns="rankColumns"
                :data-source="departmentRank"
                :pagination="false"
                size="small"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'rank'">
                    <span :class="'rank rank-' + record.rank">{{ record.rank }}</span>
                  </template>
                  <template v-if="column.key === 'progress'">
                    <a-progress :percent="record.progress" size="small" :stroke-color="getProgressColor(record.progress)" />
                  </template>
                </template>
              </a-table>
            </a-card>
            <a-card title="学习趋势" class="chart-card">
              <div class="trend-chart">
                <div class="trend-item" v-for="(item, index) in trendData" :key="index">
                  <div class="trend-date">{{ item.date }}</div>
                  <div class="trend-bar-container">
                    <div class="trend-bar" :style="{ height: item.count * 5 + 'px' }"></div>
                  </div>
                  <div class="trend-value">{{ item.count }}</div>
                </div>
              </div>
            </a-card>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 新建/编辑资料弹窗 -->
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
            <a-select-option value="政策法规">政策法规</a-select-option>
            <a-select-option value="典型案例">典型案例</a-select-option>
            <a-select-option value="警示教育">警示教育</a-select-option>
            <a-select-option value="学习资料">学习资料</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="资料内容">
          <a-textarea v-model:value="materialFormData.content" :rows="6" placeholder="请输入资料内容摘要" />
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

    <!-- 创建/编辑活动弹窗 -->
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
        <a-form-item label="活动类型">
          <a-select v-model:value="activityFormData.type" placeholder="请选择">
            <a-select-option value="集中学习">集中学习</a-select-option>
            <a-select-option value="专题讲座">专题讲座</a-select-option>
            <a-select-option value="警示教育">警示教育</a-select-option>
            <a-select-option value="知识测试">知识测试</a-select-option>
          </a-select>
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="开始时间">
              <a-date-picker v-model:value="activityFormData.startDate" style="width: 100%" show-time />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="结束时间">
              <a-date-picker v-model:value="activityFormData.endDate" style="width: 100%" show-time />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="参与人数">
              <a-input-number v-model:value="activityFormData.maxParticipants" :min="1" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="活动地点">
              <a-input v-model:value="activityFormData.location" placeholder="请输入活动地点" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="活动内容">
          <a-textarea v-model:value="activityFormData.description" :rows="4" placeholder="请输入活动内容描述" />
        </a-form-item>
        <a-form-item label="参与人员">
          <a-select mode="multiple" v-model:value="activityFormData.departments" placeholder="请选择参与部门">
            <a-select-option value="第一纪检监察室">第一纪检监察室</a-select-option>
            <a-select-option value="第二纪检监察室">第二纪检监察室</a-select-option>
            <a-select-option value="第三纪检监察室">第三纪检监察室</a-select-option>
            <a-select-option value="组织部">组织部</a-select-option>
          </a-select>
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
import { ref, computed, reactive } from 'vue'
import {
  HomeOutlined,
  PlusOutlined,
  CalendarOutlined,
  ExportOutlined,
  EyeOutlined,
  EditOutlined,
  FileTextOutlined,
  CloudUploadOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'

const activeTab = ref('material')
const searchText = ref('')
const filterType = ref<string | undefined>(undefined)
const filterStatus = ref<string | undefined>(undefined)
const selectedMaterialKeys = ref<number[]>([])
const selectedActivityKeys = ref<number[]>([])

// 资料相关
const materialModalVisible = ref(false)
const materialModalTitle = ref('新建资料')
const materialFormData = reactive({
  id: undefined as number | undefined,
  title: '',
  category: undefined as string | undefined,
  content: ''
})

const materialColumns: TableColumnsType = [
  { title: '资料标题', dataIndex: 'title', key: 'title', ellipsis: true },
  { title: '资料类型', dataIndex: 'category', key: 'category', width: 120 },
  { title: '发布时间', dataIndex: 'publishDate', key: 'publishDate', width: 120 },
  { title: '浏览量', dataIndex: 'views', key: 'views', width: 100 },
  { title: '发布状态', dataIndex: 'published', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 200 }
]

const materialData = ref([
  { id: 1, title: '中国共产党纪律处分条例（修订后）', category: '政策法规', publishDate: '2025-01-20', views: 1256, published: true },
  { id: 2, title: '某局长违规收受礼品典型案例剖析', category: '典型案例', publishDate: '2025-01-18', views: 892, published: true },
  { id: 3, title: '警示教育片《警钟长鸣》观后感', category: '警示教育', publishDate: '2025-01-15', views: 567, published: true },
  { id: 4, title: '廉政风险防控知识手册', category: '学习资料', publishDate: '2025-01-10', views: 423, published: false },
  { id: 5, title: '监察法实施条例解读', category: '政策法规', publishDate: '2025-01-08', views: 1089, published: true },
])

const materialPagination = reactive({
  current: 1,
  pageSize: 10,
  total: materialData.value.length,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const filteredMaterials = computed(() => {
  let result = [...materialData.value]
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    result = result.filter(r => r.title.toLowerCase().includes(keyword))
  }
  if (filterType.value) {
    const typeMap: Record<string, string> = { policy: '政策法规', case: '典型案例', notice: '警示教育', study: '学习资料' }
    result = result.filter(r => r.category === typeMap[filterType.value!])
  }
  if (filterStatus.value) {
    const statusMap: Record<string, boolean> = { published: true, draft: false }
    result = result.filter(r => r.published === statusMap[filterStatus.value!])
  }
  return result
})

// 活动相关
const activityModalVisible = ref(false)
const activityModalTitle = ref('创建活动')
const activityFormData = reactive({
  id: undefined as number | undefined,
  title: '',
  type: undefined as string | undefined,
  startDate: null as any,
  endDate: null as any,
  maxParticipants: 50,
  location: '',
  description: '',
  departments: [] as string[]
})

const activityColumns: TableColumnsType = [
  { title: '活动标题', dataIndex: 'title', key: 'title', ellipsis: true },
  { title: '活动类型', dataIndex: 'type', key: 'type', width: 120 },
  { title: '开始时间', dataIndex: 'startDate', key: 'startDate', width: 140 },
  { title: '参与情况', dataIndex: 'participants', key: 'participants', width: 160 },
  { title: '活动状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 200 }
]

const activityData = ref([
  { id: 1, title: '2025年第一季度廉政党课', type: '集中学习', startDate: '2025-01-25 14:00', endDate: '2025-01-25 16:00', maxParticipants: 100, enrolledCount: 78, status: 'ongoing', statusText: '进行中' },
  { id: 2, title: '监察法专题讲座', type: '专题讲座', startDate: '2025-01-20 09:00', endDate: '2025-01-20 11:00', maxParticipants: 80, enrolledCount: 80, status: 'ended', statusText: '已结束' },
  { id: 3, title: '警示教育片观看活动', type: '警示教育', startDate: '2025-01-28 14:00', endDate: '2025-01-28 16:30', maxParticipants: 60, enrolledCount: 45, status: 'upcoming', statusText: '待开始' },
  { id: 4, title: '廉政知识测试（第一期）', type: '知识测试', startDate: '2025-02-01 10:00', endDate: '2025-02-01 11:30', maxParticipants: 120, enrolledCount: 98, status: 'upcoming', statusText: '待开始' },
  { id: 5, title: '党风廉政专题研讨', type: '集中学习', startDate: '2025-01-18 14:00', endDate: '2025-01-18 17:00', maxParticipants: 40, enrolledCount: 40, status: 'ended', statusText: '已结束' },
])

const activityPagination = reactive({
  current: 1,
  pageSize: 10,
  total: activityData.value.length,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const filteredActivities = computed(() => {
  let result = [...activityData.value]
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    result = result.filter(r => r.title.toLowerCase().includes(keyword))
  }
  return result
})

// 统计相关
const totalParticipants = computed(() => {
  return activityData.value.reduce((sum, a) => sum + a.enrolledCount, 0)
})

const completedCount = computed(() => {
  return activityData.value.filter(a => a.status === 'ended').reduce((sum, a) => sum + a.enrolledCount, 0)
})

const rankColumns: TableColumnsType = [
  { title: '排名', dataIndex: 'rank', key: 'rank', width: 80 },
  { title: '部门名称', dataIndex: 'department', key: 'department', width: 150 },
  { title: '学习人数', dataIndex: 'count', key: 'count', width: 100 },
  { title: '完成率', dataIndex: 'progress', key: 'progress', width: 200 },
]

const departmentRank = ref([
  { rank: 1, department: '第一纪检监察室', count: 28, progress: 100 },
  { rank: 2, department: '组织部', count: 25, progress: 95 },
  { rank: 3, department: '第二纪检监察室', count: 24, progress: 92 },
  { rank: 4, department: '宣传部', count: 22, progress: 88 },
  { rank: 5, department: '第三纪检监察室', count: 20, progress: 85 },
])

const trendData = ref([
  { date: '01-20', count: 45 },
  { date: '01-21', count: 52 },
  { date: '01-22', count: 38 },
  { date: '01-23', count: 65 },
  { date: '01-24', count: 78 },
  { date: '01-25', count: 92 },
  { date: '01-26', count: 86 },
])

// 方法
const getCategoryColor = (category: string) => {
  const map: Record<string, string> = {
    '政策法规': 'blue',
    '典型案例': 'red',
    '警示教育': 'orange',
    '学习资料': 'green'
  }
  return map[category] || 'default'
}

const getActivityStatus = (record: any) => {
  const now = new Date()
  const startDate = new Date(record.startDate)
  const endDate = new Date(record.endDate)
  if (now < startDate) return 'default'
  if (now > endDate) return 'success'
  return 'processing'
}

const getProgressColor = (progress: number) => {
  if (progress >= 90) return '#52C41A'
  if (progress >= 70) return '#1890FF'
  return '#FA8C16'
}

const handleTabChange = (key: string) => {
  activeTab.value = key
}

// 资料操作
const handleCreateMaterial = () => {
  materialModalTitle.value = '新建资料'
  Object.assign(materialFormData, { id: undefined, title: '', category: undefined, content: '' })
  materialModalVisible.value = true
}

const handleViewMaterial = (record: any) => {
  message.info(`查看资料: ${record.title}`)
}

const handleEditMaterial = (record: any) => {
  materialModalTitle.value = '编辑资料'
  Object.assign(materialFormData, { id: record.id, title: record.title, category: record.category, content: '' })
  materialModalVisible.value = true
}

const handlePublishMaterial = (record: any) => {
  record.published = true
  message.success('发布成功')
}

const handleMaterialModalOk = () => {
  if (!materialFormData.title || !materialFormData.category) {
    message.warning('请填写必填项')
    return
  }
  const newId = Math.max(...materialData.value.map(r => r.id), 0) + 1
  materialData.value.unshift({
    id: newId,
    title: materialFormData.title,
    category: materialFormData.category,
    publishDate: new Date().toISOString().slice(0, 10),
    views: 0,
    published: false
  })
  message.success('保存成功')
  materialModalVisible.value = false
}

// 活动操作
const handleCreateActivity = () => {
  activityModalTitle.value = '创建活动'
  Object.assign(activityFormData, {
    id: undefined, title: '', type: undefined, startDate: null, endDate: null,
    maxParticipants: 50, location: '', description: '', departments: []
  })
  activityModalVisible.value = true
}

const handleViewActivity = (record: any) => {
  message.info(`查看活动: ${record.title}`)
}

const handleEditActivity = (record: any) => {
  activityModalTitle.value = '编辑活动'
  Object.assign(activityFormData, { id: record.id, title: record.title, type: record.type, startDate: null, endDate: null, maxParticipants: record.maxParticipants, location: '', description: '', departments: [] })
  activityModalVisible.value = true
}

const handleManageActivity = (record: any) => {
  message.info(`管理活动: ${record.title}`)
}

const handleActivityModalOk = () => {
  if (!activityFormData.title) {
    message.warning('请填写活动标题')
    return
  }
  const newId = Math.max(...activityData.value.map(r => r.id), 0) + 1
  activityData.value.unshift({
    id: newId,
    title: activityFormData.title,
    type: activityFormData.type || '集中学习',
    startDate: activityFormData.startDate ? dayjs(activityFormData.startDate).format('YYYY-MM-DD HH:mm') : '',
    endDate: activityFormData.endDate ? dayjs(activityFormData.endDate).format('YYYY-MM-DD HH:mm') : '',
    maxParticipants: activityFormData.maxParticipants,
    enrolledCount: 0,
    status: 'upcoming',
    statusText: '待开始'
  })
  message.success('保存成功')
  activityModalVisible.value = false
}

const handleExport = () => {
  message.success('导出成功')
}

// 删除教育资料
const handleDeleteMaterial = (record: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除资料"${record.title}"吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      const index = materialData.value.findIndex(item => item.id === record.id)
      if (index > -1) {
        materialData.value.splice(index, 1)
        message.success('删除成功')
      }
    }
  })
}

// 删除教育活动
const handleDeleteActivity = (record: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除活动"${record.title}"吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      const index = activityData.value.findIndex(item => item.id === record.id)
      if (index > -1) {
        activityData.value.splice(index, 1)
        message.success('删除成功')
      }
    }
  })
}

// 批量删除
const handleBatchDelete = () => {
  const currentKeys = activeTab.value === 'material' ? selectedMaterialKeys.value : selectedActivityKeys.value
  const currentData = activeTab.value === 'material' ? materialData : activityData
  const itemType = activeTab.value === 'material' ? '资料' : '活动'

  if (currentKeys.length === 0) {
    message.warning(`请选择要删除的${itemType}`)
    return
  }

  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${currentKeys.length} 个${itemType}吗？`,
    okText: '确认',
    cancelText: '取消',
    okType: 'danger',
    onOk: () => {
      currentData.value = currentData.value.filter(item => !currentKeys.includes(item.id))
      if (activeTab.value === 'material') {
        selectedMaterialKeys.value = []
      } else {
        selectedActivityKeys.value = []
      }
      message.success('批量删除成功')
    }
  })
}

// 行选择配置
const materialRowSelection = {
  selectedRowKeys: selectedMaterialKeys,
  onChange: (keys: number[]) => {
    selectedMaterialKeys.value = keys
  }
}

const activityRowSelection = {
  selectedRowKeys: selectedActivityKeys,
  onChange: (keys: number[]) => {
    selectedActivityKeys.value = keys
  }
}

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
.material-icon,
.activity-icon {
  color: #1890FF;
}
.view-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #8c8c8c;
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
.participant-count {
  font-size: 12px;
  color: #8c8c8c;
  margin-left: 8px;
}
.stats-row {
  margin-bottom: 16px;
}
.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}
.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1f1f1f;
}
.stat-label {
  font-size: 14px;
  color: #8c8c8c;
}
.charts-section {
  display: flex;
  gap: 16px;
}
.chart-card {
  flex: 1;
}
.trend-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 200px;
  padding-top: 20px;
}
.trend-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.trend-date {
  font-size: 12px;
  color: #8c8c8c;
}
.trend-bar-container {
  width: 40px;
  height: 150px;
  background: #f0f0f0;
  border-radius: 4px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.trend-bar {
  width: 100%;
  background: linear-gradient(180deg, #1890FF 0%, #096DD9 100%);
  border-radius: 4px;
  transition: height 0.3s;
}
.trend-value {
  font-size: 12px;
  color: #1f1f1f;
}
.rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-weight: 600;
}
.rank-1 {
  background: #FFF7E6;
  color: #FA8C16;
}
.rank-2 {
  background: #F5F5F5;
  color: #8C8C8C;
}
.rank-3 {
  background: #FFF1F0;
  color: #F5222D;
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
