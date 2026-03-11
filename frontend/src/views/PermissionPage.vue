<template>
  <div class="permission-page">
    <a-breadcrumb class="page-breadcrumb">
      <a-breadcrumb-item>
        <HomeOutlined />
      </a-breadcrumb-item>
      <a-breadcrumb-item>系统管理</a-breadcrumb-item>
      <a-breadcrumb-item>权限管理</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">权限管理</h1>
      <a-space>
        <a-button type="primary" @click="handleAddRole">
          <template #icon>
            <PlusOutlined />
          </template>
          新增角色
        </a-button>
        <a-button type="primary" @click="handleAddUser">
          <template #icon>
            <UserAddOutlined />
          </template>
          新增用户
        </a-button>
      </a-space>
    </div>

    <div class="page-card">
      <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
        <a-tab-pane key="role" tab="角色管理">
          <a-table
            :columns="roleColumns"
            :data-source="roleData"
            :pagination="false"
            :row-key="(record: any) => record.id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-badge :status="record.status === 'active' ? 'success' : 'default'" :text="record.status === 'active' ? '启用' : '禁用'" />
              </template>
              <template v-if="column.key === 'action'">
                <span class="action-links">
                  <a class="action-link" @click="handleEditRole(record)">
                    <EditOutlined /> 编辑
                  </a>
                  <a class="action-link" @click="handleConfigPermission(record)">
                    <SettingOutlined /> 权限配置
                  </a>
                  <a class="action-link" @click="handleDeleteRole(record)" style="color: #F5222D">
                    <DeleteOutlined /> 删除
                  </a>
                </span>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="user" tab="用户管理">
          <a-table
            :columns="userColumns"
            :data-source="userData"
            :pagination="pagination"
            :row-key="(record: any) => record.id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'role'">
                <a-tag :color="getRoleColor(record.role)">{{ record.role }}</a-tag>
              </template>
              <template v-if="column.key === 'status'">
                <a-badge :status="record.status === 'active' ? 'success' : 'default'" :text="record.status === 'active' ? '正常' : '停用'" />
              </template>
              <template v-if="column.key === 'lastLogin'">
                <span class="login-time">{{ record.lastLogin }}</span>
              </template>
              <template v-if="column.key === 'action'">
                <span class="action-links">
                  <a class="action-link" @click="handleEditUser(record)">
                    <EditOutlined /> 编辑
                  </a>
                  <a class="action-link" @click="handleResetPassword(record)">
                    <KeyOutlined /> 重置密码
                  </a>
                  <a class="action-link" @click="handleDeleteUser(record)" style="color: #F5222D">
                    <DeleteOutlined /> 删除
                  </a>
                </span>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 新增/编辑角色弹窗 -->
    <a-modal
      v-model:open="roleModalVisible"
      :title="roleModalTitle"
      width="600px"
      :footer="null"
    >
      <a-form :model="roleFormData" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="角色名称" required>
          <a-input v-model:value="roleFormData.name" placeholder="请输入角色名称" />
        </a-form-item>
        <a-form-item label="角色编码" required>
          <a-input v-model:value="roleFormData.code" placeholder="请输入角色编码" />
        </a-form-item>
        <a-form-item label="角色描述">
          <a-textarea v-model:value="roleFormData.description" :rows="3" placeholder="请输入角色描述" />
        </a-form-item>
        <a-form-item label="状态">
          <a-switch v-model:checked="roleFormData.status" checked-children="启用" unchecked-children="禁用" />
        </a-form-item>
      </a-form>
      <div class="modal-footer">
        <a-space>
          <a-button @click="roleModalVisible = false">取消</a-button>
          <a-button type="primary" @click="handleRoleModalOk">保存</a-button>
        </a-space>
      </div>
    </a-modal>

    <!-- 权限配置弹窗 -->
    <a-modal
      v-model:open="permissionModalVisible"
      title="权限配置"
      width="700px"
      :footer="null"
    >
      <div class="permission-tree">
        <a-tree
          v-model:checkedKeys="permissionTreeData.checked"
          checkable
          :tree-data="treeData"
          :field-names="{ key: 'id', title: 'name', children: 'children' }"
        />
      </div>
      <div class="modal-footer">
        <a-space>
          <a-button @click="permissionModalVisible = false">取消</a-button>
          <a-button type="primary" @click="handlePermissionModalOk">保存</a-button>
        </a-space>
      </div>
    </a-modal>

    <!-- 新增/编辑用户弹窗 -->
    <a-modal
      v-model:open="userModalVisible"
      :title="userModalTitle"
      width="700px"
      :footer="null"
    >
      <a-form :model="userFormData" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="用户名" required>
              <a-input v-model:value="userFormData.username" placeholder="请输入用户名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="姓名" required>
              <a-input v-model:value="userFormData.realName" placeholder="请输入姓名" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="所属部门">
              <a-tree-select
                v-model:value="userFormData.department"
                :tree-data="departmentTree"
                placeholder="请选择部门"
                tree-default-expand-all
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="角色" required>
              <a-select v-model:value="userFormData.role" placeholder="请选择角色">
                <a-select-option value="系统管理员">系统管理员</a-select-option>
                <a-select-option value="纪检书记">纪检书记</a-select-option>
                <a-select-option value="纪检主任">纪检主任</a-select-option>
                <a-select-option value="办案人员">办案人员</a-select-option>
                <a-select-option value="普通用户">普通用户</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="手机号码">
              <a-input v-model:value="userFormData.phone" placeholder="请输入手机号码" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="邮箱">
              <a-input v-model:value="userFormData.email" placeholder="请输入邮箱" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="状态">
          <a-switch v-model:checked="userFormData.status" checked-children="正常" unchecked-children="停用" />
        </a-form-item>
      </a-form>
      <div class="modal-footer">
        <a-space>
          <a-button @click="userModalVisible = false">取消</a-button>
          <a-button type="primary" @click="handleUserModalOk">保存</a-button>
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  HomeOutlined,
  PlusOutlined,
  UserAddOutlined,
  EditOutlined,
  SettingOutlined,
  DeleteOutlined,
  KeyOutlined
} from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { message } from 'ant-design-vue'

