# MapContainer

Contenedor del mapa principal: MapLibre Native en builds propias de Android/iOS,
Leaflet en WebView dentro de Expo Go y Leaflet en web. La detección de Expo Go
ocurre antes de cargar MapLibre para evitar errores por módulos nativos ausentes.
El centro inicial es `[-68.30, -54.81]` (longitud, latitud), con zoom 11.
La pantalla principal selecciona la base topográfica OpenTopoMap al iniciar;
también permite alternar a OpenStreetMap. Ambas bases requieren conexión y
mantienen la atribución de sus proveedores.

## Interfaz

- `focusBounds`: límites `[oeste, sur, este, norte]`; una nueva referencia solicita
  encuadrar la zona con espacio para los controles. La búsqueda filtra una lista
  de resultados, conservando las zonas en el mapa para no reconstruirlo mientras
  se escribe. Seleccionar un resultado cierra lista/teclado y mueve la cámara;
  tocar el polígono sigue abriendo su detalle. GPS cancela el encuadre de búsqueda.

- `features`, `onZonePress`: polígonos GeoJSON de zonas y selección por ID.
- `mapStyle`: `terrain` o `street`.
- `userLocation`: coordenadas obtenidas por el consumidor; al cambiarlas se
  muestra un marcador y se centra la cámara con zoom 13.
- `onLocate`, `locating`: solicitud de GPS y estado de carga del botón. El
  consumidor administra permisos y mensajes de error.
- `zoomControlTop`: separación superior de los controles, incluyendo safe area.
- `onLoad`, `onError`: inicialización del visor y fallo de carga.
- `onMapPress`: coordenadas `[longitud, latitud]` de una pulsación.
- `onCameraChange`: centro y zoom al finalizar un movimiento.
- `children`: capas/fuentes MapLibre en nativo; overlays React en web. Los
  componentes de MapLibre no deben importarse en implementaciones web.

## Verificación manual

### Capa de riesgo (#79)

`RiskPolygonLayer.tsx` recibe `zones` (GeoJSON FeatureCollection de Polygon,
con propiedades `id`, `name` y `riskLevel`) y `onSelectZone(zoneId)`.
Se monta dentro de MapLibre y permite un `id` opcional para fuentes múltiples.
Los tipos públicos están en `RiskPolygonLayer.types.ts`, sin depender de mocks
ni importar módulos nativos. El relleno tiene opacidad 0.45 y borde de 2 puntos.
Usa `theme.risk`: extremo rojo, alto naranja, considerable amarillo, moderado
azul y bajo verde; valores desconocidos se muestran en gris.

En una development build, comprobar los cinco niveles en tema claro/oscuro y
tocar cada polígono para verificar su ID. En Expo Go/web continúa utilizándose
Leaflet; estas plataformas no validan la capa MapLibre.

### Contenedor (#78)

MapLibre requiere una development build que incluya el plugin configurado en
`app.json`. Expo Go utiliza el fallback Leaflet (requiere conexión para descargar
el motor desde unpkg y las imágenes del mapa). El GPS de la pantalla principal
conserva su botón original junto al selector de capas. La exportación del bundle Android no
sustituye la compilación ni la prueba en dispositivo.

1. Abrir el mapa en web y en una development build: verificar centro inicial,
   base topográfica y atribución.
2. Pulsar `+` y `−`, y hacer zoom con gestos; comprobar que los botones parten
   del zoom actual.
3. Solicitar GPS, conceder permisos y comprobar marcador y recentrado. Repetir
   después de desplazar el mapa.
4. Denegar permisos: debe aparecer el aviso de ubicación y seguir funcionando
   el mapa.
5. Seleccionar una zona y comprobar la navegación a su detalle.
6. Alternar la base callejera/topográfica y comprobar las capas de riesgo.
7. Verificar los callbacks de carga, pulsación y cámara desde un consumidor.

El fallback de coordenadas de desarrollo corresponde al issue #80.
