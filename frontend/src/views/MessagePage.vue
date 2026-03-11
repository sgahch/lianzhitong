<template>
  <div class="message-page">
    <a-breadcrumb class="page-breadcrumb">
      <a-breadcrumb-item>
        <HomeOutlined />
      </a-breadcrumb-item>
      <a-breadcrumb-item>个人中心</a-breadcrumb-item>
      <a-breadcrumb-item>{{ activeTab === 'message' ? '消息中心' : '个人信息' }}</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">{{ activeTab === 'message' ? '消息中心' : '个人信息' }}</h1>
    </div>

    <a-tabs v-model:activeKey="activeTab" @change="handleTabChange" class="profile-tabs">
      <a-tab-pane key="profile" tab="个人信息">
        <a-form :model="profileForm" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }" class="profile-form">
          <a-form-item label="用户名">
            <a-input v-model:value="profileForm.username" placeholder="请输入用户名" />
            <div class="form-hint">用户名用于登录系统</div>
          </a-form-item>
          <a-form-item label="姓名">
            <a-input :value="profileForm.realName" disabled />
            <div class="form-hint">姓名不可修改</div>
          </a-form-item>
          <a-form-item label="所属部门">
            <a-input :value="profileForm.department" disabled />
          </a-form-item>
          <a-form-item label="角色">
            <a-tag color="blue">{{ profileForm.role }}</a-tag>
          </a-form-item>
          <a-form-item label="手机号码">
            <a-input v-model:value="profileForm.phone" placeholder="请输入手机号码" />
          </a-form-item>
          <a-form-item label="邮箱">
            <a-input v-model:value="profileForm.email" placeholder="请输入邮箱" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" :loading="loading" @click="handleSaveProfile">保存修改</a-button>
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <a-tab-pane key="message" tab="消息中心">
        <!-- 消息中心的筛选工具栏 -->
        <div class="page-card filter-card">
          <div class="toolbar">
            <div class="toolbar-left">
              <a-space>
                <a-button type="primary" @click="handleMarkAllRead">
                  <template #icon><CheckOutlined /></template>
                  全部已读
                </a-button>
                <a-button @click="handleClearAll">
                  <template #icon><DeleteOutlined /></template>
                  清空消息
                </a-button>
              </a-space>
              <a-radio-group v-model:value="filterType" button-style="solid" style="margin-left: 16px;">
                <a-radio-button value="all">全部</a-radio-button>
                <a-radio-button value="unread">未读</a-radio-button>
                <a-radio-button value="read">已读</a-radio-button>
              </a-radio-group>
            </div>
            <div class="toolbar-right">
              <a-button @click="handleExport">
                <template #icon>
                  <ExportOutlined />
                </template>
                导出
              </a-button>
            </div>
          </div>
        </div>

        <!-- 消息列表 -->
        <div class="page-card">
          <a-table
            :columns="columns"
            :data-source="filteredData"
            :pagination="pagination"
            :row-key="(record: any) => record.id"
            @change="handleTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'type'">
                <a-tag :color="getTypeColor(record.type)">{{ record.typeText }}</a-tag>
              </template>
              <template v-if="column.key === 'priority'">
                <a-tag :color="record.priority === 'high' ? 'red' : record.priority === 'medium' ? 'orange' : 'default'">
                  {{ record.priorityText }}
                </a-tag>
              </template>
              <template v-if="column.key === 'status'">
                <a-badge :status="record.read ? 'default' : 'processing'" :text="record.read ? '已读' : '未读'" />
              </template>
              <template v-if="column.key === 'action'">
                <span class="action-links">
                  <a class="action-link" @click="handleView(record)">
                    <EyeOutlined /> 查看
                  </a>
                  <a class="action-link" @click="handleDelete(record)">
                    <DeleteOutlined /> 删除
                  </a>
                </span>
              </template>
            </template>
          </a-table>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  HomeOutlined,
  CheckOutlined,
  DeleteOutlined,
  ExportOutlined,
  EyeOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { get, put } from '@/api/request'

const route = useRoute()

const activeTab = ref('profile')  // 默认显示个人信息tab
const filterType = ref('all')
const loading = ref(false)

// 根据路由查询参数设置activeTab
onMounted(() => {
  if (route.query.tab === 'message') {
    activeTab.value = 'message'
  } else {
    activeTab.value = 'profile'
    fetchProfile()
  }
})

