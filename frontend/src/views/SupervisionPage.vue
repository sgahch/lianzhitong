<template>
  <div class="supervision-page">
    <a-breadcrumb class="page-breadcrumb">
      <a-breadcrumb-item>
        <HomeOutlined />
      </a-breadcrumb-item>
      <a-breadcrumb-item>日常业务</a-breadcrumb-item>
      <a-breadcrumb-item>监督检查</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">监督检查</h1>
      <a-space>
        <a-button type="primary" @click="handleCreatePlan">
          <template #icon>
            <PlusOutlined />
          </template>
          新建计划
        </a-button>
        <a-button type="primary" @click="handleCreateTask">
          <template #icon>
            <FileSearchOutlined />
          </template>
          发起检查
        </a-button>
      </a-space>
    </div>

    <div class="page-card filter-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索检查计划、任务..."
            class="search-input"
            allow-clear
          />
          <a-select v-model:value="filterType" placeholder="检查类型" allow-clear class="filter-select">
            <a-select-option value="routine">例行检查</a-select-option>
            <a-select-option value="special">专项检查</a-select-option>
            <a-select-option value="random">随机抽查</a-select-option>
          </a-select>
          <a-select v-model:value="filterStatus" placeholder="执行状态" allow-clear class="filter-select">
            <a-select-option value="ongoing">进行中</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
            <a-select-option value="pending">待开始</a-select-option>
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
        <a-tab-pane key="plan" tab="检查计划">
          <a-table
            :columns="planColumns"
            :data-source="filteredPlans"
            :pagination="planPagination"
            :row-key="(record: any) => record.id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'title'">
                <div class="plan-title">
                  <ProjectOutlined class="plan-icon" />
                  <span>{{ record.title }}</span>
                </div>
              </template>
              <template v-if="column.key === 'type'">
                <a-tag :color="getTypeColor(record.type)">{{ record.type }}</a-tag>
              </template>
              <template v-if="column.key === 'scope'">
                <span>{{ record.scope }}</span>
              </template>
              <template v-if="column.key === 'status'">
                <a-badge :status="getStatusType(record.status)" :text="record.status" />
              </template>
              <template v-if="column.key === 'progress'">
                <a-progress :percent="record.progress" size="small" />
              </template>
              <template v-if="column.key === 'action'">
                <span class="action-links">
                  <a class="action-link" @click="handleViewPlan(record)">
                    <EyeOutlined /> 查看
                  </a>
                  <a class="action-link" @click="handleEditPlan(record)">
                    <EditOutlined /> 编辑
                  </a>
                  <a class="action-link" @click="handleStartPlan(record)" v-if="record.status === 'pending'">
                    <PlayCircleOutlined /> 启动
                  </a>
                </span>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="task" tab="检查任务">
          <a-table
            :columns="taskColumns"
            :data-source="filteredTasks"
            :pagination="taskPagination"
            :row-key="(record: any) => record.id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'title'">
                <div class="task-title">
                  <FileSearchOutlined class="task-icon" />
                  <span>{{ record.title }}</span>
                </div>
              </template>
              <template v-if="column.key === 'type'">
                <a-tag :color="getTypeColor(record.type)">{{ record.type }}</a-tag>
              </template>
              <template v-if="column.key === 'status'">
                <a-badge :status="getStatusType(record.status)" :text="record.status" />
              </template>
              <template v-if="column.key === 'findings'">
                <span :class="{ 'findings-warning': record.findingsCount > 0 }">
                  {{ record.findingsCount }}个问题
                </span>
              </template>
              <template v-if="column.key === 'action'">
                <span class="action-links">
                  <a class="action-link" @click="handleViewTask(record)">
                    <EyeOutlined /> 查看
                  </a>
                  <a class="action-link" @click="handleRecordFindings(record)">
                    <FormOutlined /> 记录问题
                  </a>
                  <a class="action-link" @click="handleGenerateReport(record)">
                    <FileTextOutlined /> 生成报告
                  </a>
                </span>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="statistics" tab="监督检查统计">
          <a-row :gutter="16" class="stats-row">
            <a-col :span="6">
              <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%)">
                  <ProjectOutlined />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ totalPlans }}</div>
                  <div class="stat-label">检查计划总数</div>
                </div>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #52C41A 0%, #389E0D 100%)">
                  <FileSearchOutlined />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ totalTasks }}</div>
                  <div class="stat-label">检查任务总数</div>
                </div>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #FA8C16 0%, #D46B08 100%)">
                  <WarningOutlined />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ totalFindings }}</div>
                  <div class="stat-label">发现问题数</div>
                </div>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #722ED1 0%, #531DAB 100%)">
                  <CheckCircleOutlined />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ rectifiedCount }}</div>
                  <div class="stat-label">已整改数</div>
                </div>
              </div>
            </a-col>
          </a-row>

          <a-row :gutter="16" class="charts-row">
            <a-col :span="12">
              <a-card title="问题类型分布" class="chart-card">
                <div class="pie-chart">
                  <div class="pie-item" v-for="(item, index) in findingsTypeData" :key="index">
                    <div class="pie-color" :style="{ background: item.color }"></div>
                    <div class="pie-label">{{ item.type }}</div>
                    <div class="pie-value">{{ item.count }}个</div>
                    <div class="pie-percent">{{ item.percent }}%</div>
                  </div>
                </div>
              </a-card>
            </a-col>
            <a-col :span="12">
              <a-card title="部门问题统计" class="chart-card">
                <a-table
                  :columns="deptColumns"
                  :data-source="departmentFindings"
                  :pagination="false"
                  size="small"
                >
                  <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'status'">
                      <a-badge :status="record.rectified === record.total ? 'success' : 'warning'" :text="`${record.rectified}/${record.total}`" />
                    </template>
                  </template>
                </a-table>
              </a-card>
            </a-col>
          </a-row>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 新建计划弹窗 -->
    <a-modal
      v-model:open="planModalVisible"
      :title="planModalTitle"
      width="700px"
      :footer="null"
    >
      <a-form :model="planFormData" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="计划标题" required>
          <a-input v-model:value="planFormData.title" placeholder="请输入计划标题" />
        </a-form-item>
        <a-form-item label="检查类型" required>
          <a-select v-model:value="planFormData.type" placeholder="请选择">
            <a-select-option value="routine">例行检查</a-select-option>
            <a-select-option value="special">专项检查</a-select-option>
            <a-select-option value="random">随机抽查</a-select-option>
          </a-select>
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="开始时间">
              <a-date-picker v-model:value="planFormData.startDate" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="结束时间">
              <a-date-picker v-model:value="planFormData.endDate" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="检查范围">
          <a-select mode="multiple" v-model:value="planFormData.departments" placeholder="请选择检查范围">
            <a-select-option value="第一纪检监察室">第一纪检监察室</a-select-option>
            <a-select-option value="第二纪检监察室">第二纪检监察室</a-select-option>
            <a-select-option value="组织部">组织部</a-select-option>
            <a-select-option value="宣传部">宣传部</a-select-option>
            <a-select-option value="办公室">办公室</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="检查重点">
          <a-textarea v-model:value="planFormData.focus" :rows="3" placeholder="请输入检查重点内容" />
        </a-form-item>
        <a-form-item label="备注说明">
          <a-textarea v-model:value="planFormData.remark" :rows="2" placeholder="请输入备注说明" />
        </a-form-item>
      </a-form>
      <div class="modal-footer">
        <a-space>
          <a-button @click="planModalVisible = false">取消</a-button>
          <a-button type="primary" @click="handlePlanModalOk">保存</a-button>
        </a-space>
      </div>
    </a-modal>

    <!-- 发起检查弹窗 -->
    <a-modal
      v-model:open="taskModalVisible"
      :title="taskModalTitle"
      width="700px"
      :footer="null"
    >
      <a-form :model="taskFormData" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="任务标题" required>
          <a-input v-model:value="taskFormData.title" placeholder="请输入任务标题" />
        </a-form-item>
        <a-form-item label="关联计划">
          <a-select v-model:value="taskFormData.planId" placeholder="请选择关联计划（可选）" allow-clear>
            <a-select-option v-for="plan in planData" :key="plan.id" :value="plan.id">
              {{ plan.title }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="检查类型" required>
          <a-select v-model:value="taskFormData.type" placeholder="请选择">
            <a-select-option value="routine">例行检查</a-select-option>
            <a-select-option value="special">专项检查</a-select-option>
            <a-select-option value="random">随机抽查</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="被检查单位" required>
          <a-select v-model:value="taskFormData.department" placeholder="请选择被检查单位">
            <a-select-option value="第一纪检监察室">第一纪检监察室</a-select-option>
            <a-select-option value="第二纪检监察室">第二纪检监察室</a-select-option>
            <a-select-option value="组织部">组织部</a-select-option>
            <a-select-option value="宣传部">宣传部</a-select-option>
            <a-select-option value="办公室">办公室</a-select-option>
          </a-select>
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="检查时间">
              <a-date-picker v-model:value="taskFormData.checkDate" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="检查人员">
              <a-select v-model:value="taskFormData.inspectors" mode="multiple" placeholder="请选择检查人员">
                <a-select-option value="张书记">张书记</a-select-option>
                <a-select-option value="李主任">李主任</a-select-option>
                <a-select-option value="王科长">王科长</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="检查内容">
          <a-textarea v-model:value="taskFormData.content" :rows="3" placeholder="请输入检查内容" />
        </a-form-item>
      </a-form>
      <div class="modal-footer">
        <a-space>
          <a-button @click="taskModalVisible = false">取消</a-button>
          <a-button type="primary" @click="handleTaskModalOk">保存</a-button>
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
  FileSearchOutlined,
  ExportOutlined,
  EyeOutlined,
  EditOutlined,
  ProjectOutlined,
  PlayCircleOutlined,
  FormOutlined,
  FileTextOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { supervisionService, type SupervisionPlan, type SupervisionTask } from '@/api'

const activeTab = ref('plan')
const searchText = ref('')
const filterType = ref<string | undefined>(undefined)
const filterStatus = ref<string | undefined>(undefined)
const loading = ref(false)

// 检查计划
const planModalVisible = ref(false)
const planModalTitle = ref('新建计划')
const planFormData = reactive({
  id: undefined as number | undefined,
  title: '',
  type: undefined as string | undefined,
  startDate: null as any,
  endDate: null as any,
  departments: [] as string[],
  focus: '',
  remark: ''
})

const planColumns: TableColumnsType = [
  { title: '计划标题', dataIndex: 'title', key: 'title', ellipsis: true },
  { title: '检查类型', dataIndex: 'type', key: 'type', width: 120 },
  { title: '检查范围', dataIndex: 'scope', key: 'scope', width: 100 },
  { title: '执行时间', dataIndex: 'dateRange', key: 'dateRange', width: 180 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '进度', dataIndex: 'progress', key: 'progress', width: 120 },
  { title: '操作', key: 'action', width: 180 }
]

// 真实数据
const planData = ref<SupervisionPlan[]>([])
const totalPlans = ref(0)

const planPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// 获取计划列表
const fetchPlans = async () => {
  loading.value = true
  try {
    const result = await supervisionService.getPlans({
      search: searchText.value || undefined,
      type: filterType.value || undefined,
      status: filterStatus.value || undefined,
      page: planPagination.current,
      page_size: planPagination.pageSize
    })
    planData.value = result.results || []
    totalPlans.value = result.count || 0
    planPagination.total = totalPlans.value
  } catch (error: any) {
    message.error(error.response?.data?.detail || '获取计划数据失败')
  } finally {
    loading.value = false
  }
}

const filteredPlans = computed(() => {
  return planData.value.map(item => ({
    ...item,
    type: getTypeLabel(item.type),
    scope: `${item.department_count || 0}个部门`,
    dateRange: item.start_date && item.end_date ? `${item.start_date} 至 ${item.end_date}` : '-',
    status: item.status,
    progress: item.progress || 0
  }))
})

// 检查任务
const taskModalVisible = ref(false)
const taskModalTitle = ref('发起检查')
const taskFormData = reactive({
  id: undefined as number | undefined,
  title: '',
  planId: undefined as number | undefined,
  type: undefined as string | undefined,
  department: undefined as string | undefined,
  checkDate: null as any,
  inspectors: [] as string[],
  content: ''
})

const taskColumns: TableColumnsType = [
  { title: '任务标题', dataIndex: 'title', key: 'title', ellipsis: true },
  { title: '检查类型', dataIndex: 'type', key: 'type', width: 120 },
  { title: '被检查单位', dataIndex: 'department', key: 'department', width: 140 },
  { title: '检查时间', dataIndex: 'check_date', key: 'checkDate', width: 120 },
  { title: '检查人员', dataIndex: 'inspectors', key: 'inspectors', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '发现问题', dataIndex: 'findings_count', key: 'findings', width: 100 },
  { title: '操作', key: 'action', width: 200 }
]

// 真实数据
const taskData = ref<SupervisionTask[]>([])
const totalTasks = ref(0)

const taskPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// 获取任务列表
const fetchTasks = async () => {
  loading.value = true
  try {
    const result = await supervisionService.getTasks({
      search: searchText.value || undefined,
      type: filterType.value || undefined,
      status: filterStatus.value || undefined,
      page: taskPagination.current,
      page_size: taskPagination.pageSize
    })
    taskData.value = result.results || []
    totalTasks.value = result.count || 0
    taskPagination.total = totalTasks.value
  } catch (error: any) {
    message.error(error.response?.data?.detail || '获取任务数据失败')
  } finally {
    loading.value = false
  }
}

const filteredTasks = computed(() => {
  return taskData.value.map(item => ({
    ...item,
    type: getTypeLabel(item.type),
    checkDate: item.check_date || '-',
    inspectors: item.inspectors?.join('、') || '-',
    status: item.status,
    findingsCount: item.findings_count || 0
  }))
})

// 统计
const totalFindings = computed(() => {
  return taskData.value.reduce((sum, t) => sum + (t.findings_count || 0), 0)
})

const rectifiedCount = computed(() => {
  return Math.floor(totalFindings.value * 0.7)
})

const findingsTypeData = ref([
  { type: '财务违规', count: 8, percent: 32, color: '#F5222D' },
  { type: '公车使用', count: 6, percent: 24, color: '#FA8C16' },
  { type: '公务接待', count: 5, percent: 20, color: '#FAAD14' },
  { type: '办公用房', count: 3, percent: 12, color: '#1890FF' },
  { type: '其他', count: 3, percent: 12, color: '#8c8c8c' },
])

const deptColumns: TableColumnsType = [
  { title: '部门', dataIndex: 'name', key: 'name', width: 150 },
  { title: '问题数', dataIndex: 'total', key: 'total', width: 100 },
  { title: '整改情况', dataIndex: 'status', key: 'status', width: 100 },
]

const departmentFindings = ref([
  { key: 1, name: '组织部', total: 5, rectified: 4 },
  { key: 2, name: '宣传部', total: 3, rectified: 2 },
  { key: 3, name: '办公室', total: 4, rectified: 3 },
  { key: 4, name: '第一纪检监察室', total: 2, rectified: 2 },
])

// 监听筛选条件变化
watch([searchText, filterType, filterStatus], () => {
  planPagination.current = 1
  taskPagination.current = 1
  fetchPlans()
  fetchTasks()
}, { deep: true })

// 初始化
onMounted(() => {
  fetchPlans()
  fetchTasks()
})

// 方法
const getTypeColor = (type: string) => {
  const map: Record<string, string> = {
    routine: 'blue',
    special: 'red',
    random: 'orange'
  }
  return map[type] || 'default'
}

const getTypeLabel = (type: string) => {
  const options = supervisionService.getTypeOptions()
  return options.find(o => o.value === type)?.label || type
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'default',
    ongoing: 'processing',
    completed: 'success'
  }
  return map[status] || 'default'
}

