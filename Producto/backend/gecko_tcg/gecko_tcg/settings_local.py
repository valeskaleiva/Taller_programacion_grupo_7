from gecko_tcg.settings import *

# Configuracion temporal para desarrollo local sin Oracle.
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.local.sqlite3',
    }
}

# Evita bloqueo por permisos en logs/debug.log durante pruebas locales.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

ALLOWED_HOSTS = ['*']
