from rest_framework import viewsets
from ..models import ReporteTecnico
from ..serializer import reporte_tecnicoSerializer


class ReporteTecnicoViewSet(viewsets.ModelViewSet):
    queryset = ReporteTecnico.objects.all()
    serializer_class = reporte_tecnicoSerializer
