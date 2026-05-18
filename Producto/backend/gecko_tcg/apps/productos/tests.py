from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from apps.productos.models import Producto, ProductoCaja
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




class ProductoModelTest(TestCase):

    def test_crear_producto(self):
        producto = crear_producto(id_prod=1, nombre='Charizard', precio=Decimal('50000.00'), stock=5)
        self.assertEqual(producto.nombre, 'Charizard')
        self.assertEqual(producto.stock, 5)
        self.assertEqual(producto.precio_base, Decimal('50000.00'))


class ProductoCajaModelTest(TestCase):

    def test_crear_producto_caja(self):
        producto = crear_producto(id_prod=1, nombre='Caja Elite', categoria='Caja')
        caja = ProductoCaja.objects.create(id_producto=producto, cant_sobres=36)
        self.assertEqual(caja.cant_sobres, 36)
        self.assertIn('Caja Elite', str(caja))

    def test_caja_se_elimina_al_eliminar_producto(self):
        producto = crear_producto(id_prod=1, nombre='Caja Booster', categoria='Caja')
        ProductoCaja.objects.create(id_producto=producto, cant_sobres=24)
        producto.delete()
        self.assertEqual(ProductoCaja.objects.count(), 0)




class ProductoAPITest(APITestCase):

    def setUp(self):
        self.url_token = '/api/auth/token/'
        self.url_productos = '/api/productos/'
        self.vendedor = crear_vendedor(username='vend_prod', password='pass1234')
        self.admin = crear_admin(username='admin_prod', password='pass1234')
        self.producto = crear_producto(id_prod=1, stock=10)

    def _token(self, username, password='pass1234'):
        response = self.client.post(self.url_token, {'username': username, 'password': password})
        return response.data['access']

    def test_vendedor_puede_listar_productos(self):
        token = self._token('vend_prod')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(self.url_productos)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


    def test_vendedor_no_puede_crear_productos(self):
        token = self._token('vend_prod')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        data = {
            'id_producto': 99,
            'codigo_barras': 'NUEVO001',
            'nombre': 'Producto Nuevo',
            'stock': 5,
            'precio_base': '1000.00',
            'categoria': 'Carta'
        }
        response = self.client.post(self.url_productos, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_buscar_por_codigo_existente(self):
        token = self._token('vend_prod')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/productos/por_codigo/', {'codigo': 'TEST0001'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'Carta Test')

    def test_reducir_stock_exitoso(self):
        token = self._token('admin_prod')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(
            f'/api/productos/{self.producto.id_producto}/reducir_stock/',
            {'cantidad': 3}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock, 7)

    def test_bajo_stock_retorna_productos_con_menos_de_10(self):
        crear_producto(id_prod=2, nombre='Producto Escaso', stock=3)
        token = self._token('admin_prod')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/productos/bajo_stock/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        nombres = [p['nombre'] for p in response.data]
        self.assertIn('Producto Escaso', nombres)
        self.assertNotIn('Carta Test', nombres)
