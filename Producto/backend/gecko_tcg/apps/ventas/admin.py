from django.contrib import admin
from .models import Venta, DetalleVenta

class DetalleVentaInline(admin.TabularInline):

    model = DetalleVenta
    extra = 1  # Una fila vacía extra para agregar
    fields = ('id_producto', 'cantidad', 'precio_unitario')
    readonly_fields = ('precio_unitario',)



@admin.register(Venta)
class VentaAdmin(admin.ModelAdmin):

    list_display = ('id_venta', 'fecha_venta', 'id_usuario', 'total_pagado')
    list_filter = ('fecha_venta', 'id_usuario')
    search_fields = ('id_venta', 'id_usuario__username')
    readonly_fields = ('id_venta', 'fecha_venta', 'total_pagado')
    inlines = [DetalleVentaInline]  
    
    fieldsets = (
        ('Información de Venta', {
            'fields': ('id_venta', 'fecha_venta', 'id_usuario')
        }),
        ('Totales', {
            'fields': ('total_pagado',)
        }),
    )

@admin.register(DetalleVenta)
class DetalleVentaAdmin(admin.ModelAdmin):

    
    list_display = ('id_detalle', 'id_venta', 'id_producto', 'cantidad', 'precio_unitario')
    list_filter = ('id_venta__fecha_venta',)
    search_fields = ('id_venta__id_venta', 'id_producto__nombre')
    readonly_fields = ('id_detalle',)