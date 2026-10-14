from rest_framework import viewsets
from ..models import Valoracion
from ..serializer import valoracionSerializer
from ..permissions import IsOwnerOrAdminOrReadOnly


class ValoracionViewSet(viewsets.ModelViewSet):
    queryset = Valoracion.objects.all()
    serializer_class = valoracionSerializer
    permission_classes = [IsOwnerOrAdminOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


