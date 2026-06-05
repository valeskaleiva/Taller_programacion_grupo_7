from datetime import datetime, time, timedelta

from django.db import models
from rest_framework import viewsets, filters
from rest_framework import permissions
from .models import Reporte
from .serializers import ReporteSerializer
from apps.ventas.models import Venta, DetalleVenta
from apps.productos.models import Producto
from django.db.models import Sum, Count, F
from django.utils.dateparse import parse_date
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.response import Response


class PuedeVerReportes(permissions.BasePermission):
    """Admin y vendedor pueden leer reportes; solo admin puede modificar."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in permissions.SAFE_METHODS:
            return True

        return bool(request.user.is_staff)

class ReporteViewSet(viewsets.ModelViewSet): # gestionar reportes 
    queryset = Reporte.objects.all()
    serializer_class = ReporteSerializer
    permission_classes = [PuedeVerReportes]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['tipo_reporte','id_usuario__username']
    ordering_fields = ['fecha_reporte', 'tipo_reporte']
    ordering = ['-fecha_reporte']

    def _get_date_range(self, request):
        fecha_desde = parse_date(request.query_params.get('from', '') or '')
        fecha_hasta = parse_date(request.query_params.get('to', '') or '')

        if fecha_desde and fecha_hasta and fecha_desde > fecha_hasta:
            fecha_desde, fecha_hasta = fecha_hasta, fecha_desde

        return fecha_desde, fecha_hasta

    def _date_to_datetime_range(self, fecha_desde, fecha_hasta):
        dt_desde = None
        dt_hasta_exclusiva = None

        if fecha_desde:
            dt_desde = datetime.combine(fecha_desde, time.min)
            if timezone.is_naive(dt_desde):
                dt_desde = timezone.make_aware(dt_desde)

        if fecha_hasta:
            dt_hasta_exclusiva = datetime.combine(fecha_hasta + timedelta(days=1), time.min)
            if timezone.is_naive(dt_hasta_exclusiva):
                dt_hasta_exclusiva = timezone.make_aware(dt_hasta_exclusiva)

        return dt_desde, dt_hasta_exclusiva

    def _filtrar_detalles_por_fecha(self, queryset, fecha_desde, fecha_hasta):
        dt_desde, dt_hasta_exclusiva = self._date_to_datetime_range(fecha_desde, fecha_hasta)
        if dt_desde:
            queryset = queryset.filter(id_venta__fecha_venta__gte=dt_desde)
        if dt_hasta_exclusiva:
            queryset = queryset.filter(id_venta__fecha_venta__lt=dt_hasta_exclusiva)
        return queryset

    @action(detail=False, methods=['get']) 
    # productos mas vendido del día
    def top_productos_vendidos(self, request): 
        fecha_desde, fecha_hasta = self._get_date_range(request)
        detalles_qs = self._filtrar_detalles_por_fecha(DetalleVenta.objects.all(), fecha_desde, fecha_hasta)

        detalles = detalles_qs.values('id_producto__nombre').annotate(
            cantidad_vendida=Sum('cantidad'),
            veces_vendido=Count('id_detalle')
        ).order_by('-cantidad_vendida')[:10]

        return Response({
            'titulo' : 'top 10 Productos Más Vendidos',
            'filtros': {
                'from': fecha_desde.isoformat() if fecha_desde else None,
                'to': fecha_hasta.isoformat() if fecha_hasta else None,
            },
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
        fecha_desde, fecha_hasta = self._get_date_range(request)
        detalles_qs = self._filtrar_detalles_por_fecha(DetalleVenta.objects.all(), fecha_desde, fecha_hasta)

        ingresos = detalles_qs.values(
            'id_producto__categoria'
        ).annotate(
                total_ingresos=Sum(F('cantidad') * F('precio_unitario'), output_field=models.DecimalField()),
                cantidad_productos =Count('id_producto', distinct=True)
        ).order_by('-total_ingresos')

        return Response({
            'titulo': 'Ingresos por Categoria',
            'filtros': {
                'from': fecha_desde.isoformat() if fecha_desde else None,
                'to': fecha_hasta.isoformat() if fecha_hasta else None,
            },
            'datos': list(ingresos)
        })

    @action(detail=False, methods=['get'])
    def ventas_diarias(self, request):
        fecha_desde, fecha_hasta = self._get_date_range(request)
        dt_desde, dt_hasta_exclusiva = self._date_to_datetime_range(fecha_desde, fecha_hasta)

        ventas_qs = Venta.objects.all()
        ventas_qs = ventas_qs.filter(total_pagado__gt=0)
        if dt_desde:
            ventas_qs = ventas_qs.filter(fecha_venta__gte=dt_desde)
        if dt_hasta_exclusiva:
            ventas_qs = ventas_qs.filter(fecha_venta__lt=dt_hasta_exclusiva)

        ventas = ventas_qs.values('fecha_venta', 'total_pagado').order_by('fecha_venta')

        agrupadas = {}
        for venta in ventas:
            fecha = venta['fecha_venta']
            if not fecha:
                continue
            fecha_key = fecha.date().isoformat()
            total_pagado = float(venta['total_pagado'] or 0)

            if fecha_key not in agrupadas:
                agrupadas[fecha_key] = {
                    'ventas': 0.0,
                    'transacciones': 0,
                }

            agrupadas[fecha_key]['ventas'] += total_pagado
            agrupadas[fecha_key]['transacciones'] += 1

        datos = []
        for fecha_key in sorted(agrupadas.keys()):
            total = float(agrupadas[fecha_key]['ventas'])
            transacciones = int(agrupadas[fecha_key]['transacciones'])
            ticket_promedio = round(total / transacciones) if transacciones else 0
            datos.append({
                'fecha': fecha_key,
                'ventas': round(total),
                'transacciones': transacciones,
                'ticket_promedio': ticket_promedio,
            })

        return Response({
            'titulo': 'Ventas Diarias',
            'filtros': {
                'from': fecha_desde.isoformat() if fecha_desde else None,
                'to': fecha_hasta.isoformat() if fecha_hasta else None,
            },
            'datos': datos,
        })