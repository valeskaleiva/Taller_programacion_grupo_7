from django.contrib import admin
from .models import Producto, ProductoCarta, ProductoSobre, ProductoCaja


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
   
    list_display = ('id_producto', 'nombre', 'codigo_barras', 'stock', 'precio_base', 'categoria')
    list_filter = ('categoria', 'precio_base')
    search_fields = ('nombre', 'codigo_barras')
    ordering = ('-id_producto',)
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('codigo_barras', 'nombre', 'descripcion', 'categoria')
        }),
        ('Stock y Precio', {
            'fields': ('stock', 'precio_base')
        }),
    )

@admin.register(ProductoCarta)
class ProductoCartaAdmin(admin.ModelAdmin):
   
    list_display = ('id_producto', 'rareza', 'estado', 'edicion', 'precio_mercado')
    list_filter = ('rareza', 'estado', 'edicion')
    search_fields = ('id_producto__nombre',)


@admin.register(ProductoSobre)
class ProductoSobreAdmin(admin.ModelAdmin):

    
    list_display = ('id_producto', 'cant_cartas', 'serie')
    search_fields = ('id_producto__nombre', 'serie')


@admin.register(ProductoCaja)
class ProductoCajaAdmin(admin.ModelAdmin):

    list_display = ('id_producto', 'cant_sobres')
    search_fields = ('id_producto__nombre',)