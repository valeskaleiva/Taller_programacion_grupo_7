from django.contrib.auth.models import User
from rest_framework import serializers, viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, AllowAny, IsAuthenticated, BasePermission
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Rol, UsuarioGecko


class EsAdmin(BasePermission):
    """Permiso: usuario es administrador"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff


class EsVendedor(BasePermission):
    """Permiso: usuario es vendedor"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        try:
            perfil = request.user.perfil_gecko
            return perfil.rol and perfil.rol.tipo == 'vendedor'
        except UsuarioGecko.DoesNotExist:
            return False


class EsAdminOVendedor(BasePermission):
    """Permiso: usuario es admin o vendedor"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        try:
            perfil = request.user.perfil_gecko
            return perfil.rol and perfil.rol.tipo in ['admin', 'vendedor']
        except UsuarioGecko.DoesNotExist:
            return request.user.is_staff


class AdminTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['is_staff'] = user.is_staff
        
        # Incluir información del rol si existe
        try:
            perfil = user.perfil_gecko
            if perfil.rol:
                token['rol'] = perfil.rol.tipo
        except UsuarioGecko.DoesNotExist:
            pass
        
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        if not user.is_active:
            raise serializers.ValidationError('Usuario inactivo.')

        if not user.is_staff:
            # Verificar que sea vendedor activo
            try:
                perfil = user.perfil_gecko
                if not perfil.rol or perfil.rol.tipo not in ['admin', 'vendedor']:
                    raise serializers.ValidationError('Usuario sin rol válido.')
                if perfil.estado != 'activo':
                    raise serializers.ValidationError('Usuario inactivo.')
            except UsuarioGecko.DoesNotExist:
                raise serializers.ValidationError('Usuario sin perfil configurado.')

        rol_tipo = None
        try:
            perfil = user.perfil_gecko
            if perfil.rol:
                rol_tipo = perfil.rol.tipo
        except UsuarioGecko.DoesNotExist:
            rol_tipo = 'admin' if user.is_staff else None

        if user.is_staff and not rol_tipo:
            rol_tipo = 'admin'

        data['user'] = {
            'id': user.id,
            'username': user.username,
            'is_staff': user.is_staff,
            'rol': rol_tipo,
        }
        return data


class AdminTokenObtainPairView(TokenObtainPairView):
    serializer_class = AdminTokenObtainPairSerializer
    permission_classes = [AllowAny]


class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ['id', 'tipo', 'descripcion']
        read_only_fields = ['id', 'creado_en', 'actualizado_en']


class UsuarioGeckoSerializer(serializers.ModelSerializer):
    usuario_id = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()
    nombre = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    rol_tipo = serializers.CharField(source='rol.tipo', read_only=True)
    rol_display = serializers.CharField(source='rol.get_tipo_display', read_only=True)
    
    class Meta:
        model = UsuarioGecko
        fields = ['usuario_id', 'username', 'nombre', 'email', 'telefono', 'estado', 'rol_tipo', 'rol_display']
        read_only_fields = ['usuario_id', 'username', 'nombre', 'email', 'rol_tipo', 'rol_display']
    
    def get_usuario_id(self, obj):
        return obj.usuario.id
    
    def get_username(self, obj):
        return obj.usuario.username
    
    def get_nombre(self, obj):
        first_name = obj.usuario.first_name or ''
        last_name = obj.usuario.last_name or ''
        return f"{first_name} {last_name}".strip() or obj.usuario.username
    
    def get_email(self, obj):
        return obj.usuario.email


class UsuarioSerializer(serializers.ModelSerializer):
    rol_tipo = serializers.SerializerMethodField()
    rol_display = serializers.SerializerMethodField()
    telefono = serializers.SerializerMethodField()
    estado = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_active', 'is_staff', 'rol_tipo', 'rol_display', 'telefono', 'estado']
        read_only_fields = ['id', 'is_staff']
    
    def get_rol_tipo(self, obj):
        if obj.is_staff:
            return 'admin'
        try:
            return obj.perfil_gecko.rol.tipo if obj.perfil_gecko.rol else None
        except UsuarioGecko.DoesNotExist:
            return None
    
    def get_rol_display(self, obj):
        if obj.is_staff:
            return 'Administrador'
        try:
            return obj.perfil_gecko.rol.get_tipo_display() if obj.perfil_gecko.rol else None
        except UsuarioGecko.DoesNotExist:
            return None
    
    def get_telefono(self, obj):
        try:
            return obj.perfil_gecko.telefono
        except UsuarioGecko.DoesNotExist:
            return ''
    
    def get_estado(self, obj):
        try:
            return obj.perfil_gecko.estado
        except UsuarioGecko.DoesNotExist:
            return 'activo'


class UsuarioCreateUpdateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    telefono = serializers.CharField(max_length=20, required=False, allow_blank=True)
    estado = serializers.ChoiceField(choices=['activo', 'inactivo'], required=False)
    rol_tipo = serializers.ChoiceField(choices=['vendedor', 'admin'], required=False)

    def _get_or_create_rol(self, rol_tipo: str) -> Rol:
        descripcion_default = 'Administrador del sistema' if rol_tipo == 'admin' else 'Vendedor de tienda'
        rol, _ = Rol.objects.get_or_create(
            tipo=rol_tipo,
            defaults={'descripcion': descripcion_default},
        )
        return rol
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        rol_tipo = validated_data.pop('rol_tipo', 'vendedor')
        telefono = validated_data.pop('telefono', '')
        estado = validated_data.pop('estado', 'activo')
        
        if not password:
            raise serializers.ValidationError({'password': 'La contraseña es requerida.'})
        
        is_admin_role = rol_tipo == 'admin'
        usuario = User.objects.create_user(
            **validated_data,
            password=password,
            is_staff=is_admin_role,
            is_superuser=is_admin_role,
            is_active=(estado == 'activo'),
        )

        rol = self._get_or_create_rol(rol_tipo)
        UsuarioGecko.objects.create(
            usuario=usuario,
            rol=rol,
            telefono=telefono,
            estado=estado
        )
        
        return usuario
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        rol_tipo = validated_data.pop('rol_tipo', None)
        telefono = validated_data.pop('telefono', None)
        estado = validated_data.pop('estado', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)

        if rol_tipo:
            is_admin_role = rol_tipo == 'admin'
            instance.is_staff = is_admin_role
            instance.is_superuser = is_admin_role

        if estado:
            instance.is_active = estado == 'activo'
        
        instance.save()

        perfil, _ = UsuarioGecko.objects.get_or_create(
            usuario=instance,
            defaults={
                'rol': self._get_or_create_rol(rol_tipo or 'vendedor'),
                'telefono': telefono or '',
                'estado': estado or 'activo',
            },
        )

        if rol_tipo:
            perfil.rol = self._get_or_create_rol(rol_tipo)
        if telefono is not None:
            perfil.telefono = telefono
        if estado:
            perfil.estado = estado
        perfil.save()
        
        return instance


class UsuarioViewSet(viewsets.ViewSet):
    """
    ViewSet para gestionar usuarios con permisos diferenciados:
    - Admin: CRUD completo
    - Vendedor: Solo lectura
    """
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [EsAdmin()]
        elif self.action in ['list', 'retrieve', 'me']:
            return [EsAdminOVendedor()]
        else:
            return [IsAuthenticated()]
    
    def list(self, request):
        """Listar usuarios"""
        usuarios = User.objects.all().order_by('id')
        serializer = UsuarioSerializer(usuarios, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        """Crear nuevo usuario (solo admin)"""
        serializer = UsuarioCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()
        return Response(UsuarioSerializer(usuario).data, status=status.HTTP_201_CREATED)
    
    def retrieve(self, request, pk=None):
        """Obtener un usuario específico"""
        try:
            usuario = User.objects.get(pk=pk)
            serializer = UsuarioSerializer(usuario)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'detail': 'No encontrado.'}, status=status.HTTP_404_NOT_FOUND)
    
    def update(self, request, pk=None):
        """Actualizar un usuario (solo admin)"""
        try:
            usuario = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'No encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = UsuarioCreateUpdateSerializer(usuario, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()
        return Response(UsuarioSerializer(usuario).data)
    
    def partial_update(self, request, pk=None):
        """Actualizar parcialmente un usuario (solo admin)"""
        try:
            usuario = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'No encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = UsuarioCreateUpdateSerializer(usuario, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()
        return Response(UsuarioSerializer(usuario).data)
    
    def destroy(self, request, pk=None):
        """Eliminar un usuario (solo admin)"""
        try:
            usuario = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'No encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        
        usuario.delete()
        return Response({'detail': 'Usuario eliminado.'}, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Obtener datos del usuario autenticado"""
        if not request.user or not request.user.is_authenticated:
            return Response({'detail': 'No autenticado.'}, status=401)
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)
