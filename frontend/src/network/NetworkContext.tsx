import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import NetInfo from '@react-native-community/netinfo';

interface NetworkContextValue {
  isConnected: boolean;
  isInternetReachable: boolean | null;
}

const NetworkContext =
  createContext<NetworkContextValue | undefined>(
    undefined
  );

interface Props {
  children: ReactNode;
}

export function NetworkProvider({
  children,
}: Props) {
  const [
    isConnected,
    setIsConnected,
  ] = useState(true);

  const [
    isInternetReachable,
    setIsInternetReachable,
  ] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    const unsubscribe =
      NetInfo.addEventListener(
        (state) => {
          setIsConnected(
            Boolean(
              state.isConnected
            )
          );

          setIsInternetReachable(
            state.isInternetReachable
          );
        }
      );

    return unsubscribe;
  }, []);

  return (
    <NetworkContext.Provider
      value={{
        isConnected,
        isInternetReachable,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context =
    useContext(NetworkContext);

  if (!context) {
    throw new Error(
      'useNetwork debe utilizarse dentro de NetworkProvider'
    );
  }

  return context;
}