/**
 * 用户认证服务
 */

import { login, logoutAPI, getCurrentUser, getUserInfo, setUserInfo, clearAuth, LoginParams, get } from './request'

export interface User {
  id: number
  username: string
  real_name?: string
  phone?: string
  department?: string
  role?: string
  title?: string
  email?: string
}

// 用户选项接口
export interface UserOption {
  label: string
  value: number
}

export const userService = {
  // 登录
  async login(params: LoginParams) {
    const result = await login(params)
    return result
  },

  // 登出
  async logout() {
    await logoutAPI()
  },

  // 获取当前用户
  async getCurrentUser(): Promise<User | null> {
    return await getCurrentUser()
  },

  // 获取缓存的用户信息
  getCachedUser(): User | null {
    return getUserInfo()
  },

  // 更新用户信息
  updateUserInfo(userInfo: User) {
    setUserInfo(userInfo)
  },

  // 清除认证信息
  clearAuth() {
    clearAuth()
  },

  // 检查是否已登录
  isLoggedIn(): boolean {
    return !!getUserInfo()
  },

  // 获取用户列表
  async getUsers(params?: {
    department?: string
    role?: string
    is_active?: boolean
    page?: number
    page_size?: number
  }): Promise<{ results: User[], count: number }> {
    return get('/users/', params)
  },

  // 获取用户选项列表（用于下拉选择）
  async getUserOptions(): Promise<UserOption[]> {
    try {
      const result = await this.getUsers({ is_active: true, page_size: 100 })
      return (result.results || []).map((user: User) => ({
        label: user.real_name || user.username,
        value: user.id
      }))
    } catch {
      // 如果获取失败，返回默认选项
      return [
        { label: '张书记', value: 1 },
        { label: '李主任', value: 2 },
        { label: '王科长', value: 3 }
      ]
    }
  }
}

export default userService
