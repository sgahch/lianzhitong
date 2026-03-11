<template>
  <aside class="sidebar">
    <!-- Logo区域 -->
    <div class="sidebar-header">
      <router-link to="/" class="sidebar-logo">
        <div class="login-logo">
          <img src="https://dis.xawl.edu.cn/images/logo1.png" alt="纪检监察学院logo">
        </div>
      </router-link>
    </div>

    <!-- 菜单 -->
    <a-menu
      v-model:selectedKeys="selectedKeys"
      mode="inline"
      class="sidebar-menu"
      :inline-indent="12"
    >
      <!-- 顶部菜单项 -->
      <a-menu-item v-for="item in topMenus" :key="item.key" class="menu-item">
        <router-link :to="item.path" class="menu-link">
          <template #icon>
            <component :is="item.icon" />
          </template>
          {{ item.label }}
        </router-link>
      </a-menu-item>

      <!-- 分组：日常业务 -->
      <div class="menu-group-title">日常业务</div>
      <a-menu-item v-for="item in dailyBusinessMenus" :key="item.key" class="menu-item">
        <router-link :to="item.path" class="menu-link">
          <template #icon>
            <component :is="item.icon" />
          </template>
          {{ item.label }}
        </router-link>
      </a-menu-item>

      <!-- 分组：系统管理 -->
      <div class="menu-group-title">系统管理</div>
      <a-menu-item v-for="item in systemMenus" :key="item.key" class="menu-item">
        <router-link :to="item.path" class="menu-link">
          <template #icon>
            <component :is="item.icon" />
          </template>
          {{ item.label }}
        </router-link>
      </a-menu-item>
    </a-menu>

    <!-- 底部信息 -->
    <div class="sidebar-footer">
      <div class="footer-motto">
        <StarOutlined class="motto-icon" />
        <span>忠诚 干净 担当</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  HomeOutlined,
  MailOutlined,
  FolderOpenOutlined,
  SearchOutlined,
  BankOutlined,
  ContainerOutlined,
  TeamOutlined,
  ReadOutlined,
  CompassOutlined,
  BulbOutlined,
  UsergroupAddOutlined,
  LineChartOutlined,
  BookOutlined,
  ApiOutlined,
  ScissorOutlined,
  StarOutlined
} from '@ant-design/icons-vue'

// 菜单项类型
interface MenuItem {
  key: string
  label: string
  path: string
  icon: object
}

// 路由
const route = useRoute()

// 顶部菜单
const topMenus: MenuItem[] = [
  { key: 'home', label: '首页', path: '/', icon: HomeOutlined },
  { key: 'report', label: '信访举报', path: '/report', icon: MailOutlined },
  { key: 'caseFiling', label: '案件立案', path: '/case-filing', icon: FolderOpenOutlined },
  { key: 'investigation', label: '审查调查', path: '/investigation', icon: SearchOutlined },
  { key: 'trial', label: '案件审理', path: '/trial', icon: BankOutlined },
  { key: 'conclusion', label: '结案报告', path: '/conclusion', icon: ContainerOutlined }
]

// 日常业务
const dailyBusinessMenus: MenuItem[] = [
  { key: 'assistParty', label: '协助党委', path: '/assist-party', icon: TeamOutlined },
  { key: 'disciplineEdu', label: '纪律教育', path: '/discipline-edu', icon: ReadOutlined },
  { key: 'supervision', label: '监督检查', path: '/supervision', icon: CompassOutlined },
  { key: 'clue', label: '线索处置', path: '/clue', icon: BulbOutlined }
]

// 系统管理
const systemMenus: MenuItem[] = [
  { key: 'permission', label: '权限管理', path: '/permission', icon: UsergroupAddOutlined },
  { key: 'processMonitor', label: '流程监控', path: '/process-monitor', icon: LineChartOutlined },
  { key: 'regulation', label: '法规库', path: '/regulation', icon: BookOutlined },
  { key: 'integration', label: '系统集成', path: '/integration', icon: ApiOutlined }
]

// 选中状态
const selectedKeys = ref<string[]>(['home'])

// 监听路由变化，更新选中状态
watch(
  () => route.path,
  (path) => {
    const allMenus = [...topMenus, ...dailyBusinessMenus, ...systemMenus]
    const menu = allMenus.find(m => m.path === path)
    if (menu) {
      selectedKeys.value = [menu.key]
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.sidebar {
  width: 260px;
  /* 米白色主题 */
  background: linear-gradient(180deg, #FAF8F5 0%, #F5F0E8 100%);
  border-right: 2px solid #B8860B;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: relative;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.08);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 2px solid #D4AF37; /* 保留金色边框，与顶部导航呼应 */
  /* 替换为和content-header一致的蓝色渐变 */
  background: linear-gradient(90deg, #0088CC 0%, #4e9fc5 50%, #0088CC 100%);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

/* Logo样式（核心：保证显示） */
.login-logo {
}
.login-logo img {
  width: 230px;
  height: auto;
  object-fit: contain;
  display: inline-block;
}



.logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1px;
  line-height: 1.2;
}

.logo-subtitle {
  font-size: 11px;
  color: #ffd700;
  letter-spacing: 1px;
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
  border: none;
  background: transparent !important;
}

.menu-group-title {
  padding: 16px 20px 8px;
  font-size: 12px;
  color: #8B7355;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
}

/* 深色主题菜单样式 */
:deep(.ant-menu-item) {
  margin: 2px 12px !important;
  border-radius: 6px;
  height: 42px;
  line-height: 42px;
  color: #333;
  padding: 0 12px !important;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

:deep(.ant-menu-item .anticon) {
  color: #0088CC;
  font-size: 16px;
}

:deep(.ant-menu-item:hover) {
  color: #333 !important;
  background: rgba(0, 136, 204, 0.08) !important;
  border-left-color: #0088CC;
}

:deep(.ant-menu-item:hover .anticon) {
  color: #0088CC !important;
}

/* 激活状态：蓝色背景 + 深蓝边框 */
:deep(.ant-menu-item-selected) {
  background: linear-gradient(90deg, #0088CC 0%, #0066AA 100%) !important;
  color: #fff !important;
  border-radius: 6px !important;
  margin: 2px 12px !important;
  border-left: 3px solid #0088CC;
  box-shadow: 0 2px 8px rgba(0, 136, 204, 0.2);
}

:deep(.ant-menu-item-selected .anticon) {
  color: #fff !important;
}

:deep(.ant-menu-item-selected:hover) {
  background: linear-gradient(90deg, #0088CC 0%, #5DADE2 100%) !important;
}

/* 菜单链接样式 */
.menu-link {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  color: inherit;
  gap: 10px;
}

.menu-link:hover {
  color: inherit;
}

/* 底部 */
.sidebar-footer {
  padding: 16px 20px;
  border-top: 2px solid #B8860B;
  background: linear-gradient(0deg, rgba(184, 134, 11, 0.15) 0%, transparent 100%);
}

.footer-motto {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: #B8860B;
  letter-spacing: 3px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.motto-icon {
  color: #B8860B;
  font-size: 14px;
}

/* 滚动条样式 */
.sidebar-menu::-webkit-scrollbar {
  width: 4px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 215, 0, 0.2);
  border-radius: 2px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 215, 0, 0.3);
}
</style>
