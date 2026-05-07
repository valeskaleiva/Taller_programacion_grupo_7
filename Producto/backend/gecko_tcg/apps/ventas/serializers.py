from rest_framework import serializers
from .models import Venta, DetalleVenta
from django.contrib.auth.models import User
from apps.productos.models import Producto
from apps.productos.serializers import ProductoSerializer


#usuario 
class UsuarioMinimalSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


# detalle de venta
class DetalleVentaSerializer(serializers.ModelSerializer):
    
    producto = ProductoSerializer(source='id_producto', read_only=True)
    producto_id = serializers.PrimaryKeyRelatedField(
        source='id_producto',
        queryset=Producto.objects.all(),
        write_only=True
    )
    
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = DetalleVenta
        fields = [
            'id_detalle',
            'id_venta',
            'producto',
            'producto_id',
            'cantidad',
            'precio_unitario',
            'subtotal'
        ]
        read_only_fields = ['id_detalle', 'subtotal']
    
    def get_subtotal(self, obj):
        return obj.cantidad * obj.precio_unitario

# ventas detalle
class VentaSerializer(serializers.ModelSerializer):

    # datos del usuario que hace la vnta
    usuario = UsuarioMinimalSerializer(source='id_usuario', read_only=True)
    usuario_id = serializers.PrimaryKeyRelatedField(
        source='id_usuario',
        queryset=User.objects.all(),
        write_only=True
    )
    
    
    detalles = DetalleVentaSerializer(many=True, read_only=True)
    
    class Meta:
        model = Venta
        fields = [
            'id_venta',
            'fecha_venta',
            'usuario',
            'usuario_id',
            'total_pagado',
            'detalles'
        ]
        read_only_fields = ['id_venta', 'fecha_venta']


#crea ventas 
class VentaCreateSerializer(serializers.ModelSerializer):

    
    detalles = DetalleVentaSerializer(many=True, write_only=True)
    usuario_id = serializers.PrimaryKeyRelatedField(
        source='id_usuario',
        queryset=User.objects.all()
    )
    
    class Meta:
        model = Venta
        fields = ['usuario_id', 'total_pagado', 'detalles']
    
    def create(self, validated_data):
     
        detalles_data = validated_data.pop('detalles', [])
        
        # Calcula el total automáticamente
        total = sum(d['cantidad'] * d['precio_unitario'] for d in detalles_data)
        validated_data['total_pagado'] = total
        
        venta = Venta.objects.create(**validated_data)
        
        # detalles
        for detalle_data in detalles_data:
            DetalleVenta.objects.create(id_venta=venta, **detalle_data)
        
        return venta