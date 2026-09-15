from django.db import models
from django.conf import settings


class Zona(models.Model):
    creador = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='zonas',
        verbose_name='Creado por'
    )
    zona_padre = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subzonas',
        verbose_name='Zona contenedora'
    )
    nombre = models.CharField(max_length=200, verbose_name='Nombre')
    descripcion = models.TextField(blank=True, default='', verbose_name='Descripción')
    geometria = models.JSONField(
        blank=True,
        null=True,
        help_text='Polígono en formato GeoJSON o lista de coordenadas',
        verbose_name='Geometría'
    )
    altura = models.IntegerField(blank=True, null=True, verbose_name='Altura (msnm)')
    es_multizona = models.BooleanField(default=False, verbose_name='Es multizona')
    nivel_actual_peligro = models.CharField(
        max_length=50,
        blank=True,
        default='',
        verbose_name='Nivel actual de peligro'
    )
    problema_principal = models.CharField(
        max_length=255,
        blank=True,
        default='',
        verbose_name='Problema principal'
    )
    resumen_diagnostico = models.TextField(
        blank=True,
        default='',
        verbose_name='Resumen de diagnóstico'
    )
    ultima_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name='Última actualización'
    )

    class Meta:
        verbose_name = 'Zona'
        verbose_name_plural = 'Zonas'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre
