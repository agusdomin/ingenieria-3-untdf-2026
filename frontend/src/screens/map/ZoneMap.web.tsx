import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useTheme } from '../../theme/useTheme';
import { getZoneColor, getZoneCoordinates } from './zoneMap.types';
import { INITIAL_CENTER, INITIAL_ZOOM, type MapContainerProps } from '../../components/map/MapContainer.types';

export function ZoneMap({ features, focusBounds, onZonePress, mapStyle, userLocation, zoomControlTop, onLoad, onError, onMapPress, onCameraChange }: MapContainerProps) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const mapRef = useRef<LeafletMap | null>(null);
  const [mapVersion, setMapVersion] = useState(0);

  useEffect(() => {
    if (!focusBounds || !mapRef.current) return;
    const [west, south, east, north] = focusBounds;
    mapRef.current.flyToBounds([[south, west], [north, east]], {
      paddingTopLeft: [72, zoomControlTop + 32], paddingBottomRight: [72, 120], maxZoom: 16, duration: 0.6,
    });
  }, [focusBounds, mapVersion, zoomControlTop]);

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
        setError(false);

        map = L.map(containerRef.current, {
          attributionControl: true,
          zoomControl: false,
        }).setView([INITIAL_CENTER[1], INITIAL_CENTER[0]], INITIAL_ZOOM);
        const currentMap = map;
        currentMap.attributionControl.setPrefix(false);
        mapRef.current = currentMap;
        setMapVersion((version) => version + 1);
        const zoomControl = L.control.zoom({ position: 'topright' }).addTo(currentMap);
        const zoomControlElement = zoomControl.getContainer();
        if (zoomControlElement) {
          zoomControlElement.style.margin = '0';
          zoomControlElement.style.transform = 'translateX(50%)';
        }
        const zoomControlPosition = zoomControl.getContainer()?.parentElement;
        if (zoomControlPosition) {
          zoomControlPosition.style.top = `${zoomControlTop}px`;
          zoomControlPosition.style.right = '35px';
        }

        const tileUrl = mapStyle === 'terrain'
          ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
          : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
        L.tileLayer(tileUrl, {
          maxZoom: mapStyle === 'terrain' ? 17 : 19,
          attribution: mapStyle === 'terrain'
            ? '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · SRTM | <a href="https://opentopomap.org/about">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(currentMap);

        features.forEach((feature) => {
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

        currentMap.on('click', (event) => onMapPress?.([event.latlng.lng, event.latlng.lat]));
        currentMap.on('moveend', () => {
          const center = currentMap.getCenter();
          onCameraChange?.({ center: [center.lng, center.lat], zoom: currentMap.getZoom() });
        });
        onLoad?.();

        resizeObserver = new ResizeObserver(() => currentMap.invalidateSize());
        resizeObserver.observe(containerRef.current);
      } catch {
        if (!disposed) { setError(true); onError?.(); }
      }
    }

    void createMap();

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      map?.remove();
      mapRef.current = null;
    };
  }, [features, mapStyle, onZonePress, theme, userLocation, zoomControlTop, onLoad, onError, onMapPress, onCameraChange]);

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
