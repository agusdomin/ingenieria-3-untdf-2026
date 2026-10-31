#!/usr/bin/env bash
set -Eeuo pipefail

cd "$(dirname "$0")"

APP_URL="https://debian-1.tailb677a0.ts.net"
API_URL="${APP_URL}/api"

echo "=== Deploy Ingeniería 3 ==="

# 1. Verificar configuración y cambios locales
if [[ ! -f .env ]]; then
    echo "ERROR: Falta el archivo .env"
    exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
    echo "ERROR: Hay cambios locales sin guardar."
    git status --short
    exit 1
fi

# 2. Obtener cambios de GitHub
echo "[1/6] Actualizando repositorio..."
git pull --ff-only origin main

# 3. Construir el frontend
echo "[2/6] Construyendo frontend..."
sudo docker build \
    --build-arg "EXPO_PUBLIC_API_URL=${API_URL}" \
    -t g3-frontend:latest \
    ./frontend

# 4. Actualizar servicios
echo "[3/6] Actualizando contenedores..."
sudo docker compose config --quiet
sudo docker compose up -d --build

# 5. Aplicar migraciones
echo "[4/6] Aplicando migraciones..."
sudo docker compose exec -T backend \
    python manage.py migrate --noinput

# 6. Verificar servicios
echo "[5/6] Estado de Docker..."
sudo docker compose ps

echo "[6/6] Comprobando HTTP..."

FRONTEND_STATUS=$(curl -s -o /dev/null -w '%{http_code}' \
    http://127.0.0.1:8080/)

BACKEND_STATUS=$(curl -s -o /dev/null -w '%{http_code}' \
    http://127.0.0.1:8080/api/usuarios/)

echo "Frontend: HTTP ${FRONTEND_STATUS}"
echo "Backend:  HTTP ${BACKEND_STATUS}"

if [[ "$FRONTEND_STATUS" != "200" ]]; then
    echo "ERROR: Frontend no responde con HTTP 200."
    exit 1
fi

if [[ "$BACKEND_STATUS" != "401" ]]; then
    echo "ERROR: Backend no responde con HTTP 401."
    exit 1
fi

echo "=== Deploy completado correctamente ==="
