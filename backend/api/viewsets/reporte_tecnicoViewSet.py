from rest_framework import viewsets
from ..models import ReporteTecnico
from ..serializer import reporte_tecnicoSerializer
from ..permissions import IsExpertoOwnerOrAdminOrReadOnly


class ReporteTecnicoViewSet(viewsets.ModelViewSet):
    queryset = ReporteTecnico.objects.all()
    serializer_class = reporte_tecnicoSerializer
    permission_classes = [IsExpertoOwnerOrAdminOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


