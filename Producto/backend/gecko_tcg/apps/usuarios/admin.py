from django.contrib import admin
from .models import Rol, UsuarioGecko


@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ['tipo', 'descripcion', 'creado_en']
    search_fields = ['tipo', 'descripcion']
    readonly_fields = ['creado_en', 'actualizado_en']


@admin.register(UsuarioGecko)
class UsuarioGeckoAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'rol', 'estado', 'telefono', 'creado_en']
    list_filter = ['rol', 'estado', 'creado_en']
    search_fields = ['usuario__username', 'usuario__email', 'telefono']
    readonly_fields = ['creado_en', 'actualizado_en']
    fieldsets = (
        ('Información de Usuario', {
            'fields': ('usuario', 'rol')
        }),
        ('Datos Personales', {
            'fields': ('telefono',)
        }),
        ('Estado', {
            'fields': ('estado',)
        }),
        ('Timestamps', {
            'fields': ('creado_en', 'actualizado_en'),
            'classes': ('collapse',)
        }),
    )
