from pathlib import Path
from uuid import uuid4

from django.db import models
from django.conf import settings
from django.utils import timezone


def observacion_imagen_path(instance, filename):
    """Genera un nombre independiente del nombre enviado por el cliente."""
    extension = Path(filename).suffix.lower()
    return f'observaciones/{uuid4()}{extension}'


class Observacion(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='observaciones', verbose_name='Usuario')
    coordenadas = models.JSONField(blank=True, null=True, verbose_name='Coordenadas')
    titulo = models.CharField(blank=True, null=True, max_length=200, verbose_name='Título')
    descripcion = models.TextField(blank=True, null=True, verbose_name='Descripción')
    foto_url = models.URLField(blank=True, null=True, max_length=500, verbose_name='URL de la foto')
    imagen = models.ImageField(upload_to=observacion_imagen_path, blank=True, null=True, verbose_name='Imagen')
    fecha_hora = models.DateTimeField(default=timezone.now, verbose_name='Fecha y hora')
    tipo = models.CharField(max_length=100, verbose_name='Tipo')
    nivel_relevancia = models.CharField(max_length=50, blank=True, null=True, verbose_name='Nivel de relevancia')

    class Meta:
        verbose_name = 'Observación'
        verbose_name_plural = 'Observaciones'
        ordering = ['-fecha_hora']

    def __str__(self):
        return f"{self.titulo or f'Observación #{self.id}'} ({self.usuario})"
