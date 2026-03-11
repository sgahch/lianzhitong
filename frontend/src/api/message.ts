/**
 * 消息通知服务
 */

import { get, post, patch, del } from './request'

// 消息类型
export type MessageType = 'system' | 'task' | 'report' | 'case' | 'clue' | 'supervision'

// 消息数据接口
export interface Message {
  id: number
  msg_type: MessageType     // 消息类型
  title: string             // 消息标题
  content: string           // 消息内容
  sender?: number           // 发送人ID
  receiver: number          // 接收人ID
  is_read: boolean          // 是否已读
  related_object_type?: string  // 关联对象类型
  related_object_id?: number    // 关联对象ID
  created_at: string
  updated_at: string
}

// 消息参数
export interface MessageParams {
  msg_type: MessageType
  title: string
  content: string
  receiver: number
  related_object_type?: string
  related_object_id?: number
}

// 消息模板
export interface MessageTemplate {
  id: number
  name: string
  msg_type: MessageType
  title_template: string
  content_template: string
  created_at: string
  updated_at: string
}

export const messageService = {
  // ========== 消息 ==========

  // 获取消息列表
  async getMessages(params?: {
    is_read?: boolean
    msg_type?: MessageType
    page?: number
    page_size?: number
  }) {
    return get('/messages/', params)
  },

  // 获取单个消息详情
  async getMessage(id: number) {
    return get(`/messages/${id}/`)
  },

  // 获取未读消息数量
  async getUnreadCount(): Promise<number> {
    const result = await get('/messages/unread_count/')
    return result.unread_count || 0
  },

  // 标记消息已读
  async markAsRead(id: number) {
    return patch(`/messages/${id}/mark_read/`, {})
  },

  // 批量标记消息已读
  async markAllAsRead(ids: number[]) {
    return Promise.all(ids.map(id => markAsRead(id)))
  },

  // 删除消息
  async deleteMessage(id: number) {
    return del(`/messages/${id}/`)
  },

  // 发送消息
  async sendMessage(data: MessageParams) {
    return post('/messages/', data)
  },

  // 发送系统通知
  async sendSystemNotice(title: string, content: string, userIds?: number[]) {
    // 如果没有指定用户，发送给所有用户
    if (!userIds) {
      // 获取所有用户ID
      const users = await get('/users/', { page_size: 1000 })
      userIds = (users.results || []).map((u: any) => u.id)
    }
    return Promise.all(userIds.map((userId: number) =>
      sendMessage({
        msg_type: 'system',
        title,
        content,
        receiver: userId
      })
    ))
  },

  // ========== 消息模板 ==========

  // 获取模板列表
  async getTemplates(params?: {
    msg_type?: MessageType
    page?: number
    page_size?: number
  }) {
    return get('/message-templates/', params)
  },

  // 获取单个模板
  async getTemplate(id: number) {
    return get(`/message-templates/${id}/`)
  },

  // 创建模板
  async createTemplate(data: {
    name: string
    msg_type: MessageType
    title_template: string
    content_template: string
  }) {
    return post('/message-templates/', data)
  },

  // 更新模板
  async updateTemplate(id: number, data: Partial<{
    name: string
    title_template: string
    content_template: string
  }>) {
    return patch(`/message-templates/${id}/`, data)
  },

  // 删除模板
  async deleteTemplate(id: number) {
    return del(`/message-templates/${id}/`)
  },

  // 使用模板发送消息
  async sendFromTemplate(templateId: number, receiverId: number, variables: Record<string, string>) {
    const template = await getTemplate(templateId)
    let title = template.title_template
    let content = template.content_template

    // 替换变量
    for (const [key, value] of Object.entries(variables)) {
      title = title.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
      content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
    }

    return sendMessage({
      msg_type: template.msg_type,
      title,
      content,
      receiver: receiverId
    })
  },

  // ========== 选项 ==========

  getMessageTypeOptions() {
    return [
      { value: 'system', label: '系统通知', color: 'blue' },
      { value: 'task', label: '任务通知', color: 'green' },
      { value: 'report', label: '报告通知', color: 'orange' },
      { value: 'case', label: '案件通知', color: 'red' },
      { value: 'clue', label: '线索通知', color: 'purple' },
      { value: 'supervision', label: '监督通知', color: 'cyan' }
    ]
  }
}

export default messageService
