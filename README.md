# Aplicación de prevención de avalanchas

Proyecto de aplicación móvil y web para apoyar la consulta de zonas, la planificación de salidas y el registro de observaciones y reportes técnicos sobre nieve y riesgo de avalanchas. Está compuesto por una API Django y un cliente Expo/React Native.

> **Estado:** el proyecto está en desarrollo. La API cuenta con modelos y endpoints CRUD, pero las pantallas principales del frontend todavía no están implementadas y existen diferencias entre los contratos del cliente y los de la API. Por eso, iniciar ambos servidores no garantiza que los flujos de la aplicación funcionen de punta a punta.

## Requisitos

- Python 3 y `pip`.
- Node.js y npm.
- Para ejecutar la app Android localmente: Android Studio, Android SDK y un emulador iniciado, o un dispositivo Android con depuración USB.
- Para compilar iOS localmente: macOS y Xcode.

## Backend (Django)

Desde la raíz del repositorio:

```bash
cd backend
python -m venv .venv
```

Activá el entorno virtual:

```bash
# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS/Linux
source .venv/bin/activate
```

Instalá dependencias, generá y aplicá las migraciones, y arrancá el servidor:

```bash
python -m pip install -r requirements.txt
python manage.py makemigrations api
python manage.py migrate
python manage.py runserver
```

La API queda en `http://127.0.0.1:8000/api/` y el administrador en `http://127.0.0.1:8000/admin/`. Para crear un usuario administrador:

```bash
python manage.py createsuperuser
```

El backend carga el primer archivo `.env` que encuentre: `backend/.env` y luego el `.env` de la raíz. Si no hay configuración de base de datos, usa SQLite en `backend/db.sqlite3`. Para PostgreSQL se deben configurar `DB_NAME` y `DB_USER` (y opcionalmente `DB_PASSWORD`, `DB_HOST` y `DB_PORT`); también hace falta instalar un driver de PostgreSQL, que no está incluido en `requirements.txt`.

Comprobación básica:

```bash
python manage.py check
```

## Frontend (Expo)

En otra terminal, desde la raíz:

```bash
cd frontend
npm ci
```

Configurá `EXPO_PUBLIC_API_URL` para que apunte a la API. Por ejemplo, para web en la misma computadora, creá `frontend/.env` con:

```dotenv
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Luego iniciá Expo:

```bash
npm run start
```

- **Web:** ejecutá `npm run web` o presioná `w` en la terminal de Expo.
- **Android:** iniciá un emulador y ejecutá `npm run android`; también podés abrir Expo Go y escanear el QR si el SDK y las dependencias utilizadas son compatibles.
- **iOS:** en macOS con Xcode, ejecutá `npm run ios`.
- **Lint:** `npm run lint`.
- **Typecheck:** `npx tsc --noEmit`.

En un teléfono físico, `127.0.0.1` apunta al propio teléfono, no a la computadora: usá la IP local de la computadora en `EXPO_PUBLIC_API_URL` y asegurate de que ambos dispositivos estén en la misma red. En el emulador Android, normalmente se usa `http://10.0.2.2:8000/api` para acceder al servidor local del host.

## Rutas de la API disponibles

El router de Django registra, bajo `/api/`, `usuarios/`, `zonas/`, `planes-salida/`, `observaciones/`, `reportes-tecnicos/`, `valoraciones/` y `datos-meteorologicos/`. El servidor de desarrollo muestra las rutas navegables en la raíz `/api/`.

## Limitaciones conocidas

- La pantalla inicial del frontend todavía referencia componentes que no están presentes; las rutas de login, mapa, planificación y reportes están vacías.
- El frontend y el backend usan nombres de rutas y estructuras de datos diferentes. Configurar la URL base no resuelve por sí solo esa incompatibilidad.
- Las rutas de autenticación con tokens que espera el cliente no están implementadas en el backend.
- La base SQLite local, la sincronización offline y varias funciones de mapas/ubicación son dependencias o archivos preparados, pero no flujos terminados.
- No hay pruebas automatizadas propias ni migraciones iniciales versionadas. Revisá los cambios que genere `makemigrations` antes de confirmarlos.

Para comandos y convenciones específicos del cliente Expo, consultá [`frontend/AGENTS.md`](frontend/AGENTS.md).