// 从API获取用户信息
const fetchProfile = async () => {
  try {
    const response = await get('/auth/me/')
    Object.assign(profileForm, {
      username: response.username,
      realName: response.real_name || '',
      department: getDepartmentName(response.department),
      role: getRoleName(response.role),
      phone: response.phone || '',
      email: response.email || ''
    })
    currentUserId.value = response.id
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 获取当前用户信息（用于顶部显示）
const fetchCurrentUser = async () => {
  try {
    const response = await get('/auth/me/')
    currentUser.value = response
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

const currentUserId = ref<number | null>(null)
const currentUser = ref<{ username?: string }>({})

// 部门名称映射
const getDepartmentName = (code: string) => {
  const map: Record<string, string> = {
    discipline: '第一纪检监察室',
    supervision: '监督执纪室',
    office: '办公室'
  }
  return map[code] || code
}

// 角色名称映射
const getRoleName = (code: string) => {
  const map: Record<string, string> = {
    admin: '系统管理员',
    leader: '领导',
    investigator: '办案人员',
    clerk: '一般工作人员'
  }
  return map[code] || code
}

const profileForm = reactive({
  username: '',
  realName: '',
  department: '',
  role: '',
  phone: '',
  email: ''
})

// 保存个人信息
const handleSaveProfile = async () => {
  if (!currentUserId.value) return

  loading.value = true
  try {
    await put(`/users/${currentUserId.value}/`, {
      username: profileForm.username,
      phone: profileForm.phone,
      email: profileForm.email
    })
    message.success('个人信息保存成功')
    // 刷新顶部用户信息
    fetchCurrentUser()
  } catch (error: any) {
    message.error(error.response?.data?.detail || '保存失败')
  } finally {
    loading.value = false
  }
}

const columns: TableColumnsType = [
  { title: '消息标题', dataIndex: 'title', key: 'title', ellipsis: true },
  { title: '消息类型', dataIndex: 'typeText', key: 'type', width: 120 },
  { title: '优先级', dataIndex: 'priorityText', key: 'priority', width: 100 },
  { title: '发送人', dataIndex: 'sender', key: 'sender', width: 100 },
  { title: '接收时间', dataIndex: 'time', key: 'time', width: 160 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 140 }
]

const messageData = ref([
  { id: 1, title: '您有一条新的信访举报待处理', type: 'task', typeText: '任务通知', priority: 'high', priorityText: '紧急', sender: '系统', time: '2025-01-27 10:30', read: false },
  { id: 2, title: '案件 LZ2025010001 已完成立案审批', type: 'system', typeText: '系统通知', priority: 'medium', priorityText: '重要', sender: '系统', time: '2025-01-27 09:15', read: false },
  { id: 3, title: '监督任务 JC2025010002 即将到期提醒', type: 'remind', typeText: '提醒通知', priority: 'high', priorityText: '紧急', sender: '系统', time: '2025-01-26 16:45', read: false },
  { id: 4, title: '张某的案件已移交至审理环节', type: 'system', typeText: '系统通知', priority: 'low', priorityText: '一般', sender: '李主任', time: '2025-01-26 14:20', read: true },
  { id: 5, title: '您收藏的法规有更新：监察法实施条例', type: 'system', typeText: '系统通知', priority: 'low', priorityText: '一般', sender: '系统', time: '2025-01-25 11:00', read: true },
])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: messageData.value.length,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const filteredData = computed(() => {
  let result = [...messageData.value]
  if (filterType.value === 'unread') {
    result = result.filter(r => !r.read)
  } else if (filterType.value === 'read') {
    result = result.filter(r => r.read)
  }
  return result
})

const getTypeColor = (type: string) => {
  const map: Record<string, string> = {
    task: 'blue',
    system: 'green',
    remind: 'orange'
  }
  return map[type] || 'default'
}

const handleView = (record: any) => {
  record.read = true
  message.info(`查看消息: ${record.title}`)
}

const handleDelete = (record: any) => {
  const index = messageData.value.findIndex(m => m.id === record.id)
  if (index > -1) {
    messageData.value.splice(index, 1)
    message.success('删除成功')
  }
}

const handleMarkAllRead = () => {
  messageData.value.forEach(m => m.read = true)
  message.success('全部已读')
}

const handleClearAll = () => {
  messageData.value = []
  message.success('清空成功')
}

const handleExport = () => {
  message.success('导出成功')
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}
</script>

<style scoped>
.message-page {
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
}
.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
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
.profile-tabs {
  padding-top: 8px;
}
.profile-form {
  padding-top: 20px;
}
.form-hint {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}
</style>
