# Dockerfile para ASOCHINUF - Multi-stage build (Frontend + Backend)
# Un solo contenedor: Node.js (Express + Nginx proxy) + Backend API

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
# STAGE 2: Backend + Frontend Assets (Production)
# ============================================================================
FROM node:20-alpine

WORKDIR /app

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=5001

# ============================================================================
# Instalar nginx
# ============================================================================
RUN apk add --no-cache nginx

# ============================================================================
# Copiar código y dependencias del backend
# ============================================================================
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production --legacy-peer-deps

COPY backend/ ./backend/

# ============================================================================
# Copiar assets del frontend compilado
# ============================================================================
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# ============================================================================
# Configurar Nginx - Archivo de configuración mejorado
# ============================================================================
COPY frontend/nginx.conf /etc/nginx/http.d/default.conf

# ============================================================================
# Crear script de entrada mejorado
# ============================================================================
RUN mkdir -p /app/scripts

RUN cat > /app/scripts/start.sh << 'SCRIPT_EOF'
#!/bin/sh
set -e

echo "🚀 ====================================================="
echo "   ASOCHINUF - Iniciando servicios"
echo "====================================================="

# Verificar archivos del frontend
echo "📁 Verificando archivos del frontend..."
ls -la /usr/share/nginx/html/ 2>/dev/null || echo "⚠️  No se encontraron archivos del frontend"

# Crear directorio de logs si no existe
mkdir -p /var/log/nginx

# Iniciar Nginx en el FOREGROUND (no en background)
# Nginx se ejecutará como proceso principal
echo "🌐 Iniciando Nginx en puerto 80..."
nginx -g "daemon off;" &
NGINX_PID=$!
echo "✅ Nginx iniciado (PID: $NGINX_PID)"

# Dar tiempo para que Nginx se estabilice
sleep 2

# Cambiar al directorio del backend
cd /app/backend

# Verificar configuración
echo "📝 Configuración:"
echo "   NODE_ENV: $NODE_ENV"
echo "   PORT: $PORT"
echo "   DATABASE_URL: ${DATABASE_URL:0:20}..."

# Iniciar backend Node.js
echo "🔧 Iniciando Backend Node.js en puerto $PORT..."
npm start &
NODE_PID=$!
echo "✅ Backend iniciado (PID: $NODE_PID)"

echo "====================================================="
echo "🎉 Sistema completo ejecutándose"
echo "   Frontend: http://localhost:80"
echo "   Backend API: http://localhost:$PORT"
echo "====================================================="

# Esperar a que ambos procesos terminen
wait $NGINX_PID
wait $NODE_PID
SCRIPT_EOF

RUN chmod +x /app/scripts/start.sh

# ============================================================================
# Exponer puerto
# ============================================================================
EXPOSE 80
EXPOSE 5001

# ============================================================================
# Health check
# ============================================================================
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# ============================================================================
# Comando de inicio
# ============================================================================
CMD ["/app/scripts/start.sh"]
