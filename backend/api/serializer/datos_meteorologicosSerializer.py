from django.utils import timezone
from rest_framework import serializers
from ..models import DatosMeteorologicos


class datos_meteorologicosSerializer(serializers.ModelSerializer):
    fecha_hora = serializers.DateTimeField(required=False)

    class Meta:
        model = DatosMeteorologicos
        fields = [
            'id',
            'temperatura',
            'precipitaciones',
            'fecha_hora',
            'nieve',
            'velocidad_viento',
            'direccion_viento',
            'rafaga',
            'humedad',
        ]
        read_only_fields = [
            'id',
        ]

    def create(self, validated_data):
        # Si no viene fecha al crear la medición, se le asigna la actual
        if not validated_data.get('fecha_hora'):
            validated_data['fecha_hora'] = timezone.now()
        return super().create(validated_data)
