import math
from typing import Any, List, Optional, Tuple


def calcular_distancia_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calcula la distancia geodésica en kilómetros entre dos coordenadas
    utilizando la fórmula de Haversine.
    """
    radio_tierra_km = 6371.0

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2.0) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return radio_tierra_km * c


def _extraer_puntos(data: Any) -> List[Tuple[float, float]]:
    """
    Extrae recursivamente pares (latitud, longitud) a partir de diversas
    estructuras posibles de JSON (dict de puntos, lista de puntos, GeoJSON).
    """
    puntos: List[Tuple[float, float]] = []

    if isinstance(data, dict):
        # 1. Caso estándar: {"lat": ..., "lng": ...} o {"latitude": ..., "longitude": ...}
        lat = data.get('lat') if 'lat' in data else data.get('latitude')
        lon = data.get('lng') if 'lng' in data else data.get('lon', data.get('longitude'))

        if lat is not None and lon is not None:
            try:
                puntos.append((float(lat), float(lon)))
            except (ValueError, TypeError):
                pass

        # 2. Caso GeoJSON: {"type": "Point", "coordinates": [lon, lat]}
        if data.get('type') == 'Point' and isinstance(data.get('coordinates'), (list, tuple)):
            coords = data['coordinates']
            if len(coords) >= 2:
                try:
                    puntos.append((float(coords[1]), float(coords[0])))
                except (ValueError, TypeError):
                    pass

        # 3. Caso dict con lista interna (ej: {"puntos": [...]}, {"coordinates": [...]})
        for key in ('puntos', 'coordinates', 'route', 'trayecto'):
            if key in data and isinstance(data[key], list):
                puntos.extend(_extraer_puntos(data[key]))

    elif isinstance(data, (list, tuple)):
        # Si es una lista de 2 números: [lat, lon]
        if len(data) == 2 and all(isinstance(x, (int, float)) for x in data):
            puntos.append((float(data[0]), float(data[1])))
        else:
            # Si es una lista de elementos (dict u otras listas)
            for item in data:
                puntos.extend(_extraer_puntos(item))

    return puntos


def punto_o_ruta_en_radio(
    coordenadas: Any,
    centro_lat: float,
    centro_lon: float,
    radio_km: float
) -> bool:
    """
    Determina si alguna coordenada dentro de la estructura de datos
    se encuentra a una distancia menor o igual al radio (en km) del punto central.
    """
    if not coordenadas:
        return False

    puntos = _extraer_puntos(coordenadas)
    if not puntos:
        return False

    for lat, lon in puntos:
        distancia = calcular_distancia_km(centro_lat, centro_lon, lat, lon)
        if distancia <= radio_km:
            return True

    return False

