from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import DatosMeteorologicos
from ..serializer import datos_meteorologicosSerializer
from ..services.open_meteo import OpenMeteoService, OpenMeteoServiceError


class DatosMeteorologicosViewSet(viewsets.ModelViewSet):
    queryset = DatosMeteorologicos.objects.all()
    serializer_class = datos_meteorologicosSerializer

    def create(self, request, *args, **kwargs):
        """
        Permite enviar latitud y longitud (opcionales) sino usa default (Ushuaia).
        El backend consulta Open-Meteo o reutiliza el registro reciente en base de datos.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            instancia = serializer.save()
            headers = self.get_success_headers(serializer.data)
            return Response(
                self.get_serializer(instancia).data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )
        except OpenMeteoServiceError as e:
            return Response({'detail': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

    @action(detail=False, methods=['get'], url_path='actual')
    def actual(self, request):
        """
        Devuelve el clima actual para las coordenadas dadas (o Ushuaia por defecto).
        Aplica la ventana de caché de 60 minutos en la base de datos.
        """
        lat = request.query_params.get('lat') or request.query_params.get('latitud')
        lon = request.query_params.get('lon') or request.query_params.get('longitud')

        try:
            lat_float = float(lat) if lat is not None else None
            lon_float = float(lon) if lon is not None else None
        except ValueError:
            return Response(
                {'detail': 'Las coordenadas lat y lon deben ser números decimales válidos.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            instancia, _ = OpenMeteoService.obtener_o_consultar(
                latitud=lat_float,
                longitud=lon_float
            )
            serializer = self.get_serializer(instancia)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except OpenMeteoServiceError as e:
            return Response({'detail': str(e)}, status=status.HTTP_502_BAD_GATEWAY)
