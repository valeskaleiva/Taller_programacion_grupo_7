from rest_framework import serializers
from .models import Producto, ProductoCarta, ProductoSobre, ProductoCaja

# Esto hacen los modelos a formato Jason 
class ProductoSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Producto
        fields = [
            'id_producto',
            'codigo_barras',
            'nombre',
            'descripcion',
            'stock',
            'precio_base',
            'categoria'
        ]
        read_only_fields = ['id_producto']  # No se puede editar



class ProductoCartaSerializer(serializers.ModelSerializer):
 
    

    producto = ProductoSerializer(source='id_producto', read_only=True)
    producto_id = serializers.PrimaryKeyRelatedField(
        source='id_producto',
        queryset=Producto.objects.filter(categoria='Carta'),
        write_only=True
    )
    
    class Meta:
        model = ProductoCarta
        fields = [
            'id_producto',
            'producto',
            'producto_id',
            'rareza',
            'edicion',
            'estado',
            'precio_mercado'
        ]
        read_only_fields = ['id_producto']




class ProductoSobreSerializer(serializers.ModelSerializer):

    
    producto = ProductoSerializer(source='id_producto', read_only=True)
    producto_id = serializers.PrimaryKeyRelatedField(
        source='id_producto',
        queryset=Producto.objects.filter(categoria='Sobre'),
        write_only=True
    )
    
    class Meta:
        model = ProductoSobre
        fields = [
            'id_producto',
            'producto',
            'producto_id',
            'cant_cartas',
            'serie'
        ]
        read_only_fields = ['id_producto']


class ProductoCajaSerializer(serializers.ModelSerializer):

    producto = ProductoSerializer(source='id_producto', read_only=True)
    producto_id = serializers.PrimaryKeyRelatedField(
        source='id_producto',
        queryset=Producto.objects.filter(categoria='Caja'),
        write_only=True
    )
    
    class Meta:
        model = ProductoCaja
        fields = [
            'id_producto',
            'producto',
            'producto_id',
            'cant_sobres'
        ]
        read_only_fields = ['id_producto']