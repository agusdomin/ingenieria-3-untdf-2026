import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export type NetworkStatus = 'unknown' | 'online' | 'offline';

interface NetworkContextValue {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  status: NetworkStatus;
  isOffline: boolean;
}

const NetworkContext = createContext<NetworkContextValue | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [connection, setConnection] = useState<Pick<NetworkContextValue, 'isConnected' | 'isInternetReachable'>>({
    isConnected: null,
    isInternetReachable: null,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setConnection({ isConnected: state.isConnected, isInternetReachable: state.isInternetReachable });
    });
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        // refresh notifica al mismo listener; un fallo de consulta no prueba desconexión.
        void NetInfo.refresh().catch(() => undefined);
      }
    });
    return () => { unsubscribe(); subscription.remove(); };
  }, []);

  const value = useMemo<NetworkContextValue>(() => {
    const { isConnected, isInternetReachable } = connection;
    const status: NetworkStatus = isConnected === false || isInternetReachable === false
      ? 'offline'
      : isInternetReachable === true ? 'online' : 'unknown';
    return { ...connection, status, isOffline: status === 'offline' };
  }, [connection]);

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) throw new Error('useNetwork debe utilizarse dentro de NetworkProvider');
  return context;
}
