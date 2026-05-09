from django.urls import path, include
from rest_framework.routers import DefaultRouter, SimpleRouter
from .views import ReporteViewSet

router = SimpleRouter()
router.register(r'reportes', ReporteViewSet, basename='reporte')

urlpatterns = [
    path('', include(router.urls)),
]