<template>
  <a-config-provider :theme="{ token: { colorPrimary: '#B22222' } }">
    <!-- 登录/注册页面不使用主布局 -->
    <div v-if="isPublicPage" class="public-page">
      <router-view />
    </div>
    <!-- 其他页面使用主布局 -->
    <div v-else class="admin-layout">
      <TheSidebar />
      <div class="main-content">
        <TheHeader />
        <div class="content-body">
          <router-view />
        </div>
      </div>
    </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TheSidebar from '@/components/TheSidebar.vue'
import TheHeader from '@/components/TheHeader.vue'

const route = useRoute()

// 判断是否为公开页面（不需要主布局）
const isPublicPage = computed(() => {
  return route.path === '/login' || route.path === '/register'
})
</script>

<style>
/* 全局样式 */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  height: 100%;
}
</style>

<style scoped>
.public-page {
  height: 100vh;
  width: 100vw;
}

.admin-layout {
  display: flex;
  height: 100vh;
  /* 新中式风格 - 温暖的米白背景 */
  background: linear-gradient(135deg, #faf8f5 0%, #f5f0e8 50%, #faf8f5 100%);
}

/* 宣纸纹理效果 */
.admin-layout::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(178, 34, 34, 0.02) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(212, 175, 55, 0.02) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.content-body {
  flex: 1;
  overflow-y: auto;
  background: transparent;
}
</style>
