# AppImagePicker (#81)

Selector controlado de una foto, con caja punteada basada en el wireframe de
reporte rápido, cámara (`expo-camera`), galería (`expo-image-picker`) y miniatura.

```tsx
const [imageUri, setImageUri] = useState<string | null>(null);
<AppImagePicker value={imageUri} onChange={setImageUri} />
```

Props: `value`, `onChange`, `label?`, `disabled?`, `error?`.
`onChange(uri)` comunica una selección/captura y `onChange(null)` elimina la foto.
Cancelar conserva el valor anterior. La URI nativa apunta a un archivo temporal;
web puede entregar una URI de datos/blob. El consumidor administra la subida y
debe copiar el archivo a almacenamiento persistente si implementa una cola offline.
No se debe enviar la URI local como si fuera una URL accesible por el backend.

La cámara solicita permiso al tocar «Tomar foto», no al entrar al formulario.
La galería usa el selector del sistema para imágenes: en plataformas actuales no
requiere acceso general al almacenamiento. No se solicita micrófono. Los plugins
de `app.json` configuran los mensajes para futuras builds propias; Expo Go utiliza
sus propios permisos. La cámara se desmonta al cerrar o pasar la app a segundo plano.

## Pruebas en web y Expo Go

Abrir **Mapa → Reportar → Adjuntar foto del manto**.

1. Elegir de galería: seleccionar una foto vertical y luego una horizontal.
   La miniatura debe mostrar la imagen completa y permitir cambiarla/eliminarla.
2. Cambiar foto y cancelar el selector: debe conservarse la anterior. Reabrir
   galería debe seguir funcionando, también después de cancelar en web.
3. Tomar foto: conceder permiso, esperar el preview y pulsar el disparador.
   Debe cerrar la cámara, apagarla y mostrar la miniatura.
4. Cancelar cámara o usar Atrás: conserva la foto anterior. Pasar a otra app
   mientras la cámara está abierta debe cerrar la captura.
5. Denegar permiso: debe explicar el problema y permitir elegir desde galería.
   Si el sistema bloqueó preguntas nuevas, habilitar cámara en Ajustes y reintentar.
6. Eliminar foto: vuelve la caja vacía y el consumidor recibe `null`.
7. Revisar tema claro/oscuro y una pantalla angosta; acciones de al menos 44 px.

La cámara web requiere un contexto seguro (localhost o HTTPS) y cámara disponible.
Una URL HTTP con IP de red puede bloquearla. Expo Go en teléfono físico permite
probar sin compilar Android. En simuladores sin cámara se puede probar galería.

La pantalla de observaciones integra el componente para probarlo. El formulario
completo, envío a API y sincronización offline aún están pendientes.

Referencias SDK 57:
- https://docs.expo.dev/versions/v57.0.0/sdk/camera/
- https://docs.expo.dev/versions/v57.0.0/sdk/imagepicker/