const activeTab = ref('role')

// 角色管理
const roleModalVisible = ref(false)
const roleModalTitle = ref('新增角色')
const roleFormData = reactive({
  id: undefined as number | undefined,
  name: '',
  code: '',
  description: '',
  status: true
})

const roleColumns: TableColumnsType = [
  { title: '角色名称', dataIndex: 'name', key: 'name', width: 150 },
  { title: '角色编码', dataIndex: 'code', key: 'code', width: 150 },
  { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '用户数', dataIndex: 'userCount', key: 'userCount', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 220 }
]

const roleData = ref([
  { id: 1, name: '系统管理员', code: 'admin', description: '拥有系统所有权限', userCount: 2, status: 'active' },
  { id: 2, name: '纪检书记', code: 'secretary', description: '纪检监察部门负责人', userCount: 3, status: 'active' },
  { id: 3, name: '纪检主任', code: 'director', description: '纪检监察部门主任', userCount: 5, status: 'active' },
  { id: 4, name: '办案人员', code: 'investigator', description: '负责案件办理', userCount: 12, status: 'active' },
  { id: 5, name: '普通用户', code: 'user', description: '普通业务用户', userCount: 28, status: 'active' },
])

// 权限配置
const permissionModalVisible = ref(false)
const permissionTreeData = reactive({
  checked: [] as string[]
})

const treeData = [
  {
    id: '1',
    name: '日常业务',
    children: [
      { id: '1-1', name: '信访举报' },
      { id: '1-2', name: '线索处置' },
      { id: '1-3', name: '案件立案' },
      { id: '1-4', name: '调查取证' },
      { id: '1-5', name: '案件审理' },
      { id: '1-6', name: '结案报告' },
    ]
  },
  {
    id: '2',
    name: '监督检查',
    children: [
      { id: '2-1', name: '检查计划' },
      { id: '2-2', name: '检查任务' },
    ]
  },
  {
    id: '3',
    name: '纪律教育',
    children: [
      { id: '3-1', name: '教育资料' },
      { id: '3-2', name: '教育活动' },
    ]
  },
  {
    id: '4',
    name: '系统管理',
    children: [
      { id: '4-1', name: '权限管理' },
      { id: '4-2', name: '流程监控' },
      { id: '4-3', name: '法规库' },
      { id: '4-4', name: '系统集成' },
    ]
  },
]

// 用户管理
const userModalVisible = ref(false)
const userModalTitle = ref('新增用户')
const userFormData = reactive({
  id: undefined as number | undefined,
  username: '',
  realName: '',
  department: undefined,
  role: undefined,
  phone: '',
  email: '',
  status: true
})

