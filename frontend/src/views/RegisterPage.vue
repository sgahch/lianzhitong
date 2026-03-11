<template>
  <div class="register-page">
    <div class="register-container">
      <!-- 顶部Logo区域 -->
      <div class="register-header">
        <div class="logo-badge">
          <ScissorOutlined class="logo-icon" />
        </div>
        <h1 class="register-title">西安文理学院</h1>
        <h2 class="register-subtitle">纪检监察学院工作管理平台</h2>
        <div class="decoration-line"></div>
      </div>

      <a-form
        :model="formState"
        name="registerForm"
        @finish="handleRegister"
        @finishFailed="handleRegisterFailed"
        class="register-form"
      >
        <a-form-item
          name="username"
          :rules="usernameRules"
        >
          <a-input
            v-model:value="formState.username"
            placeholder="请设置用户名"
            size="large"
            class="register-input"
            :status="usernameStatus"
            @blur="checkUsername"
            @input="onUsernameInput"
          >
            <template #prefix>
              <UserOutlined class="input-icon" />
            </template>
            <template #suffix>
              <a-spin v-if="checkingUsername" size="small" />
              <CheckCircleOutlined v-else-if="usernameStatus === 'success'" class="input-suffix-icon success" />
              <CloseCircleOutlined v-else-if="usernameStatus === 'error'" class="input-suffix-icon error" />
            </template>
          </a-input>
          <div class="username-hint" :class="usernameStatus">
            {{ usernameHint }}
          </div>
        </a-form-item>

        <a-form-item
          name="password"
          :rules="[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6个字符' }]"
        >
          <a-input-password v-model:value="formState.password" placeholder="请设置密码" size="large" class="register-input">
            <template #prefix>
              <LockOutlined class="input-icon" />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item
          name="confirmPassword"
          :rules="[{ required: true, message: '请确认密码' }, { validator: validatePassword }]"
        >
          <a-input-password v-model:value="formState.confirmPassword" placeholder="请确认密码" size="large" class="register-input">
            <template #prefix>
              <LockOutlined class="input-icon" />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item
          name="real_name"
          :rules="[{ required: true, message: '请输入真实姓名' }]"
        >
          <a-input v-model:value="formState.real_name" placeholder="请输入真实姓名" size="large" class="register-input">
            <template #prefix>
              <IdcardOutlined class="input-icon" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item name="email" :rules="[{ type: 'email', message: '请输入有效的邮箱地址' }]">
          <a-input v-model:value="formState.email" placeholder="邮箱（选填）" size="large" class="register-input">
            <template #prefix>
              <MailOutlined class="input-icon" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item name="phone">
          <a-input v-model:value="formState.phone" placeholder="联系电话（选填）" size="large" class="register-input">
            <template #prefix>
              <PhoneOutlined class="input-icon" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
            class="register-button"
          >
            注 册
          </a-button>
        </a-form-item>
      </a-form>

      <div class="register-footer">
        <p class="login-link">已有账号？<a href="#" @click.prevent="goToLogin">立即登录</a></p>
      </div>
    </div>

    <div class="register-bg">
      <div class="bg-overlay"></div>
      <div class="bg-content">
        <div class="emblem">
          <StarOutlined class="emblem-star" />
        </div>
        <h2>忠诚 干净 担当</h2>
        <p>共建廉洁校园，营造风清气正</p>
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
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ScissorOutlined,
  UserOutlined,
  LockOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StarOutlined
} from '@ant-design/icons-vue'
import { post, get } from '@/api/request'

const router = useRouter()

// 表单数据
const formState = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  real_name: '',
  email: '',
  phone: ''
})

// 状态
const loading = ref(false)
const checkingUsername = ref(false)
const usernameStatus = ref<'success' | 'error' | ''>('')
const usernameHint = ref('')
let usernameCheckTimer: number | null = null

