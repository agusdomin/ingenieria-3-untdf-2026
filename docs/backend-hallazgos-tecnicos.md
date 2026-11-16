# Evaluación técnica del backend

Fecha: 2026-11-15. Alcance: código e infraestructura del repositorio.
No evalúa completitud funcional ni reglas de negocio: no se dispone de documentación
de dominio. No se auditó el servidor de producción.

## Base existente

- Django REST Framework con modelos, serializers, viewsets y servicio Open-Meteo separados.
- JWT, hashing de contraseñas, permisos por propietario/administrador y rol experto.
- Planes restringidos al propietario; revisión administrativa de certificaciones.
- Open-Meteo con timeout, manejo de errores y reutilización de registros recientes.
- Migraciones versionadas, OpenAPI, Docker, Gunicorn y PostgreSQL.
- Imágenes opcionales en observaciones, validadas por ImageField y nombradas con UUID.

## Resuelto en el repositorio; pendiente de desplegar

- Persistencia: `media_data` montado en `/app/media` para Django y
  `/var/www/media` en solo lectura para Nginx.
- Estáticos: `static_data` compartido entre `/app/staticfiles` y `/var/www/static`.
- Nginx sirve `/media/` y `/static/`, y dirige `/admin/` al backend.
- Nginx conserva el puerto del Host al enviar solicitudes a Django (`$http_host`):
  probado que la URL de imagen mantiene `localhost:18080`.
- `deploy.sh` ejecuta `collectstatic --noinput` y comprueba un CSS del administrador.
- `.gitattributes` fuerza LF para scripts Bash y evita errores por CRLF al ejecutarlos en Linux/WSL.
- El contexto Docker del backend excluye media, estáticos recolectados y archivos `.env`.

## Hallazgos pendientes

### Prioridad alta

1. **Contraseñas:** registro exige seis caracteres y no llama a `validate_password()`.
   Tampoco lo hacen los métodos de creación/actualización de usuario del serializer.
   Los validadores de settings no se ejecutan automáticamente con `create_user()`.
2. **Email:** usado para login, sin restricción de unicidad en la base. La comprobación
   del registro no protege de concurrencia ni de duplicados desde edición/administración.
3. **JWT:** se entrega refresh token, pero no hay ruta de renovación/revocación.
   El access token dura siete días. Definir y completar el ciclo de sesión.
4. **Pruebas:** solo tres pruebas de imágenes. Faltan pruebas de autenticación,
   aislamiento entre usuarios, privilegios, revisión y errores del proveedor externo.

### Prioridad media

5. **PATCH de planes:** valida fechas solo si ambas llegan en el request. Reproducido:
   un PATCH con retorno anterior al inicio existente pasa `is_valid()`.
6. **Revisión de certificaciones:** revisión y promoción del usuario se guardan sin
   transacción. El request se procesa a mano en vez de validar con el serializer declarado.
7. **Errores meteorológicos:** el serializer convierte errores del servicio a 400;
   el bloque de la vista que intenta devolver 502 no recibe esa excepción original.
8. **Consultas:** sin paginación global; varios listados acceden a relaciones sin
   `select_related()`/`prefetch_related()`. Tráfico recorre planes en Python.
9. **Geometría:** faltan validaciones uniformes de estructura, rangos y valores finitos
   en coordenadas y parámetros de búsqueda. No cambiar formatos sin revisar clientes.
10. **Archivos:** imágenes sin límite explícito de tamaño; documentos de certificación
    comprueban extensión y tamaño, pero no contenido. No hay limpieza de archivos
    reemplazados/eliminados. Nginx limita el request completo a 12 MiB.
11. **Seguridad de despliegue:** CORS permite todos los orígenes; faltan límites de
    frecuencia y configuración explícita de cookies seguras/HTTPS/proxy confiable.
    Revisar junto con la terminación TLS real antes de activar redirects o HSTS.
12. **Reproducibilidad:** dependencias abiertas; Gunicorn y psycopg se instalan aparte
    en Dockerfile. No se encontró pipeline CI en el repositorio.
