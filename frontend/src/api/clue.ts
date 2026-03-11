/**
 * 线索处置服务
 */

import { get, post, patch, del } from './request'

// 线索状态
export type ClueStatus = 'pending' | 'reviewed' | 'assigned' | 'investigating' | 'closed' | 'filed'

// 线索来源
export type ClueSource = 'report' | 'audit' | 'discover' | 'transfer' | 'other'

// 线索数据接口
export interface Clue {
  id: number
  clue_no: string           // 线索编号
  source: ClueSource        // 线索来源
  title: string             // 线索标题
  content: string           // 线索内容
  status: ClueStatus        // 线索状态
  discoverer?: string       // 发现人
  discover_time?: string    // 发现时间
  reviewer?: number         // 审阅人ID
  reviewer_name?: string    // 审阅人姓名
  review_time?: string      // 审阅时间
  review_opinion?: string   // 审阅意见
  handler?: number          // 承办人ID
  handler_name?: string     // 承办人姓名
  handle_time?: string      // 处置时间
  handle_result?: string    // 处置结果
  created_at: string
  updated_at: string
}

// 线索参数
export interface ClueParams {
  source: ClueSource
  title: string
  content: string
  discoverer?: string
  discover_time?: string
}

export const clueService = {
  // 获取线索列表
  async getClues(params?: {
    search?: string
    source?: ClueSource
    status?: ClueStatus
    page?: number
    page_size?: number
  }) {
    return get('/clues/', params)
  },

  // 获取单个线索详情
  async getClue(id: number) {
    return get(`/clues/${id}/`)
  },

  // 新增线索
  async createClue(data: ClueParams) {
    return post('/clues/', data)
  },

  // 更新线索
  async updateClue(id: number, data: Partial<ClueParams>) {
    return patch(`/clues/${id}/`, data)
  },

  // 审阅线索
  async reviewClue(id: number, opinion: string) {
    return patch(`/clues/${id}/`, {
      status: 'reviewed',
      review_opinion: opinion
    })
  },

  // 分办线索（指定承办人）
  async assignClue(id: number, handlerId: number) {
    return patch(`/clues/${id}/`, {
      status: 'assigned',
      handler: handlerId
    })
  },

  // 开始调查
  async startInvestigation(id: number) {
    return patch(`/clues/${id}/`, { status: 'investigating' })
  },

  // 了结线索
  async closeClue(id: number, result: string) {
    return patch(`/clues/${id}/`, {
      status: 'closed',
      handle_result: result
    })
  },

  // 暂存线索
  async fileClue(id: number, result: string) {
    return patch(`/clues/${id}/`, {
      status: 'filed',
      handle_result: result
    })
  },

  // 删除线索
  async deleteClue(id: number) {
    return del(`/clues/${id}/`)
  },

  // 统计线索数量
  async getClueStats() {
    const [pending, investigating, closed] = await Promise.all([
      get('/clues/', { status: 'pending', page_size: 1 }),
      get('/clues/', { status: 'investigating', page_size: 1 }),
      get('/clues/', { status: 'closed', page_size: 1 })
    ])
    return {
      pending: pending.count || 0,
      investigating: investigating.count || 0,
      closed: closed.count || 0,
      total: (pending.count || 0) + (investigating.count || 0) + (closed.count || 0)
    }
  },

  // 获取来源选项
  getSourceOptions() {
    return [
      { value: 'report', label: '举报线索' },
      { value: 'audit', label: '审计线索' },
      { value: 'discover', label: '发现线索' },
      { value: 'transfer', label: '移送线索' },
      { value: 'other', label: '其他' }
    ]
  },

  // 获取状态选项
  getStatusOptions() {
    return [
      { value: 'pending', label: '待处置', color: 'default' },
      { value: 'reviewed', label: '已审阅', color: 'blue' },
      { value: 'assigned', label: '已分办', color: 'processing' },
      { value: 'investigating', label: '调查中', color: 'orange' },
      { value: 'closed', label: '已了结', color: 'success' },
      { value: 'filed', label: '已暂存', color: 'warning' }
    ]
  }
}

export default clueService
