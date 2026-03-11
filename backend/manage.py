#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lianzhitong.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    
    # 如果执行 runserver 命令但没有指定端口，则使用 8001 端口
    if len(sys.argv) >= 2 and sys.argv[1] == 'runserver':
        # 检查是否已经指定了地址:端口参数
        addrport_specified = False
        for arg in sys.argv[2:]:
            if ':' in arg or arg.isdigit():
                addrport_specified = True
                break
        
        if not addrport_specified:
            # 默认使用 127.0.0.1:8001
            sys.argv.insert(2, '127.0.0.1:8001')
    
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