const handleTabChange = (key: string) => {
  activeTab.value = key
  if (key === 'plan') fetchPlans()
  if (key === 'task') fetchTasks()
}

// 计划操作
const handleCreatePlan = () => {
  planModalTitle.value = '新建计划'
  Object.assign(planFormData, { id: undefined, title: '', type: undefined, startDate: null, endDate: null, departments: [], focus: '', remark: '' })
  planModalVisible.value = true
}

const handleViewPlan = (record: any) => {
  message.info(`查看计划: ${record.title}`)
}

const handleEditPlan = (record: any) => {
  planModalTitle.value = '编辑计划'
  Object.assign(planFormData, { id: record.id, title: record.title, type: record.type, startDate: null, endDate: null, departments: [], focus: '', remark: '' })
  planModalVisible.value = true
}

const handleStartPlan = async (record: any) => {
  try {
    await supervisionService.startPlan(record.id)
    message.success('计划已启动')
    fetchPlans()
  } catch (error: any) {
    message.error(error.response?.data?.detail || '启动失败')
  }
}

const handlePlanModalOk = async () => {
  if (!planFormData.title || !planFormData.type) {
    message.warning('请填写必填项')
    return
  }
  // 检查内容必填
  if (!planFormData.focus) {
    message.warning('请填写检查重点')
    return
  }
  try {
    await supervisionService.createPlan({
      title: planFormData.title,
      supervision_type: planFormData.type,
      content: planFormData.focus,  // 将检查重点作为检查内容
      target_objects: planFormData.departments.join('、'),  // 将检查范围作为检查对象
      start_date: planFormData.startDate ? dayjs(planFormData.startDate).format('YYYY-MM-DD') : undefined,
      end_date: planFormData.endDate ? dayjs(planFormData.endDate).format('YYYY-MM-DD') : undefined
    })
    message.success('保存成功')
    planModalVisible.value = false
    fetchPlans()
  } catch (error: any) {
    message.error(error.response?.data?.detail || '保存失败')
  }
}

