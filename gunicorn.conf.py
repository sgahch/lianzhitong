# Gunicorn 配置文件
# 适用于廉智通项目生产环境

# 服务器配置
bind = "127.0.0.1:8001"
backlog = 2048
daemon = False

# 工作进程配置
workers = 2  # 根据服务器 CPU 核心数调整
worker_class = "sync"
worker_connections = 1000
timeout = 120
keepalive = 5

# 重启配置
max_requests = 1000
max_requests_jitter = 100

# 日志配置
accesslog = "/var/log/lianzhitong/gunicorn_access.log"
errorlog = "/var/log/lianzhitong/gunicorn_error.log"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# 进程命名
proc_name = 'lianzhitong'