from rest_framework import serializers
from .models import Venta, DetalleVenta
from django.contrib.auth.models import User
from apps.productos.models import Producto
from apps.productos.serializers import ProductoSerializer
from django.db.models import F, Max
from django.db import transaction


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
        read_only_fields = ['id_detalle', 'id_venta', 'subtotal']
    
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
        fields = ['id_venta', 'fecha_venta', 'usuario_id', 'total_pagado', 'detalles']
        read_only_fields = ['id_venta', 'fecha_venta', 'total_pagado']

    def validate(self, attrs):
        detalles_data = attrs.get('detalles', [])
        if not detalles_data:
            raise serializers.ValidationError({'detalles': 'Debes agregar al menos un producto.'})

        for detalle in detalles_data:
            producto = detalle['id_producto']
            cantidad = int(detalle['cantidad'])
            if cantidad <= 0:
                raise serializers.ValidationError({'detalles': 'La cantidad debe ser mayor a 0.'})
            if producto.stock < cantidad:
                raise serializers.ValidationError(
                    {'detalles': f'Stock insuficiente para {producto.nombre}. Disponible: {producto.stock}.'}
                )

        return attrs
    
    def create(self, validated_data):

        detalles_data = validated_data.pop('detalles', [])

        with transaction.atomic():
            # Revalidar stock dentro de la transacción para evitar carreras
            producto_ids = [detalle['id_producto'].id_producto for detalle in detalles_data]
            productos_db = {
                p.id_producto: p
                for p in Producto.objects.select_for_update().filter(id_producto__in=producto_ids)
            }

            for detalle in detalles_data:
                producto = productos_db.get(detalle['id_producto'].id_producto)
                cantidad = int(detalle['cantidad'])
                if not producto:
                    raise serializers.ValidationError({'detalles': 'Producto no encontrado.'})
                if producto.stock < cantidad:
                    raise serializers.ValidationError(
                        {'detalles': f'Stock insuficiente para {producto.nombre}. Disponible: {producto.stock}.'}
                    )

            # Calcula el total automáticamente
            total = sum(d['cantidad'] * d['precio_unitario'] for d in detalles_data)
            validated_data['total_pagado'] = total

            # Generate next ID for Venta
            last_id = Venta.objects.aggregate(Max('id_venta'))['id_venta__max'] or 0
            validated_data['id_venta'] = last_id + 1

            venta = Venta.objects.create(**validated_data)

            # Generate next ID for DetalleVenta and create details while reducing stock
            last_detalle_id = DetalleVenta.objects.aggregate(Max('id_detalle'))['id_detalle__max'] or 0

            for detalle_data in detalles_data:
                last_detalle_id += 1
                detalle_data['id_detalle'] = last_detalle_id
                DetalleVenta.objects.create(id_venta=venta, **detalle_data)

                producto_db = productos_db[detalle_data['id_producto'].id_producto]
                producto_db.stock -= int(detalle_data['cantidad'])
                producto_db.save(update_fields=['stock'])

        return venta