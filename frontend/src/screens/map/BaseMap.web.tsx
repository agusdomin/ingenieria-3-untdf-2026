import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, TileLayer } from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  zoomControlTop,
  zoomControlBottom,
  onLoad,
  onError,
  onMapPress,
  onCameraChange,
}: MapContainerProps) {
  const { theme } = useTheme();

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const zoomPositionRef = useRef<HTMLElement | null>(null);

  const [error, setError] = useState(false);
  const [mapVersion, setMapVersion] = useState(0);

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