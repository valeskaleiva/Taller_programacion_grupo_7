from django.urls import include, path
from rest_framework.routers import SimpleRouter
from .views import UsuarioViewSet

router = SimpleRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')

urlpatterns = [
    path('', include(router.urls)),
]
