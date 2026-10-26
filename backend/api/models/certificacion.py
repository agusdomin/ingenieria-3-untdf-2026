from django.db import models
from django.conf import settings
from django.utils import timezone


class Certificacion(models.Model):
    class Estado(models.TextChoices):
        PENDIENTE = 'pendiente', 'Pendiente de revisión'
        APROBADA = 'aprobada', 'Aprobada'
        RECHAZADA = 'rechazada', 'Rechazada'

    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='certificaciones', verbose_name='Usuario')
    titulo = models.CharField(max_length=200, verbose_name='Título o nombre de la certificación')
    entidad_emisora = models.CharField(max_length=200, blank=True, null=True, verbose_name='Institución o entidad emisora')
    fecha_emision = models.DateField(blank=True, null=True, verbose_name='Fecha de emisión')
    documento = models.FileField(upload_to='certificaciones/', blank=True, null=True, verbose_name='Documento probatorio (PDF/Imagen)')
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.PENDIENTE, verbose_name='Estado de validación')
    observaciones = models.TextField(blank=True, null=True, verbose_name='Observaciones de revisión')
    fecha_subida = models.DateTimeField(default=timezone.now, verbose_name='Fecha de carga')
    fecha_revision = models.DateTimeField(blank=True, null=True, verbose_name='Fecha de revisión')
    revisado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='certificaciones_revisadas', verbose_name='Revisado por')

    class Meta:
        verbose_name = 'Certificación'
        verbose_name_plural = 'Certificaciones'
        ordering = ['-fecha_subida']

    def __str__(self):
        return f"{self.titulo} - {self.usuario.username} ({self.get_estado_display()})"
