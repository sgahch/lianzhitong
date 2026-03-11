<template>
  <div class="home-page">
    <!-- 欢迎区域（已移到header） -->

    <!-- 主要内容区 -->
    <div class="main-section">
      <a-row :gutter="16">
        <!-- 待办事项 -->
        <a-col :span="14">
          <div class="section-card">
            <div class="section-header">
              <div class="section-title-wrapper">
                <ClockCircleOutlined class="section-icon" />
                <h3 class="section-title">待办事项</h3>
              </div>
              <a class="link-text" @click="goToTodoList">全部待办 &gt;</a>
            </div>
            <div class="todo-list">
              <div
                v-for="item in todoList"
                :key="item.id"
                class="todo-item"
                @click="handleTodoClick(item)"
              >
                <div class="todo-priority" :class="'priority-' + item.priority">
                  <span class="priority-dot"></span>
                  {{ item.priorityText }}
                </div>
                <div class="todo-content">
                  <div class="todo-title">{{ item.title }}</div>
                  <div class="todo-meta">
                    <span class="todo-module">
                      <TagOutlined /> {{ item.module }}
                    </span>
                    <span class="todo-deadline" :class="{ overdue: item.isOverdue }">
                      <ClockCircleOutlined /> {{ item.deadline }}
                    </span>
                  </div>
                </div>
                <div class="todo-action">
                  <a-button type="primary" size="small" ghost>处理</a-button>
                </div>
              </div>
            </div>
          </div>
        </a-col>

        <!-- 右侧栏 -->
        <a-col :span="10">
          <!-- 快捷入口 -->
          <div class="section-card quick-links">
            <div class="section-header">
              <div class="section-title-wrapper">
                <ThunderboltOutlined class="section-icon" />
                <h3 class="section-title">快捷入口</h3>
              </div>
            </div>
            <div class="quick-links-grid">
              <div
                v-for="link in quickLinks"
                :key="link.key"
                class="quick-link-item"
                @click="goToPage(link.path)"
              >
                <div class="quick-link-icon" :style="{ background: link.gradient }">
                  <component :is="link.icon" />
                </div>
                <div class="quick-link-text">{{ link.label }}</div>
              </div>
            </div>
          </div>

          <!-- 系统公告 -->
          <div class="section-card">
            <div class="section-header">
              <div class="section-title-wrapper">
                <SoundOutlined class="section-icon" />
                <h3 class="section-title">系统公告</h3>
              </div>
              <a class="link-text">更多 &gt;</a>
            </div>
            <div class="notice-list">
              <div v-for="notice in notices" :key="notice.id" class="notice-item">
                <div class="notice-indicator" v-if="notice.isNew">
                  <FireOutlined class="notice-fire" />
                </div>
                <div class="notice-content">
                  <div class="notice-title">{{ notice.title }}</div>
                  <div class="notice-date">{{ notice.date }}</div>
                </div>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 最近操作 -->
    <div class="section-card recent-operations">
      <div class="section-header">
        <div class="section-title-wrapper">
          <HistoryOutlined class="section-icon" />
          <h3 class="section-title">最近操作</h3>
        </div>
      </div>
      <a-table
        :columns="operationColumns"
        :data-source="recentOperations"
        :pagination="false"
        size="small"
        :row-key="(record: any) => record.id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag :color="record.typeColor" class="type-tag">{{ record.type }}</a-tag>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  PlusOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  SearchOutlined,
  BankOutlined,
  ReadOutlined,
  CompassOutlined,
  BulbOutlined,
  BellOutlined,
  SettingOutlined,
  StarOutlined,
  TagOutlined,
  ThunderboltOutlined,
  SoundOutlined,
  HistoryOutlined,
  FireOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { get } from '@/api/request'

const router = useRouter()

const currentUser = ref<{ real_name?: string; username?: string }>({})

// 用户名显示
const userName = computed(() => {
  return currentUser.value.real_name || currentUser.value.username || '用户'
})

// 当前日期
const currentDate = computed(() => {
  return dayjs().format('YYYY年M月D日 dddd')
})

// 问候语
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '上午好，工作开始啦！'
  if (hour < 14) return '中午好，午休时间也要加油哦！'
  if (hour < 18) return '下午好，继续努力！'
  return '晚上好，注意休息哦！'
})

// 待办事项
const todoList = ref([
  {
    id: 1,
    title: '落实中央八项规定精神专项检查',
    module: '协助党委',
    priority: 'urgent',
    priorityText: '紧急',
    deadline: '今日到期',
    isOverdue: false
  },
  {
    id: 2,
    title: '年度党风廉政建设工作总结审核',
    module: '协助党委',
    priority: 'important',
    priorityText: '重要',
    deadline: '剩余2天',
    isOverdue: false
  },
  {
    id: 3,
    title: '重点岗位风险防控排查报告',
    module: '监督检查',
    priority: 'important',
    priorityText: '重要',
    deadline: '剩余5天',
    isOverdue: false
  },
  {
    id: 4,
    title: '廉政教育进社区活动方案审批',
    module: '纪律教育',
    priority: 'normal',
    priorityText: '普通',
    deadline: '剩余7天',
    isOverdue: false
  },
  {
    id: 5,
    title: '某干部违纪问题初核报告',
    module: '案件立案',
    priority: 'urgent',
    priorityText: '紧急',
    deadline: '已逾期1天',
    isOverdue: true
  }
])

