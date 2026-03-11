/**
 * 统一的 API 请求模块
 * 包含 JWT 认证、自动刷新 token、错误处理等功能
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { message } from 'ant-design-vue'
import router from '@/router'

// API 基础地址 - 指向 Django 后端
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api'

// Token 存储 key
const TOKEN_KEY = 'lzt_access_token'
const REFRESH_TOKEN_KEY = 'lzt_refresh_token'
const USER_INFO_KEY = 'lzt_user_info'

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 自动添加 Token
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: Error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理 Token 刷新、错误
request.interceptors.response.use(
  (response: AxiosResponse) => {
    // 直接返回响应体（DRF 返回的就是数据本身）
    return response.data
  },
  async (error: any) => {
    const { response } = error

    if (response) {
      switch (response.status) {
        case 401:
          // Token 过期，尝试刷新
          const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
          if (refreshToken) {
            try {
              const newToken = await refreshAccessToken(refreshToken)
              if (newToken) {
                // 刷新成功，重新发起请求
                localStorage.setItem(TOKEN_KEY, newToken)
                error.config.headers.Authorization = `Bearer ${newToken}`
                return request(error.config)
              }
            } catch (refreshError) {
              // 刷新失败，跳转登录
              logout()
            }
          } else {
            logout()
          }
          break
        case 403:
          message.error('没有权限访问该资源')
          break
        case 404:
          message.error('请求的资源不存在')
          break
        case 500:
          message.error('服务器错误，请稍后重试')
          break
        default:
          message.error(response.data?.detail || '请求失败')
      }
    } else {
      message.error('网络连接异常，请检查网络')
    }

    return Promise.reject(error)
  }
)

// 刷新 Access Token
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
      refresh: refreshToken
    })
    return response.data.access
  } catch (error) {
    return null
  }
}

// 登出
function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_INFO_KEY)
  router.push('/login')
  message.info('登录已过期，请重新登录')
}

// ========== Token 管理 ==========

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function setUserInfo(userInfo: any): void {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
}

export function getUserInfo(): any {
  const info = localStorage.getItem(USER_INFO_KEY)
  return info ? JSON.parse(info) : null
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_INFO_KEY)
}

// ========== 认证 API ==========

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  access: string
  refresh: string
  user: any
}

export async function login(data: LoginParams): Promise<LoginResult> {
  // 先获取 token
  const tokenResponse = await axios.post(`${API_BASE_URL}/token/`, data)

  const { access, refresh } = tokenResponse.data

  // 设置 token
  setToken(access)
  setRefreshToken(refresh)

  // 获取用户信息
  const userResponse = await request.get('/users/', {
    params: { username: data.username }
  })

  const users = userResponse.results || []
  const user = users.find((u: any) => u.username === data.username) || {
    id: 1,
    username: data.username,
    real_name: '张科长',
    department: 'discipline',
    role: 'investigator'
  }

  setUserInfo(user)

  return { access, refresh, user }
}

export async function logoutAPI(): Promise<void> {
  try {
    await request.post('/logout/')
  } finally {
    clearAuth()
  }
}

export async function getCurrentUser(): Promise<any> {
  const userInfo = getUserInfo()
  if (userInfo) {
    return userInfo
  }

  // 如果没有缓存，从 API 获取
  const response = await request.get('/users/me/').catch(() => null)
  if (response) {
    setUserInfo(response)
    return response
  }

  return null
}

// ========== 通用请求方法 ==========

export function get<T = any>(url: string, params?: object): Promise<T> {
  return request.get(url, { params })
}

export function post<T = any>(url: string, data?: object): Promise<T> {
  return request.post(url, data)
}

export function put<T = any>(url: string, data?: object): Promise<T> {
  return request.put(url, data)
}

export function patch<T = any>(url: string, data?: object): Promise<T> {
  return request.patch(url, data)
}

export function del<T = any>(url: string, params?: object): Promise<T> {
  return request.delete(url, { params })
}

export default request
