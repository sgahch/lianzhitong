<template>
  <div class="integration-page">
    <a-breadcrumb class="page-breadcrumb">
      <a-breadcrumb-item>
        <HomeOutlined />
      </a-breadcrumb-item>
      <a-breadcrumb-item>系统管理</a-breadcrumb-item>
      <a-breadcrumb-item>系统集成</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">系统集成</h1>
      <a-button type="primary" @click="handleAdd">
        <template #icon>
          <PlusOutlined />
        </template>
        新增接口
      </a-button>
    </div>

    <div class="page-card">
      <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
        <a-tab-pane key="interface" tab="接口管理">
          <a-table
            :columns="interfaceColumns"
            :data-source="interfaceData"
            :pagination="pagination"
            :row-key="(record: any) => record.id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'name'">
                <div class="interface-name">
                  <ApiOutlined class="interface-icon" />
                  <span>{{ record.name }}</span>
                </div>
              </template>
              <template v-if="column.key === 'status'">
                <a-badge :status="record.status === 'active' ? 'success' : 'default'" :text="record.status === 'active' ? '已启用' : '已禁用'" />
              </template>
              <template v-if="column.key === 'lastSync'">
                <span class="sync-time">{{ record.lastSync || '从未同步' }}</span>
              </template>
              <template v-if="column.key === 'action'">
                <span class="action-links">
                  <a class="action-link" @click="handleTest(record)">
                    <ThunderboltOutlined /> 测试
                  </a>
                  <a class="action-link" @click="handleSync(record)">
                    <SyncOutlined /> 同步
                  </a>
                  <a class="action-link" @click="handleEdit(record)">
                    <EditOutlined /> 编辑
                  </a>
                </span>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="log" tab="同步日志">
          <a-table
            :columns="logColumns"
            :data-source="syncLogData"
            :pagination="logPagination"
            :row-key="(record: any) => record.id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-badge :status="record.status === 'success' ? 'success' : 'error'" :text="record.status === 'success' ? '成功' : '失败'" />
              </template>
              <template v-if="column.key === 'action'">
                <a class="action-link" @click="handleViewLog(record)">
                  <EyeOutlined /> 详情
                </a>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 新增/编辑接口弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      width="700px"
      :footer="null"
    >
      <a-form :model="formData" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="接口名称" required>
          <a-input v-model:value="formData.name" placeholder="请输入接口名称" />
        </a-form-item>
        <a-form-item label="接口类型" required>
          <a-select v-model:value="formData.type" placeholder="请选择">
            <a-select-option value="restful">RESTful API</a-select-option>
            <a-select-option value="soap">SOAP WebService</a-select-option>
            <a-select-option value="database">数据库直连</a-select-option>
            <a-select-option value="message">消息队列</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="对接系统" required>
          <a-select v-model:value="formData.system" placeholder="请选择对接系统">
            <a-select-option value="oa">OA办公系统</a-select-option>
            <a-select-option value="hr">人事管理系统</a-select-option>
            <a-select-option value="finance">财务系统</a-select-option>
            <a-select-option value="email">邮件系统</a-select-option>
            <a-select-option value="sms">短信平台</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="接口地址" required>
          <a-input v-model:value="formData.url" placeholder="请输入接口地址" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="认证方式">
              <a-select v-model:value="formData.authType" placeholder="请选择">
                <a-select-option value="none">无</a-select-option>
                <a-select-option value="basic">Basic Auth</a-select-option>
                <a-select-option value="token">Token</a-select-option>
                <a-select-option value="oauth">OAuth 2.0</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="同步频率">
              <a-select v-model:value="formData.syncFrequency" placeholder="请选择">
                <a-select-option value="realtime">实时</a-select-option>
                <a-select-option value="hourly">每小时</a-select-option>
                <a-select-option value="daily">每天</a-select-option>
                <a-select-option value="manual">手动</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="接口描述">
          <a-textarea v-model:value="formData.description" :rows="3" placeholder="请输入接口描述" />
        </a-form-item>
        <a-form-item label="状态">
          <a-switch v-model:checked="formData.status" checked-children="启用" unchecked-children="禁用" />
        </a-form-item>
      </a-form>
      <div class="modal-footer">
        <a-space>
          <a-button @click="handleTestConnection">测试连接</a-button>
          <a-button @click="modalVisible = false">取消</a-button>
          <a-button type="primary" @click="handleModalOk">保存</a-button>
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
  ApiOutlined,
  ThunderboltOutlined,
  SyncOutlined,
  EditOutlined,
  EyeOutlined
} from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { message } from 'ant-design-vue'

const activeTab = ref('interface')
const modalVisible = ref(false)
const modalTitle = ref('新增接口')

const formData = reactive({
  id: undefined as number | undefined,
  name: '',
  type: undefined as string | undefined,
  system: undefined as string | undefined,
  url: '',
  authType: undefined as string | undefined,
  syncFrequency: undefined as string | undefined,
  description: '',
  status: true
})

