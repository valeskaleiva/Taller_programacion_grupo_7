from django.db import models
from django.contrib.auth.models import User

class Rol(models.Model):
    TIPO_CHOICES = [
        ('admin', 'Administrador'),
        ('vendedor', 'Vendedor'),
    ]
    
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES, unique=True)
    descripcion = models.CharField(max_length=255, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Rol'
        verbose_name_plural = 'Roles'
        ordering = ['tipo']
    
    def __str__(self):
        return self.get_tipo_display()


class UsuarioGecko(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil_gecko')
    rol = models.ForeignKey(Rol, on_delete=models.SET_NULL, null=True, blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    estado = models.CharField(
        max_length=10,
        choices=[('activo', 'Activo'), ('inactivo', 'Inactivo')],
        default='activo'
    )
    puesto = models.CharField(max_length=255, blank=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    direccion = models.CharField(max_length=500, blank=True)
    bio = models.TextField(blank=True)
    avatar = models.TextField(blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Usuario Gecko TCG'
        verbose_name_plural = 'Usuarios Gecko TCG'
        ordering = ['-creado_en']
    
    def __str__(self):
        return f"{self.usuario.username} - {self.rol}"
