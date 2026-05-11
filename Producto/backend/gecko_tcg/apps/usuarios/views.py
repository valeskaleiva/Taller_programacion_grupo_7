from django.contrib.auth.models import User
from rest_framework import serializers, viewsets, filters
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_active', 'is_staff']


class UsuarioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UsuarioSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'first_name', 'last_name', 'email']
    ordering_fields = ['id', 'username', 'email']

    @action(detail=False, methods=['get'])
    def me(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response({'detail': 'No autenticado.'}, status=401)
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
