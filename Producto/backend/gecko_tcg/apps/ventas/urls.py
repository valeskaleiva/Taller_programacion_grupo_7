from django.urls import path, include
from rest_framework.routers import DefaultRouter, SimpleRouter
from .views import VentaViewSet, DetalleVentaViewSet

router = SimpleRouter()
router.register(r'ventas', VentaViewSet, basename='venta')
router.register(r'detalles', DetalleVentaViewSet, basename='detalle-venta')

urlpatterns = [
    path('', include(router.urls))
]