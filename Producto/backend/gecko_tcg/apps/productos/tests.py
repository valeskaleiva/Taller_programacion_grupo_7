from django.test import TestCase, SimpleTestCase
from decimal import Decimal
from apps.productos.models import Producto, ProductoCarta, ProductoSobre, ProductoCaja
from apps.productos.serializers import ProductoSerializer, ProductoCartaSerializer, ProductoSobreSerializer, ProductoCajaSerializer
from unittest.mock import patch, MagicMock
from rest_framework.test import APIClient
from django.core.exceptions import ValidationError

class ProductoStrTest(SimpleTestCase):

    

    def test_str_formato_correcto(self):
        producto = Producto(nombre="Pikachu", codigo_barras="PKM-001")
        self.assertEqual(str(producto), "Pikachu (PKM-001)")

    def test_str_nombre_compuesto(self):   
        producto = Producto(nombre="Carta Holográfica Rara", codigo_barras="PKM-999")
        self.assertEqual(str(producto), "Carta Holográfica Rara (PKM-999)")

class ProductoCartaStrTest(SimpleTestCase):
    def test_str_formato_carta(self):
        producto = Producto(nombre="Charizard")
        carta = ProductoCarta()
        carta.id_producto = producto
        self.assertEqual(str(carta), "Carta: " \
        "Charizard")

class ProductoSobreStrTest(SimpleTestCase):
    def test_str_formato_sobre(self):
        producto = Producto(nombre="Sobre de Evoluciones")
        sobre = ProductoSobre()
        sobre.id_producto = producto
        self.assertEqual(str(sobre), "Sobre: Sobre de Evoluciones")

class ProductoCajaStrTest(SimpleTestCase):
    def test_str_formato_caja(self):
        producto = Producto(nombre="Caja Elite Trainer")
        caja = ProductoCaja()
        caja.id_producto = producto
        self.assertEqual(str(caja), "Caja: Caja Elite Trainer")
# Create your tests here.


#testeos de los serializers, donde se combierte el formato a json y viceversa
# se va a ser un testeo a la validacin de campos y que esten bien ingresados

class ProductoSerializerTest(SimpleTestCase):
    def setUp(self):
        self.producto = Producto(
            codigo_barras="PKM-001",
            nombre="Pikachu V",
            descripcion="Carta básica",
            stock=10,
            precio_base=Decimal('15.00'),
            categoria='Carta'
        )
        self.data = ProductoSerializer(self.producto).data
    
    def test_contiene_campos_esperados(self):
        for campo in ['nombre', 'codigo_barras', 'stock', 'precio_base', 'categoria']:
            self.assertIn(campo, self.data)

    def test_valores_serializados_correctos(self):
        self.assertEqual(self.data['nombre'], "Pikachu V")
        self.assertEqual(self.data['codigo_barras'], "PKM-001")
        self.assertEqual(self.data['stock'], 10)

#----------- estó va hacer ls test de productos pero con las urls----

class BajoStockViewTest(SimpleTestCase):
    def setUp(self):
        self.client = APIClient()

    @patch('apps.productos.views.PuedeVerProductos.has_permission', return_value=True)
    @patch('apps.productos.views.Producto.objects')
    def test_responde_200(self, mock_manager, mock_permission):
        mock_manager.all.return_value = []
        mock_manager.filter.return_value = []
        response = self.client.get('/api/productos/bajo_stock/')
        self.assertEqual(response.status_code, 200)

    @patch('apps.productos.views.PuedeVerProductos.has_permission', return_value=True)
    @patch('apps.productos.views.Producto.objects')
    def test_responde_lista_vacia_si_no_hay_bajo_stock(self, mock_manager, mock_permission):
        mock_manager.all.return_value = []
        mock_manager.filter.return_value = []
        response = self.client.get('/api/productos/bajo_stock/')
        self.assertEqual(list(response.data), [])

    @patch('apps.productos.views.PuedeVerProductos.has_permission', return_value=True)
    @patch('apps.productos.views.Producto.objects')
    def test_solo_producto_con_stock_bajo_10(self, mock_manager, mock_permission):
        producto_bajo = Producto(
            id_producto=1, nombre="Pikachu", codigo_barras="001",
            stock=5, precio_base=Decimal('10.00'), categoria='Carta'
        )
        mock_manager.all.return_value = [producto_bajo]
        mock_manager.filter.return_value = [producto_bajo]
        response = self.client.get('/api/productos/bajo_stock/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

class ReducirStockViewTest(SimpleTestCase):
    def setUp(self):
        self.client = APIClient()
        mock_user = MagicMock(is_authenticated=True, is_staff=True)
        self.client.force_authenticate(user=mock_user)

    @patch('apps.productos.views.PuedeVerProductos.has_permission', return_value=True)
    @patch('apps.productos.views.ProductoViewSet.get_object')
    def test_reducir_stock_exitoso(self, mock_get_object, mock_permission):
        producto_mock = MagicMock(spec=Producto)
        producto_mock.stock = 20
        mock_get_object.return_value = producto_mock

        response = self.client.post(
            '/api/productos/1/reducir_stock/', 
            {'cantidad': 5}, 
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['stock_actual'], 15)
        producto_mock.save.assert_called_once()


    @patch('apps.productos.views.PuedeVerProductos.has_permission', return_value=True)
    @patch('apps.productos.views.ProductoViewSet.get_object')
    def test_reducir_stock_insuficiente_retorna_400(self, mock_get_object,mock_permission):
        producto_mock = MagicMock(spec=Producto)
        producto_mock.stock = 3
        mock_get_object.return_value = producto_mock

        response = self.client.post(
            '/api/productos/1/reducir_stock/', 
            {'cantidad': 10}, 
            format='json'
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)


# Test de validacione de modelo 
class ProductoValidacionTest(SimpleTestCase):

    def test_stock_negativo_es_invalido(self):
        producto = Producto(
            nombre="Pikachu", codigo_barras="001",
            stock=-1, precio_base=Decimal('10.00'), categoria='Carta'
        )
        with self.assertRaises(ValidationError):
            producto.full_clean(validate_unique=False)

    def test_categoria_invalida_es_rechazada(self):
        producto = Producto(
            nombre="Pikachu", codigo_barras="001",
            stock=5, precio_base=Decimal('10.00'), categoria='TipoInventado'
        )
        with self.assertRaises(ValidationError):
            producto.full_clean(validate_unique=False)
