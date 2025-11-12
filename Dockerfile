# Dockerfile para ASOCHINUF - Multi-stage build
# Estrategia: Compilar frontend + servir todo con Node.js + Express

# ============================================================================
# STAGE 1: Frontend Builder
# ============================================================================
FROM node:20 AS frontend-builder

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
# STAGE 2: Production - Node.js + Express
# ============================================================================
FROM node:20

WORKDIR /app

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=5001

# ============================================================================
# Copiar código y dependencias del backend
# ============================================================================
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production --legacy-peer-deps

COPY backend/ ./backend/

# ============================================================================
# Copiar assets del frontend compilado (servirá Express)
# ============================================================================
COPY --from=frontend-builder /app/frontend/dist ./backend/public

# ============================================================================
# Crear directorio public si no existe (por seguridad)
# ============================================================================
RUN mkdir -p /app/backend/public

# ============================================================================
# Comando de inicio
# ============================================================================
WORKDIR /app/backend

CMD ["npm", "start"]
