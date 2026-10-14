from rest_framework import viewsets
from ..models import PlanSalida
from ..serializer import plan_salidaSerializer
from ..permissions import IsOwnerOrAdminOrReadOnly


class PlanSalidaViewSet(viewsets.ModelViewSet):
    queryset = PlanSalida.objects.all()
    serializer_class = plan_salidaSerializer
    permission_classes = [IsOwnerOrAdminOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


