from django.shortcuts import render
from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Producto, ProductoCarta, ProductoCaja, ProductoSobre
from .serializers import ProductoSerializer, ProductoCartaSerializer, ProductoCajaSerializer, ProductoSobreSerializer


class PuedeVerProductos(permissions.BasePermission):
    """Permite a admin y vendedores ver productos; solo admin puede modificar"""
    def has_permission(self, request, view):
        # Lectura (GET) permitida para todos autenticados
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Escritura (POST, PUT, DELETE) solo para admin
        if request.user and request.user.is_authenticated:
            if request.user.is_staff:
                return True
            # Verificar si es vendedor
            try:
                perfil = request.user.perfil_gecko
                return perfil.rol and perfil.rol.tipo == 'admin'
            except:
                return False
        return False


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [PuedeVerProductos]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion', 'codigo_barras']
    ordering_fields = ['precio', 'fecha_lanzamiento']

    @action(detail=False, methods=['get'])
    def por_codigo(self, request):
        """Buscar producto por código de barras - IDEAL PARA LECTORES"""
        codigo = request.query_params.get('codigo')
        if not codigo:
            return Response({'error': 'Parámetro codigo requerido'},
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            producto = Producto.objects.get(codigo_barras=codigo)
            serializer = self.get_serializer(producto)
            return Response(serializer.data)
        except Producto.DoesNotExist:
            return Response({'error': 'Producto no encontrado'},
                          status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def bajo_stock(self, request):
        bajo_stock = Producto.objects.filter(stock__lt=10)
        serializer = self.get_serializer(bajo_stock, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reducir_stock(self, request, pk=None):
        producto = self.get_object()
        cantidad = int(request.data.get('cantidad', 0))

        if producto.stock < cantidad:
            return Response({'error': 'Stock insuficiente'},
                            status=status.HTTP_400_BAD_REQUEST)

        producto.stock -= cantidad
        producto.save()

        return Response({
            'mensaje': 'stock reducido',
            'stock_actual': producto.stock
        })


# Producto Carta 
class ProductoCartaViewSet(viewsets.ModelViewSet):
    queryset = ProductoCarta.objects.all()
    serializer_class = ProductoCartaSerializer
    permission_classes = [PuedeVerProductos]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['id_producto__nombre', 'rareza', 'edicion']
    ordering_fields = ['rareza', 'precio_mercado']
    ordering = ['id_producto']


# Producto Sobre
class ProductoSobreViewSet(viewsets.ModelViewSet):
    queryset = ProductoSobre.objects.all()
    serializer_class = ProductoSobreSerializer
    permission_classes = [PuedeVerProductos]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['id_producto__nombre', 'serie']
    ordering_fields = ['cant_cartas']


# Producto caja 
class ProductoCajaViewSet(viewsets.ModelViewSet):
    queryset = ProductoCaja.objects.all()
    serializer_class = ProductoCajaSerializer
    permission_classes = [PuedeVerProductos]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['id_producto__nombre']
    ordering_fields = ['cant_sobres']

