# Dockerfile para ASOCHINUF - Multi-stage build
# Estrategia: Compilar frontend + servir todo con Node.js + Express

# ============================================================================
# STAGE 1: Frontend Builder
# ============================================================================
FROM node:20 AS frontend-builder

WORKDIR /app/frontend

# Copiar frontend dependencies
COPY frontend/package*.json frontend/yarn.lock* ./

# Instalar dependencias - prefer yarn, fallback to npm
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; else npm install --legacy-peer-deps; fi

# Copiar código del frontend
COPY frontend/ .

# Crear archivo .env con variables de entorno para build time
# Esto es necesario para que Vite incluya las variables en el bundle
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_MERCADO_PAGO_PUBLIC_KEY

RUN echo "VITE_API_URL=${VITE_API_URL}" > .env && \
    echo "VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}" >> .env && \
    echo "VITE_MERCADO_PAGO_PUBLIC_KEY=${VITE_MERCADO_PAGO_PUBLIC_KEY}" >> .env

# Construir el frontend con variables de entorno - show errors if build fails
RUN if [ -f yarn.lock ]; then yarn build; else npm run build; fi

# ============================================================================
# STAGE 2: Production - Node.js + Express
# ============================================================================
FROM node:20

WORKDIR /app

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=5001

# ============================================================================
# Instalar dependencias del sistema para canvas (PDF rendering)
# ============================================================================
RUN apt-get update && apt-get install -y \
    build-essential \
    g++ \
    gcc \
    make \
    python3 \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# ============================================================================
# Copiar código y dependencias del backend
# Compilar canvas desde fuente
# ============================================================================
COPY backend/package*.json ./backend/
RUN cd backend && \
    npm install --production --legacy-peer-deps && \
    npm rebuild canvas --verbose 2>&1 | tail -20

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
