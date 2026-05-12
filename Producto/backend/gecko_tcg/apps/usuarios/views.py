from django.contrib.auth.models import User
from rest_framework import serializers, viewsets, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class AdminTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['is_staff'] = user.is_staff
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        if not user.is_active or not user.is_staff:
            raise serializers.ValidationError('Solo administradores de Django pueden acceder.')

        data['user'] = {
            'id': user.id,
            'username': user.username,
            'is_staff': user.is_staff,
        }
        return data


class AdminTokenObtainPairView(TokenObtainPairView):
    serializer_class = AdminTokenObtainPairSerializer
    permission_classes = [AllowAny]


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_active', 'is_staff']


class UsuarioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UsuarioSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'first_name', 'last_name', 'email']
    ordering_fields = ['id', 'username', 'email']

    @action(detail=False, methods=['get'])
    def me(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response({'detail': 'No autenticado.'}, status=401)
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
