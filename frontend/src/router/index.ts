import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { getToken } from '@/api/request'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginPage.vue'),
    meta: { public: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterPage.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomePage.vue')
  },
  {
    path: '/report',
    name: 'Report',
    component: () => import('@/views/ReportPage.vue')
  },
  {
    path: '/case-filing',
    name: 'CaseFiling',
    component: () => import('@/views/CaseFilingPage.vue')
  },
  {
    path: '/investigation',
    name: 'Investigation',
    component: () => import('@/views/InvestigationPage.vue')
  },
  {
    path: '/trial',
    name: 'Trial',
    component: () => import('@/views/TrialPage.vue')
  },
  {
    path: '/conclusion',
    name: 'Conclusion',
    component: () => import('@/views/ConclusionPage.vue')
  },
  {
    path: '/assist-party',
    name: 'AssistParty',
    component: () => import('@/views/AssistPartyList.vue')
  },
  {
    path: '/discipline-edu',
    name: 'DisciplineEdu',
    component: () => import('@/views/EducationPage.vue')
  },
  {
    path: '/supervision',
    name: 'Supervision',
    component: () => import('@/views/SupervisionPage.vue')
  },
  {
    path: '/clue',
    name: 'Clue',
    component: () => import('@/views/CluePage.vue')
  },
  {
    path: '/permission',
    name: 'Permission',
    component: () => import('@/views/PermissionPage.vue')
  },
  {
    path: '/process-monitor',
    name: 'ProcessMonitor',
    component: () => import('@/views/ProcessMonitorPage.vue')
  },
  {
    path: '/regulation',
    name: 'Regulation',
    component: () => import('@/views/RegulationPage.vue')
  },
  {
    path: '/integration',
    name: 'Integration',
    component: () => import('@/views/IntegrationPage.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsPage.vue')
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('@/views/MessagePage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 检查登录状态
router.beforeEach((to, from, next) => {
  // 公开路由直接放行
  if (to.meta.public) {
    next()
    return
  }

  // 检查是否已登录
  const token = getToken()
  if (!token && to.path !== '/login') {
    next('/login')
    return
  }

  // 已登录用户访问登录页，跳转到首页
  if (token && to.path === '/login') {
    next('/')
    return
  }

  next()
})

export default router
