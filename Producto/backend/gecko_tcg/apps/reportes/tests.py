from django.test import SimpleTestCase
from rest_framework.test import APIClient
from unittest.mock import patch, MagicMock
from django.contrib.auth.models import User
import time 

# pruebas de integracion 
class ReporteIntegracionTest(SimpleTestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = MagicMock(spec=User, is_authenticated=True, is_staff=True)
        self.client.force_authenticate(user=self.user)

    @patch('apps.reportes.views.DetalleVenta.objects')
    def test_top_productos_responde_estructura_correcta(self, mock_detalles):
        mock_detalles.all.return_value.values.return_value.annotate.return_value.order_by.return_value.__getitem__.return_value = [
            {'id_producto__nombre': 'Charizard', 'cantidad_vendida': 10, 'veces_vendido': 3},
            {'id_producto__nombre': 'Pikachu', 'cantidad_vendida': 5, 'veces_vendido': 2},
        ]
        response = self.client.get('/api/reportes/top_productos_vendidos/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('titulo', response.data)
        self.assertIn('datos', response.data)
        self.assertIn('filtros', response.data)

    @patch('apps.reportes.views.Producto.objects')
    def test_productos_bajo_stock_responde_estructura_correcta(self, mock_productos):
        mock_productos.filter.return_value.values.return_value.order_by.return_value = []
        response = self.client.get('/api/reportes/productos_bajo_stock/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('titulo', response.data)
        self.assertIn('cantidad_productos', response.data)
        self.assertIn('datos', response.data)

    def test_usuario_no_autenticado_recibe_403(self):
        client_sin_auth = APIClient()
        response = client_sin_auth.get('/api/reportes/top_productos_vendidos/')
        self.assertIn(response.status_code, [401, 403])

#Pruebas de rendimiento 

class ReporteRendimientoTest(SimpleTestCase):

    def setUp(self):
        self.client = APIClient()
        user = MagicMock(is_authenticated=True, is_staff=True)
        self.client.force_authenticate(user=user)

    @patch('apps.reportes.views.Venta.objects')
    def test_ventas_diarias_responde_en_menos_de_1_segundo(self, mock_ventas):
        # Simula 500 ventas distribuidas en fechas distintas
        from datetime import datetime, timezone as tz
        from decimal import Decimal

        ventas_simuladas = [
            {
                'fecha_venta': datetime(2024, 1, i % 28 + 1, tzinfo=tz.utc),
                'total_pagado': Decimal('15000.00')
            }
            for i in range(500)
        ]
        mock_ventas.all.return_value.filter.return_value.values.return_value.order_by.return_value = ventas_simuladas
        mock_ventas.all.return_value.values.return_value.order_by.return_value = ventas_simuladas

        inicio = time.time()
        response = self.client.get('/api/reportes/ventas_diarias/')
        duracion = time.time() - inicio

        self.assertEqual(response.status_code, 200)
        self.assertLess(duracion, 1.0)  # este test tiene que responder en menos de un segundo CR