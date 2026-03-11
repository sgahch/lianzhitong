"""
数据库迁移测试脚本
用于验证数据库模型修改是否正确
"""
import os
import sys
import django

# 设置 Django 环境
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lianzhitong.settings')
django.setup()

from cases.models import Conclusion, Evidence
from reports.models import Report


def test_conclusion_model():
    """测试 Conclusion 模型的文件字段"""
    print("=" * 50)
    print("测试1：Conclusion 模型字段")
    print("=" * 50)
    
    try:
        # 获取模型字段
        fields = [f.name for f in Conclusion._meta.fields]
        
        # 检查新增的文件字段
        required_fields = ['report_file_url', 'report_file_name', 'report_object_name']
        missing_fields = [f for f in required_fields if f not in fields]
        
        if not missing_fields:
            print("✅ Conclusion 模型字段完整")
            print(f"   包含字段: {', '.join(required_fields)}")
            return True
        else:
            print(f"❌ Conclusion 模型缺少字段: {', '.join(missing_fields)}")
            return False
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        return False


def test_evidence_model():
    """测试 Evidence 模型的文件字段"""
    print("\n" + "=" * 50)
    print("测试2：Evidence 模型字段")
    print("=" * 50)
    
    try:
        # 获取模型字段
        fields = [f.name for f in Evidence._meta.fields]
        
        # 检查新增的文件字段
        required_fields = ['file_url', 'file_name', 'object_name']
        missing_fields = [f for f in required_fields if f not in fields]
        
        if not missing_fields:
            print("✅ Evidence 模型字段完整")
            print(f"   包含字段: {', '.join(required_fields)}")
            return True
        else:
            print(f"❌ Evidence 模型缺少字段: {', '.join(missing_fields)}")
            return False
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        return False


def test_report_model():
    """测试 Report 模型的文件字段"""
    print("\n" + "=" * 50)
    print("测试3：Report 模型字段")
    print("=" * 50)
    
    try:
        # 获取模型字段
        fields = [f.name for f in Report._meta.fields]
        
        # 检查新增的文件字段
        required_fields = ['attachment_url', 'attachment_name', 'attachment_object_name']
        missing_fields = [f for f in required_fields if f not in fields]
        
        if not missing_fields:
            print("✅ Report 模型字段完整")
            print(f"   包含字段: {', '.join(required_fields)}")
            return True
        else:
            print(f"❌ Report 模型缺少字段: {', '.join(missing_fields)}")
            return False
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        return False


def test_model_creation():
    """测试模型创建（不实际保存到数据库）"""
    print("\n" + "=" * 50)
    print("测试4：模型实例化测试")
    print("=" * 50)
    
    try:
        # 测试 Conclusion 模型
        conclusion = Conclusion(
            conclusion_no='TEST001',
            conclusion_date='2025-01-11',
            conclusion_type='party_discipline',
            report_file_url='http://example.com/test.pdf',
            report_file_name='test.pdf',
            report_object_name='conclusions/test.pdf'
        )
        print("✅ Conclusion 模型实例化成功")
        
        # 测试 Evidence 模型
        evidence = Evidence(
            evidence_type='document',
            name='测试证据',
            file_url='http://example.com/evidence.pdf',
            file_name='evidence.pdf',
            object_name='evidence/test.pdf'
        )
        print("✅ Evidence 模型实例化成功")
        
        # 测试 Report 模型
        report = Report(
            report_no='TEST001',
            report_type='phone',
            title='测试举报',
            content='测试内容',
            accused_name='张三',
            is_anonymous=False,
            attachment_url='http://example.com/attachment.pdf',
            attachment_name='attachment.pdf',
            attachment_object_name='reports/test.pdf'
        )
        print("✅ Report 模型实例化成功")
        
        return True
    except Exception as e:
        print(f"❌ 模型实例化失败: {e}")
        return False


def run_all_tests():
    """运行所有测试"""
    print("\n" + "🔍 " * 25)
    print("数据库模型测试")
    print("🔍 " * 25 + "\n")
    
    results = []
    
    # 测试1：Conclusion 模型
    results.append(test_conclusion_model())
    
    # 测试2：Evidence 模型
    results.append(test_evidence_model())
    
    # 测试3：Report 模型
    results.append(test_report_model())
    
    # 测试4：模型实例化
    results.append(test_model_creation())
    
    # 测试总结
    print("\n" + "=" * 50)
    print("测试总结")
    print("=" * 50)
    
    passed = sum(results)
    total = len(results)
    
    if passed == total:
        print(f"✅ 所有测试通过 ({passed}/{total})")
        print("\n下一步：")
        print("1. 在服务器上执行数据库迁移")
        print("2. 运行命令：python manage.py makemigrations")
        print("3. 运行命令：python manage.py migrate")
    else:
        print(f"❌ 部分测试失败 ({passed}/{total})")
        print("\n建议：")
        print("1. 检查模型定义是否正确")
        print("2. 确保已导入所有必要的模块")
        print("3. 检查字段名称是否拼写正确")


if __name__ == '__main__':
    run_all_tests()

