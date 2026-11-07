import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Location from 'expo-location';

export const FALLBACK_LOCATION = {
  latitude: -54.81,
  longitude: -68.30,
  accuracy: null,
} as const;

const POSITION_TIMEOUT_MS = 15_000;

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  isFallback: boolean;
}

function fallback(error: string | null): LocationState {
  return { ...FALLBACK_LOCATION, loading: false, error, isFallback: true };
}

async function readLocation(requestEnableServices: boolean): Promise<LocationState> {
  if (Platform.OS === 'web' || !Device.isDevice) return fallback(null);

  try {
    let permission = await Location.getForegroundPermissionsAsync();
    // Una solicitud por lectura, incluso tras denegar si el sistema permite reintentar.
    if (!permission.granted && permission.canAskAgain) {
      permission = await Location.requestForegroundPermissionsAsync();
    }
    if (!permission.granted) {
      return fallback(permission.canAskAgain
        ? 'Permiso de ubicación denegado. Pulsá GPS para volver a solicitarlo.'
        : 'Permiso de ubicación denegado. Podés habilitarlo en Ajustes.');
    }
    if (!await Location.hasServicesEnabledAsync()) {
      if (Platform.OS === 'android' && requestEnableServices) {
        try {
          await Location.enableNetworkProviderAsync();
        } catch {
          return fallback('No se activó la ubicación. Pulsá GPS para volver a intentarlo.');
        }
      }
      if (!await Location.hasServicesEnabledAsync()) {
        return fallback(Platform.OS === 'android'
          ? 'La ubicación está desactivada. Pulsá GPS para activarla.'
          : 'La ubicación está desactivada. Activala en Ajustes > Privacidad y seguridad > Localización.');
      }
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const position = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          mayShowUserSettingsDialog: false,
        }),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error('La ubicación tardó más de 15 segundos.')), POSITION_TIMEOUT_MS);
        }),
      ]);
      const { latitude, longitude, accuracy } = position.coords;
      return { latitude, longitude, accuracy, loading: false, error: null, isFallback: false };
    } finally {
      clearTimeout(timer);
    }
  } catch (error) {
    return fallback(error instanceof Error ? error.message : 'No se pudo obtener tu ubicación.');
  }
}

/** Una lectura al montar; retry vuelve a consultar permisos, servicios y posición. */
export function useLocation() {
  const [state, setState] = useState<LocationState>({
    latitude: null, longitude: null, accuracy: null,
    loading: true, error: null, isFallback: false,
  });
  const mounted = useRef(false);
  const pending = useRef<Promise<void> | null>(null);

  const load = useCallback((requestEnableServices: boolean): Promise<void> => {
    if (!mounted.current) return Promise.resolve();
    if (pending.current) return pending.current;
    setState((current) => ({ ...current, loading: true, error: null }));
    // Compartir la lectura evita solicitudes duplicadas en Strict Mode y dobles taps.
    pending.current = readLocation(requestEnableServices).then((result) => {
      if (mounted.current) setState(result);
    }).finally(() => {
      pending.current = null;
    });
    return pending.current;
  }, []);

  const retry = useCallback(() => load(true), [load]);

  useEffect(() => {
    mounted.current = true;
    void load(false);
    return () => { mounted.current = false; };
  }, [load]);

  return { ...state, retry };
}
