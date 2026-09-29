from rest_framework import serializers


class TerrenoSerializer(serializers.Serializer):
    ubicacion_gps = serializers.CharField(required=False, allow_blank=True)
    altitud = serializers.IntegerField(required=False, allow_null=True)
    orientacion_ladera = serializers.CharField(required=False, allow_blank=True)
    inclinacion_pendiente = serializers.IntegerField(required=False, allow_null=True)
    forma_del_terreno = serializers.CharField(required=False, allow_blank=True)


class EstadoNieveSerializer(serializers.Serializer):
    espesor_total_manto = serializers.FloatField(required=False, allow_null=True)
    nieve_nueva_24h = serializers.FloatField(required=False, allow_null=True)
    hundimiento_pie = serializers.FloatField(required=False, allow_null=True)
    hundimiento_esqui = serializers.FloatField(required=False, allow_null=True)


class CapaDebilSerializer(serializers.Serializer):
    profundidad_capa_debil = serializers.FloatField(required=False, allow_null=True)
    grosor_capa_debil = serializers.FloatField(required=False, allow_null=True)
    dureza_de_la_nieve = serializers.CharField(required=False, allow_blank=True)
    tipo_de_grano = serializers.CharField(required=False, allow_blank=True)
    tamano_de_cristal = serializers.FloatField(required=False, allow_null=True)
    cantidad_de_limones = serializers.IntegerField(required=False, allow_null=True)


class PruebasEstabilidadSerializer(serializers.Serializer):
    test_compresion_ct = serializers.CharField(required=False, allow_blank=True)
    test_columna_extendida_ect = serializers.CharField(required=False, allow_blank=True)
    test_sierra_pst = serializers.CharField(required=False, allow_blank=True)
    calidad_de_deslizamiento_q = serializers.CharField(required=False, allow_blank=True)


class ClimaLocalSerializer(serializers.Serializer):
    temperatura_ambiente = serializers.FloatField(required=False, allow_null=True)
    temperatura_superficie_nieve = serializers.FloatField(required=False, allow_null=True)
    estado_del_cielo = serializers.CharField(required=False, allow_blank=True)
    fuerza_del_viento = serializers.CharField(required=False, allow_blank=True)
    direccion_del_viento = serializers.CharField(required=False, allow_blank=True)
    tipo_de_precipitacion = serializers.CharField(required=False, allow_blank=True)


class SenalesAlarmaSerializer(serializers.Serializer):
    sonidos_de_colapso_whumpfs = serializers.BooleanField(required=False, default=False)
    grietas_en_superficie = serializers.BooleanField(required=False, default=False)
    avalanchas_recientes = serializers.CharField(required=False, allow_blank=True)


class datosCampoSerializer(serializers.Serializer):
    terreno = TerrenoSerializer(required=False)
    estado_nieve = EstadoNieveSerializer(required=False)
    capa_debil = CapaDebilSerializer(required=False)
    pruebas_estabilidad = PruebasEstabilidadSerializer(required=False)
    clima_local = ClimaLocalSerializer(required=False)
    senales_alarma = SenalesAlarmaSerializer(required=False)


# Alias de compatibilidad
DatosCampoSerializer = datosCampoSerializer
