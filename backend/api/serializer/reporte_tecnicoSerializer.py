from django.utils import timezone
from rest_framework import serializers
from ..models import ReporteTecnico
from .datosCampoSerializer import datosCampoSerializer


class reporte_tecnicoSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.ReadOnlyField(source='usuario.username')
    zona_nombre = serializers.ReadOnlyField(source='zona.nombre')
    fecha_hora = serializers.DateTimeField(required=False)
    datos_campo = datosCampoSerializer(required=False)

    class Meta:
        model = ReporteTecnico
        fields = [
            'id',
            'usuario',
            'usuario_nombre',
            'zona',
            'zona_nombre',
            'fecha_hora',
            'nivel_peligro_estimado',
            'diagnostico_resumen',
            'datos_campo',
            'datos_meteorologicos',
        ]
        read_only_fields = [
            'id',
            'usuario_nombre',
            'zona_nombre',
        ]

    def create(self, validated_data):
        if not validated_data.get('fecha_hora'):
            validated_data['fecha_hora'] = timezone.now()
        return super().create(validated_data)
