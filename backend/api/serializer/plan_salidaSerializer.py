from rest_framework import serializers
from ..models import PlanSalida


class plan_salidaSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.ReadOnlyField(source='usuario.username')
    zona_nombre = serializers.ReadOnlyField(source='zona.nombre')
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)

    class Meta:
        model = PlanSalida
        fields = [
            'id',
            'usuario',
            'usuario_nombre',
            'zona',
            'zona_nombre',
            'fecha_hora_inicio',
            'fecha_hora_retorno',
            'cantidad_acompanantes',
            'itinerario_descripcion',
            'estado',
            'estado_display',
        ]
        read_only_fields = [
            'id',
            'usuario_nombre',
            'zona_nombre',
            'estado_display',
        ]

    def validate(self, data):
        inicio = data.get('fecha_hora_inicio')
        retorno = data.get('fecha_hora_retorno')
        if inicio and retorno and retorno <= inicio:
            raise serializers.ValidationError({
                'fecha_hora_retorno': 'La fecha y hora de retorno debe ser posterior a la de inicio.'
            })
        return data
