from rest_framework import viewsets
from ..models import PlanSalida
from ..serializer import plan_salidaSerializer


class PlanSalidaViewSet(viewsets.ModelViewSet):
    queryset = PlanSalida.objects.all()
    serializer_class = plan_salidaSerializer