// 任务操作
const handleCreateTask = () => {
  taskModalTitle.value = '发起检查'
  Object.assign(taskFormData, { id: undefined, title: '', planId: undefined, type: undefined, department: undefined, checkDate: null, inspectors: [], content: '' })
  taskModalVisible.value = true
}

const handleViewTask = (record: any) => {
  message.info(`查看任务: ${record.title}`)
}

const handleRecordFindings = (record: any) => {
  message.info(`记录问题: ${record.title}`)
}

const handleGenerateReport = (record: any) => {
  message.success(`正在生成报告: ${record.title}`)
}

const handleTaskModalOk = async () => {
  if (!taskFormData.title || !taskFormData.type || !taskFormData.department) {
    message.warning('请填写必填项')
    return
  }
  try {
    await supervisionService.createTask({
      title: taskFormData.title,
      supervision_type: taskFormData.type,
      content: taskFormData.content || taskFormData.department,  // 检查内容
      target_objects: taskFormData.department,  // 检查对象
      start_date: taskFormData.checkDate ? dayjs(taskFormData.checkDate).format('YYYY-MM-DD') : undefined
    })
    message.success('保存成功')
    taskModalVisible.value = false
    fetchTasks()
  } catch (error: any) {
    message.error(error.response?.data?.detail || '保存失败')
  }
}

const handleExport = () => {
  message.success('导出成功')
}
</script>

<style scoped>
.supervision-page {
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
.plan-title,
.task-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.plan-icon,
.task-icon {
  color: #1890FF;
}
.findings-warning {
  color: #F5222D;
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
.charts-row {
  margin-top: 16px;
}
.chart-card {
  height: 100%;
}
.pie-chart {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.pie-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 4px;
}
.pie-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}
.pie-label {
  font-size: 14px;
  color: #1f1f1f;
}
.pie-value {
  font-size: 14px;
  color: #8c8c8c;
}
.pie-percent {
  font-size: 14px;
  font-weight: 500;
  color: #1f1f1f;
  min-width: 40px;
  text-align: right;
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
