// 任务状态枚举
export enum TaskStatus {
  PENDING = 0,      // 待开始
  RUNNING = 1,      // 进行中
  DONE = 2,         // 已完成
  OVERDUE = 3       // 已逾期
}

// 任务状态显示映射
export const TaskStatusMap: Record<TaskStatus, { text: string; color: string }> = {
  [TaskStatus.PENDING]: { text: '待开始', color: 'default' },
  [TaskStatus.RUNNING]: { text: '进行中', color: 'processing' },
  [TaskStatus.DONE]: { text: '已完成', color: 'success' },
  [TaskStatus.OVERDUE]: { text: '已逾期', color: 'error' }
}

// 任务数据结构
export interface Task {
  id: number
  taskName: string      // 任务名称
  owner: string         // 负责人
  status: TaskStatus    // 状态码
  deadline: string      // 截止日期 YYYY-MM-DD
  progress: number      // 进度 0-100
}

// 菜单项类型
export interface MenuItem {
  key: string
  label: string
  icon?: string
  children?: MenuItem[]
}

// 筛选条件
export interface FilterParams {
  searchText: string
  status?: TaskStatus
}