// 快捷入口
const quickLinks = ref([
  { key: 'report', label: '信访举报', path: '/report', icon: SearchOutlined, gradient: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)' },
  { key: 'case', label: '案件立案', path: '/case-filing', icon: FolderOpenOutlined, gradient: 'linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)' },
  { key: 'investigation', label: '审查调查', path: '/investigation', icon: SearchOutlined, gradient: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)' },
  { key: 'trial', label: '案件审理', path: '/trial', icon: BankOutlined, gradient: 'linear-gradient(135deg, #13c2c2 0%, #08979c 100%)' },
  { key: 'education', label: '纪律教育', path: '/discipline-edu', icon: ReadOutlined, gradient: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)' },
  { key: 'supervision', label: '监督检查', path: '/supervision', icon: CompassOutlined, gradient: 'linear-gradient(135deg, #eb2f96 0%, #c41e3a 100%)' }
])

// 系统公告
const notices = ref([
  { id: 1, title: '关于开展2025年度廉政风险排查的通知', date: '2025-01-26', isNew: true },
  { id: 2, title: '系统将于本周六凌晨2:00-4:00进行维护', date: '2025-01-25', isNew: true },
  { id: 3, title: '关于规范案件材料归档的通知', date: '2025-01-24', isNew: false },
  { id: 4, title: '新增"谈话提醒"功能模块说明', date: '2025-01-20', isNew: false }
])

// 最近操作列
const operationColumns = [
  { title: '操作类型', dataIndex: 'type', key: 'type' },
  { title: '操作内容', dataIndex: 'content', key: 'content', ellipsis: true },
  { title: '操作人', dataIndex: 'operator', key: 'operator', width: 100 },
  { title: '操作时间', dataIndex: 'time', key: 'time', width: 160 }
]

// 最近操作数据
const recentOperations = ref([
  { id: 1, type: '新建任务', typeColor: 'red', content: '新建任务"落实中央八项规定精神专项检查"', operator: currentUser.value.username || '张科长', time: '2025-01-27 10:30' },
  { id: 2, type: '完成任务', typeColor: 'green', content: '完成任务"廉政教育进社区活动"', operator: currentUser.value.username || '张科长', time: '2025-01-27 09:15' },
  { id: 3, type: '编辑案件', typeColor: 'orange', content: '编辑案件"某干部违纪问题初核"', operator: currentUser.value.username || '张科长', time: '2025-01-26 16:45' },
  { id: 4, type: '删除任务', typeColor: 'default', content: '删除任务"测试任务001"', operator: currentUser.value.username || '张科长', time: '2025-01-26 14:20' }
])

// 方法
const handleQuickCreate = () => {
  router.push('/assist-party')
}

const handleTodoClick = (item: any) => {
  message.info(`跳转到: ${item.title}`)
}

const goToTodoList = () => {
  router.push('/assist-party')
}

const goToPage = (path: string) => {
  router.push(path)
}

// 获取当前用户信息
onMounted(async () => {
  try {
    const response = await get('/auth/me/')
    currentUser.value = response
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
})
</script>

<style scoped>
.home-page {
  padding: 0;
}

/* 主要内容区 */
.main-section {
  margin-bottom: 24px;
}

.section-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(178, 34, 34, 0.08);
  border: 1px solid #f0f0f0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #B22222;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  font-size: 18px;
  color: #B22222;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f1f1f;
  margin: 0;
}

/* 待办事项 */
.todo-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-radius: 6px;
  margin-bottom: 10px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #f0f0f0;
}

.todo-item:hover {
  background: #FFF9F0;
  border-color: #D4AF37;
}

.todo-priority {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 60px;
  justify-content: center;
}

.priority-urgent {
  background: linear-gradient(135deg, #B22222 0%, #8B0000 100%);
  color: #fff;
}

.priority-important {
  background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
  color: #fff;
}

.priority-normal {
  background: #f0f0f0;
  color: #666;
}

.priority-dot {
  width: 4px;
  height: 4px;
  background: currentColor;
  border-radius: 50%;
}

.todo-content {
  flex: 1;
}

.todo-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f1f1f;
  margin-bottom: 6px;
}

.todo-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #8c8c8c;
}

.todo-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.todo-deadline.overdue {
  color: #cf1322;
}

.todo-action {
  margin-left: 16px;
}

/* 快捷入口 */
.quick-links-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.quick-link-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
  border: 1px solid #f0f0f0;
}

.quick-link-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(178, 34, 34, 0.15);
  border-color: #D4AF37;
  background: #FFF9F0;
}

.quick-link-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 22px;
  margin-bottom: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.quick-link-text {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

/* 公告列表 */
.notice-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px dashed #f0f0f0;
}

.notice-item:last-child {
  border-bottom: none;
}

.notice-indicator {
  margin-right: 10px;
  margin-top: 2px;
}

.notice-fire {
  color: #fa8c16;
  font-size: 14px;
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-size: 14px;
  color: #1f1f1f;
  margin-bottom: 4px;
  cursor: pointer;
  transition: color 0.2s;
}

.notice-title:hover {
  color: #cf1322;
}

.notice-date {
  font-size: 12px;
  color: #999;
}

.link-text {
  color: #B22222;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.link-text:hover {
  color: #D4AF37;
}

/* 最近操作 */
.recent-operations {
  margin-top: 16px;
}

:deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  color: #333;
  font-weight: 600;
  border-bottom: 2px solid #f0f0f0;
}

:deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid #f5f5f5;
}

.type-tag {
  border-radius: 4px;
}
</style>
