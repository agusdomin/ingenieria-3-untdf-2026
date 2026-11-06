import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useTheme } from '../../theme/useTheme';
import { getZoneColor, getZoneCoordinates } from './zoneMap.types';
import type { ZoneMapProps } from './zoneMap.types';

export function ZoneMap({ features, onZonePress, mapStyle, userLocation, zoomControlTop }: ZoneMapProps) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let disposed = false;
    let map: LeafletMap | undefined;
    let resizeObserver: ResizeObserver | undefined;

    // Leaflet accesses window at import time. Load it only after mounting so
    // Expo Router's static/server rendering can build this route as well.
    async function createMap() {
      try {
        const L = await import('leaflet');
        if (disposed || !containerRef.current) return;

        map = L.map(containerRef.current, {
          attributionControl: false,
          zoomControl: false,
        }).setView([-54.745, -68.275], 10);
        const currentMap = map;
        const zoomControl = L.control.zoom({ position: 'topleft' }).addTo(currentMap);
        const zoomControlPosition = zoomControl.getContainer()?.parentElement;
        if (zoomControlPosition) {
          zoomControlPosition.style.top = `${zoomControlTop}px`;
          zoomControlPosition.style.left = '12px';
        }

        const tileUrl = mapStyle === 'terrain'
          ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
          : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
        L.tileLayer(tileUrl, {
          maxZoom: 19,
          attribution: mapStyle === 'terrain'
            ? 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://opentopomap.org">OpenTopoMap</a>'
            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(currentMap);

        const polygons = features.map((feature) => {
          const coordinates = getZoneCoordinates(feature).map(
            ({ latitude, longitude }): [number, number] => [latitude, longitude]
          );
          const polygon = L.polygon(coordinates, {
            color: getZoneColor(feature.properties.riskLevel, theme),
            fillOpacity: 0.45,
            weight: 2,
          }).addTo(currentMap);

          const label = document.createElement('span');
          label.textContent = `${feature.properties.name} · ${feature.properties.riskLevel}`;
          polygon.bindTooltip(label);
          polygon.on('click', () => onZonePress(feature.properties.id));
          return polygon;
        });

        if (userLocation) {
          L.circleMarker([userLocation.latitude, userLocation.longitude], {
            radius: 8,
            color: '#FFFFFF',
            weight: 3,
            fillColor: theme.colors.primary,
            fillOpacity: 1,
          })
            .bindTooltip('Tu ubicación')
            .addTo(currentMap);
          currentMap.setView([userLocation.latitude, userLocation.longitude], 13);
        }

        if (!userLocation && polygons.length > 0) {
          currentMap.fitBounds(L.featureGroup(polygons).getBounds(), {
            padding: [32, 32],
            maxZoom: 12,
          });
        }

        resizeObserver = new ResizeObserver(() => currentMap.invalidateSize());
        resizeObserver.observe(containerRef.current);
      } catch {
        if (!disposed) setError(true);
      }
    }

    setError(false);
    void createMap();

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      map?.remove();
    };
  }, [features, mapStyle, onZonePress, theme, userLocation, zoomControlTop]);

  return (
    <div style={{ flex: 1, minHeight: 240, position: 'relative', display: 'flex' }}>
      <div
        ref={containerRef}
        aria-label="Mapa de zonas de ejemplo"
        style={{ flex: 1, minHeight: 240, zIndex: 0 }}
      />
      {error && (
        <p role="alert" style={{ color: theme.colors.danger, padding: 16 }}>
          No se pudo cargar el mapa. Recargá la página para volver a intentar.
        </p>
      )}
    </div>
  );
}
