#!/bin/bash

# MinIO 文件上传功能一键测试脚本
# 用于快速验证所有功能是否正常

echo "=========================================="
echo "MinIO 文件上传功能测试"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数器
PASSED=0
FAILED=0

# 测试1：检查 MinIO 容器
echo "测试1：检查 MinIO 容器状态..."
if docker ps | grep -q minio; then
    echo -e "${GREEN}✅ MinIO 容器正在运行${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ MinIO 容器未运行${NC}"
    echo "   请执行：docker start minio"
    ((FAILED++))
fi
echo ""

# 测试2：检查 MinIO 端口
echo "测试2：检查 MinIO 端口..."
if netstat -tuln | grep -q 9000; then
    echo -e "${GREEN}✅ MinIO API 端口 (9000) 已开放${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ MinIO API 端口 (9000) 未开放${NC}"
    ((FAILED++))
fi

if netstat -tuln | grep -q 9001; then
    echo -e "${GREEN}✅ MinIO 控制台端口 (9001) 已开放${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ MinIO 控制台端口 (9001) 未开放${NC}"
    ((FAILED++))
fi
echo ""

# 测试3：检查 Python 依赖
echo "测试3：检查 Python 依赖..."
cd /root/lianzhitong
source venv/bin/activate

if python3 -c "import minio" 2>/dev/null; then
    echo -e "${GREEN}✅ MinIO SDK 已安装${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ MinIO SDK 未安装${NC}"
    echo "   请执行：pip install minio>=7.2.0"
    ((FAILED++))
fi
echo ""

# 测试4：运行后端 API 测试
echo "测试4：运行后端 API 测试..."
cd /root/lianzhitong/backend

if python3 test_minio_api.py > /tmp/minio_api_test.log 2>&1; then
    echo -e "${GREEN}✅ 后端 API 测试通过${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ 后端 API 测试失败${NC}"
    echo "   查看日志：cat /tmp/minio_api_test.log"
    ((FAILED++))
fi
echo ""

# 测试5：运行数据库模型测试
echo "测试5：运行数据库模型测试..."
if python3 test_database_models.py > /tmp/minio_model_test.log 2>&1; then
    echo -e "${GREEN}✅ 数据库模型测试通过${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ 数据库模型测试失败${NC}"
    echo "   查看日志：cat /tmp/minio_model_test.log"
    ((FAILED++))
fi
echo ""

# 测试6：检查数据库迁移
echo "测试6：检查数据库迁移..."
MIGRATIONS_NEEDED=$(python3 manage.py showmigrations --plan | grep -c "\[ \]")

if [ "$MIGRATIONS_NEEDED" -eq 0 ]; then
    echo -e "${GREEN}✅ 所有数据库迁移已应用${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  有 $MIGRATIONS_NEEDED 个迁移待应用${NC}"
    echo "   请执行："
    echo "   python3 manage.py makemigrations"
    echo "   python3 manage.py migrate"
fi
echo ""

# 测试总结
echo "=========================================="
echo "测试总结"
echo "=========================================="
echo -e "通过: ${GREEN}$PASSED${NC}"
echo -e "失败: ${RED}$FAILED${NC}"
echo ""

if [ "$FAILED" -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！${NC}"
    echo ""
    echo "下一步："
    echo "1. 访问 MinIO 控制台：http://192.168.182.128:9001"
    echo "2. 测试前端组件：访问测试页面"
    echo "3. 测试完整流程：上传文件到结案报告"
    exit 0
else
    echo -e "${RED}❌ 部分测试失败，请检查上述错误信息${NC}"
    echo ""
    echo "故障排查："
    echo "1. 检查 MinIO 容器：docker ps | grep minio"
    echo "2. 查看 MinIO 日志：docker logs minio"
    echo "3. 检查网络连接：curl http://192.168.182.128:9000"
    echo "4. 查看测试日志：cat /tmp/minio_api_test.log"
    exit 1
fi

