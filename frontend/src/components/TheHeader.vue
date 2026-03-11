<template>
  <header class="content-header">
    <!-- 居中偏左：全局搜索 -->
    <div class="header-center-left">
      <a-input-search
        v-model:value="searchValue"
        placeholder="搜索任务、人员..."
        class="global-search"
      />
    </div>

    <!-- 右侧：欢迎语 + 消息 + 用户 -->
    <div class="header-right">
      <!-- 欢迎语 -->
      <div class="welcome-text">
        <span class="welcome-msg">{{ greeting }}，{{ displayName }}</span>
      </div>

      <!-- 消息中心：铃铛图标+蓝色角标 -->
      <a-badge :count="unreadCount" :number-style="{ backgroundColor: '#0088CC' }">
        <a-button type="text" shape="circle" class="header-btn" @click="goToMessages">
          <template #icon>
            <BellOutlined />
          </template>
        </a-button>
      </a-badge>

      <!-- 个人中心：头像+姓名+下拉箭头 -->
      <a-dropdown>
        <div class="user-profile">
          <a-avatar :size="32" :style="{ backgroundColor: '#8ccde7' }">
            <template #icon>
              <UserOutlined />
            </template>
          </a-avatar>
          <span class="username">{{ displayName }}</span>
          <DownOutlined />
        </div>
        <template #overlay>
          <a-menu @click="handleMenuClick">
            <a-menu-item key="profile">
              <UserOutlined />
              个人信息
            </a-menu-item>
            <a-menu-item key="settings">
              <SettingOutlined />
              系统设置
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item key="logout">
              <LogoutOutlined />
              退出登录
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  DownOutlined
} from '@ant-design/icons-vue'
import { clearAuth, get } from '@/api/request'

const router = useRouter()
const searchValue = ref('')
const unreadCount = ref(3)
const currentUser = ref<{ real_name?: string; username?: string }>({})

// 显示名称
const displayName = computed(() => {
  return currentUser.value.real_name || currentUser.value.username || '用户'
})

// 问候语
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

// 获取当前用户信息
const fetchCurrentUser = async () => {
  try {
    const response = await get('/auth/me/')
    currentUser.value = response
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

onMounted(() => {
  fetchCurrentUser()
})

const goToMessages = () => {
  router.push('/messages')
}

const handleMenuClick = ({ key }: { key: string }) => {
  if (key === 'profile') {
    router.push({ path: '/messages', query: { tab: 'profile' } })
  } else if (key === 'settings') {
    router.push('/settings')
  } else if (key === 'logout') {
    clearAuth()
    message.success('退出登录成功')
    router.push('/login')
  }
}
</script>

<style scoped>
.content-header {
  height: 64px;
  /* 替换为蓝色渐变：和之前统一的亮蓝→浅蓝→亮蓝 */
  background: linear-gradient(90deg, #0088CC 0%, #4e9fc5 50%, #0088CC 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  /* 阴影替换为蓝色系，透明度保持0.2不变 */
  box-shadow: 0 2px 8px rgba(0, 136, 204, 0.2);
}

/* 居中偏左的搜索区域 */
.header-center-left {
  position: absolute;
  left: 50%;
  transform: translateX(-320px);
}

.global-search {
  width: 280px;
}

:deep(.ant-input-search .ant-input) {
  background: rgba(255, 255, 255, 0.95);
  border-color: #0088CC;
  color: #333;
}

:deep(.ant-input-search .ant-input::placeholder) {
  color: #999;
}

:deep(.ant-input-search .ant-input:focus),
:deep(.ant-input-search .ant-input:hover) {
  background: #fff;
  border-color: #0066AA;
}

:deep(.ant-input-search .ant-btn) {
  background: #187dd0;
  border-color: #2377b3;
  color: #3da4cd;
}

/* 右侧用户信息 */
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: auto;
}

/* 欢迎语 */
.welcome-text {
  display: flex;
  align-items: center;
}

.welcome-msg {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
  letter-spacing: 1px;
}

.header-btn {
  font-size: 18px;
  color: #fff;
}

.header-btn:hover {
  color: #5DADE2;
  background: rgba(0, 136, 204, 0.2);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-profile:hover {
  background-color: rgba(0, 136, 204, 0.2);
}

.username {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}

/* 下拉菜单蓝色主题 */
:deep(.ant-dropdown-menu) {
  background: #fff;
  border: 1px solid #0088CC;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 136, 204, 0.2);
}

:deep(.ant-dropdown-menu-item) {
  color: #333;
}

:deep(.ant-dropdown-menu-item:hover) {
  background: #E8F4F8;
  color: #0088CC;
}

:deep(.ant-dropdown-menu-item .anticon) {
  color: #0088CC;
}

:deep(.ant-dropdown-menu-divider) {
  background: #f0f0f0;
}
</style>
