<template>
  <div class="process-page">
    <a-breadcrumb class="page-breadcrumb">
      <a-breadcrumb-item>
        <HomeOutlined />
      </a-breadcrumb-item>
      <a-breadcrumb-item>系统管理</a-breadcrumb-item>
      <a-breadcrumb-item>流程监控</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">流程监控</h1>
      <a-button @click="handleExport">
        <template #icon>
          <ExportOutlined />
        </template>
        导出报表
      </a-button>
    </div>

    <div class="page-card filter-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索流程名称、编号..."
            class="search-input"
            allow-clear
          />
          <a-select v-model:value="filterStatus" placeholder="流程状态" allow-clear class="filter-select">
            <a-select-option value="running">进行中</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
            <a-select-option value="exception">异常</a-select-option>
          </a-select>
        </div>
      </div>
    </div>

    <div class="page-card">
      <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
        <a-tab-pane key="overview" tab="流程概览">
          <a-row :gutter="16" class="stats-row">
            <a-col :span="6">
              <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%)">
                  <BranchesOutlined />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ totalProcesses }}</div>
                  <div class="stat-label">总流程数</div>
                </div>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #52C41A 0%, #389E0D 100%)">
                  <CheckCircleOutlined />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ completedCount }}</div>
                  <div class="stat-label">已完成</div>
                </div>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #FA8C16 0%, #D46B08 100%)">
                  <SyncOutlined />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ runningCount }}</div>
                  <div class="stat-label">进行中</div>
                </div>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #F5222D 0%, #CF1322 100%)">
                  <WarningOutlined />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ exceptionCount }}</div>
                  <div class="stat-label">异常流程</div>
                </div>
              </div>
            </a-col>
          </a-row>

          <a-row :gutter="16" class="charts-row">
            <a-col :span="12">
              <a-card title="流程类型分布" class="chart-card">
                <div class="bar-chart">
                  <div class="bar-item" v-for="(item, index) in processTypeData" :key="index">
                    <div class="bar-label">{{ item.name }}</div>
                    <div class="bar-container">
                      <div class="bar" :style="{ width: item.percent + '%' }"></div>
                    </div>
                    <div class="bar-value">{{ item.count }}</div>
                  </div>
                </div>
              </a-card>
            </a-col>
            <a-col :span="12">
              <a-card title="部门流程统计" class="chart-card">
                <a-table
                  :columns="deptColumns"
                  :data-source="deptData"
                  :pagination="false"
                  size="small"
                >
                  <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'progress'">
                      <a-progress :percent="record.completed / record.total * 100" size="small" />
                    </template>
                  </template>
                </a-table>
              </a-card>
            </a-col>
          </a-row>
        </a-tab-pane>
        <a-tab-pane key="running" tab="进行中">
          <a-table
            :columns="processColumns"
            :data-source="runningData"
            :pagination="pagination"
            :row-key="(record: any) => record.id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'processNo'">
                <span class="process-no">{{ record.processNo }}</span>
              </template>
              <template v-if="column.key === 'status'">
                <a-badge :status="record.status === 'exception' ? 'error' : 'processing'" :text="record.statusText" />
              </template>
              <template v-if="column.key === 'progress'">
                <a-progress :percent="record.progress" size="small" :status="record.status === 'exception' ? 'exception' : 'normal'" />
              </template>
              <template v-if="column.key === 'action'">
                <span class="action-links">
                  <a class="action-link" @click="handleView(record)">
                    <EyeOutlined /> 查看
                  </a>
                  <a class="action-link" @click="handleTrace(record)">
                    <DeploymentUnitOutlined /> 追踪
                  </a>
                </span>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="completed" tab="已完成">
          <a-table
            :columns="processColumns"
            :data-source="completedData"
            :pagination="pagination"
            :row-key="(record: any) => record.id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'processNo'">
                <span class="process-no">{{ record.processNo }}</span>
              </template>
              <template v-if="column.key === 'status'">
                <a-badge status="success" :text="record.statusText" />
              </template>
              <template v-if="column.key === 'progress'">
                <a-progress :percent="100" size="small" status="success" />
              </template>
              <template v-if="column.key === 'action'">
                <span class="action-links">
                  <a class="action-link" @click="handleView(record)">
                    <EyeOutlined /> 查看
                  </a>
                  <a class="action-link" @click="handleTrace(record)">
                    <DeploymentUnitOutlined /> 追踪
                  </a>
                </span>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import {
  HomeOutlined,
  ExportOutlined,
  BranchesOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  WarningOutlined,
  EyeOutlined,
  DeploymentUnitOutlined
} from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { message } from 'ant-design-vue'

