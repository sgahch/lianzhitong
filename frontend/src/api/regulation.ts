/**
 * 法规库服务
 */

import { get, post, patch, del } from './request'

// 法规分类
export type RegulationCategory = 'law' | 'regulation' | 'rule' | 'policy' | 'interpretation'

// 法规层级
export type RegulationLevel = 'national' | 'provincial' | 'city' | 'district'

// 法规数据接口
export interface Regulation {
  id: number
  title: string             // 标题
  category: RegulationCategory // 分类
  category_name?: string    // 分类名称
  document_no?: string      // 文号
  issuing_authority?: string // 发文机关/发布部门
  level?: RegulationLevel   // 效力层级
  level_name?: string       // 层级名称
  content: string           // 内容
  attachment?: string       // 附件路径
  publish_date?: string     // 发布日期
  effective_date?: string   // 生效日期
  expiry_date?: string      // 失效日期
  is_valid: boolean         // 是否有效
  view_count: number        // 浏览次数
  created_at: string
  updated_at: string
}

// 法规参数
export interface RegulationParams {
  title: string
  category: RegulationCategory
  document_no?: string
  issuing_authority?: string
  level?: RegulationLevel
  content: string
  attachment?: File
  publish_date?: string
  effective_date?: string
  expiry_date?: string
  is_valid?: boolean
}

export const regulationService = {
  // 获取法规列表
  async getRegulations(params?: {
    search?: string
    category?: RegulationCategory
    is_valid?: boolean
    page?: number
    page_size?: number
  }) {
    return get('/regulations/', params)
  },

  // 获取单个法规详情
  async getRegulation(id: number) {
    const result = await get(`/regulations/${id}/`)
    // 增加浏览次数
    if (result.id) {
      patch(`/regulations/${id}/`, { view_count: (result.view_count || 0) + 1 })
    }
    return result
  },

  // 新增法规
  async createRegulation(data: RegulationParams) {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('category', data.category)
    formData.append('content', data.content)
    if (data.document_no) formData.append('document_no', data.document_no)
    if (data.issuing_authority) formData.append('issuing_authority', data.issuing_authority)
    if (data.level) formData.append('level', data.level)
    if (data.publish_date) formData.append('publish_date', data.publish_date)
    if (data.effective_date) formData.append('effective_date', data.effective_date)
    if (data.expiry_date) formData.append('expiry_date', data.expiry_date)
    if (data.attachment) formData.append('attachment', data.attachment)
    return post('/regulations/', formData)
  },

  // 更新法规
  async updateRegulation(id: number, data: Partial<RegulationParams>) {
    return patch(`/regulations/${id}/`, data)
  },

  // 删除法规
  async deleteRegulation(id: number) {
    return del(`/regulations/${id}/`)
  },

  // 失效法规
  async invalidateRegulation(id: number) {
    return patch(`/regulations/${id}/`, { is_valid: false })
  },

  // 获取热门法规
  async getHotRegulations(limit: number = 10) {
    return get('/regulations/', {
      is_valid: true,
      page_size: limit,
      ordering: '-view_count'
    })
  },

  // 获取最新法规
  async getLatestRegulations(limit: number = 10) {
    return get('/regulations/', {
      is_valid: true,
      page_size: limit,
      ordering: '-created_at'
    })
  },

  // 统计数量
  async getRegulationStats() {
    const total = await get('/regulations/', { page_size: 1 })
    const valid = await get('/regulations/', { is_valid: true, page_size: 1 })
    return {
      total: total.count || 0,
      valid: valid.count || 0
    }
  },

  // 获取分类选项
  getCategoryOptions() {
    return [
      { value: 'law', label: '法律' },
      { value: 'regulation', label: '法规' },
      { value: 'rule', label: '规章' },
      { value: 'policy', label: '政策' },
      { value: 'interpretation', label: '解释' }
    ]
  },

  // 获取层级选项
  getLevelOptions() {
    return [
      { value: 'national', label: '国家级' },
      { value: 'provincial', label: '省级' },
      { value: 'city', label: '市级' },
      { value: 'district', label: '区县级' }
    ]
  }
}

export default regulationService
