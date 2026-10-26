from rest_framework import serializers
from ..models import Certificacion


class certificacionSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.ReadOnlyField(source='usuario.username')
    revisado_por_nombre = serializers.ReadOnlyField(source='revisado_por.username', default=None)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    documento = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Certificacion
        fields = [
            'id',
            'usuario',
            'usuario_nombre',
            'titulo',
            'entidad_emisora',
            'fecha_emision',
            'documento',
            'estado',
            'estado_display',
            'observaciones',
            'fecha_subida',
            'fecha_revision',
            'revisado_por',
            'revisado_por_nombre',
        ]
        read_only_fields = [
            'id',
            'usuario',
            'usuario_nombre',
            'estado',
            'estado_display',
            'fecha_subida',
            'fecha_revision',
            'revisado_por',
            'revisado_por_nombre',
        ]

    def validate_documento(self, value):
        """Valida que el archivo no supere 10 MB y sea un formato aceptado (PDF o imagen)."""
        if value:
            limite_mb = 10
            if value.size > limite_mb * 1024 * 1024:
                raise serializers.ValidationError(f"El archivo no debe superar los {limite_mb} MB.")

            extensiones_validas = ['.pdf', '.png', '.jpg', '.jpeg', '.webp']
            nombre = value.name.lower()
            if not any(nombre.endswith(ext) for ext in extensiones_validas):
                raise serializers.ValidationError(
                    f"Formato no permitido. Solo se aceptan archivos: {', '.join(extensiones_validas)}"
                )
        return value