const interfaceColumns: TableColumnsType = [
  { title: '接口名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '接口类型', dataIndex: 'typeText', key: 'type', width: 120 },
  { title: '对接系统', dataIndex: 'systemText', key: 'system', width: 140 },
  { title: '接口地址', dataIndex: 'url', key: 'url', ellipsis: true },
  { title: '同步频率', dataIndex: 'syncFrequency', key: 'syncFrequency', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '最后同步', dataIndex: 'lastSync', key: 'lastSync', width: 140 },
  { title: '操作', key: 'action', width: 200 }
]

const interfaceData = ref([
  { id: 1, name: 'OA系统用户同步', type: 'restful', typeText: 'RESTful API', system: 'oa', systemText: 'OA办公系统', url: 'https://oa.example.com/api/users', syncFrequency: 'hourly', status: 'active', lastSync: '2025-01-27 10:00' },
  { id: 2, name: '人事数据同步', type: 'database', typeText: '数据库直连', system: 'hr', systemText: '人事管理系统', url: 'jdbc:mysql://hr.example.com:3306/hr', syncFrequency: 'daily', status: 'active', lastSync: '2025-01-26 00:00' },
  { id: 3, name: '邮件发送接口', type: 'restful', typeText: 'RESTful API', system: 'email', systemText: '邮件系统', url: 'https://mail.example.com/api/send', syncFrequency: 'realtime', status: 'active', lastSync: '2025-01-27 10:30' },
  { id: 4, name: '短信平台接口', type: 'soap', typeText: 'SOAP', system: 'sms', systemText: '短信平台', url: 'https://sms.example.com/ws/smsService', syncFrequency: 'realtime', status: 'active', lastSync: '2025-01-27 10:25' },
  { id: 5, name: '财务系统对接', type: 'restful', typeText: 'RESTful API', system: 'finance', systemText: '财务系统', url: 'https://finance.example.com/api/v1', syncFrequency: 'manual', status: 'inactive', lastSync: null },
])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: interfaceData.value.length,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const logColumns: TableColumnsType = [
  { title: '接口名称', dataIndex: 'interfaceName', key: 'interfaceName', width: 180 },
  { title: '同步时间', dataIndex: 'syncTime', key: 'syncTime', width: 160 },
  { title: '同步类型', dataIndex: 'syncType', key: 'syncType', width: 100 },
  { title: '同步数据', dataIndex: 'dataCount', key: 'dataCount', width: 100 },
  { title: '耗时', dataIndex: 'duration', key: 'duration', width: 80 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 80 }
]

const syncLogData = ref([
  { id: 1, interfaceName: 'OA系统用户同步', syncTime: '2025-01-27 10:00:00', syncType: '增量', dataCount: 15, duration: '2.3s', status: 'success' },
  { id: 2, interfaceName: '邮件发送接口', syncTime: '2025-01-27 10:30:05', syncType: '单条', dataCount: 1, duration: '0.5s', status: 'success' },
  { id: 3, interfaceName: 'OA系统用户同步', syncTime: '2025-01-27 09:00:00', syncType: '增量', dataCount: 8, duration: '1.8s', status: 'success' },
  { id: 4, interfaceName: '财务系统对接', syncTime: '2025-01-26 23:30:00', syncType: '全量', dataCount: 1256, duration: '45.2s', status: 'error' },
  { id: 5, interfaceName: '人事数据同步', syncTime: '2025-01-26 00:00:00', syncType: '全量', dataCount: 568, duration: '12.5s', status: 'success' },
])

const logPagination = reactive({
  current: 1,
  pageSize: 10,
  total: syncLogData.value.length,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const handleTabChange = (key: string) => {
  activeTab.value = key
}

const handleTest = (record: any) => {
  message.loading(`正在测试接口: ${record.name}...`)
  setTimeout(() => {
    message.success('接口测试成功')
  }, 2000)
}

const handleSync = (record: any) => {
  message.loading(`正在同步数据: ${record.name}...`)
  setTimeout(() => {
    record.lastSync = new Date().toLocaleString('zh-CN').slice(0, 16).replace('/', '-')
    message.success('同步完成')
  }, 2000)
}

const handleEdit = (record: any) => {
  modalTitle.value = '编辑接口'
  Object.assign(formData, {
    id: record.id, name: record.name, type: record.type, system: record.system,
    url: record.url, authType: undefined, syncFrequency: record.syncFrequency, description: '', status: record.status === 'active'
  })
  modalVisible.value = true
}

const handleViewLog = (record: any) => {
  message.info(`查看日志详情: ${record.interfaceName}`)
}

const handleAdd = () => {
  modalTitle.value = '新增接口'
  Object.assign(formData, {
    id: undefined, name: '', type: undefined, system: undefined, url: '',
    authType: undefined, syncFrequency: undefined, description: '', status: true
  })
  modalVisible.value = true
}

const handleTestConnection = () => {
  message.loading('正在测试连接...')
  setTimeout(() => {
    message.success('连接测试成功')
  }, 1500)
}

const handleModalOk = () => {
  if (!formData.name || !formData.type || !formData.system || !formData.url) {
    message.warning('请填写必填项')
    return
  }
  message.success('保存成功')
  modalVisible.value = false
}
</script>

<style scoped>
.integration-page {
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
.interface-name {
  display: flex;
  align-items: center;
  gap: 8px;
}
.interface-icon {
  color: #1890FF;
  font-size: 16px;
}
.sync-time {
  color: #8c8c8c;
  font-size: 13px;
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
.modal-footer {
  text-align: right;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
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
