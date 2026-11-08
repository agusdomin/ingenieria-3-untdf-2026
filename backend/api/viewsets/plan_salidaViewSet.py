from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from drf_spectacular.types import OpenApiTypes

from ..models import PlanSalida
from ..serializer import plan_salidaSerializer
from ..serializer.plan_salidaSerializer import TraficoZonaResponseSerializer
from ..utils.geo import punto_o_ruta_en_radio


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

    @extend_schema(
        summary="Consultar tráfico de personas en una zona",
        description=(
            "Calcula el número total de personas que se encuentran actualmente en curso "
            "dentro de un radio geográfico (en km) alrededor del punto (lat, lon) especificado."
        ),
        parameters=[
            OpenApiParameter(
                name='lat',
                type=OpenApiTypes.FLOAT,
                location=OpenApiParameter.QUERY,
                required=True,
                description='Latitud del centro de la zona a consultar (ej: -54.8019).'
            ),
            OpenApiParameter(
                name='lon',
                type=OpenApiTypes.FLOAT,
                location=OpenApiParameter.QUERY,
                required=True,
                description='Longitud del centro de la zona a consultar (ej: -68.3030).'
            ),
            OpenApiParameter(
                name='radio',
                type=OpenApiTypes.FLOAT,
                location=OpenApiParameter.QUERY,
                required=False,
                description='Radio de búsqueda en kilómetros. Por defecto es 5.0 km.'
            ),
        ],
        responses={
            200: TraficoZonaResponseSerializer,
            400: OpenApiResponse(description="Parámetros inválidos o faltantes (lat y lon son obligatorios)."),
            401: OpenApiResponse(description="No autenticado (requiere token)."),
        }
    )
    @action(detail=False, methods=['get'], url_path='trafico', permission_classes=[permissions.IsAuthenticated])
    def trafico(self, request):
        lat_raw = request.query_params.get('lat') or request.query_params.get('latitud')
        lon_raw = request.query_params.get('lon') or request.query_params.get('longitud')
        radio_raw = request.query_params.get('radio') or request.query_params.get('radio_km')

        if lat_raw is None or lon_raw is None:
            return Response(
                {'detail': 'Los parámetros lat y lon son obligatorios.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            lat = float(lat_raw)
            lon = float(lon_raw)
        except ValueError:
            return Response(
                {'detail': 'Las coordenadas lat y lon deben ser números decimales válidos.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        radio = 5.0
        if radio_raw is not None:
            try:
                radio = float(radio_raw)
                if radio <= 0:
                    raise ValueError()
            except ValueError:
                return Response(
                    {'detail': 'El radio debe ser un número positivo mayor a 0.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Consultamos solo los campos estrictamente necesarios (coordenadas y acompanantes)
        # de planes EN_CURSO para optimizar al maximo memoria y transferencia de la BD.
        planes_en_curso = PlanSalida.objects.filter(
            estado=PlanSalida.Estado.EN_CURSO
        ).values('coordenadas', 'cantidad_acompanantes')

        total_personas = 0
        for plan in planes_en_curso:
            if punto_o_ruta_en_radio(plan['coordenadas'], lat, lon, radio):
                acompanantes = plan['cantidad_acompanantes'] or 0
                total_personas += (1 + acompanantes)

        data = {
            'coordenadas': {
                'latitud': lat,
                'longitud': lon
            },
            'radio_km': radio,
            'total_personas': total_personas
        }
        return Response(data, status=status.HTTP_200_OK)
