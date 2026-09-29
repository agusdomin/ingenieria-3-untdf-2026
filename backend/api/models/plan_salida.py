from django.db import models
from django.conf import settings
from .zona import Zona


class PlanSalida(models.Model):
    class Estado(models.TextChoices):
        PENDIENTE = 'pendiente', 'Pendiente'
        EN_CURSO = 'en_curso', 'En curso'
        FINALIZADO = 'finalizado', 'Finalizado'
        CANCELADO = 'cancelado', 'Cancelado'

    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='planes_salida', verbose_name='Usuario declarante')
    zona = models.ForeignKey(Zona, on_delete=models.CASCADE, related_name='planes_salida', verbose_name='Zona')
    fecha_hora_inicio = models.DateTimeField(verbose_name='Fecha y hora de inicio')
    fecha_hora_retorno = models.DateTimeField(verbose_name='Fecha y hora de retorno')
    cantidad_acompanantes = models.PositiveIntegerField(default=0, verbose_name='Cantidad de acompañantes')
    itinerario_descripcion = models.TextField(verbose_name='Descripción del itinerario')
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.PENDIENTE, verbose_name='Estado')

    class Meta:
        verbose_name = 'Plan de salida'
        verbose_name_plural = 'Planes de salida'
        ordering = ['-fecha_hora_inicio']

    def __str__(self):
        return f"Plan #{self.id} - {self.usuario} ({self.zona.nombre})"
