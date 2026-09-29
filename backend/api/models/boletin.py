from django.db import models
from django.conf import settings
from django.utils import timezone
from .zona import Zona
from .reporte_tecnico import ReporteTecnico


class Boletin(models.Model):
    class Estado(models.TextChoices):
        BORRADOR = 'borrador', 'Borrador'
        PUBLICADO = 'publicado', 'Publicado'
        ARCHIVADO = 'archivado', 'Archivado'

    reporte_tecnico = models.ForeignKey(ReporteTecnico,on_delete=models.CASCADE,related_name='boletines',verbose_name='Reporte técnico base')
    zona = models.ForeignKey(Zona,on_delete=models.CASCADE,related_name='boletines',verbose_name='Zona')
    autor = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True,related_name='boletines_creados',verbose_name='Autor/Pronosticador')

    estado = models.CharField(max_length=20,choices=Estado.choices,default=Estado.BORRADOR,verbose_name='Estado de publicación')
    fecha_emision = models.DateTimeField(default=timezone.now, verbose_name='Fecha y hora de emisión')
    valido_desde = models.DateField(default=timezone.now, verbose_name='Válido desde')
    valido_hasta = models.DateField(verbose_name='Válido hasta')
    validez_texto = models.CharField(max_length=255,blank=True,verbose_name='Texto de validez (ej: Lunes 14, Martes 15 y Miércoles 16)')

    # 1. Nivel de Peligro General
    nivel_peligro = models.IntegerField(
        choices=[(1, '1 - Bajo'), (2, '2 - Moderado'), (3, '3 - Considerable'), (4, '4 - Fuerte'), (5, '5 - Muy Fuerte')],
        default=1,
        verbose_name='Nivel de peligro general'
    )
    descripcion_peligro = models.TextField(blank=True, verbose_name='Descripción del peligro')
    confianza_pronostico = models.CharField(
        max_length=20,
        choices=[('baja', 'Baja'), ('media', 'Media'), ('alta', 'Alta')],
        default='alta',
        verbose_name='Confianza en el pronóstico'
    )

    # 2. Problema Principal de Avalanchas
    problema_principal = models.CharField(max_length=255, verbose_name='Título del problema principal')
    descripcion_problema_principal = models.TextField(verbose_name='Descripción detallada del problema principal')
    otros_problemas = models.TextField(blank=True, verbose_name='Otros problemas relevantes')

    # 3. Resumen Meteorológico público
    resumen_nevada = models.TextField(blank=True, verbose_name='Resumen de nevada')
    resumen_viento = models.TextField(blank=True, verbose_name='Resumen de viento')
    resumen_temperatura = models.TextField(blank=True, verbose_name='Resumen de temperaturas')

    # 4. Zonificación y Gráficos (Orientación, Altitud, Distribución espacial)
    # JSON con sectores críticos (ej: {"N": "alto", "NE": "alto", "E": "alto", "SE": "medio", ...})
    orientacion_peligro = models.JSONField(default=dict, blank=True, verbose_name='Peligro por orientación')
    # JSON con franjas altitudinales (ej: {"alto": ">700m", "medio": "400-700m", "bajo": "<400m"})
    peligro_altitud = models.JSONField(default=dict, blank=True, verbose_name='Peligro por altitud')
    distribucion_espacial = models.TextField(blank=True, verbose_name='Distribución espacial (zonas de mayor preocupación)')

    # 5. Barra Inferior de Evaluación de Estabilidad
    reactividad_manto = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Reactividad del manto (ej: Muy sensible, Reactiva, No reactiva)'
    )
    distribucion_problema = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Distribución del problema (ej: Generalizada, Específica, Puntual/Aislada)'
    )
    probabilidad_desencadenamiento = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Probabilidad de desencadenamiento (ej: Casi seguro, Muy probable, Posible, Improbable)'
    )

    class Meta:
        verbose_name = 'Boletín de avalanchas'
        verbose_name_plural = 'Boletines de avalanchas'
        ordering = ['-fecha_emision']

    def save(self, *args, **kwargs):
        # Asigna automáticamente la zona del reporte técnico si no se especificó manualmente
        if self.reporte_tecnico and not self.zona_id:
            self.zona = self.reporte_tecnico.zona
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Boletín #{self.id} - {self.zona.nombre} (Peligro: {self.nivel_peligro})"
