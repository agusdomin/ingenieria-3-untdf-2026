from rest_framework import serializers
from ..models import DatosMeteorologicos
from ..services.open_meteo import OpenMeteoService, OpenMeteoServiceError


class datos_meteorologicosSerializer(serializers.ModelSerializer):
    latitud = serializers.FloatField(required=False, allow_null=True)
    longitud = serializers.FloatField(required=False, allow_null=True)

    class Meta:
        model = DatosMeteorologicos
        fields = [
            'id',
            'latitud',
            'longitud',
            'temperatura',
            'precipitaciones',
            'fecha_hora',
            'nieve_fresca',
            'espesor_nieve',
            'velocidad_viento',
            'direccion_viento',
            'rafaga',
            'humedad',
        ]
        read_only_fields = [
            'id',
            'temperatura',
            'precipitaciones',
            'fecha_hora',
            'nieve_fresca',
            'espesor_nieve',
            'velocidad_viento',
            'direccion_viento',
            'rafaga',
            'humedad',
        ]

    def create(self, validated_data):
        latitud = validated_data.get('latitud')
        longitud = validated_data.get('longitud')
        try:
            instancia, _ = OpenMeteoService.obtener_o_consultar(
                latitud=latitud,
                longitud=longitud
            )
            return instancia
        except OpenMeteoServiceError as e:
            raise serializers.ValidationError({'detail': str(e)})
