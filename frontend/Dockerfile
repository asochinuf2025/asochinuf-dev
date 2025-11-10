# Dockerfile para ASOCHINUF Frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json y yarn.lock
COPY package.json yarn.lock* ./

# Instalar dependencias con fallback a npm
RUN yarn install --frozen-lockfile || npm install

# Copiar el resto del código
COPY . .

# Construir la aplicación con fallback a npm
RUN yarn build || npm run build

# Etapa final - servir con nginx
FROM nginx:alpine

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar la carpeta dist construida
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer puerto
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
