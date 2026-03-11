<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 顶部Logo区域 -->
      <div class="login-header">
        <!-- Logo容器 -->
        <div class="login-logo">
          <img src="https://dis.xawl.edu.cn/resources/images/logo.png" alt="纪检监察学院logo">
        </div>
        <h2 class="login-subtitle">纪检监察业务虚拟仿真平台</h2>
        <div class="decoration-line"></div>
      </div>

      <a-form
        :model="formState"
        name="loginForm"
        @finish="handleLogin"
        @finishFailed="handleLoginFailed"
        class="login-form"
      >
        <a-form-item
          name="username"
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <a-input v-model:value="formState.username" placeholder="用户名" size="large" class="login-input">
            <template #prefix>
              <UserOutlined class="input-icon" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          name="password"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <a-input-password v-model:value="formState.password" placeholder="密码" size="large" class="login-input">
            <template #prefix>
              <LockOutlined class="input-icon" />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <div class="login-options">
            <a-checkbox v-model:checked="rememberMe">记住登录状态</a-checkbox>
          </div>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
            class="login-button"
          >
            登 录
          </a-button>
        </a-form-item>
      </a-form>

      <div class="login-footer">
        <p class="register-link">新用户？<a href="#" @click.prevent="goToRegister">立即注册</a></p>
        <div class="demo-info">
          <InfoCircleOutlined /> 演示账号: admin / admin123
        </div>
      </div>
    </div>

    <div class="login-bg">
      <div class="bg-overlay"></div>
      <div class="bg-content">
        <div class="emblem">
          <StarOutlined class="emblem-star" />
        </div>
        <h2>忠诚 干净 担当</h2>
        <p>打造廉洁高效的纪检监察工作体系</p>
        <div class="motto">
          <span>执纪监督</span>
          <span class="divider">|</span>
          <span>执纪审查</span>
          <span class="divider">|</span>
          <span>依法问责</span>
        </div>
      </div>
      <div class="bg-bottom-pattern"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  UserOutlined,
  LockOutlined,
  InfoCircleOutlined,
  StarOutlined
} from '@ant-design/icons-vue'
import { login } from '@/api/request'

const router = useRouter()

// 表单数据
const formState = reactive({
  username: '',
  password: ''
})

// 状态
const loading = ref(false)
const rememberMe = ref(true)

// 登录处理
const handleLogin = async () => {
  loading.value = true
  try {
    await login({
      username: formState.username,
      password: formState.password
    })
    message.success('登录成功')
    router.push('/')
  } catch (error: any) {
    message.error(error.response?.data?.detail || '登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}

// 登录失败处理
const handleLoginFailed = (errorInfo: any) => {
  console.log('Form validation failed:', errorInfo)
}

// 跳转到注册页
const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
/* 整体布局 */
.login-page {
  display: flex;
  min-height: 100vh;
  background: #f0f2f5;
}

/* 左侧登录容器 */
.login-container {
  flex: 0 0 520px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 50px;
  background: #fff;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1;
}

/* 登录头部 */
.login-header {
  text-align: center;
  margin-bottom: 48px;
}

/* Logo样式（核心：保证显示） */
.login-logo {
  margin-bottom: 20px;
}
.login-logo img {
  width: 450px;
  height: auto;
  object-fit: contain;
  display: inline-block;
}

/* 标题样式 */
.login-subtitle {
  font-size: 16px;
  font-weight: 500;
  color: #0088CC;
  margin: 0 0 20px 0;
  letter-spacing: 4px;
}

/* 装饰线 */
.decoration-line {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #4e9fc5, transparent);
  margin: 0 auto;
}

/* 表单样式 */
.login-form {
  margin-top: 20px;
}

.login-input {
  border-radius: 6px;
}

.input-icon {
  color: rgba(0, 136, 204, 0.5);
}

/* 登录选项 */
.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.login-options :deep(.ant-checkbox-checked .ant-checkbox-inner) {
  background-color: #0088CC;
  border-color: #0088CC;
}

/* 登录按钮 */
.login-button {
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 6px;
  background: #0088CC;
  border: none;
  letter-spacing: 4px;
  margin-top: 8px;
}

.login-button:hover {
  background: linear-gradient(135deg, #0088CC 0%, #005580 100%);
}

/* 登录底部 */
.login-footer {
  margin-top: 40px;
  text-align: center;
}

.register-link {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.register-link a {
  color: #0088CC;
  font-weight: 600;
}

.demo-info {
  font-size: 12px;
  color: #999;
  padding: 8px 16px;
  background: #fafafa;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.demo-info :deep(.anticon) {
  color: #0088CC;
}

/* 右侧背景区域 */
.login-bg {
  flex: 1;
  background: linear-gradient(135deg, #6a7a8e 0%, #7a8fae 50%, #8aa4be 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #0088CC; /* 完全不透明的蓝色，覆盖底层红色 */
}

/* 背景内容 */
.bg-content {
  text-align: center;
  color: #fff;
  position: relative;
  z-index: 1;
  padding: 40px;
}

.emblem {
  width: 100px;
  height: 100px;
  margin: 32px auto;
  border: 3px solid rgba(255, 215, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 215, 0, 0.05);
}

.emblem-star {
  font-size: 48px;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.bg-content h2 {
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 16px 0;
  letter-spacing: 8px;
  background: linear-gradient(135deg, #fff 0%, #ffd700 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.bg-content > p {
  font-size: 18px;
  opacity: 0.9;
  margin: 0 0 40px 0;
  letter-spacing: 2px;
}

.motto {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 2px;
}

.motto span {
  padding: 8px 16px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 4px;
  background: rgba(255, 215, 0, 0.05);
}

.motto .divider {
  border: none;
  background: transparent;
  padding: 0;
  color: rgba(255, 215, 0, 0.5);
}

/* 底部图案 */
.bg-bottom-pattern {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(180deg, transparent, rgba(0, 136, 204, 0.1));
  border-top: 1px solid rgba(255, 215, 0, 0.1);
}

/* 圆形徽章样式（备用） */
.logo-badge {
  width: 72px;
  height: 72px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #0088CC 0%, #005580 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 136, 204, 0.3);
}

.logo-icon {
  font-size: 36px;
  color: #fff;
}
</style>