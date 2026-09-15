from django.db import models
from django.contrib.auth.models import AbstractUser


class Usuario(AbstractUser):
    class Rol(models.TextChoices):
        COMUN = 'comun', 'Común'
        EXPERTO = 'experto', 'Experto'

    nombre = models.CharField(max_length=150, blank=True, null=True, verbose_name='Nombre')
    certificacion = models.CharField(max_length=255, blank=True, null=True, verbose_name='Certificación')
    rol = models.CharField(
        max_length=20,
        choices=Rol.choices,
        default=Rol.COMUN,
        verbose_name='Rol'
    )

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return f"{self.username} ({self.get_rol_display()})"
