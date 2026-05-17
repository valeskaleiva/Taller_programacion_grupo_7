from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from apps.reportes.models import Reporte
from apps.ventas.models import Venta, DetalleVenta
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


def crear_producto(id_prod=1, nombre='Carta Test', precio=Decimal('100.00'), stock=10, categoria='Carta'):
    return Producto.objects.create(
        id_producto=id_prod,
        codigo_barras=f'TEST{id_prod:04d}',
        nombre=nombre,
        descripcion='Producto de prueba',
        stock=stock,
        precio_base=precio,
        categoria=categoria
    )


#Tests unitarios MModelo

class ReporteModelTest(TestCase):

    def test_crear_reporte(self):
        admin = crear_admin(username='admin_rep', password='pass1234')
        reporte = Reporte.objects.create(
            id_reporte=1,
            tipo_reporte='Ventas',
            id_usuario=admin,
            descripcion='Reporte de prueba',
            datos_json={'total': 1000}
        )
        self.assertEqual(reporte.tipo_reporte, 'Ventas')
        self.assertIsNotNone(reporte.fecha_reporte)

#Tests de API

class ReportePermisoAPITest(APITestCase):

    def setUp(self):
        self.url_token = '/api/auth/token/'
        self.url_reportes = '/api/reportes/'
        self.vendedor = crear_vendedor(username='vend_rep', password='pass1234')
        self.admin = crear_admin(username='admin_rep', password='pass1234')

    def _token(self, username, password='pass1234'):
        response = self.client.post(self.url_token, {'username': username, 'password': password})
        return response.data['access']




    def setUp(self):
        self.url_token = '/api/auth/token/'
        self.admin = crear_admin(username='admin_acc', password='pass1234')
        self.vendedor = crear_vendedor(username='vend_acc', password='pass1234')
        self.producto = crear_producto(id_prod=1, stock=5)

    def _token(self, username, password='pass1234'):
        response = self.client.post(self.url_token, {'username': username, 'password': password})
        return response.data['access']

    def test_top_productos_vendidos(self):
        token = self._token('admin_acc')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/reportes/top_productos_vendidos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('titulo', response.data)
        self.assertIn('datos', response.data)
        self.assertIn('filtros', response.data)

    def test_productos_bajo_stock(self):
        token = self._token('admin_acc')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/reportes/productos_bajo_stock/')
        nombres = [p['nombre'] for p in response.data['datos']]
        self.assertIn('Carta Test', nombres)

    def test_ventas_diarias_con_datos_reales(self):
        venta = Venta.objects.create(
            total_pagado=Decimal('500.00'),
            id_usuario=self.admin
        )
        DetalleVenta.objects.create(
            id_venta=venta,
            id_producto=self.producto,
            cantidad=5,
            precio_unitario=Decimal('100.00')
        )
        token = self._token('admin_acc')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/reportes/ventas_diarias/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['datos']), 1)
        self.assertEqual(response.data['datos'][0]['transacciones'], 1)

    def test_vendedor_puede_acceder_a_reportes_de_lectura(self):
        token = self._token('vend_acc')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/reportes/ventas_diarias/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
