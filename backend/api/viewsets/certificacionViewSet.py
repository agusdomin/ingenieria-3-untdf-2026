from django.db import models
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiResponse
from ..models import Certificacion, Usuario
from ..serializer import (
    certificacionSerializer,
    CertificacionRevisarRequestSerializer,
    CertificacionRevisarResponseSerializer,
)
from ..permissions import IsOwnerOrAdminOrReadOnly



class CertificacionViewSet(viewsets.ModelViewSet):
    queryset = Certificacion.objects.all()
    serializer_class = certificacionSerializer
    permission_classes = [IsOwnerOrAdminOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        qs = Certificacion.objects.all().select_related('usuario', 'revisado_por')

        # Si no es administrador, solo ve certificaciones aprobadas públicas
        # más las propias (aunque estén pendientes o rechazadas)
        if not (user.is_authenticated and (user.is_staff or user.is_superuser)):
            if user.is_authenticated:
                qs = qs.filter(models.Q(estado=Certificacion.Estado.APROBADA) | models.Q(usuario=user))
            else:
                qs = qs.filter(estado=Certificacion.Estado.APROBADA)

        # Filtro por usuario (ej: /api/certificaciones/?usuario=2)
        usuario_id = self.request.query_params.get('usuario')
        if usuario_id:
            qs = qs.filter(usuario_id=usuario_id)

        # Filtro por estado (ej: /api/certificaciones/?estado=pendiente)
        estado = self.request.query_params.get('estado')
        if estado:
            qs = qs.filter(estado=estado)

        return qs

    def perform_create(self, serializer):
        serializer.save(
            usuario=self.request.user,
            estado=Certificacion.Estado.PENDIENTE
        )

    @extend_schema(
        summary="Bandeja de certificaciones pendientes",
        description="Retorna todas las certificaciones que se encuentran en estado 'pendiente'. Requiere rol Administrador.",
        responses={200: certificacionSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def pendientes(self, request):
        """
        Bandeja de entrada rápida para administradores.
        Retorna todas las certificaciones pendientes de revisión.
        """
        qs = Certificacion.objects.filter(
            estado=Certificacion.Estado.PENDIENTE
        ).select_related('usuario')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Revisar certificación y promover a experto",
        description=(
            "Permite a un administrador aprobar o rechazar una certificación.\n\n"
            "Si se envía `promover_a_experto: true` y el nuevo estado es `aprobada`, "
            "el usuario titular es automáticamente promovido al rol 'experto'."
        ),
        request=CertificacionRevisarRequestSerializer,
        responses={
            200: CertificacionRevisarResponseSerializer,
            400: OpenApiResponse(description="Estado inválido."),
            401: OpenApiResponse(description="No autenticado."),
            403: OpenApiResponse(description="No autorizado (solo administradores)."),
            404: OpenApiResponse(description="Certificación no encontrada."),
        }
    )
    @action(detail=True, methods=['patch', 'post'], permission_classes=[permissions.IsAdminUser])
    def revisar(self, request, pk=None):

        """
        Permite a un administrador aprobar o rechazar una certificación.
        Opcionalmente permite graduar al usuario a 'experto' en el mismo paso si se envía
        {"promover_a_experto": true}.
        """
        certificacion = self.get_object()
        nuevo_estado = request.data.get('estado')
        observaciones = request.data.get('observaciones', '')
        promover_a_experto = request.data.get('promover_a_experto', False)

        if nuevo_estado not in [Certificacion.Estado.APROBADA, Certificacion.Estado.RECHAZADA]:
            return Response(
                {
                    'detail': f"Estado inválido. Opciones válidas: {[Certificacion.Estado.APROBADA, Certificacion.Estado.RECHAZADA]}"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        certificacion.estado = nuevo_estado
        if observaciones:
            certificacion.observaciones = observaciones
        certificacion.fecha_revision = timezone.now()
        certificacion.revisado_por = request.user
        certificacion.save()

        # Si se aprobó y se solicitó la promoción a experto, actualiza el rol del usuario
        usuario_promovido = False
        if nuevo_estado == Certificacion.Estado.APROBADA and str(promover_a_experto).lower() in ['true', '1']:
            usuario = certificacion.usuario
            if usuario.rol != Usuario.Rol.EXPERTO:
                usuario.rol = Usuario.Rol.EXPERTO
                usuario.save(update_fields=['rol'])
                usuario_promovido = True

        mensaje = f"Certificación #{certificacion.id} actualizada a '{certificacion.get_estado_display()}'."
        if usuario_promovido:
            mensaje += f" El usuario '{certificacion.usuario.username}' fue graduado a Experto."

        return Response(
            {
                'detail': mensaje,
                'usuario_promovido': usuario_promovido,
                'certificacion': certificacionSerializer(certificacion).data
            },
            status=status.HTTP_200_OK
        )


