from django.db import models
from django.conf import settings
from django.utils import timezone


class PlanSalida(models.Model):
    class Estado(models.TextChoices):
        PENDIENTE = 'pendiente', 'Pendiente'
        EN_CURSO = 'en_curso', 'En curso'
        FINALIZADO = 'finalizado', 'Finalizado'
        CANCELADO = 'cancelado', 'Cancelado'

    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='planes_salida', verbose_name='Usuario declarante')
    coordenadas = models.JSONField(blank=True, null=True, verbose_name='Coordenadas')
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
        return f"Plan #{self.id} - {self.usuario}"

    @classmethod
    def actualizar_estados(cls):
        """
        Actualiza en la base de datos los estados de los planes según la fecha y hora actual:
        - PENDIENTE -> EN_CURSO si fecha_hora_inicio <= ahora <= fecha_hora_retorno.
        - PENDIENTE / EN_CURSO -> FINALIZADO si ahora > fecha_hora_retorno.
        (Respeta los planes cancelados).
        """
        ahora = timezone.now()

        # 1. Pasar a EN_CURSO los pendientes cuyo horario ya comenzó
        cls.objects.filter(
            estado=cls.Estado.PENDIENTE,
            fecha_hora_inicio__lte=ahora,
            fecha_hora_retorno__gte=ahora
        ).update(estado=cls.Estado.EN_CURSO)

        # 2. Pasar a FINALIZADO los que ya superaron su fecha de retorno
        cls.objects.filter(
            estado__in=[cls.Estado.PENDIENTE, cls.Estado.EN_CURSO],
            fecha_hora_retorno__lt=ahora
        ).update(estado=cls.Estado.FINALIZADO)

    def save(self, *args, **kwargs):
        # Si el plan no fue cancelado ni finalizado manualmente, determinar el estado según fecha actual
        if self.estado not in [self.Estado.CANCELADO, self.Estado.FINALIZADO]:
            if self.fecha_hora_inicio and self.fecha_hora_retorno:
                ahora = timezone.now()
                if self.fecha_hora_retorno < ahora:
                    self.estado = self.Estado.FINALIZADO
                elif self.fecha_hora_inicio <= ahora <= self.fecha_hora_retorno:
                    self.estado = self.Estado.EN_CURSO
                elif self.fecha_hora_inicio > ahora:
                    self.estado = self.Estado.PENDIENTE
        super().save(*args, **kwargs)
