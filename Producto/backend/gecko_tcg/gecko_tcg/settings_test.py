from gecko_tcg.settings import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

TEST_RUNNER = 'gecko_tcg.test_runner.UnmanagedModelTestRunner'

INSTALLED_APPS = [app for app in INSTALLED_APPS if app != 'apps.tcgplayer']
