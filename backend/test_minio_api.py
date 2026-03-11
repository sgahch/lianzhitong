"""
MinIO 文件上传 API 测试脚本
用于测试文件上传、下载、删除功能
"""
import os
import sys
import django

# 设置 Django 环境
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lianzhitong.settings')
django.setup()

from core.minio_client import minio_client
from io import BytesIO


def test_minio_connection():
    """测试 MinIO 连接"""
    print("=" * 50)
    print("测试1：MinIO 连接")
    print("=" * 50)
    
    try:
        # 检查存储桶是否存在
        bucket_exists = minio_client.client.bucket_exists(minio_client.bucket_name)
        print(f"✅ MinIO 连接成功")
        print(f"   存储桶名称: {minio_client.bucket_name}")
        print(f"   存储桶存在: {bucket_exists}")
        return True
    except Exception as e:
        print(f"❌ MinIO 连接失败: {e}")
        return False


def test_file_upload():
    """测试文件上传"""
    print("\n" + "=" * 50)
    print("测试2：文件上传")
    print("=" * 50)
    
    try:
        # 创建测试文件
        test_content = b"This is a test file for MinIO upload."
        test_file = BytesIO(test_content)
        test_file.name = "test_upload.txt"
        test_file.content_type = "text/plain"
        
        # 上传文件
        result = minio_client.upload_file(
            file_obj=test_file,
            folder='test',
            original_filename='test_upload.txt'
        )
        
        print(f"✅ 文件上传成功")
        print(f"   文件URL: {result['url']}")
        print(f"   文件名: {result['filename']}")
        print(f"   文件大小: {result['size']} 字节")
        print(f"   对象名称: {result['object_name']}")
        
        return result
    except Exception as e:
        print(f"❌ 文件上传失败: {e}")
        return None


def test_file_exists(object_name):
    """测试文件是否存在"""
    print("\n" + "=" * 50)
    print("测试3：文件存在性检查")
    print("=" * 50)
    
    try:
        exists = minio_client.file_exists(object_name)
        if exists:
            print(f"✅ 文件存在: {object_name}")
        else:
            print(f"❌ 文件不存在: {object_name}")
        return exists
    except Exception as e:
        print(f"❌ 检查失败: {e}")
        return False


def test_file_url(url):
    """测试文件 URL 访问"""
    print("\n" + "=" * 50)
    print("测试4：文件 URL 访问")
    print("=" * 50)
    
    try:
        import requests
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            print(f"✅ 文件可访问")
            print(f"   URL: {url}")
            print(f"   状态码: {response.status_code}")
            print(f"   内容长度: {len(response.content)} 字节")
            return True
        else:
            print(f"❌ 文件访问失败")
            print(f"   状态码: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ URL 访问失败: {e}")
        return False


def test_file_delete(object_name):
    """测试文件删除"""
    print("\n" + "=" * 50)
    print("测试5：文件删除")
    print("=" * 50)
    
    try:
        success = minio_client.delete_file(object_name)
        if success:
            print(f"✅ 文件删除成功: {object_name}")
            
            # 验证文件是否已删除
            exists = minio_client.file_exists(object_name)
            if not exists:
                print(f"✅ 验证：文件已不存在")
            else:
                print(f"⚠️  警告：文件仍然存在")
        else:
            print(f"❌ 文件删除失败")
        return success
    except Exception as e:
        print(f"❌ 删除失败: {e}")
        return False


def run_all_tests():
    """运行所有测试"""
    print("\n" + "🚀 " * 25)
    print("MinIO 文件上传功能测试")
    print("🚀 " * 25 + "\n")
    
    # 测试1：连接
    if not test_minio_connection():
        print("\n❌ MinIO 连接失败，终止测试")
        return
    
    # 测试2：上传
    upload_result = test_file_upload()
    if not upload_result:
        print("\n❌ 文件上传失败，终止测试")
        return
    
    # 测试3：检查文件存在
    test_file_exists(upload_result['object_name'])
    
    # 测试4：访问文件 URL
    test_file_url(upload_result['url'])
    
    # 测试5：删除文件
    test_file_delete(upload_result['object_name'])
    
    # 测试总结
    print("\n" + "=" * 50)
    print("测试总结")
    print("=" * 50)
    print("✅ 所有测试完成")
    print("\n建议：")
    print("1. 如果所有测试通过，可以继续前端集成")
    print("2. 如果有测试失败，请检查 MinIO 配置和网络连接")
    print("3. 确保 MinIO 容器正在运行：docker ps | grep minio")
    print("4. 确保端口 9000 可访问")


if __name__ == '__main__':
    run_all_tests()

