from rest_framework import serializers
from ..models import Zona


class zonaSerializer(serializers.ModelSerializer):
    creador_nombre = serializers.ReadOnlyField(source='creador.username')
    zona_padre_nombre = serializers.ReadOnlyField(source='zona_padre.nombre')


    class Meta:
        model = Zona
        fields = [
            'id',
            'creador',
            'creador_nombre',
            'zona_padre',
            'zona_padre_nombre',
            'nombre',
            'descripcion',
            'geometria',
            'altura',
            'es_multizona',
            'nivel_actual_peligro',
            'problema_principal',
            'resumen_diagnostico',
            'ultima_actualizacion',
        ]
        read_only_fields = [
            'id',
            'ultima_actualizacion',
            'creador_nombre',
            'zona_padre_nombre',
            'nivel_actual_peligro',
            'problema_principal',
            'resumen_diagnostico',
            'ultima_actualizacion',    # Se deja como read_only; la lógica de actualización se manejará al asociar reportes a la zona
        ]
