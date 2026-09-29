from django.utils import timezone
from rest_framework import serializers
from ..models import Observacion


class observacionSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.ReadOnlyField(source='usuario.username')
    zona_nombre = serializers.ReadOnlyField(source='zona.nombre')
    fecha_hora = serializers.DateTimeField(required=False)

    class Meta:
        model = Observacion
        fields = [
            'id',
            'usuario',
            'usuario_nombre',
            'zona',
            'zona_nombre',
            'titulo',
            'descripcion',
            'foto_url',
            'fecha_hora',
            'tipo',
            'nivel_relevancia',
        ]
        read_only_fields = [
            'id',
            'usuario_nombre',
            'zona_nombre',
        ]

    def create(self, validated_data):
        # Si no viene fecha, se le asigna la actual
        if not validated_data.get('fecha_hora'):
            validated_data['fecha_hora'] = timezone.now()
        return super().create(validated_data)
