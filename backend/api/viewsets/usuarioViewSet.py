from rest_framework import viewsets
from ..models import Usuario
from ..serializer import usuarioSerializer


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = usuarioSerializer
