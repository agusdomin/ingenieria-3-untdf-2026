from rest_framework import viewsets
from ..models import Observacion
from ..serializer import observacionSerializer


class ObservacionViewSet(viewsets.ModelViewSet):
    queryset = Observacion.objects.all()
    serializer_class = observacionSerializer
