from django.shortcuts import render
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Venta, DetalleVenta
from .serializers import VentaSerializer, VentaCreateSerializer, DetalleVentaSerializer
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta


class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['id_usuario__username']
    ordering_fields = ['fecha_venta', 'total_pagado']
    ordering = ['-fecha_venta']

    def get_serializer_class(self): # va a hacer una venta 
        if self.request.method == 'POST':
            return VentaCreateSerializer
        return VentaSerializer
    
    @action(detail=True, methods=['get']) # para hacr un rsumen de ventas del día 

    def resumen_diario(self,request):
        hoy = timezone.now().date()
        ventas_hoy = Venta.objects.filter(fecha_venta__date=hoy) # esto va a filtrar por venta 

        total_vendido = ventas_hoy.aggregate(total=Sum('total_pagado'))['total'] or 0
        cantidad_ventas = ventas_hoy.count()

        return Response({
            'fecha': hoy,
            'total_vendido': total_vendido,
            'cantidad_ventas': cantidad_ventas,
            'promedio_venta': total_vendido / cantidad_ventas if cantidad_ventas > 0 else 0
        })

    @action(detail=True, methods=['get']) # lo mismo pero del mes 
    def resumen_mes(self, request):
        hoy = timezone.now().date()
        primer_dia= hoy.replace(day=1)
        ventas_mes = Venta.objects.filter(fecha_venta__date__gte=primer_dia)
        total_vendido = ventas_mes.aggregate(Sum('total_pagado'))['total_pagado_sum'] or 0
        cantidad_ventas = ventas_mes.count()
    
        return Response({
            'mes':hoy.month,
            'año':hoy.year,
            'total_vendido': total_vendido,
            'cantidad_ventas': cantidad_ventas,
            'promedio_venta': total_vendido / cantidad_ventas if cantidad_ventas > 0 else 0
        })

    @action(detail=True, methods=['get']) # lo mismo pero del año
    def detalle_venta(self, request):
        venta = self.get_object()
        detalles = venta.detalles.all()
        serializer = DetalleVentaSerializer(detalles, many=True)
        return Response(serializer.data)
    
class DetalleVentaViewSet(viewsets.ModelViewSet):
    queryset = DetalleVenta.objects.all()
    serializer_class = DetalleVentaSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['id_venta__id_venta', 'id_producto__nombre']
    ordering_fields = ['cantidad', 'precio_unitario']