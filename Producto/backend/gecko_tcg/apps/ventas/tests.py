from django.test import TestCase, SimpleTestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from apps.ventas.models import Venta, DetalleVenta
from apps.ventas.serializers import DetalleVentaSerializer
from apps.productos.models import Producto
from apps.usuarios.models import Rol, UsuarioGecko




def crear_rol(tipo='vendedor'):
    return Rol.objects.get_or_create(tipo=tipo, defaults={'descripcion': f'Rol {tipo}'})[0]


def crear_vendedor(username='vendedor1', password='pass1234'):
    rol = crear_rol('vendedor')
    user = User.objects.create_user(username=username, password=password, is_active=True)
    UsuarioGecko.objects.create(usuario=user, rol=rol, estado='activo')
    return user


def crear_admin(username='admin1', password='pass1234'):
    user = User.objects.create_user(username=username, password=password, is_staff=True, is_active=True)
    rol = crear_rol('admin')
    UsuarioGecko.objects.create(usuario=user, rol=rol, estado='activo')
    return user


def crear_producto(id_prod=1, nombre='Carta Test', precio=Decimal('100.00'), stock=10):
    return Producto.objects.create(
        id_producto=id_prod,
        codigo_barras=f'TEST{id_prod:04d}',
        nombre=nombre,
        descripcion='Producto de prueba',
        stock=stock,
        precio_base=precio,
        categoria='Carta'
    )




class DetalleVentaTestCase(SimpleTestCase):

    def test_subtotal_calculo_basico(self):
        detalle = DetalleVenta(cantidad=3, precio_unitario=Decimal('10.00'))
        self.assertEqual(detalle.subtotal, Decimal('30.00'))

    def test_subtotal_cantidad_grande(self):
        detalle = DetalleVenta(cantidad=5, precio_unitario=Decimal('999.99'))
        self.assertEqual(detalle.subtotal, Decimal('4999.95'))



class DetalleVentaSerializerTest(SimpleTestCase):

    def test_get_subtotal_basico(self):
        detalle = DetalleVenta(cantidad=3, precio_unitario=Decimal('10.00'))
        serializer = DetalleVentaSerializer()
        self.assertEqual(serializer.get_subtotal(detalle), Decimal('30.00'))



class VentaIntegracionTest(TestCase):

    def setUp(self):
        self.usuario = crear_admin(username='admin_integ', password='pass1234')
        self.producto = crear_producto(id_prod=1)

    def test_crear_detalle_venta_en_bd(self):
        venta = Venta.objects.create(
            total_pagado=Decimal('200.00'),
            id_usuario=self.usuario
        )
        detalle = DetalleVenta.objects.create(
            id_venta=venta,
            id_producto=self.producto,
            cantidad=2,
            precio_unitario=Decimal('100.00')
        )
        self.assertEqual(detalle.subtotal, Decimal('200.00'))
        self.assertEqual(venta.detalles.count(), 1)

    def test_eliminar_venta_elimina_sus_detalles(self):
        venta = Venta.objects.create(
            total_pagado=Decimal('100.00'),
            id_usuario=self.usuario
        )
        DetalleVenta.objects.create(
            id_venta=venta,
            id_producto=self.producto,
            cantidad=1,
            precio_unitario=Decimal('100.00')
        )
        venta.delete()
        self.assertEqual(DetalleVenta.objects.count(), 0)

    def test_venta_tiene_fecha_asignada_automaticamente(self):
        venta = Venta.objects.create(
            total_pagado=Decimal('50.00'),
            id_usuario=self.usuario
        )
        self.assertIsNotNone(venta.fecha_venta)


# ─── Tests de API: ventas ─────────────────────────────────────────────────────

class VentaAPITest(APITestCase):

    def setUp(self):
        self.url_token = '/api/auth/token/'
        self.url_ventas = '/api/ventas/'
        self.vendedor = crear_vendedor(username='vend_api', password='pass1234')
        self.admin = crear_admin(username='admin_api', password='pass1234')
        self.producto = crear_producto(id_prod=2)

    def _token(self, username, password='pass1234'):
        response = self.client.post(self.url_token, {'username': username, 'password': password})
        return response.data['access']


    def test_admin_puede_listar_ventas(self):
        token = self._token('admin_api')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(self.url_ventas)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


    def test_admin_ve_todas_las_ventas(self):
        Venta.objects.create(total_pagado=Decimal('100.00'), id_usuario=self.admin)
        Venta.objects.create(total_pagado=Decimal('200.00'), id_usuario=self.vendedor)

        token = self._token('admin_api')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(self.url_ventas)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_resumen_diario_retorna_estructura_correcta(self):
        token = self._token('admin_api')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/ventas/resumen_diario/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('fecha', response.data)
        self.assertIn('total_vendido', response.data)
        self.assertIn('cantidad_ventas', response.data)

    def test_resumen_mes_retorna_estructura_correcta(self):
        token = self._token('admin_api')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/ventas/resumen_mes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('mes', response.data)
        self.assertIn('total_vendido', response.data)
        self.assertIn('cantidad_ventas', response.data)
