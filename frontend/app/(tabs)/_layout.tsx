import { useEffect, useRef, useState } from 'react';
import { Tabs } from 'expo-router/js-tabs';
import { SymbolView } from 'expo-symbols';

import { LoginGateModal } from '../../src/components/auth/LoginGateModal';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/theme/useTheme';

export default function TabsLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const [loginVisible, setLoginVisible] = useState(false);
  const didShowLogin = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      setLoginVisible(false);
      return;
    }

    if (!didShowLogin.current) {
      didShowLogin.current = true;
      setLoginVisible(true);
    }
  }, [isAuthenticated, isLoading]);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarStyle: {
            height: 68,
            paddingTop: 7,
            paddingBottom: 7,
            backgroundColor: theme.colors.navbarBackground,
            borderTopColor: theme.colors.navbarBorder,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="mapa"
          options={{
            title: 'Mapa',
            tabBarIcon: ({ color }) => (
              <SymbolView
                name={{ ios: 'map.fill', android: 'map', web: 'map' }}
                tintColor={color}
                size={22}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="reportes"
          options={{
            title: 'Reportes',
            tabBarIcon: ({ color }) => (
              <SymbolView
                name={{ ios: 'waveform.path.ecg', android: 'monitoring', web: 'monitoring' }}
                tintColor={color}
                size={22}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="planificar"
          options={{
            title: 'Planificar',
            tabBarIcon: ({ color }) => (
              <SymbolView
                name={{ ios: 'slider.horizontal.3', android: 'tune', web: 'tune' }}
                tintColor={color}
                size={22}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="offline"
          options={{
            title: 'Offline',
            tabBarIcon: ({ color }) => (
              <SymbolView
                name={{ ios: 'arrow.triangle.2.circlepath', android: 'sync', web: 'sync' }}
                tintColor={color}
                size={22}
              />
            ),
          }}
        />
      </Tabs>
      <LoginGateModal
        visible={loginVisible && !isAuthenticated}
        onDismiss={() => setLoginVisible(false)}
      />
    </>
  );
}
