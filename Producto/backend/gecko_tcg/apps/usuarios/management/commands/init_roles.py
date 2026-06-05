from django.core.management.base import BaseCommand
from apps.usuarios.models import Rol


class Command(BaseCommand):
    help = 'Inicializa los roles del sistema'

    def handle(self, *args, **options):
        roles_data = [
            {'tipo': 'admin', 'descripcion': 'Administrador con acceso total'},
            {'tipo': 'vendedor', 'descripcion': 'Vendedor con acceso limitado'},
        ]
        
        for rol_data in roles_data:
            rol, created = Rol.objects.get_or_create(
                tipo=rol_data['tipo'],
                defaults={'descripcion': rol_data['descripcion']}
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Rol "{rol.get_tipo_display()}" creado')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'~ Rol "{rol.get_tipo_display()}" ya existe')
                )
        
        self.stdout.write(self.style.SUCCESS('✓ Inicialización de roles completada'))
