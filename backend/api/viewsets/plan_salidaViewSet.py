from rest_framework import viewsets, permissions
from ..models import PlanSalida
from ..serializer import plan_salidaSerializer


class PlanSalidaViewSet(viewsets.ModelViewSet):
    queryset = PlanSalida.objects.all()
    serializer_class = plan_salidaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return PlanSalida.objects.none()
        if user.is_staff or user.is_superuser:
            return PlanSalida.objects.all()
        return PlanSalida.objects.filter(usuario=user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