// 用户名校验规则
const usernameRules = computed(() => {
  const rules: any[] = [
    { required: true, message: '请输入用户名' },
    { min: 3, message: '用户名至少3个字符' },
    {
      validator: async (_rule: any, value: string) => {
        if (!value) return Promise.resolve()
        if (value.length < 3) return Promise.resolve()
        if (usernameStatus.value === 'error') {
          return Promise.reject('用户名已被占用')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ]
  return rules
})

// 用户名输入时重置状态
const onUsernameInput = () => {
  usernameStatus.value = ''
  usernameHint.value = ''
  if (usernameCheckTimer) {
    clearTimeout(usernameCheckTimer)
  }
  usernameCheckTimer = window.setTimeout(() => {
    if (formState.username.length >= 3) {
      checkUsername()
    }
  }, 500)
}

// 检查用户名是否可用
const checkUsername = async () => {
  const username = formState.username.trim()
  if (!username || username.length < 3) {
    usernameStatus.value = ''
    usernameHint.value = ''
    return
  }

  checkingUsername.value = true
  usernameHint.value = '正在检查...'

  try {
    const response = await get('/auth/check-username/', { username })
    if (response.available) {
      usernameStatus.value = 'success'
      usernameHint.value = '用户名可用'
    } else {
      usernameStatus.value = 'error'
      usernameHint.value = response.message || '用户名已被占用'
    }
  } catch (error) {
    usernameStatus.value = ''
    usernameHint.value = ''
  } finally {
    checkingUsername.value = false
  }
}

// 密码验证
const validatePassword = async (_rule: any, value: string) => {
  if (value !== formState.password) {
    return Promise.reject('两次输入的密码不一致')
  }
  return Promise.resolve()
}

// 注册处理
const handleRegister = async () => {
  loading.value = true
  try {
    await post('/register/', {
      username: formState.username,
      password: formState.password,
      real_name: formState.real_name,
      email: formState.email,
      phone: formState.phone
    })
    message.success('注册成功，请登录')
    router.push('/login')
  } catch (error: any) {
    const errorMsg = error.response?.data?.error || error.response?.data?.detail || '注册失败'
    message.error(errorMsg)
  } finally {
    loading.value = false
  }
}

// 注册失败处理
const handleRegisterFailed = (errorInfo: any) => {
  console.log('Form validation failed:', errorInfo)
}

// 跳转到登录页
const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-page {
  display: flex;
  min-height: 100vh;
  background: #f0f2f5;
}

.register-container {
  flex: 0 0 520px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px 50px;
  background: #fff;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1;
  overflow-y: auto;
  max-height: 100vh;
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-badge {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(196, 30, 58, 0.3);
}

.logo-icon {
  font-size: 32px;
  color: #fff;
}

.register-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 4px 0;
  letter-spacing: 2px;
}

.register-subtitle {
  font-size: 14px;
  font-weight: 500;
  color: #c41e3a;
  margin: 0 0 16px 0;
  letter-spacing: 3px;
}

.decoration-line {
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #c41e3a, transparent);
  margin: 0 auto;
}

.register-form {
  margin-top: 20px;
}

.register-input {
  border-radius: 6px;
}

.input-icon {
  color: #c41e3a;
}

.input-suffix-icon {
  font-size: 16px;
}

.input-suffix-icon.success {
  color: #52c41a;
}

.input-suffix-icon.error {
  color: #f5222d;
}

.username-hint {
  font-size: 12px;
  margin-top: 4px;
  min-height: 18px;
  transition: all 0.2s;
}

.username-hint.success {
  color: #52c41a;
}

.username-hint.error {
  color: #f5222d;
}

.username-hint:empty {
  display: none;
}

.register-button {
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 6px;
  background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%);
  border: none;
  letter-spacing: 4px;
  margin-top: 8px;
}

.register-button:hover {
  background: linear-gradient(135deg, #a01830 0%, #6b0000 100%);
}

.register-footer {
  margin-top: 32px;
  text-align: center;
}

.login-link {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.login-link a {
  color: #c41e3a;
  font-weight: 600;
}

/* 右侧背景区域 */
.register-bg {
  flex: 1;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
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
  background:
    radial-gradient(circle at 20% 80%, rgba(196, 30, 58, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(196, 30, 58, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(196, 30, 58, 0.05) 0%, transparent 30%);
}

.bg-content {
  text-align: center;
  color: #fff;
  position: relative;
  z-index: 1;
  padding: 40px;
}

.emblem {
  width: 90px;
  height: 90px;
  margin: 24px auto;
  border: 3px solid rgba(255, 215, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 215, 0, 0.05);
}

.emblem-star {
  font-size: 42px;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.bg-content h2 {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 16px 0;
  letter-spacing: 6px;
  background: linear-gradient(135deg, #fff 0%, #ffd700 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.bg-content > p {
  font-size: 16px;
  opacity: 0.9;
  margin: 0 0 32px 0;
  letter-spacing: 2px;
}

.motto {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 2px;
}

.motto span {
  padding: 6px 12px;
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

.bg-bottom-pattern {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background:
    linear-gradient(180deg, transparent, rgba(196, 30, 58, 0.1));
  border-top: 1px solid rgba(255, 215, 0, 0.1);
}
</style>
