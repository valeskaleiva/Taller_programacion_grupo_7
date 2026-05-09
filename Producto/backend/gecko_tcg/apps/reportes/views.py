from django.shortcuts import render

from rest_framework import viewsets, filters
from .models import Reporte
from .serializers import ReporteSerializer
from apps.ventas.models import Venta, DetalleVenta
from apps.productos.models import Producto
from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.response import Response

class ReporteViewSet(viewsets.ModelViewSet): # gestionar reportes 
    queryset = Reporte.objects.all()
    serializer_class = ReporteSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['tipo_reporte','id_usuario__username']
    ordering_fields = ['fecha_reporte', 'tipo_reporte']
    ordering = ['-fecha_reporte']

    @action(detail=False, methods=['get']) 
    # productos mas vendido del día
    def top_productos_vendidos(self, request): 
        detalles =  DetalleVenta.objects.values('id_producto__nombre').annotate(
            cantidad_vendida=Sum('cantidad'),
            veces_vendido=Count('id_detalle')
        ).order_by('-cantidad_vendida')[:10]
        return Response({
            'titulo' : 'top 10 Productos Más Vendidos',
            'datos' : list(detalles)
        })
    
    #productos bajos en stock (osea menos de 10)
    @action(detail=False, methods=['get'])
    def productos_bajo_stock(self, request):
        productos = Producto.objects.filter(stock__lt=10).values(
            'id_producto', 
            'nombre', 
            'stock',
            'precio_base'
        ).order_by('stock')

        return Response({
            'titulo': 'Productos con Bajo Stock',
            'cantidad_productos':len(list (productos)),
            'datos': list(productos)
        })
    
    #ingresos por categoria 
    @action(detail=False, methods=['get'])
    def ingresos_por_categoria(self, request): 
        ingresos = DetalleVenta.objects.values(
            'id_producto__categoria'
        ).annotate(
                total_ingresos=Sum('precio_unitario') * Sum('precio_unitario'),
                cantidad_productos =Count('id_producto', distinct=True)
        ).order_by('-total_ingresos')

        return Response({
            'titulo': 'Ingresos por Categoria',
            'datos': list(ingresos)
        })