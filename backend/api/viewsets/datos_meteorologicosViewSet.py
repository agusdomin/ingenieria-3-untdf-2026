from rest_framework import viewsets
from ..models import DatosMeteorologicos
from ..serializer import datos_meteorologicosSerializer


class DatosMeteorologicosViewSet(viewsets.ModelViewSet):
    queryset = DatosMeteorologicos.objects.all()
    serializer_class = datos_meteorologicosSerializer
