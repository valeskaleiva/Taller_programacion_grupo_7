from django.shortcuts import render
from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Venta, DetalleVenta
from .serializers import VentaSerializer, VentaCreateSerializer, DetalleVentaSerializer
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta


class PuedeCrearVentas(permissions.BasePermission):
    """Permite a admin ver todas las ventas; vendedores solo crean y ven las suyas"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # POST (crear venta) permitido para todos autenticados
        if request.method == 'POST':
            return True
        
        # GET permitido solo para admin
        if request.user.is_staff:
            return True
        
        # Vendedores solo GET a acciones específicas
        try:
            perfil = request.user.perfil_gecko
            return perfil.rol and perfil.rol.tipo == 'vendedor'
        except:
            return False
    
    def has_object_permission(self, request, view, obj):
        # Admin ve todo
        if request.user.is_staff:
            return True
        
        # Vendedor solo ve sus propias ventas
        try:
            perfil = request.user.perfil_gecko
            if perfil.rol and perfil.rol.tipo == 'vendedor':
                return obj.id_usuario_id == request.user.id
        except:
            pass
        
        return False


class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all()
    permission_classes = [PuedeCrearVentas]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['id_usuario__username']
    ordering_fields = ['fecha_venta', 'total_pagado']
    ordering = ['-fecha_venta']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return VentaCreateSerializer
        return VentaSerializer
    
    def get_queryset(self):
        """Vendedores solo ven sus propias ventas; admin ve todas"""
        queryset = Venta.objects.all()
        
        if self.request.user and self.request.user.is_authenticated:
            if not self.request.user.is_staff:
                # Vendedor solo ve sus ventas
                try:
                    perfil = self.request.user.perfil_gecko
                    if perfil.rol and perfil.rol.tipo == 'vendedor':
                        queryset = queryset.filter(id_usuario=self.request.user)
                except:
                    pass
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def resumen_diario(self, request):
        hoy = timezone.now().date()
        ventas_hoy = self.get_queryset().filter(fecha_venta__date=hoy)

        total_vendido = ventas_hoy.aggregate(total=Sum('total_pagado'))['total'] or 0
        cantidad_ventas = ventas_hoy.count()

        return Response({
            'fecha': hoy,
            'total_vendido': total_vendido,
            'cantidad_ventas': cantidad_ventas,
            'promedio_venta': total_vendido / cantidad_ventas if cantidad_ventas > 0 else 0
        })

    @action(detail=False, methods=['get'])
    def resumen_mes(self, request):
        hoy = timezone.now().date()
        primer_dia = hoy.replace(day=1)
        ventas_mes = self.get_queryset().filter(fecha_venta__date__gte=primer_dia)
        total_vendido = ventas_mes.aggregate(Sum('total_pagado'))['total_pagado__sum'] or 0
        cantidad_ventas = ventas_mes.count()
    
        return Response({
            'mes': hoy.month,
            'año': hoy.year,
            'total_vendido': total_vendido,
            'cantidad_ventas': cantidad_ventas,
            'promedio_venta': total_vendido / cantidad_ventas if cantidad_ventas > 0 else 0
        })

    @action(detail=True, methods=['get'])
    def detalle_venta(self, request, pk=None):
        venta = self.get_object()
        detalles = venta.detalles.all()
        serializer = DetalleVentaSerializer(detalles, many=True)
        return Response(serializer.data)
    

class DetalleVentaViewSet(viewsets.ModelViewSet):
    queryset = DetalleVenta.objects.all()
    serializer_class = DetalleVentaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['id_venta__id_venta', 'id_producto__nombre']
    ordering_fields = ['cantidad', 'precio_unitario']