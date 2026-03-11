/**
 * Case Management Service
 */

import { get, post, patch, del } from './request'

// 案件状态
export type CaseStatus = 'filed' | 'investigating' | 'reviewing' | 'closed' | 'archived'

// 案件类型
export type CaseType = 'discipline' | 'supervision' | 'case'

// 案件等级
export type CaseLevel = 'major' | 'serious' | 'general'

// 协助党委任务状态
export type AssistPartyTaskStatus = 0 | 1 | 2 | 3

// 协助党委任务接口
export interface AssistPartyTask {
  id: number
  task_no: string
  task_name: string
  owner: string
  deadline?: string
  status: AssistPartyTaskStatus
  status_text?: string
  progress: number
  description?: string
  created_by?: number
  created_at: string
  updated_at: string
}

// 案件数据接口
export interface Case {
  id: number
  case_no: string           // 案件编号
  case_type: CaseType       // 案件类型
  title: string             // 案件标题
  suspect_name: string      // 被调查人姓名
  suspect_unit?: string     // 被调查人单位
  suspect_position?: string // 被调查人职务
  case_level: CaseLevel     // 案件等级
  status: CaseStatus        // 案件状态
  filing_date: string       // 立案日期
  closed_date?: string      // 结案日期
  case_source: string       // 案件来源
  main_content: string      // 主要内容
  handling_opinion?: string // 处理意见
  result?: string           // 处理结果
  handler?: number          // 承办人
  leader?: number           // 负责人
  created_at: string
  updated_at: string
}

// 案件参数
export interface CaseParams {
  case_type: CaseType
  title: string
  suspect_name: string
  suspect_unit?: string
  suspect_position?: string
  case_level: CaseLevel
  case_source: string
  main_content: string
  handling_opinion?: string
}

// 案件进度
export interface CaseProgress {
  id: number
  case: number
  progress_date: string
  progress_type: string
  progress_content: string
  handler?: number
  remark?: string
  created_at: string
}

// 证据
export interface Evidence {
  id: number
  case: number
  evidence_type: string
  name: string            // 证据名称
  description?: string    // 证据描述
  file?: string           // 文件路径 (URL)
  page_count: number
  submitter?: string      // 提交人
  created_at: string      // 创建时间
  // 前端兼容字段
  evidence_name?: string
  file_path?: string
  uploaded_by?: string
  upload_date?: string
  evidence_desc?: string
}

// 审理状态
export type TrialStatus = 'pending' | 'processing' | 'completed'

// 审理记录
export interface Trial {
  id: number
  accept_no: string           // 受理编号
  case: number                // 关联案件ID
  case_name: string           // 案件名称
  case_no: string             // 案件编号
  suspect_name: string        // 被调查人
  department: string          // 移送部门
  accept_date: string         // 受理日期
  deadline: number            // 审理期限(天)
  judge: string               // 主办审理员
  assistants: string          // 协办人员
  status: TrialStatus         // 审理状态
  trial_opinion?: string      // 审理意见
  result?: string             // 审理结果
  days_left?: number          // 剩余天数
  created_at: string
  updated_at: string
}

// 结案状态
export type ExecutionStatus = 'pending' | 'completed'

// 结案类型
export type ConclusionType = 'party_discipline' | 'administrative' | 'judicial' | 'criticism' | 'concluded'

// 结案记录
export interface Conclusion {
  id: number
  conclusion_no: string           // 结案编号
  case: number                    // 关联案件ID
  case_name: string               // 案件名称
  suspect_name: string            // 被处分人
  conclusion_date: string         // 结案日期
  conclusion_type: ConclusionType // 结案方式
  decision?: string               // 处分决定
  execution_status: ExecutionStatus // 执行状态
  execution_text?: string         // 执行状态文本
  execute_date?: string           // 执行日期
  summary?: string                // 案件总结
  archived: boolean               // 是否归档
  archived_date?: string          // 归档日期
  created_at: string
  updated_at: string
}

