/**
 * 纪律教育服务
 */

import { get, post, patch, del } from './request'

// 教育资料分类
export type EducationCategory = 'policy' | 'case' | 'notice' | 'study'

// 教育资料数据接口
export interface EducationMaterial {
  id: number
  title: string             // 资料标题
  category: EducationCategory // 资料类型
  category_name?: string    // 类型名称
  content: string           // 内容
  attachment?: string       // 附件路径
  source?: string           // 来源
  view_count: number        // 浏览次数
  is_published: boolean     // 是否发布
  published_at?: string     // 发布时间
  created_at: string
  updated_at: string
}

// 教育资料参数
export interface EducationMaterialParams {
  title: string
  category: EducationCategory
  content: string
  attachment?: File
  source?: string
  is_published?: boolean
  published_at?: string
}

// 教育活动状态
export type EducationActivityStatus = 'upcoming' | 'ongoing' | 'completed'

// 教育活动数据接口
export interface EducationActivity {
  id: number
  title: string             // 活动标题
  content: string           // 活动内容
  activity_type?: string    // 活动类型
  start_time?: string       // 开始时间
  end_time?: string         // 结束时间
  location?: string         // 活动地点
  participants?: string     // 参与人员
  status: EducationActivityStatus // 状态
  status_name?: string      // 状态名称
  created_at: string
  updated_at: string
}

// 教育活动参数
export interface EducationActivityParams {
  title: string
  content: string
  activity_type?: string
  start_time?: string
  end_time?: string
  location?: string
  participants?: string
  status?: EducationActivityStatus
}

export const educationService = {
  // ========== 教育资料 ==========

  // 获取教育资料列表
  async getMaterials(params?: {
    search?: string
    category?: EducationCategory
    page?: number
    page_size?: number
  }) {
    return get('/education-materials/', params)
  },

  // 获取单个教育资料详情
  async getMaterial(id: number) {
    return get(`/education-materials/${id}/`)
  },

  // 新增教育资料
  async createMaterial(data: EducationMaterialParams) {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('category', data.category)
    formData.append('content', data.content)
    if (data.source) formData.append('source', data.source)
    if (data.attachment) formData.append('attachment', data.attachment)
    if (data.is_published !== undefined) formData.append('is_published', String(data.is_published))
    if (data.published_at) formData.append('published_at', data.published_at)
    return post('/education-materials/', formData)
  },

  // 更新教育资料
  async updateMaterial(id: number, data: Partial<EducationMaterialParams>) {
    return patch(`/education-materials/${id}/`, data)
  },

  // 删除教育资料
  async deleteMaterial(id: number) {
    return del(`/education-materials/${id}/`)
  },

  // ========== 教育活动 ==========

  // 获取教育活动列表
  async getActivities(params?: {
    search?: string
    status?: EducationActivityStatus
    page?: number
    page_size?: number
  }) {
    return get('/education-activities/', params)
  },

  // 获取单个教育活动详情
  async getActivity(id: number) {
    return get(`/education-activities/${id}/`)
  },

  // 新增教育活动
  async createActivity(data: EducationActivityParams) {
    return post('/education-activities/', data)
  },

  // 更新教育活动
  async updateActivity(id: number, data: Partial<EducationActivityParams>) {
    return patch(`/education-activities/${id}/`, data)
  },

  // 删除教育活动
  async deleteActivity(id: number) {
    return del(`/education-activities/${id}/`)
  },

  // ========== 选项 ==========

  // 获取资料分类选项
  getCategoryOptions() {
    return [
      { value: 'policy', label: '政策法规' },
      { value: 'case', label: '典型案例' },
      { value: 'notice', label: '通知公告' },
      { value: 'study', label: '学习材料' }
    ]
  },

  // 获取活动状态选项
  getStatusOptions() {
    return [
      { value: 'upcoming', label: '未开始', color: 'default' },
      { value: 'ongoing', label: '进行中', color: 'processing' },
      { value: 'completed', label: '已结束', color: 'success' }
    ]
  }
}

export default educationService
