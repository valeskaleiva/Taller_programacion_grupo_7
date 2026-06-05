# ... Todo tu código actual de settings.py (DATABASES, MIDDLEWARE, etc.) ...

# ==============================================================================
# DOCKER PATCH (Colócalo al final del archivo)
# ==============================================================================
# -*- coding: utf-8 -*-
# Docker Patch: Convierte los links de paginacion internos a localhost para el navegador
from django.http import HttpRequest

_original_get_host = HttpRequest.get_host

def _patched_get_host(self):
    host = _original_get_host(self)
    return 'localhost:8000' if host == 'backend:8000' else host

HttpRequest.get_host = _patched_get_host