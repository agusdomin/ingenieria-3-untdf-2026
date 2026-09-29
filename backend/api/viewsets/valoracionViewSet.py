from rest_framework import viewsets
from ..models import Valoracion
from ..serializer import valoracionSerializer


class ValoracionViewSet(viewsets.ModelViewSet):
    queryset = Valoracion.objects.all()
    serializer_class = valoracionSerializer
