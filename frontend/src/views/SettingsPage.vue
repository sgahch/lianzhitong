<template>
  <div class="settings-page">
    <a-breadcrumb class="page-breadcrumb">
      <a-breadcrumb-item>
        <HomeOutlined />
      </a-breadcrumb-item>
      <a-breadcrumb-item>个人中心</a-breadcrumb-item>
      <a-breadcrumb-item>个人设置</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">个人设置</h1>
    </div>

    <div class="page-card">
      <a-tabs v-model:activeKey="activeTab" @change="handleTabChange" class="settings-tabs">
        <a-tab-pane key="security" tab="安全设置">
          <div class="security-section">
            <div class="security-item">
              <div class="security-info">
                <div class="security-title">登录密码</div>
                <div class="security-desc">定期更换密码可以提高账户安全性</div>
              </div>
              <a-button @click="showPasswordModal = true">修改密码</a-button>
            </div>
            <a-divider />
            <div class="security-item">
              <div class="security-info">
                <div class="security-title">手机验证</div>
                <div class="security-desc">当前绑定手机：{{ profileForm.phone || '未绑定' }}</div>
              </div>
              <a-button>更换手机</a-button>
            </div>
            <a-divider />
            <div class="security-item">
              <div class="security-info">
                <div class="security-title">登录设备管理</div>
                <div class="security-desc">查看并管理您的登录设备</div>
              </div>
              <a-button>查看设备</a-button>
            </div>
          </div>
        </a-tab-pane>

        <a-tab-pane key="notifications" tab="通知设置">
          <div class="notification-section">
            <div class="notification-item">
              <div class="notification-info">
                <div class="notification-title">系统通知</div>
                <div class="notification-desc">接收系统推送的重要通知</div>
              </div>
              <a-switch v-model:checked="notificationForm.system" />
            </div>
            <a-divider />
            <div class="notification-item">
              <div class="notification-info">
                <div class="notification-title">消息提醒</div>
                <div class="notification-desc">接收业务消息提醒</div>
              </div>
              <a-switch v-model:checked="notificationForm.message" />
            </div>
            <a-divider />
            <div class="notification-item">
              <div class="notification-info">
                <div class="notification-title">邮件通知</div>
                <div class="notification-desc">通过邮件接收重要通知</div>
              </div>
              <a-switch v-model:checked="notificationForm.email" />
            </div>
            <a-divider />
            <div class="notification-item">
              <div class="notification-info">
                <div class="notification-title">免打扰模式</div>
                <div class="notification-desc">在免打扰时间内不接收通知</div>
              </div>
              <a-switch v-model:checked="notificationForm.quietMode" />
            </div>
          </div>
        </a-tab-pane>

        <a-tab-pane key="appearance" tab="界面设置">
          <div class="appearance-section">
            <a-form-item label="主题颜色">
              <div class="theme-colors">
                <div
                  class="theme-color"
                  :class="{ active: themeColor === 'blue' }"
                  style="background: #1890FF"
                  @click="themeColor = 'blue'"
                ></div>
                <div
                  class="theme-color"
                  :class="{ active: themeColor === 'green' }"
                  style="background: #52C41A"
                  @click="themeColor = 'green'"
                ></div>
                <div
                  class="theme-color"
                  :class="{ active: themeColor === 'orange' }"
                  style="background: #FA8C16"
                  @click="themeColor = 'orange'"
                ></div>
                <div
                  class="theme-color"
                  :class="{ active: themeColor === 'purple' }"
                  style="background: #722ED1"
                  @click="themeColor = 'purple'"
                ></div>
              </div>
            </a-form-item>
            <a-form-item label="密度">
              <a-radio-group v-model:value="tableDensity" button-style="solid">
                <a-radio-button value="large">宽松</a-radio-button>
                <a-radio-button value="default">默认</a-radio-button>
                <a-radio-button value="compact">紧凑</a-radio-button>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="语言">
              <a-select v-model:value="language" style="width: 200px">
                <a-select-option value="zh-CN">简体中文</a-select-option>
                <a-select-option value="en-US">English</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="handleSaveAppearance">保存设置</a-button>
            </a-form-item>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 修改密码弹窗 -->
    <a-modal
      v-model:open="showPasswordModal"
      title="修改密码"
      width="500px"
      :footer="null"
    >
      <a-form :model="passwordForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="当前密码" required>
          <a-input-password v-model:value="passwordForm.currentPassword" placeholder="请输入当前密码" />
        </a-form-item>
        <a-form-item label="新密码" required>
          <a-input-password v-model:value="passwordForm.newPassword" placeholder="请输入新密码" />
        </a-form-item>
        <a-form-item label="确认密码" required>
          <a-input-password v-model:value="passwordForm.confirmPassword" placeholder="请再次输入新密码" />
        </a-form-item>
      </a-form>
      <div class="modal-footer">
        <a-space>
          <a-button @click="showPasswordModal = false">取消</a-button>
          <a-button type="primary" @click="handleChangePassword">确认修改</a-button>
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  HomeOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const activeTab = ref('security')
const showPasswordModal = ref(false)

// 简化的个人信息，仅用于显示手机号
const profileForm = reactive({
  phone: '138****1234'
})

const notificationForm = reactive({
  system: true,
  message: true,
  email: false,
  quietMode: false
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const themeColor = ref('blue')
const tableDensity = ref('default')
const language = ref('zh-CN')

const handleTabChange = (key: string) => {
  activeTab.value = key
}

const handleSaveAppearance = () => {
  message.success('界面设置保存成功')
}

const handleChangePassword = () => {
  if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    message.warning('请填写所有密码字段')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    message.error('两次输入的密码不一致')
    return
  }
  message.success('密码修改成功')
  showPasswordModal.value = false
  Object.assign(passwordForm, { currentPassword: '', newPassword: '', confirmPassword: '' })
}
</script>

<style scoped>
.settings-page {
  padding: 0;
}
.page-breadcrumb {
  margin-bottom: 16px;
}
.page-header {
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
.settings-tabs {
  min-height: 500px;
}
.settings-form {
  padding-top: 20px;
}
.form-hint {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}
.security-section,
.notification-section,
.appearance-section {
  padding: 20px 0;
}
.security-item,
.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.security-title,
.notification-title {
  font-size: 16px;
  font-weight: 500;
  color: #1f1f1f;
}
.security-desc,
.notification-desc {
  font-size: 14px;
  color: #8c8c8c;
  margin-top: 4px;
}
.theme-colors {
  display: flex;
  gap: 12px;
}
.theme-color {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}
.theme-color:hover {
  transform: scale(1.1);
}
.theme-color.active {
  border-color: #1f1f1f;
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px currentColor;
}
.modal-footer {
  text-align: right;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
