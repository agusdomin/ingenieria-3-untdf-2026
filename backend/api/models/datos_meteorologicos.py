from django.db import models
from django.utils import timezone


class DatosMeteorologicos(models.Model):
    latitud = models.FloatField(blank=True, null=True, verbose_name='Latitud')
    longitud = models.FloatField(blank=True, null=True, verbose_name='Longitud')
    temperatura = models.FloatField(blank=True, null=True, verbose_name='Temperatura (°C)')
    precipitaciones = models.FloatField(blank=True, null=True, verbose_name='Precipitaciones (mm)')
    fecha_hora = models.DateTimeField(default=timezone.now, verbose_name='Fecha y hora')
    nieve_fresca = models.FloatField(blank=True, null=True, verbose_name='Nieve fresca (cm)')
    espesor_nieve = models.FloatField(blank=True, null=True, verbose_name='Espesor del manto (cm)')
    velocidad_viento = models.FloatField(blank=True, null=True, verbose_name='Velocidad del viento (km/h)')
    direccion_viento = models.CharField(blank=True, null=True, max_length=50, verbose_name='Dirección del viento')
    rafaga = models.FloatField(blank=True, null=True, verbose_name='Ráfaga (km/h)')
    humedad = models.FloatField(blank=True, null=True, verbose_name='Humedad (%)')

    class Meta:
        verbose_name = 'Dato meteorológico'
        verbose_name_plural = 'Datos meteorológicos'
        ordering = ['-fecha_hora']

    def __str__(self):
        coords = f"({self.latitud}, {self.longitud})" if self.latitud is not None and self.longitud is not None else ""
        return f"Dato meteorológico {self.fecha_hora.strftime('%d/%m/%Y %H:%M')} {coords}".strip()


