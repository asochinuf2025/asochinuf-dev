# Dockerfile para ASOCHINUF - Multi-stage build (Frontend + Backend + Nginx)
# Esta es la estrategia monolítica: un solo contenedor ejecutando frontend (Nginx) y backend (Node.js)

# ============================================================================
# STAGE 1: Frontend Builder
# ============================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copiar frontend dependencies
COPY frontend/package*.json frontend/yarn.lock* ./

# Instalar dependencias con fallback
RUN yarn install --frozen-lockfile 2>/dev/null || npm install --legacy-peer-deps

# Copiar código del frontend
COPY frontend/ .

# Construir el frontend
RUN yarn build 2>/dev/null || npm run build

# ============================================================================
# STAGE 2: Backend Setup
# ============================================================================
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copiar backend dependencies
COPY backend/package*.json ./

# Instalar solo dependencias de producción
RUN npm install --production --legacy-peer-deps

# Copiar código del backend
COPY backend/ .

# ============================================================================
# STAGE 3: Final Production Image
# ============================================================================
FROM node:20-alpine

# Instalar Nginx y otros dependencias
RUN apk add --no-cache nginx

WORKDIR /app

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=5001

# ============================================================================
# Copiar assets del frontend compilado
# ============================================================================
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# ============================================================================
# Copiar código y dependencias del backend
# ============================================================================
COPY --from=backend-builder /app/backend/node_modules /app/backend/node_modules
COPY --from=backend-builder /app/backend /app/backend

# ============================================================================
# Configurar Nginx
# ============================================================================
COPY frontend/nginx.conf /etc/nginx/http.d/default.conf

# ============================================================================
# Crear script de entrada para orchestración de servicios
# ============================================================================
RUN mkdir -p /app/scripts

RUN cat > /app/scripts/start.sh << 'EOF'
#!/bin/sh
set -e

echo "🚀 =====================================================";
echo "   ASOCHINUF - Iniciando servicios";
echo "======================================================"

# Verificar archivos del frontend
echo "📁 Verificando archivos del frontend...";
ls -la /usr/share/nginx/html/ || true

# Iniciar Nginx
echo "🌐 Iniciando Nginx en puerto 80...";
nginx -g "daemon off;" &
NGINX_PID=$!
sleep 2

# Verificar que Nginx está corriendo
if ! kill -0 $NGINX_PID 2>/dev/null; then
    echo "❌ Error: Nginx no pudo iniciarse";
    exit 1
fi
echo "✅ Nginx iniciado correctamente (PID: $NGINX_PID)";

# Cambiar al directorio del backend
cd /app/backend

# Verificar que tenemos las variables necesarias
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  Advertencia: DATABASE_URL no está configurada";
fi

# Iniciar backend Node.js
echo "🔧 Iniciando Backend Node.js en puerto $PORT...";
echo "📝 NODE_ENV: $NODE_ENV";

# Ejecutar npm start y capturar el output
npm start &
NODE_PID=$!

echo "✅ Backend iniciado (PID: $NODE_PID)";
echo "======================================================"
echo "🎉 Sistema completo ejecutándose";
echo "   Frontend: http://localhost:80";
echo "   Backend API: http://localhost:$PORT";
echo "======================================================"

# Mantener el contenedor corriendo
wait
EOF

# Dar permisos de ejecución
RUN chmod +x /app/scripts/start.sh

# ============================================================================
# Exponer puertos
# ============================================================================
EXPOSE 80
EXPOSE 5001

# ============================================================================
# Health check
# ============================================================================
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# ============================================================================
# Comando de inicio
# ============================================================================
CMD ["/app/scripts/start.sh"]