const userColumns: TableColumnsType = [
  { title: '用户名', dataIndex: 'username', key: 'username', width: 120 },
  { title: '姓名', dataIndex: 'realName', key: 'realName', width: 120 },
  { title: '所属部门', dataIndex: 'department', key: 'department', width: 150 },
  { title: '角色', dataIndex: 'role', key: 'role', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '最后登录', dataIndex: 'lastLogin', key: 'lastLogin', width: 140 },
  { title: '操作', key: 'action', width: 220 }
]

const userData = ref([
  { id: 1, username: 'admin', realName: '系统管理员', department: '信息中心', role: '系统管理员', status: 'active', lastLogin: '2025-01-27 10:30' },
  { id: 2, username: 'zhangsf', realName: '张书记', department: '第一纪检监察室', role: '纪检书记', status: 'active', lastLogin: '2025-01-27 09:15' },
  { id: 3, username: 'lizw', realName: '李主任', department: '第二纪检监察室', role: '纪检主任', status: 'active', lastLogin: '2025-01-26 16:45' },
  { id: 4, username: 'wangzk', realName: '王科长', department: '第一纪检监察室', role: '办案人员', status: 'active', lastLogin: '2025-01-27 08:30' },
  { id: 5, username: 'zhaogb', realName: '赵干部', department: '组织部', role: '普通用户', status: 'active', lastLogin: '2025-01-25 14:20' },
])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: userData.value.length,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const departmentTree = [
  { value: '1', title: '第一纪检监察室', key: '1' },
  { value: '2', title: '第二纪检监察室', key: '2' },
  { value: '3', title: '第三纪检监察室', key: '3' },
  { value: '4', title: '组织部', key: '4' },
  { value: '5', title: '宣传部', key: '5' },
  { value: '6', title: '办公室', key: '6' },
]

const getRoleColor = (role: string) => {
  const map: Record<string, string> = {
    '系统管理员': 'red',
    '纪检书记': 'purple',
    '纪检主任': 'blue',
    '办案人员': 'orange',
    '普通用户': 'green'
  }
  return map[role] || 'default'
}

const handleTabChange = (key: string) => {
  activeTab.value = key
}

const handleAddRole = () => {
  roleModalTitle.value = '新增角色'
  Object.assign(roleFormData, { id: undefined, name: '', code: '', description: '', status: true })
  roleModalVisible.value = true
}

const handleEditRole = (record: any) => {
  roleModalTitle.value = '编辑角色'
  Object.assign(roleFormData, { id: record.id, name: record.name, code: record.code, description: record.description, status: record.status === 'active' })
  roleModalVisible.value = true
}

const handleConfigPermission = (record: any) => {
  permissionTreeData.checked = ['1-1', '1-2', '1-3']
  permissionModalVisible.value = true
}

const handleDeleteRole = (record: any) => {
  message.success(`删除角色: ${record.name}`)
}

const handleRoleModalOk = () => {
  if (!roleFormData.name || !roleFormData.code) {
    message.warning('请填写必填项')
    return
  }
  message.success('保存成功')
  roleModalVisible.value = false
}

const handlePermissionModalOk = () => {
  message.success('权限配置成功')
  permissionModalVisible.value = false
}

const handleAddUser = () => {
  userModalTitle.value = '新增用户'
  Object.assign(userFormData, { id: undefined, username: '', realName: '', department: undefined, role: undefined, phone: '', email: '', status: true })
  userModalVisible.value = true
}

const handleEditUser = (record: any) => {
  userModalTitle.value = '编辑用户'
  Object.assign(userFormData, { id: record.id, username: record.username, realName: record.realName, department: record.department, role: record.role, phone: '', email: '', status: record.status === 'active' })
  userModalVisible.value = true
}

const handleResetPassword = (record: any) => {
  message.success(`重置用户 ${record.username} 的密码`)
}

const handleDeleteUser = (record: any) => {
  message.success(`删除用户: ${record.username}`)
}

const handleUserModalOk = () => {
  if (!userFormData.username || !userFormData.realName || !userFormData.role) {
    message.warning('请填写必填项')
    return
  }
  message.success('保存成功')
  userModalVisible.value = false
}
</script>

<style scoped>
.permission-page {
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
.login-time {
  color: #8c8c8c;
  font-size: 13px;
}
.modal-footer {
  text-align: right;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
.permission-tree {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
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
