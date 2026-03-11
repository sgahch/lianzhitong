/**
 * 监督检查服务
 */

import { get, post, patch, del } from './request'

// 监督状态
export type SupervisionStatus = 'planned' | 'active' | 'completed' | 'reported'

// 监督类型
export type SupervisionType = 'routine' | 'special' | 'random'

// 监督检查数据接口
export interface Supervision {
  id: number
  title: string             // 标题
  supervision_type: SupervisionType  // 检查类型
  type_name?: string       // 类型名称
  content: string           // 检查内容
  target_objects: string    // 检查对象
  status: SupervisionStatus // 状态
  status_name?: string      // 状态名称
  start_date?: string       // 开始日期
  end_date?: string         // 结束日期
  progress?: number         // 进度
  leader?: number           // 负责人ID
  leader_name?: string      // 负责人名称
  members?: number[]        // 参与人员ID列表
  member_names?: string[]   // 参与人员名称
  result?: string           // 检查结果
  created_at: string
  updated_at: string
}

// 监督检查参数
export interface SupervisionParams {
  title: string
  supervision_type: SupervisionType
  content: string
  target_objects: string
  start_date?: string
  end_date?: string
  status?: SupervisionStatus
  progress?: number
  leader?: number
  member_ids?: number[]
  result?: string
}

export const supervisionService = {
  // 获取监督检查列表
  async getSupervisions(params?: {
    search?: string
    supervision_type?: SupervisionType
    status?: SupervisionStatus
    page?: number
    page_size?: number
  }) {
    return get('/supervision/', params)
  },

  // 获取单个监督检查详情
  async getSupervision(id: number) {
    return get(`/supervision/${id}/`)
  },

  // 新增监督检查
  async createSupervision(data: SupervisionParams) {
    const submitData = { ...data }
    if (data.member_ids) {
      submitData.members = data.member_ids
      delete (submitData as any).member_ids
    }
    return post('/supervision/', submitData)
  },

  // 更新监督检查
  async updateSupervision(id: number, data: Partial<SupervisionParams>) {
    return patch(`/supervision/${id}/`, data)
  },

  // 开始监督
  async startSupervision(id: number) {
    return patch(`/supervision/${id}/`, { status: 'active' })
  },

  // 完成监督
  async completeSupervision(id: number, result: string) {
    return patch(`/supervision/${id}/`, {
      status: 'completed',
      result
    })
  },

  // 上报监督结果
  async reportSupervision(id: number) {
    return patch(`/supervision/${id}/`, { status: 'reported' })
  },

  // 删除监督检查
  async deleteSupervision(id: number) {
    return del(`/supervision/${id}/`)
  },

  // 统计数量
  async getSupervisionStats() {
    const [planned, active, completed] = await Promise.all([
      get('/supervision/', { status: 'planned', page_size: 1 }),
      get('/supervision/', { status: 'active', page_size: 1 }),
      get('/supervision/', { status: 'completed', page_size: 1 })
    ])
    return {
      planned: planned.count || 0,
      active: active.count || 0,
      completed: completed.count || 0,
      total: (planned.count || 0) + (active.count || 0) + (completed.count || 0)
    }
  },

  // 获取类型选项
  getTypeOptions() {
    return [
      { value: 'routine', label: '常规检查' },
      { value: 'special', label: '专项检查' },
      { value: 'random', label: '随机抽查' }
    ]
  },

  // 获取状态选项
  getStatusOptions() {
    return [
      { value: 'planned', label: '计划中', color: 'default' },
      { value: 'active', label: '进行中', color: 'processing' },
      { value: 'completed', label: '已完成', color: 'success' },
      { value: 'reported', label: '已报告', color: 'blue' }
    ]
  },

  // 获取检查计划列表
  async getPlans(params?: any): Promise<{ results: SupervisionPlan[], count: number }> {
    return get('/supervision/', {
      ...params,
      page: params?.page || 1,
      page_size: params?.page_size || 10
    })
  },

  // 创建计划
  async createPlan(data: any) {
    return post('/supervision/', data)
  },

  // 启动计划
  async startPlan(id: number) {
    return patch(`/supervision/${id}/`, { status: 'active' })
  },

  // 获取检查任务列表
  async getTasks(params?: any): Promise<{ results: SupervisionTask[], count: number }> {
    return get('/supervision/', {
      ...params,
      page: params?.page || 1,
      page_size: params?.page_size || 10
    })
  },

  // 创建任务
  async createTask(data: any) {
    return post('/supervision/', data)
  }
}

// 计划类型
export interface SupervisionPlan {
  id: number
  title: string
  type: string
  status: string
  start_date?: string
  end_date?: string
  department_count?: number
  progress?: number
}

// 任务类型
export interface SupervisionTask {
  id: number
  title: string
  type: string
  department: string
  check_date?: string
  inspectors?: string[]
  status: string
  findings_count?: number
}

export default supervisionService
