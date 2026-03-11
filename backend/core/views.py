from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status as http_status
from django.shortcuts import redirect
from .models import AssistParty, DisciplineEducation, Supervision, Clue, Regulation
from .serializers import (AssistPartySerializer, DisciplineEducationSerializer,
                          SupervisionSerializer, ClueSerializer, RegulationSerializer)
from .minio_client import minio_client


@api_view(['GET'])
def home(request):
    """首页 - 重定向到后台管理"""
    return redirect('/admin/')


@api_view(['GET'])
def health(request):
    """健康检查"""
    return Response({'status': 'ok', 'message': '廉智通 API 运行正常'})


class AssistPartyViewSet(viewsets.ModelViewSet):
    """协助党委视图集"""
    queryset = AssistParty.objects.all()
    serializer_class = AssistPartySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = AssistParty.objects.all()
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        return queryset


class DisciplineEducationViewSet(viewsets.ModelViewSet):
    """纪律教育视图集"""
    queryset = DisciplineEducation.objects.all()
    serializer_class = DisciplineEducationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = DisciplineEducation.objects.all()
        edu_type = self.request.query_params.get('edu_type')
        is_published = self.request.query_params.get('is_published')
        if edu_type:
            queryset = queryset.filter(edu_type=edu_type)
        if is_published is not None:
            queryset = queryset.filter(is_published=is_published == 'true')
        return queryset


class SupervisionViewSet(viewsets.ModelViewSet):
    """监督检查视图集"""
    queryset = Supervision.objects.all()
    serializer_class = SupervisionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Supervision.objects.all()
        status = self.request.query_params.get('status')
        supervision_type = self.request.query_params.get('supervision_type')
        if status:
            queryset = queryset.filter(status=status)
        if supervision_type:
            queryset = queryset.filter(supervision_type=supervision_type)
        return queryset


class ClueViewSet(viewsets.ModelViewSet):
    """线索处置视图集"""
    queryset = Clue.objects.all()
    serializer_class = ClueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Clue.objects.all()
        status = self.request.query_params.get('status')
        source = self.request.query_params.get('source')
        if status:
            queryset = queryset.filter(status=status)
        if source:
            queryset = queryset.filter(source=source)
        return queryset


class RegulationViewSet(viewsets.ModelViewSet):
    """法规库视图集"""
    queryset = Regulation.objects.all()
    serializer_class = RegulationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Regulation.objects.all()
        category = self.request.query_params.get('category')
        is_valid = self.request.query_params.get('is_valid')
        if category:
            queryset = queryset.filter(category=category)
        if is_valid is not None:
            queryset = queryset.filter(is_valid=is_valid == 'true')
        return queryset


class FileUploadView(APIView):
    """文件上传视图"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        上传文件到 MinIO

        请求参数:
            file: 文件对象
            folder: 存储文件夹（可选，默认为 'files'）

        返回:
            {
                "url": "文件访问 URL",
                "filename": "原始文件名",
                "size": 文件大小（字节）,
                "object_name": "MinIO 对象名称"
            }
        """
        try:
            # 获取上传的文件
            file_obj = request.FILES.get('file')
            if not file_obj:
                return Response(
                    {'detail': '请选择要上传的文件'},
                    status=http_status.HTTP_400_BAD_REQUEST
                )

            # 获取文件夹参数
            folder = request.data.get('folder', 'files')

            # 验证文件大小（10MB）
            if file_obj.size > 10 * 1024 * 1024:
                return Response(
                    {'detail': '文件大小不能超过 10MB'},
                    status=http_status.HTTP_400_BAD_REQUEST
                )

            # 验证文件类型
            allowed_extensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.gif']
            import os
            ext = os.path.splitext(file_obj.name)[1].lower()
            if ext not in allowed_extensions:
                return Response(
                    {'detail': f'不支持的文件类型，仅支持: {", ".join(allowed_extensions)}'},
                    status=http_status.HTTP_400_BAD_REQUEST
                )

            # 上传文件
            result = minio_client.upload_file(
                file_obj=file_obj,
                folder=folder,
                original_filename=file_obj.name
            )

            return Response(result, status=http_status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=http_status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FileDeleteView(APIView):
    """文件删除视图"""
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        """
        删除 MinIO 中的文件

        请求参数:
            object_name: MinIO 对象名称

        返回:
            {"message": "删除成功"}
        """
        try:
            object_name = request.data.get('object_name')
            if not object_name:
                return Response(
                    {'detail': '请提供要删除的文件对象名称'},
                    status=http_status.HTTP_400_BAD_REQUEST
                )

            # 删除文件
            success = minio_client.delete_file(object_name)

            if success:
                return Response({'message': '删除成功'}, status=http_status.HTTP_200_OK)
            else:
                return Response(
                    {'detail': '删除失败'},
                    status=http_status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=http_status.HTTP_500_INTERNAL_SERVER_ERROR
            )