const activeTab = ref('overview')
const searchText = ref('')
const filterStatus = ref<string | undefined>(undefined)

const processColumns: TableColumnsType = [
  { title: '流程编号', dataIndex: 'processNo', key: 'processNo', width: 150 },
  { title: '流程名称', dataIndex: 'processName', key: 'processName', ellipsis: true },
  { title: '关联业务', dataIndex: 'business', key: 'business', width: 140 },
  { title: '发起人', dataIndex: ' initiator', key: 'initiator', width: 100 },
  { title: '当前节点', dataIndex: 'currentNode', key: 'currentNode', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '进度', dataIndex: 'progress', key: 'progress', width: 150 },
  { title: '发起时间', dataIndex: 'startTime', key: 'startTime', width: 120 },
  { title: '操作', key: 'action', width: 140 }
]

const processData = ref([
  { id: 1, processNo: 'LC2025010001', processName: '信访举报受理流程', business: '举报件 BJ2025010001', initiator: '张三', currentNode: '部门审批', status: 'running', statusText: '进行中', progress: 60, startTime: '2025-01-25' },
  { id: 2, processNo: 'LC2025010002', processName: '案件立案审批流程', business: '案件 LZ2025010001', initiator: '李四', currentNode: '领导审批', status: 'running', statusText: '进行中', progress: 40, startTime: '2025-01-24' },
  { id: 3, processNo: 'LC2025010003', processName: '初核审批流程', business: '线索 XS2025010002', initiator: '王五', currentNode: '调查取证', status: 'exception', statusText: '异常', progress: 30, startTime: '2025-01-23' },
  { id: 4, processNo: 'LC2025010004', processName: '处分决定流程', business: '结案报告 JA2025010001', initiator: '赵六', currentNode: '执行完毕', status: 'completed', statusText: '已完成', progress: 100, startTime: '2025-01-20' },
  { id: 5, processNo: 'LC2025010005', processName: '监督检查流程', business: '检查任务 JC2025010001', initiator: '钱七', currentNode: '报告生成', status: 'completed', statusText: '已完成', progress: 100, startTime: '2025-01-18' },
])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: processData.value.length,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// 统计数据
const totalProcesses = computed(() => processData.value.length)
const completedCount = computed(() => processData.value.filter(p => p.status === 'completed').length)
const runningCount = computed(() => processData.value.filter(p => p.status === 'running').length)
const exceptionCount = computed(() => processData.value.filter(p => p.status === 'exception').length)

const runningData = computed(() => processData.value.filter(p => p.status === 'running' || p.status === 'exception'))
const completedData = computed(() => processData.value.filter(p => p.status === 'completed'))

const processTypeData = ref([
  { name: '信访举报', count: 15, percent: 30 },
  { name: '案件办理', count: 20, percent: 40 },
  { name: '监督检查', count: 8, percent: 16 },
  { name: '纪律教育', count: 7, percent: 14 },
])

const deptColumns: TableColumnsType = [
  { title: '部门', dataIndex: 'name', key: 'name', width: 150 },
  { title: '总流程', dataIndex: 'total', key: 'total', width: 80 },
  { title: '已完成', dataIndex: 'completed', key: 'completed', width: 80 },
  { title: '完成率', dataIndex: 'progress', key: 'progress', width: 150 },
]

const deptData = ref([
  { key: 1, name: '第一纪检监察室', total: 12, completed: 10 },
  { key: 2, name: '第二纪检监察室', total: 10, completed: 8 },
  { key: 3, name: '第三纪检监察室', total: 8, completed: 6 },
  { key: 4, name: '组织部', total: 5, completed: 4 },
])

const handleTabChange = (key: string) => {
  activeTab.value = key
}

const handleView = (record: any) => {
  message.info(`查看流程: ${record.processNo}`)
}

const handleTrace = (record: any) => {
  message.info(`追踪流程: ${record.processNo}`)
}

const handleExport = () => {
  message.success('导出成功')
}
</script>

<style scoped>
.process-page {
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
.process-no {
  font-family: monospace;
  color: #1890FF;
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
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.bar-label {
  width: 100px;
  font-size: 14px;
  color: #1f1f1f;
}
.bar-container {
  flex: 1;
  height: 20px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}
.bar {
  height: 100%;
  background: linear-gradient(90deg, #1890FF 0%, #096DD9 100%);
  border-radius: 4px;
  transition: width 0.3s;
}
.bar-value {
  width: 40px;
  font-size: 14px;
  font-weight: 500;
  color: #1f1f1f;
  text-align: right;
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
