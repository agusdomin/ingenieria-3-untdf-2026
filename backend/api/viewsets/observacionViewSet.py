from rest_framework import viewsets
from ..models import Observacion
from ..serializer import observacionSerializer
from ..permissions import IsOwnerOrAdminOrReadOnly


class ObservacionViewSet(viewsets.ModelViewSet):
    queryset = Observacion.objects.all()
    serializer_class = observacionSerializer
    permission_classes = [IsOwnerOrAdminOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