13. **Operación:** no se encontraron backups/restauración automatizados, monitoreo ni
    endpoint específico de salud. Un volumen persistente no reemplaza un backup.
14. **Documentación:** README desactualizado sobre rutas, autenticación, migraciones y pruebas.
    OpenAPI avisa colisiones de operationId por rutas de auth con/sin slash.

## Comportamientos a contrastar con documentación de dominio

No tratarlos como bugs confirmados sin conocer la política esperada:

- Cualquier usuario autenticado puede modificar coordenadas o borrar datos meteorológicos.
- El propietario puede editar `observaciones` de una certificación, descritas como de revisión.
- Certificaciones aprobadas y sus enlaces de documentos aparecen públicamente.
- `/media/` sirve archivos públicamente, sin aplicar permisos del viewset. Los documentos
  de certificación requieren un endpoint autorizado si deben ser privados.
- Tráfico suma titular y acompañantes de planes en curso si algún punto almacenado cae
  dentro del radio. No usa GPS actual, no comprueba cruce de segmentos y no demuestra
  presencia física de personas.

## Validación y límites

- `manage.py test`: tres pruebas de imágenes pasan con SQLite local.
- `collectstatic --noinput`: 157 archivos recolectados correctamente en local.
- Compose: YAML y correspondencia de montajes comprobados; `git diff --check` sin errores.
- `makemigrations --check --dry-run`: sin cambios pendientes respecto de las migraciones.
- `check --deploy` local: advertencias de seguridad y colisiones OpenAPI. Los avisos de
  DEBUG y SECRET_KEY locales no demuestran la configuración efectiva de producción;
  Compose reemplaza esos valores.
- Docker Engine 29.1.3 y Compose 2.40.3 disponibles en Ubuntu/WSL 2. La comprobación
  inicial solo había buscado Docker en Windows.
- Prueba real aislada con el Compose de producción: proyecto `ingenieria3-media-check`,
  puerto 18080, PostgreSQL y volúmenes propios. Se sustituyó únicamente el frontend
  por Nginx vacío: esta prueba no verifica la aplicación Expo.
- Backend construido con su Dockerfile; migraciones aplicadas a PostgreSQL;
  `collectstatic` recolectó 157 archivos; `nginx -t` correcto.
- Registro y POST multipart reales: imagen PNG guardada con UUID, URL con puerto,
  descarga HTTP 200 con Content-Type correcto y SHA-256 idéntico al original;
  detalle de observación accesible y archivo inexistente devuelve 404.
- Recreados backend y Nginx: la misma imagen y su registro siguen accesibles;
  CSS del administrador y página de login siguen funcionando sin repetir collectstatic.
- Tres pruebas automatizadas pasan también con PostgreSQL dentro de Docker;
  migraciones sin cambios pendientes.
- `bash -n deploy.sh` y `docker compose config --quiet` correctos. Se eliminaron
  los contenedores, volúmenes y archivos temporales de la prueba al finalizar.

## Despliegue de archivos

El despliegue habitual con `deploy.sh` recolecta estáticos. Para hacerlo manualmente,
después de iniciar los servicios:

```sh
docker compose exec -T backend python manage.py collectstatic --noinput
```

Las imágenes se guardan automáticamente en el volumen y sus URLs se descargan mediante
Nginx en el puerto 8080 o el dominio que lo publique, no directamente por Gunicorn
en el puerto 8000. `collectstatic` no copia imágenes de usuarios.

Antes de recrear un contenedor existente que tenga uploads sin volumen, copiar y
respaldar su `/app/media` e importar los archivos al volumen nuevo. Montar un volumen
no rescata archivos de un contenedor anterior. Respaldar también PostgreSQL.
No ejecutar `docker compose down -v` si se quieren conservar los datos: elimina volúmenes.

Verificar en producción: subir una imagen, descargar su URL por Nginx, recrear el
backend y descargarla nuevamente; comprobar además `/static/admin/css/base.css`.
