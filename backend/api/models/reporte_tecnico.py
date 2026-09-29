from django.db import models
from django.conf import settings
from django.utils import timezone
from .zona import Zona
from .datos_meteorologicos import DatosMeteorologicos


class ReporteTecnico(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reportes_tecnicos', verbose_name='Usuario elaborador')
    zona = models.ForeignKey(Zona, on_delete=models.CASCADE, related_name='reportes_tecnicos', verbose_name='Zona')
    fecha_hora = models.DateTimeField(default=timezone.now, verbose_name='Fecha y hora')
    nivel_peligro_estimado = models.CharField(blank=True, null=True, max_length=50, verbose_name='Nivel de peligro estimado')
    diagnostico_resumen = models.TextField(blank=True, null=True, verbose_name='Diagnóstico resumen')
    datos_campo = models.JSONField(default=dict, blank=True, null=True, verbose_name='Datos de campo')
    datos_meteorologicos = models.ForeignKey(DatosMeteorologicos,on_delete=models.SET_NULL,null=True,blank=True,related_name='reportes_tecnicos',verbose_name='Datos meteorológicos')

    class Meta:
        verbose_name = 'Reporte técnico'
        verbose_name_plural = 'Reportes técnicos'
        ordering = ['-fecha_hora']

    def __str__(self):
        return f"Reporte #{self.id} - {self.zona.nombre} ({self.fecha_hora.strftime('%d/%m/%Y')})"
