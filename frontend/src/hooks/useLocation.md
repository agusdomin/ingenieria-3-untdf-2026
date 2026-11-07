# useLocation (#80)

Devuelve `latitude`, `longitude`, `accuracy` (metros o `null`), `loading`,
`error`, `isFallback` y `retry(): Promise<void>`.

Al montar obtiene una posición con expo-location. Hasta resolver, las coordenadas
son `null`. En teléfonos solicita permiso en primer plano si no está concedido y
el sistema permite preguntar (`canAskAgain`), incluso tras una denegación previa.
Hace una sola solicitud al montar, sin bucles. `retry()` (botón GPS del mapa)
permite volver a solicitarlo explícitamente. Si el sistema bloquea nuevas
solicitudes, habilitar el permiso en Ajustes y pulsar GPS.

En Android, al pulsar GPS con los servicios de ubicación apagados se solicita
su activación mediante el diálogo nativo de `enableNetworkProviderAsync`.
Si se acepta, continúa la lectura; si se cancela, usa fallback y permite reintentar.
Este diálogo depende del soporte del dispositivo/Google Play Services y no se
abre automáticamente al montar. En iOS la activación global se hace desde Ajustes.

Web y emuladores usan directamente Martial (-54.81, -68.30), sin pedir permisos.
También se usa ante denegación, servicios desactivados, error o espera del GPS
superior a 15 segundos. El diálogo de permisos no tiene límite de tiempo.
El fallback tiene `accuracy: null` e `isFallback: true`; web/emulador tienen
`error: null` porque es el comportamiento esperado. Otros fallos incluyen mensaje.
Los consumidores de observaciones deben conservar esta distinción: el fallback
no es una posición medida del dispositivo.

En el mapa, `isFallback: true` solo determina la vista predeterminada:
centro [-68.30, -54.81], zoom 11, sin marcador de «Tu ubicación».
El botón GPS reinicia el visor después de la lectura: si obtuvo posición real,
la muestra con marcador; de lo contrario vuelve a esa vista predeterminada.

El hook realiza una lectura, no seguimiento continuo. Reintentos simultáneos
comparten la solicitud. Al desmontar se ignora el resultado. Expo no permite
cancelar `getCurrentPositionAsync`: tras el timeout su resultado tardío se ignora.

## Prueba manual

1. `npm run web`: abrir el mapa. Debe mostrar la zona predeterminada, sin punto
   de ubicación actual ni permiso del navegador. Desplazar el mapa y pulsar GPS:
   debe volver al centro predeterminado con zoom 11, sin marcador.
   La búsqueda y selección de zonas deben seguir funcionando.
2. Expo Go en teléfono con permiso sin decidir: abrir el mapa y aceptar el diálogo
   del sistema. Debe aparecer la posición real, sin aviso de desarrollo.
3. Denegar el permiso: debe aparecer la zona predeterminada sin marcador y el motivo, sin repetir el diálogo
   automáticamente. Pulsar GPS debe solicitarlo nuevamente si el sistema permite
   preguntar. Si bloqueó nuevas solicitudes, debe indicar que se habilite desde
   Ajustes. Habilitarlo allí y pulsar GPS debe recuperar la posición real.
4. En Android con permiso concedido, desactivar ubicación y pulsar GPS:
   debe ofrecer el diálogo nativo. Aceptar debe continuar hacia la posición real;
   cancelar debe mostrar fallback. Pulsar GPS debe permitir reintentar.
   En iOS, activar Localización desde Ajustes y volver a pulsar GPS.
5. Emulador (cuando esté disponible): fallback incluso con coordenadas simuladas.
6. Con GPS sin respuesta: después de 15 segundos de adquisición debe terminar
   la carga y mostrar fallback. Es distinto de dejar el diálogo de permiso abierto.

En React DevTools se puede inspeccionar el estado del hook en `MapScreen`:
posición real con `isFallback: false` y precisión provista por el sistema;
fallback con `isFallback: true`, `accuracy: null` y carga finalizada.

Referencias SDK 57:
- https://docs.expo.dev/versions/v57.0.0/sdk/location/
- https://docs.expo.dev/versions/v57.0.0/sdk/device/
