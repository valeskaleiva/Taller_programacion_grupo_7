from rest_framework import serializers
from .models import Producto, ProductoCarta, ProductoSobre, ProductoCaja

# Esto hacen los modelos a formato Jason 
class ProductoSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Producto
        fields = [
            'codigo_barras',
            'nombre',
            'descripcion',
            'stock',
            'precio_base',
            'categoria'
        ]
    def  create(self, validated_data):
        from django.db.models import Max
        
        # Obtener el máximo ID actual y sumar 1
        max_id = Producto.objects.aggregate(Max('id_producto'))['id_producto__max'] or 0
        validated_data['id_producto'] = max_id + 1
        
        return super().create(validated_data)
        
 # No se puede editar



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
