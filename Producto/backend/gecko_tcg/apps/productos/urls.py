from django.urls import path, include
from rest_framework.routers import DefaultRouter, SimpleRouter
from .views import (
    ProductoViewSet,
    ProductoCartaViewSet,
    ProductoSobreViewSet,
    ProductoCajaViewSet
)

router = SimpleRouter()
router.register(r'productos', ProductoViewSet, basename='producto')
router.register(r'cartas', ProductoCartaViewSet, basename='productocarta')
router.register(r'sobres', ProductoSobreViewSet, basename='productosobre')
router.register(r'cajas', ProductoCajaViewSet, basename='productocaja')

urlpatterns = [
    path('', include(router.urls)),
]