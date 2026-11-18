import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, TileLayer } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { binocularsSvg } from '../../components/map/markerIcons';

import { useTheme } from '../../theme/useTheme';
import {
  INITIAL_CENTER,
  INITIAL_ZOOM,
  type MapContainerProps,
} from '../../components/map/MapContainer.types';

export function BaseMap({
  focusBounds,
  mapStyle,
  userLocation,
  selectedLocation,
  zoomControlTop,
  zoomControlBottom,
  onLoad,
  onError,
  onMapPress,
  onCameraChange,
  events,
  onEventPress,
  trafficArea,
  observationAreas,
  onObservationAreaPress,
}: MapContainerProps) {
  const { theme } = useTheme();

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const zoomPositionRef = useRef<HTMLElement | null>(null);

  const [error, setError] = useState(false);
  const [mapVersion, setMapVersion] = useState(0);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let disposed = false;
    let group: import('leaflet').LayerGroup | undefined;
    void import('leaflet').then((L) => {
      if (disposed) return;
      group = L.layerGroup().addTo(map);
      for (const area of observationAreas ?? []) {
        L.geoJSON(area.feature, { style: { color: area.feature.properties?.color, weight: 2, fillOpacity: 0.22 }, bubblingMouseEvents: false })
          .on('click', () => onObservationAreaPress?.(area.id)).addTo(group);
      }
      if (trafficArea) {
        L.circle([trafficArea.coordenadas.latitud, trafficArea.coordenadas.longitud], {
          radius: trafficArea.radio_km * 1000, color: '#7254A3', fillOpacity: 0.12, interactive: false,
        }).bindTooltip(`${trafficArea.total_personas} personas en salidas · ${trafficArea.radio_km} km`, { permanent: true }).addTo(group);
      }
      for (const item of events ?? []) {
        const label = document.createElement('span');
        label.textContent = item.title;
        const icon = L.divIcon({ className: '', iconSize: [32, 32], iconAnchor: [16, 16],
          html: `<span style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border:2px solid white;border-radius:${item.kind === 'report' ? '5px' : '50%'};background:${item.color};color:white;font:bold 15px sans-serif">${item.kind === 'report' ? 'R' : binocularsSvg}</span>` });
        L.marker([item.coordinate[1], item.coordinate[0]], { icon, title: item.title, bubblingMouseEvents: false })
          .bindTooltip(label).on('click', () => onEventPress?.(item.id)).addTo(group);
      }
    }).catch(() => { if (!disposed) setError(true); });
    return () => { disposed = true; group?.remove(); };
  }, [events, onEventPress, trafficArea, observationAreas, onObservationAreaPress, mapVersion]);

  useEffect(() => {
    const position = zoomPositionRef.current;
    if (!position) return;

    position.style.top =
      zoomControlBottom === undefined
        ? `${zoomControlTop ?? 0}px`
        : 'auto';

    const zoomHeight =
      position
        .querySelector('.leaflet-control-zoom')
        ?.getBoundingClientRect().height ?? 105;

    position.style.bottom =
      zoomControlBottom === undefined
        ? 'auto'
        : `${zoomControlBottom + Math.max(0, 105 - zoomHeight)}px`;
  }, [zoomControlTop, zoomControlBottom, mapVersion]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let disposed = false;
    let tiles: TileLayer | undefined;

    void import('leaflet')
      .then((L) => {
        if (disposed) return;

        const terrain = mapStyle === 'terrain';

        tiles = L.tileLayer(
          terrain
            ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
            : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            maxNativeZoom: terrain ? 17 : 19,
            maxZoom: 19,
            attribution: terrain
              ? '© OpenStreetMap contributors · © OpenTopoMap'
              : '© OpenStreetMap contributors',
          }
        ).addTo(map);
      })
      .catch(() => {
        if (!disposed) setError(true);
      });

    return () => {
      disposed = true;
      tiles?.remove();
    };
  }, [mapStyle, mapVersion]);
    useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let disposed = false;
    let marker: import('leaflet').Marker | undefined;
    let radiusCircle: import('leaflet').Circle | undefined;

    void import('leaflet').then((L) => {
      if (disposed) return;

      if (!selectedLocation) return;

      const radiusMeters = selectedLocation.radius ?? 1000;

      radiusCircle = L.circle(
        [selectedLocation.latitude, selectedLocation.longitude],
        {
          radius: radiusMeters,
          color: '#EA4335',
          weight: 2,
          fillColor: '#EA4335',
          fillOpacity: 0.16,
        }
      ).addTo(map);

      const pinIcon = L.divIcon({
        className: '',
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        tooltipAnchor: [0, -38],
        html: `<svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.35));">
          <path d="M16 0C7.163 0 0 7.163 0 16C0 27.2 14.2 40.4 15.1 41.2C15.6 41.7 16.4 41.7 16.9 41.2C17.8 40.4 32 27.2 32 16C32 7.163 24.837 0 16 0Z" fill="#EA4335" stroke="#FFFFFF" stroke-width="1.5"/>
          <circle cx="16" cy="16" r="6" fill="#B31412"/>
        </svg>`,
      });

      marker = L.marker(
        [selectedLocation.latitude, selectedLocation.longitude],
        { icon: pinIcon }
      )
        .bindTooltip(`Ubicación seleccionada (radio ${radiusMeters} m)`)
        .addTo(map);

      map.invalidateSize();
      const mapHeight = map.getSize().y || 600;
      const bottomPad = selectedLocation.radius ? Math.round(mapHeight * 0.50) : 48;
      map.flyToBounds(radiusCircle.getBounds(), {
        paddingTopLeft: [36, Math.max(72, zoomControlTop ?? 0)],
        paddingBottomRight: [36, bottomPad],
        maxZoom: 15,
        duration: 0.45,
      });
    });

    return () => {
      disposed = true;
      marker?.remove();
      radiusCircle?.remove();
    };
  }, [selectedLocation, theme, mapVersion, zoomControlTop]);



  useEffect(() => {
    if (!focusBounds || !mapRef.current) return;

    const [west, south, east, north] = focusBounds;

    mapRef.current.flyToBounds(
      [
        [south, west],
        [north, east],
      ],
      {
        paddingTopLeft: [72, (zoomControlTop ?? 0) + 32],
        paddingBottomRight: [72, 120],
        maxZoom: 16,
        duration: 0.6,
      }
    );
  }, [focusBounds, mapVersion, zoomControlTop]);

  useEffect(() => {
    let disposed = false;
    let map: LeafletMap | undefined;
    let resizeObserver: ResizeObserver | undefined;

    async function createMap() {
      try {
        const L = await import('leaflet');

        if (disposed || !containerRef.current) return;

        setError(false);

        map = L.map(containerRef.current, {
          attributionControl: true,
          zoomControl: false,
        }).setView(
          [INITIAL_CENTER[1], INITIAL_CENTER[0]],
          INITIAL_ZOOM
        );

        const currentMap = map;

        currentMap.attributionControl.setPrefix(false);

        const attribution =
          currentMap.attributionControl.getContainer();

        if (attribution) {
          Object.assign(attribution.style, {
            fontSize: '10px',
            lineHeight: '14px',
            padding: '0 4px',
          });
        }

        mapRef.current = currentMap;
        setMapVersion((version) => version + 1);

        const zoomControl = L.control
          .zoom({ position: 'topright' })
          .addTo(currentMap);

        const zoomControlElement = zoomControl.getContainer();

        if (zoomControlElement) {
          zoomControlElement.style.margin = '0';
          zoomControlElement.style.transform = 'translateX(50%)';
        }

        const zoomControlPosition =
          zoomControl.getContainer()?.parentElement;

        zoomPositionRef.current =
          zoomControlPosition ?? null;

        if (zoomControlPosition) {
          zoomControlPosition.style.top =
            `${zoomControlTop ?? 0}px`;

          zoomControlPosition.style.right = '35px';
        }

        if (userLocation) {
          L.circleMarker(
            [
              userLocation.latitude,
              userLocation.longitude,
            ],
            {
              radius: 8,
              color: '#FFFFFF',
              weight: 3,
              fillColor: theme.colors.primary,
              fillOpacity: 1,
            }
          )
            .bindTooltip('Tu ubicación')
            .addTo(currentMap);

          currentMap.setView(
            [
              userLocation.latitude,
              userLocation.longitude,
            ],
            13
          );
        }



        currentMap.on('click', (event) => {
          onMapPress?.([
            event.latlng.lng,
            event.latlng.lat,
          ]);
        });

        currentMap.on('moveend', () => {
          const center = currentMap.getCenter();

          onCameraChange?.({
            center: [center.lng, center.lat],
            zoom: currentMap.getZoom(),
          });
        });

        onLoad?.();

        resizeObserver = new ResizeObserver(() =>
          currentMap.invalidateSize()
        );

        resizeObserver.observe(containerRef.current);
      } catch {
        if (!disposed) {
          setError(true);
          onError?.();
        }
      }
    }

    void createMap();

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      map?.remove();

      mapRef.current = null;
      zoomPositionRef.current = null;
    };
  }, [
    theme,
    userLocation,
    zoomControlTop,
    onLoad,
    onError,
    onMapPress,
    onCameraChange,
  ]);

  return (
    <div
      style={{
        flex: 1,
        minHeight: 240,
        position: 'relative',
        display: 'flex',
      }}
    >
      <div
        ref={containerRef}
        aria-label="Mapa de montaña"
        style={{
          flex: 1,
          minHeight: 240,
          zIndex: 0,
        }}
      />

      {error && (
        <p
          role="alert"
          style={{
            color: theme.colors.danger,
            padding: 16,
          }}
        >
          No se pudo cargar el mapa. Recargá la página para volver a intentar.
        </p>
      )}
    </div>
  );
}
