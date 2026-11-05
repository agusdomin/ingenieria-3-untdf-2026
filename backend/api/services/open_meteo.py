import logging
from datetime import timedelta
from typing import Optional, Tuple
import requests

from django.conf import settings
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from ..models import DatosMeteorologicos

logger = logging.getLogger(__name__)


class OpenMeteoServiceError(Exception):
    """Excepción lanzada cuando ocurre un error al comunicarse con Open-Meteo."""
    pass


def grados_a_cardinal(grados: Optional[float]) -> Optional[str]:
    """
    Convierte un valor de dirección del viento en grados (0° a 360°)
    a su rumbo cardinal en español (8 rumbos principales: N, NE, E, SE, S, SO, O, NO)
    acompañado del valor angular exacto para máxima claridad y precisión.
    Ejemplo: 240.0 -> 'SO (240°)'
    """
    if grados is None:
        return None

    grados_norm = float(grados) % 360
    grados_enteros = int(round(grados_norm))
    if grados_enteros == 360:
        grados_enteros = 0

    rumbos = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']
    # Cada sector abarca 360 / 8 = 45 grados
    indice = round(grados_norm / 45.0) % 8
    rumbo = rumbos[indice]

    return f"{rumbo} ({grados_enteros}°)"


class OpenMeteoService:
    """
    Servicio para consultar la API de Open-Meteo y persistir mediciones meteorológicas.
    Implementa caché en base de datos para no sobrecargar las peticiones externas.
    """

    @classmethod
    def obtener_o_consultar(
        cls,
        latitud: Optional[float] = None,
        longitud: Optional[float] = None,
        forzar: bool = False
    ) -> Tuple[DatosMeteorologicos, bool]:
        """
        Obtiene los datos meteorológicos para una latitud y longitud.
        
        Si no se proporcionan coordenadas, se utilizan las de Ushuaia por defecto.
        Si existe un registro en la BD dentro de la ventana de caché (por defecto 60 min)
        y `forzar` es False, se reutiliza dicho registro (created=False).
        De lo contrario, se consulta a Open-Meteo, se persiste y se retorna (created=True).

        Retorna:
            (instancia_datos_meteorologicos, created: bool)
        """
        # 1. Resolver coordenadas por defecto si no vienen
        default_lat = getattr(settings, 'OPEN_METEO_DEFAULT_LATITUDE', -54.8019)
        default_lon = getattr(settings, 'OPEN_METEO_DEFAULT_LONGITUDE', -68.3030)

        lat = round(float(latitud), 4) if latitud is not None else round(float(default_lat), 4)
        lon = round(float(longitud), 4) if longitud is not None else round(float(default_lon), 4)

        ventana_minutos = getattr(settings, 'OPEN_METEO_CACHE_MINUTES', 60)
        tiempo_limite = timezone.now() - timedelta(minutes=ventana_minutos)

        # 2. Revisar si ya existe un registro reciente en BD (Opción A acordada)
        if not forzar:
            # Tolerancia de ~0.005 grados (aprox 500 metros) para considerar la misma zona
            registro_reciente = DatosMeteorologicos.objects.filter(
                latitud__gte=lat - 0.005,
                latitud__lte=lat + 0.005,
                longitud__gte=lon - 0.005,
                longitud__lte=lon + 0.005,
                fecha_hora__gte=tiempo_limite
            ).order_by('-fecha_hora').first()

            if registro_reciente:
                logger.info(
                    f"Reutilizando datos meteorológicos en BD (ID: {registro_reciente.id}) "
                    f"para lat={lat}, lon={lon} de hace {(timezone.now() - registro_reciente.fecha_hora).total_seconds() / 60:.1f} min."
                )
                return registro_reciente, False

        # 3. Si no existe o expiró la ventana, consultar la API de Open-Meteo
        base_url = getattr(settings, 'OPEN_METEO_BASE_URL', 'https://api.open-meteo.com/v1/forecast')
        tz_name = getattr(settings, 'OPEN_METEO_TIMEZONE', 'America/Argentina/Ushuaia')

        params = {
            'latitude': lat,
            'longitude': lon,
            'current': (
                'temperature_2m,'
                'relative_humidity_2m,'
                'precipitation,'
                'snowfall,'
                'snow_depth,'
                'wind_speed_10m,'
                'wind_direction_10m,'
                'wind_gusts_10m'
            ),
            'timezone': tz_name,
        }

        try:
            response = requests.get(base_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
        except requests.RequestException as exc:
            logger.error(f"Error al conectar con Open-Meteo: {exc}")
            raise OpenMeteoServiceError(f"No se pudo obtener información meteorológica de Open-Meteo: {str(exc)}") from exc

        current = data.get('current')
        if not current:
            raise OpenMeteoServiceError("La respuesta de Open-Meteo no incluyó el bloque de datos 'current'.")

        # 4. Transformar los campos al formato del modelo
        # Open-Meteo snowfall viene en cm
        nieve_fresca = current.get('snowfall')
        
        # Open-Meteo snow_depth viene en metros -> convertir a cm
        raw_snow_depth = current.get('snow_depth')
        espesor_nieve = round(raw_snow_depth * 100.0, 2) if raw_snow_depth is not None else None

        # Dirección del viento: grados a cardinal
        raw_wind_direction = current.get('wind_direction_10m')
        direccion_viento = grados_a_cardinal(raw_wind_direction)

        # Fecha y hora
        time_str = current.get('time')
        fecha_hora = parse_datetime(time_str) if time_str else timezone.now()
        if fecha_hora and timezone.is_naive(fecha_hora):
            fecha_hora = timezone.make_aware(fecha_hora, timezone.get_current_timezone())

        # 5. Persistir en la base de datos
        nuevo_registro = DatosMeteorologicos.objects.create(
            latitud=lat,
            longitud=lon,
            temperatura=current.get('temperature_2m'),
            precipitaciones=current.get('precipitation'),
            fecha_hora=fecha_hora or timezone.now(),
            nieve_fresca=nieve_fresca,
            espesor_nieve=espesor_nieve,
            velocidad_viento=current.get('wind_speed_10m'),
            direccion_viento=direccion_viento,
            rafaga=current.get('wind_gusts_10m'),
            humedad=current.get('relative_humidity_2m'),
        )

        logger.info(f"Nuevo registro DatosMeteorologicos #{nuevo_registro.id} guardado desde Open-Meteo para ({lat}, {lon}).")
        return nuevo_registro, True

