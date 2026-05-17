from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
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



class RolModelTest(TestCase):


    def test_crear_rol_admin(self):
        rol = Rol.objects.create(tipo='admin', descripcion='Administrador')
        self.assertEqual(rol.tipo, 'admin')



class UsuarioGeckoModelTest(TestCase):

    def test_crear_usuario_gecko(self):
        rol = crear_rol('vendedor')
        user = User.objects.create_user(username='test_user', password='pass1234')
        perfil = UsuarioGecko.objects.create(usuario=user, rol=rol, estado='activo')
        self.assertEqual(perfil.estado, 'activo')
        self.assertEqual(perfil.rol.tipo, 'vendedor')




class LoginAPITest(APITestCase):

    def setUp(self):
        self.url = '/api/auth/token/'
        self.vendedor = crear_vendedor(username='vendedor_login', password='pass1234')
        self.admin = crear_admin(username='admin_login', password='pass1234')

    def test_login_admin_valido(self):
        response = self.client.post(self.url, {'username': 'admin_login', 'password': 'pass1234'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_login_password_incorrecta(self):
        response = self.client.post(self.url, {'username': 'vendedor_login', 'password': 'incorrecta'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_sin_perfil_gecko(self):
        User.objects.create_user(username='sin_perfil', password='pass1234')
        response = self.client.post(self.url, {'username': 'sin_perfil', 'password': 'pass1234'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)




class PermisosUsuarioAPITest(APITestCase):

    def setUp(self):
        self.vendedor = crear_vendedor(username='vend_permisos', password='pass1234')
        self.admin = crear_admin(username='admin_permisos', password='pass1234')
        self.url_token = '/api/auth/token/'
        self.url_usuarios = '/api/usuarios/'

    def _token(self, username, password):
        response = self.client.post(self.url_token, {'username': username, 'password': password})
        return response.data['access']

    def test_sin_token_retorna_401(self):
        response = self.client.get(self.url_usuarios)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_puede_crear_usuario(self):
        token = self._token('admin_permisos', 'pass1234')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        data = {'username': 'nuevo_user', 'email': 'nuevo@test.com', 'password': 'pass1234', 'rol_tipo': 'vendedor'}
        response = self.client.post(self.url_usuarios, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
