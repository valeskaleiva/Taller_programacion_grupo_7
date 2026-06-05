from django.contrib import admin
from .models import Reporte


@admin.register(Reporte)
class ReporteAdmin(admin.ModelAdmin):

    list_display = ('id_reporte', 'tipo_reporte', 'fecha_reporte', 'id_usuario')
    list_filter = ('tipo_reporte', 'fecha_reporte', 'id_usuario')
    search_fields = ('id_usuario__username', 'tipo_reporte')
    readonly_fields = ('id_reporte', 'fecha_reporte')
    
    fieldsets = (
        ('Información del Reporte', {
            'fields': ('id_reporte', 'tipo_reporte', 'fecha_reporte', 'id_usuario')
        }),
    )