export const caseService = {
  // ========== 案件 ==========

  // 获取案件列表
  async getCases(params?: {
    search?: string
    case_type?: CaseType
    status?: CaseStatus
    page?: number
    page_size?: number
  }) {
    return get('/cases/', params)
  },

  // 获取单个案件详情
  async getCase(id: number) {
    return get(`/cases/${id}/`)
  },

  // 新增案件
  async createCase(data: CaseParams) {
    // 转换字段名以匹配后端模型
    return post('/cases/', {
      case_name: data.title,
      case_type: data.case_type,
      suspect_name: data.suspect_name,
      suspect_unit: data.suspect_unit,
      suspect_position: data.suspect_position,
      case_level: data.case_level,
      report_source: data.case_source,
      summary: data.main_content,
      illegal_content: data.handling_opinion
    })
  },

  // 更新案件
  async updateCase(id: number, data: Partial<CaseParams>) {
    // 转换字段名以匹配后端模型
    return patch(`/cases/${id}/`, {
      case_name: data.title,
      case_type: data.case_type,
      suspect_name: data.suspect_name,
      suspect_unit: data.suspect_unit,
      suspect_position: data.suspect_position,
      case_level: data.case_level,
      report_source: data.case_source,
      summary: data.main_content,
      illegal_content: data.handling_opinion
    })
  },

  // 案件状态流转
  async changeStatus(id: number, status: CaseStatus) {
    return patch(`/cases/${id}/`, { status })
  },

  // 删除案件
  async deleteCase(id: number) {
    return del(`/cases/${id}/`)
  },

  // ========== 案件进度 ==========

  // 获取案件进度列表
  async getCaseProgress(caseId: number) {
    return get('/case-progress/', { case: caseId })
  },

  // 添加案件进度
  async addCaseProgress(data: {
    case: number
    progress_type: string
    progress_content: string
    remark?: string
  }) {
    return post('/case-progress/', data)
  },

  // ========== 证据 ==========

  // 获取证据列表
  async getEvidences(caseId: number) {
    return get('/evidences/', { case: caseId })
  },

  // 添加证据
  async addEvidence(data: {
    case: number
    name: string
    evidence_type: string
    description?: string
    file?: File
  }) {
    const formData = new FormData()
    formData.append('case', String(data.case))
    formData.append('name', data.name)
    formData.append('evidence_type', data.evidence_type)
    if (data.description) formData.append('description', data.description)
    if (data.file) formData.append('file', data.file)
    return post('/evidences/', formData)
  },

  // 删除证据
  async deleteEvidence(id: number) {
    return del(`/evidences/${id}/`)
  },

  // ========== 审理 ==========

  // 获取审理列表
  async getTrials(params?: {
    search?: string
    status?: TrialStatus
    page?: number
    page_size?: number
  }) {
    return get('/trials/', params)
  },

  // 获取单个审理详情
  async getTrial(id: number) {
    return get(`/trials/${id}/`)
  },

  // 新增审理
  async createTrial(data: {
    case: number
    department?: string
    accept_date: string
    deadline?: number
    judge: string
    assistants?: string
    trial_opinion?: string
  }) {
    return post('/trials/', data)
  },

  // 更新审理
  async updateTrial(id: number, data: Partial<{
    department: string
    accept_date: string
    deadline: number
    judge: string
    assistants: string
    status: TrialStatus
    trial_opinion: string
    result: string
  }>) {
    return patch(`/trials/${id}/`, data)
  },

  // 审理状态流转
  async changeTrialStatus(id: number, status: TrialStatus) {
    return patch(`/trials/${id}/`, { status })
  },

  // 删除审理
  async deleteTrial(id: number) {
    return del(`/trials/${id}/`)
  },

  // ========== 结案 ==========

  // 获取结案列表
  async getConclusions(params?: {
    search?: string
    execution_status?: ExecutionStatus
    archived?: string
    page?: number
    page_size?: number
  }) {
    return get('/conclusions/', params)
  },

  // 获取单个结案详情
  async getConclusion(id: number) {
    return get(`/conclusions/${id}/`)
  },

  // 新增结案
  async createConclusion(data: {
    case: number
    conclusion_date: string
    conclusion_type: ConclusionType
    decision?: string
    execution_status?: ExecutionStatus
    execute_date?: string
    summary?: string
  }) {
    return post('/conclusions/', data)
  },

  // 更新结案
  async updateConclusion(id: number, data: Partial<{
    conclusion_date: string
    conclusion_type: ConclusionType
    decision: string
    execution_status: ExecutionStatus
    execute_date: string
    summary: string
    archived: boolean
  }>) {
    return patch(`/conclusions/${id}/`, data)
  },

  // 删除结案
  async deleteConclusion(id: number) {
    return del(`/conclusions/${id}/`)
  },

  // ========== 协助党委任务 ==========

  // 获取协助党委任务列表
  async getAssistPartyTasks(params?: {
    search?: string
    status?: AssistPartyTaskStatus
    page?: number
    page_size?: number
  }) {
    return get('/assist-party-tasks/', params)
  },

  // 获取单个协助党委任务详情
  async getAssistPartyTask(id: number) {
    return get(`/assist-party-tasks/${id}/`)
  },

  // 创建协助党委任务
  async createAssistPartyTask(data: {
    task_name: string
    owner: string
    deadline?: string
    status?: AssistPartyTaskStatus
    progress?: number
    description?: string
  }) {
    return post('/assist-party-tasks/', data)
  },

  // 更新协助党委任务
  async updateAssistPartyTask(id: number, data: Partial<{
    task_name: string
    owner: string
    deadline: string
    status: AssistPartyTaskStatus
    progress: number
    description: string
  }>) {
    return patch(`/assist-party-tasks/${id}/`, data)
  },

  // 删除协助党委任务
  async deleteAssistPartyTask(id: number) {
    return del(`/assist-party-tasks/${id}/`)
  },

  // ========== 统计 ==========

  // 案件统计
  async getCaseStats() {
    const [investigating, reviewing, closed] = await Promise.all([
      get('/cases/', { status: 'investigating', page_size: 1 }),
      get('/cases/', { status: 'reviewing', page_size: 1 }),
      get('/cases/', { status: 'closed', page_size: 1 })
    ])
    return {
      investigating: investigating.count || 0,
      reviewing: reviewing.count || 0,
      closed: closed.count || 0,
      total: (investigating.count || 0) + (reviewing.count || 0) + (closed.count || 0)
    }
  },

  // ========== 选项 ==========

  getCaseTypeOptions() {
    return [
      { value: 'discipline', label: '纪律审查' },
      { value: 'supervision', label: '监督执纪' },
      { value: 'case', label: '简易案件' }
    ]
  },

  getCaseLevelOptions() {
    return [
      { value: 'major', label: '大案', color: 'red' },
      { value: 'serious', label: '要案', color: 'orange' },
      { value: 'general', label: '一般案件', color: 'blue' }
    ]
  },

  getStatusOptions() {
    return [
      { value: 'filed', label: '已立案', color: 'processing' },
      { value: 'investigating', label: '调查中', color: 'blue' },
      { value: 'reviewing', label: '审理中', color: 'purple' },
      { value: 'closed', label: '已结案', color: 'success' },
      { value: 'archived', label: '已归档', color: 'default' }
    ]
  },

  getProgressTypeOptions() {
    return [
      { value: 'filing', label: '立案' },
      { value: 'investigation', label: '调查' },
      { value: 'interview', label: '谈话' },
      { value: 'evidence', label: '取证' },
      { value: 'review', label: '审理' },
      { value: 'decision', label: '决定' },
      { value: 'close', label: '结案' }
    ]
  },

  getEvidenceTypeOptions() {
    return [
      { value: 'document', label: '书证' },
      { value: 'material', label: '物证' },
      { value: 'audio', label: '视听资料' },
      { value: 'electronic', label: '电子数据' },
      { value: 'testimony', label: '证人证言' },
      { value: 'statement', label: '被调查人陈述' },
      { value: 'expert', label: '鉴定意见' },
      { value: 'inspection', label: '勘验检查笔录' }
    ]
  },

  // 审理状态选项
  getTrialStatusOptions() {
    return [
      { value: 'pending', label: '待审理', color: 'warning' },
      { value: 'processing', label: '审理中', color: 'processing' },
      { value: 'completed', label: '已审结', color: 'success' }
    ]
  },

  // 结案类型选项
  getConclusionTypeOptions() {
    return [
      { value: 'party_discipline', label: '党纪处分' },
      { value: 'administrative', label: '政务处分' },
      { value: 'judicial', label: '移送司法' },
      { value: 'criticism', label: '批评教育' },
      { value: 'concluded', label: '予以了结' }
    ]
  },

  // 执行状态选项
  getExecutionStatusOptions() {
    return [
      { value: 'pending', label: '执行中', color: 'processing' },
      { value: 'completed', label: '已执行', color: 'success' }
    ]
  }
}

export default caseService
