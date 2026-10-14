from rest_framework import viewsets
from ..models import Usuario
from ..serializer import usuarioSerializer
from ..permissions import IsOwnerOrAdminOrReadOnly


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = usuarioSerializer
    permission_classes = [IsOwnerOrAdminOrReadOnly]

