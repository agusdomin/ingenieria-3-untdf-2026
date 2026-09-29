from rest_framework import viewsets
from ..models import Zona
from ..serializer import zonaSerializer


class ZonaViewSet(viewsets.ModelViewSet):
    queryset = Zona.objects.all()
    serializer_class = zonaSerializer
