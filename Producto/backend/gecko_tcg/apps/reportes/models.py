from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Reporte(models.Model):
    
    TIPO_REPORTE_CHOICES = [
        ('Ventas', 'Reporte de Ventas'),
        ('Inventario', 'Reporte de Inventario'),
        ('Productos_Bajos', 'Reporte de Productos con Stock Bajo'),
        ('Vendedores', 'Reporte de Desempeño de Vendedores'),
        ('Ganancias', 'Reporte de Ganancias'),
    ]
    
    id_reporte = models.AutoField(primary_key=True)
    fecha_reporte = models.DateTimeField(auto_now_add=True)
    tipo_reporte = models.CharField(
        max_length=50,
        choices=TIPO_REPORTE_CHOICES
    )
    id_usuario = models.ForeignKey(
        User,
        on_delete=models.PROTECT,  
        related_name='reportes'
    )
    descripcion = models.TextField(blank=True, null=True)
    datos_json = models.JSONField(blank=True, null=True) #datos 
    
    class Meta:
        db_table = 'REPORTE'
        verbose_name = 'Reporte'
        verbose_name_plural = 'Reportes'
        ordering = ['-fecha_reporte'] 
        indexes = [
            models.Index(fields=['tipo_reporte']),
            models.Index(fields=['id_usuario']),
        ]
    
    def __str__(self):
        return f"{self.get_tipo_reporte_display()} - {self.fecha_reporte.date()}"