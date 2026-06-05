from django.test.runner import DiscoverRunner
from django.apps import apps


class UnmanagedModelTestRunner(DiscoverRunner):

    def setup_databases(self, **kwargs):
        self._unmanaged_models = []
        for model in apps.get_models():
            if not model._meta.managed:
                model._meta.managed = True
                self._unmanaged_models.append(model)

        old_config = super().setup_databases(**kwargs)

        from django.db import connection
        with connection.schema_editor() as editor:
            for model in self._unmanaged_models:
                try:
                    editor.create_model(model)
                except Exception:
                    pass

        return old_config

    def teardown_databases(self, old_config, **kwargs):
        super().teardown_databases(old_config, **kwargs)
        for model in self._unmanaged_models:
            model._meta.managed = False
