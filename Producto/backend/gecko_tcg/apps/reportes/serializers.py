from rest_framework import serializers
from .models import Reporte
from django.contrib.auth.models import User

#reporte
class ReporteSerializer(serializers.ModelSerializer):

    #usuario
    usuario_username = serializers.CharField(
        source='id_usuario.username',
        read_only=True
    )
    usuario_id = serializers.PrimaryKeyRelatedField(
        source='id_usuario',
        queryset=User.objects.all(),
        write_only=True
    )
    
    # Tipo legible
    tipo_reporte_display = serializers.CharField(
        source='get_tipo_reporte_display',
        read_only=True
    )
    
    class Meta:
        model = Reporte
        fields = [
            'id_reporte',
            'tipo_reporte',
            'tipo_reporte_display',
            'fecha_reporte',
            'usuario_id',
            'usuario_username',
        ]
        read_only_fields = ['id_reporte', 'fecha_reporte', 'tipo_reporte_display']