# Conectividad (#82)

`NetworkProvider` escucha NetInfo una sola vez y publica cambios reactivos con
`useNetwork()`. Al volver a primer plano actualiza la detección. Limpia ambos
listeners al desmontar.

- `isConnected: boolean | null`: hay una red activa.
- `isInternetReachable: boolean | null`: resultado de alcance a internet de NetInfo.
- `status`: `offline` si cualquiera es false; `online` si internet es true y la
  conexión no es false; `unknown` mientras falta información.
- `isOffline`: útil para indicadores. `unknown` no significa desconectado.

El banner global se muestra solo en offline, debajo del navegador y con safe area,
sin superponer botones. Desaparece al dejar de estar offline. Mapa y tab Offline
consumen el mismo estado. No implementa almacenamiento ni sincronización.

NetInfo usa detección nativa cuando está disponible y su comprobación HTTP por
defecto en otras plataformas. Las transiciones dependen del sistema y los plazos
de NetInfo; no son un diagnóstico de la API privada. Tailscale desconectado o un
401/500 de la API no cambian este estado por sí solos.

## Verificación manual

1. Abrir la app con internet: sin banner; mapa y tab Offline indican conexión.
2. En Expo Go, cargar primero el bundle, activar modo avión y apagar Wi-Fi:
   aparece «Sin conexión a internet». Navegar a Offline y verificar el mismo estado.
3. Reconectar: el banner desaparece y ambos indicadores se actualizan.
4. Cambiar conectividad con la app en segundo plano y volver: debe actualizarse.
5. Conectar a Wi-Fi sin salida a internet: debe indicar offline cuando NetInfo
   confirme falta de alcance, aunque `isConnected` sea true.
6. En web, desconectar la red del equipo con la página abierta y reconectar.
   DevTools Offline puede afectar solo solicitudes sin alterar los eventos de red
   del navegador; no sustituye la prueba física de desconexión.
7. Inicio sin red: verificar si el bundle está disponible localmente. Un servidor
   Expo inaccesible o una web sin caché no permiten arrancar la app; eso no es un
   fallo del contexto. Al iniciar, no debe parpadear un falso aviso offline.
8. Revisar banner en claro/oscuro y en pantallas pequeñas: tabs, GPS y Reportar
   deben seguir accesibles. Los mapas online pueden dejar de cargar teselas.

Referencia: https://github.com/react-native-netinfo/react-native-netinfo
