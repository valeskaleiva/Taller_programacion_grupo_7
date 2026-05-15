from django.test import TestCase
from django.test import SimpleTestCase
from decimal import Decimal
from apps.ventas.models import DetalleVenta
from apps.ventas.serializers import DetalleVentaSerializer



#porsiacaso cabros estos son test de unitest osea no integran bsd y son aisladas
# si lo van a ejecutar pongan --verbosity 2-- para que se vea cada test en la terminal
class DetalleVentaTestCase(SimpleTestCase): #aqui se va a verificar los test de DetalleVenta

    def test_subtotal_calculo_basico(self):
        detalle = DetalleVenta(cantidad=3, precio_unitario=Decimal('10.00'))
        self.assertEqual(detalle.subtotal, Decimal('30.00'))

    def test_subtotal_cantidad_uno(self):
        detalle = DetalleVenta(cantidad=1, precio_unitario=Decimal('150.99'))
        self.assertEqual(detalle.subtotal, Decimal('150.99'))

    def test_subtotal_cantidad_grande(self):
        detalle = DetalleVenta(cantidad = 5, precio_unitario=Decimal('999.99'))
        self.assertEqual(detalle.subtotal, Decimal('4999.95'))

    def test_subtotal_precio_decimal(self):
        detalle = DetalleVenta(cantidad=2, precio_unitario=Decimal('7.50'))
        self.assertEqual(detalle.subtotal, Decimal('15.00'))

# Aquí van los test del serializers de venta 

class DetalleVentaSerializerTest(SimpleTestCase):

    def test_get_subtotal_basico(self):
        detalle = DetalleVenta(cantidad=3, precio_unitario=Decimal('10.00'))
        serializer = DetalleVentaSerializer()
        resultado = serializer.get_subtotal(detalle)
        self.assertEqual(resultado, Decimal('30.00'))

    def test_get_subtotal_decimales(self):
        detalle = DetalleVenta(cantidad=2, precio_unitario=Decimal('7.50'))
        serializer = DetalleVentaSerializer()
        resultado = serializer.get_subtotal(detalle)
        self.assertEqual(resultado, Decimal('15.00'))
    
    def test_get_subtotal_cantidad_uno(self):
        detalle = DetalleVenta(cantidad=1, precio_unitario=Decimal('299.99'))
        serializer = DetalleVentaSerializer()
        resultado = serializer.get_subtotal(detalle)
        self.assertEqual(resultado, Decimal('299.99'))

# Create your tests here.