/**
 * 信访举报服务
 */

import { get, post, patch, del } from './request'

// 举报类型
export type ReportType = 'letter' | 'network' | 'phone' | 'visit'

// 举报状态
export type ReportStatus = 'pending' | 'accepted' | 'reviewed' | 'transferred' | 'closed' | 'recycled'

// 举报数据接口
export interface Report {
  id: number
  report_no: string          // 举报编号
  report_type: ReportType    // 举报方式
  report_level?: string      // 举报级别
  report_time?: string       // 举报时间
  reporter_name?: string     // 举报人姓名（与后端一致）
  reporter_phone?: string    // 举报人电话
  reporter_id_card?: string  // 举报人身份证号
  is_anonymous: boolean      // 是否匿名
  accused_name: string       // 被举报人姓名（与后端一致）
  accused_unit?: string      // 被举报人单位（与后端一致）
  accused_position?: string  // 被举报人职务（与后端一致）
  title: string              // 举报标题
  content: string            // 举报内容
  attachment?: string        // 附件
  status: ReportStatus       // 状态
  acceptor?: number          // 受理人ID
  acceptor_name?: string     // 受理人姓名
  accept_time?: string       // 受理时间
  handler?: number           // 承办人ID
  handler_name?: string      // 承办人姓名
  handle_time?: string       // 办理时间
  result?: string            // 处理结果
  created_at: string
  updated_at: string
}

// 举报参数
export interface ReportParams {
  report_type: ReportType
  report_level?: string
  reporter_name?: string
  reporter_phone?: string
  reporter_id_card?: string
  is_anonymous: boolean
  accused_name: string
  accused_unit?: string
  accused_position?: string
  title: string
  content: string
  attachment?: File
}

// 举报移送参数
export interface TransferParams {
  report_id: number
  target_unit: string
  target_person?: string
  transfer_reason: string
}

export const reportService = {
  // 获取举报列表
  async getReports(params?: {
    search?: string
    report_type?: ReportType
    status?: ReportStatus
    page?: number
    page_size?: number
  }) {
    return get('/reports/', params)
  },

  // 获取单个举报详情
  async getReport(id: number) {
    return get(`/reports/${id}/`)
  },

  // 新增举报
  async createReport(data: ReportParams) {
    // 转换字段名以匹配后端模型
    return post('/reports/', {
      report_type: data.report_type,
      reporter_name: data.reporter,
      reporter_phone: data.reporter_phone,
      is_anonymous: data.is_anonymous,
      accused_name: data.suspect_name,
      accused_unit: data.suspect_unit,
      accused_position: data.suspect_position,
      title: data.title,
      content: data.content
    })
  },

  // 更新举报
  async updateReport(id: number, data: Partial<ReportParams>) {
    return patch(`/reports/${id}/`, data)
  },

  // 受理举报
  async acceptReport(id: number) {
    return patch(`/reports/${id}/`, { status: 'accepted' })
  },

  // 移送举报
  async transferReport(data: TransferParams) {
    return post('/report-transfers/', {
      report: data.report_id,
      target_unit: data.target_unit,
      target_person: data.target_person,
      transfer_reason: data.transfer_reason
    })
  },

  // 获取移送记录
  async getTransferHistory(reportId: number) {
    return get('/report-transfers/', { report: reportId })
  },

  // 删除举报
  async deleteReport(id: number) {
    return del(`/reports/${id}/`)
  },

  // 统计举报数量
  async getReportStats() {
    const [pending, accepted, closed] = await Promise.all([
      get('/reports/', { status: 'pending', page_size: 1 }),
      get('/reports/', { status: 'accepted', page_size: 1 }),
      get('/reports/', { status: 'closed', page_size: 1 })
    ])
    return {
      pending: pending.count || 0,
      accepted: accepted.count || 0,
      closed: closed.count || 0,
      total: (pending.count || 0) + (accepted.count || 0) + (closed.count || 0)
    }
  },

  // 获取举报方式列表（用于筛选）
  getReportTypeOptions() {
    return [
      { value: 'letter', label: '信函' },
      { value: 'network', label: '网络' },
      { value: 'phone', label: '电话' },
      { value: 'visit', label: '来访' }
    ]
  },

  // 获取状态列表（用于筛选）
  getStatusOptions() {
    return [
      { value: 'pending', label: '待受理', color: 'default' },
      { value: 'accepted', label: '已受理', color: 'processing' },
      { value: 'reviewed', label: '已审阅', color: 'blue' },
      { value: 'transferred', label: '已移送', color: 'warning' },
      { value: 'closed', label: '已办结', color: 'success' },
      { value: 'recycled', label: '回收箱', color: 'error' }
    ]
  }
}

export default reportService
