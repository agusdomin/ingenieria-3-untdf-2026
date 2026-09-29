from django.db import models
from django.conf import settings
from django.utils import timezone
from .reporte_tecnico import ReporteTecnico


class Valoracion(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='valoraciones', verbose_name='Usuario')
    reporte_tecnico = models.ForeignKey(ReporteTecnico, on_delete=models.CASCADE, related_name='valoraciones', verbose_name='Reporte técnico')
    calificacion = models.CharField(blank=True, null=True, max_length=50, verbose_name='Calificación')
    comentario = models.TextField(blank=True, null=True, verbose_name='Comentario')
    fecha_hora = models.DateTimeField(default=timezone.now, verbose_name='Fecha y hora')

    class Meta:
        verbose_name = 'Valoración'
        verbose_name_plural = 'Valoraciones'
        ordering = ['-fecha_hora']

    def __str__(self):
        return f"Valoración de {self.usuario} al Reporte #{self.reporte_tecnico_id}"
