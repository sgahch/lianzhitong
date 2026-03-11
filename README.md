# 廉智通

廉智通是一个综合性的案件管理系统，采用前后端分离架构。

## 项目结构

```
廉智通/
├── README.md
├── .env                    # 项目环境变量
├── .gitignore
├── frontend/               # 前端项目 (Vue.js + TypeScript)
│   ├── package.json        # 前端项目依赖
│   ├── src/                # 前端源代码
│   │   ├── api/            # API 接口定义
│   │   ├── components/     # Vue 组件
│   │   ├── views/          # 页面视图
│   │   ├── router/         # 路由配置
│   │   └── types/          # TypeScript 类型定义
│   ├── public/             # 静态资源
│   └── vite.config.ts      # 构建配置
└── backend/                # 后端项目 (Django)
    ├── manage.py           # Django 管理脚本
    ├── requirements.txt    # 后端项目依赖
    ├── lianzhitong/        # Django 项目配置
    ├── core/               # 核心应用
    ├── cases/              # 案件管理应用
    ├── users/              # 用户管理应用
    ├── reports/            # 报告管理应用
    └── notifications/      # 通知管理应用
```

## 开发环境设置

### 后端 (Django)

1. 进入后端目录：
```bash
cd backend
```

2. 创建虚拟环境并激活：
```bash
python -m venv venv
# Windows
venv\Scripts\activate
```

3. 安装依赖：
```bash
pip install -r requirements.txt
```

4. 数据库迁移：
```bash
python manage.py migrate
```

5. 启动后端服务：
```bash
python manage.py runserver
```

### 前端 (Vue.js)

1. 进入前端目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 启动前端开发服务器：
```bash
npm run dev
```

## 部署

请参考 `backend/DEPLOYMENT_GUIDE.md` 文件获取部署指南。

## 文档

- 详细功能规划: `backend/docs/功能规划书.md`
- 开发日志: `backend/docs/DEVELOPMENT_LOG.md`
- UI 详细设计: `backend/docs/UI-DETAIL.md`