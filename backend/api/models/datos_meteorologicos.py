from django.db import models
from django.utils import timezone


class DatosMeteorologicos(models.Model):
    temperatura = models.FloatField(blank=True, null=True, verbose_name='Temperatura (°C)')
    precipitaciones = models.FloatField(blank=True, null=True, verbose_name='Precipitaciones (mm)')
    fecha_hora = models.DateTimeField(default=timezone.now, verbose_name='Fecha y hora')
    nieve = models.FloatField(blank=True, null=True, verbose_name='Nieve (cm)')
    velocidad_viento = models.FloatField(blank=True, null=True, verbose_name='Velocidad del viento (km/h)')
    direccion_viento = models.CharField(blank=True, null=True, max_length=50, verbose_name='Dirección del viento')
    rafaga = models.FloatField(blank=True, null=True, verbose_name='Ráfaga (km/h)')
    humedad = models.FloatField(blank=True, null=True, verbose_name='Humedad (%)')

    class Meta:
        verbose_name = 'Dato meteorológico'
        verbose_name_plural = 'Datos meteorológicos'
        ordering = ['-fecha_hora']

