from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from apps.productos.models import Producto

#VENTA
class Venta(models.Model):
    id_venta = models.BigIntegerField(primary_key=True)
    fecha_venta = models.DateTimeField(auto_now_add=True)  # Se asigna automáticamente
    total_pagado = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    id_usuario = models.ForeignKey(
        User,
        on_delete=models.PROTECT,  
        related_name='ventas'
    )
    
    class Meta:
        db_table = 'VENTA'
        managed = False
        verbose_name = 'Venta'
        verbose_name_plural = 'Ventas'
        ordering = ['-fecha_venta']  

    def __str__(self):
        return f"Venta #{self.id_venta} - {self.fecha_venta.date()}"


#Detalle venta 
class DetalleVenta(models.Model):
    
    id_detalle = models.BigIntegerField(primary_key=True)
    id_venta = models.ForeignKey(
        Venta,
        on_delete=models.CASCADE,  
        related_name='detalles'
    )
    id_producto = models.ForeignKey(
        Producto,
        on_delete=models.PROTECT,  
        related_name='detalles_venta'
    )
    cantidad = models.IntegerField(validators=[MinValueValidator(1)])
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'DETALLE_VENTA'
        managed = True
        verbose_name = 'Detalle Venta'
        verbose_name_plural = 'Detalles Venta'
        unique_together = ['id_venta', 'id_producto']  # No duplicar producto en misma venta
    
    def __str__(self):
        return f"Detalle de Venta #{self.id_venta.id_venta}"
    
    @property
    def subtotal(self):
        return self.cantidad * self.precio_unitario