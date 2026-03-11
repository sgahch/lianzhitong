"""
MinIO 客户端工具类
用于处理文件上传、下载、删除等操作
"""
from minio import Minio
from minio.error import S3Error
from django.conf import settings
from datetime import timedelta
import uuid
import os
from urllib.parse import quote


class MinIOClient:
    """MinIO 客户端封装类"""
    
    def __init__(self):
        """初始化 MinIO 客户端"""
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE
        )
        self.bucket_name = settings.MINIO_BUCKET_NAME
        self._ensure_bucket_exists()
    
    def _ensure_bucket_exists(self):
        """确保存储桶存在，如果不存在则创建"""
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                # 设置存储桶策略为公开读取
                policy = {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Principal": {"AWS": "*"},
                            "Action": ["s3:GetObject"],
                            "Resource": [f"arn:aws:s3:::{self.bucket_name}/*"]
                        }
                    ]
                }
                import json
                self.client.set_bucket_policy(self.bucket_name, json.dumps(policy))
        except S3Error as e:
            print(f"创建存储桶失败: {e}")
    
    def upload_file(self, file_obj, folder='files', original_filename=None):
        """
        上传文件到 MinIO
        
        Args:
            file_obj: 文件对象（Django UploadedFile）
            folder: 存储文件夹名称
            original_filename: 原始文件名
        
        Returns:
            dict: 包含文件信息的字典 {url, filename, size}
        """
        try:
            # 生成唯一文件名
            if original_filename:
                ext = os.path.splitext(original_filename)[1]
                filename = f"{uuid.uuid4().hex}{ext}"
            else:
                filename = f"{uuid.uuid4().hex}"
            
            # 构建对象名称（包含文件夹路径）
            object_name = f"{folder}/{filename}"
            
            # 获取文件大小
            file_obj.seek(0, os.SEEK_END)
            file_size = file_obj.tell()
            file_obj.seek(0)
            
            # 获取文件类型
            content_type = getattr(file_obj, 'content_type', 'application/octet-stream')
            
            # 上传文件
            self.client.put_object(
                self.bucket_name,
                object_name,
                file_obj,
                file_size,
                content_type=content_type
            )
            
            # 生成访问 URL
            url = self.get_file_url(object_name)
            
            return {
                'url': url,
                'filename': original_filename or filename,
                'size': file_size,
                'object_name': object_name
            }
        except S3Error as e:
            raise Exception(f"文件上传失败: {e}")
    
    def get_file_url(self, object_name):
        """
        获取文件访问 URL
        
        Args:
            object_name: 对象名称
        
        Returns:
            str: 文件访问 URL
        """
        # 使用公开访问 URL
        protocol = 'https' if settings.MINIO_SECURE else 'http'
        return f"{protocol}://{settings.MINIO_ENDPOINT}/{self.bucket_name}/{object_name}"
    
    def get_presigned_url(self, object_name, expires=timedelta(hours=1)):
        """
        获取预签名 URL（用于临时访问）
        
        Args:
            object_name: 对象名称
            expires: 过期时间
        
        Returns:
            str: 预签名 URL
        """
        try:
            url = self.client.presigned_get_object(
                self.bucket_name,
                object_name,
                expires=expires
            )
            return url
        except S3Error as e:
            raise Exception(f"生成预签名 URL 失败: {e}")
    
    def delete_file(self, object_name):
        """
        删除文件
        
        Args:
            object_name: 对象名称
        
        Returns:
            bool: 是否删除成功
        """
        try:
            self.client.remove_object(self.bucket_name, object_name)
            return True
        except S3Error as e:
            print(f"删除文件失败: {e}")
            return False
    
    def file_exists(self, object_name):
        """
        检查文件是否存在
        
        Args:
            object_name: 对象名称
        
        Returns:
            bool: 文件是否存在
        """
        try:
            self.client.stat_object(self.bucket_name, object_name)
            return True
        except S3Error:
            return False


# 创建全局 MinIO 客户端实例
minio_client = MinIOClient()

