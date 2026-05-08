from django.db import models
from django.core.validators import MinValueValidator


class Producto(models.Model):
    
    CATEGORIA_CHOICES = [
        ('Carta', 'Carta Individual'),
        ('Sobre', 'Sobre de Cartas'),
        ('Caja', 'Caja de Sobres'),
    ]
    
    id_producto = models.AutoField(primary_key=True)
    codigo_barras = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=200)
    descripcion = models.CharField(max_length=500, blank=True)
    stock = models.IntegerField(validators=[MinValueValidator(0)])
    precio_base = models.DecimalField(max_digits=10, decimal_places=2)
    categoria = models.CharField(max_length=30, choices=CATEGORIA_CHOICES)
    
    class Meta:
        db_table = 'PRODUCTO'
        managed = False
        verbose_name = 'Producto' #admin
        verbose_name_plural = 'Productos'
    
    def __str__(self):
        return f"{self.nombre} ({self.codigo_barras})"


class ProductoCarta(models.Model):

    
    RAREZA_CHOICES = [
        ('Común', 'Común'),
        ('Poco Común', 'Poco Común'),
        ('Rara', 'Rara'),
        ('Muy Rara', 'Muy Rara'),
        ('Holográfica', 'Holográfica'),
    ]
    
    ESTADO_CHOICES = [
        ('Nueva', 'Nueva'),
        ('Excelente', 'Excelente'),
        ('Buena', 'Buena'),
        ('Usada', 'Usada'),
        ('Dañada', 'Dañada'),
    ]
    
    id_producto = models.OneToOneField(
        Producto, 
        on_delete=models.CASCADE, 
        primary_key=True,
        related_name='carta'
    )
    rareza = models.CharField(max_length=50, choices=RAREZA_CHOICES)
    edicion = models.CharField(max_length=100)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES)
    precio_mercado = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    class Meta:
        db_table = 'PRODUCTO_CARTA'
        managed = False
        verbose_name = 'Producto Carta'
        verbose_name_plural = 'Productos Cartas'
    
    def __str__(self):
        return f"Carta: {self.id_producto.nombre}"


class ProductoSobre(models.Model):
    
    id_producto = models.OneToOneField(
        Producto,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='sobre'
    )
    cant_cartas = models.IntegerField(validators=[MinValueValidator(1)])
    serie = models.CharField(max_length=200)
    
    class Meta:
        db_table = 'PRODUCTO_SOBRE'
        managed = False
        verbose_name = 'Producto Sobre'
        verbose_name_plural = 'Productos Sobres'
    
    def __str__(self):
        return f"Sobre: {self.id_producto.nombre}"


class ProductoCaja(models.Model):
 
    id_producto = models.OneToOneField(
        Producto,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='caja'
    )
    cant_sobres = models.IntegerField(validators=[MinValueValidator(1)])
    
    class Meta:
        db_table = 'PRODUCTO_CAJA'
        managed = False
        verbose_name = 'Producto Caja'
        verbose_name_plural = 'Productos Cajas'
    
    def __str__(self):
        return f"Caja: {self.id_producto.nombre}"