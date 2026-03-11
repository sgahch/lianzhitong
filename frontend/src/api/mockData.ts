import type { Task } from '@/types'

// Mock 数据
export const mockTasks: Task[] = [
  {
    id: 1,
    taskName: '落实中央八项规定精神专项检查',
    owner: '张书记',
    status: 1,
    deadline: '2025-02-15',
    progress: 65
  },
  {
    id: 2,
    taskName: '廉政教育进社区活动',
    owner: '李主任',
    status: 2,
    deadline: '2025-01-20',
    progress: 100
  },
  {
    id: 3,
    taskName: '年度党风廉政建设工作总结',
    owner: '王科长',
    status: 3,
    deadline: '2025-01-10',
    progress: 80
  },
  {
    id: 4,
    taskName: '重点岗位风险防控排查',
    owner: '赵干部',
    status: 1,
    deadline: '2025-02-28',
    progress: 45
  },
  {
    id: 5,
    taskName: '纪检监察干部培训计划',
    owner: '陈处长',
    status: 0,
    deadline: '2025-03-01',
    progress: 0
  },
  {
    id: 6,
    taskName: '巡察整改情况跟踪督办',
    owner: '刘局长',
    status: 1,
    deadline: '2025-02-20',
    progress: 72
  },
  {
    id: 7,
    taskName: '党风廉政意见回复工作',
    owner: '孙书记',
    status: 2,
    deadline: '2025-01-25',
    progress: 100
  },
  {
    id: 8,
    taskName: '节日期间作风建设监督检查',
    owner: '周主任',
    status: 1,
    deadline: '2025-02-10',
    progress: 55
  }
]

// 模拟API请求
export const fetchTasks = (): Promise<Task[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockTasks])
    }, 300)
  })
}
