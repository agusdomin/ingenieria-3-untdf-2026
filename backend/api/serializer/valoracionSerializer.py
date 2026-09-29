from rest_framework import serializers
from ..models import Valoracion


class valoracionSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.ReadOnlyField(source='usuario.username')
    fecha_hora = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Valoracion
        fields = [
            'id',
            'usuario',
            'usuario_nombre',
            'reporte_tecnico',
            'calificacion',
            'comentario',
            'fecha_hora',
        ]
        read_only_fields = [
            'id',
            'usuario_nombre',
            'fecha_hora',
        ]
