# Dockerfile para ASOCHINUF Backend
FROM node:20-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias en producción
RUN npm install --production

# Copiar el resto del código
COPY . .

# Set production environment
ENV NODE_ENV=production
ENV PORT=5001

# Exponer puerto
EXPOSE 5001

# Health check para Railway
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/api/health', (res) => { if (res.statusCode !== 200) throw new Error(res.statusCode) })"

# Comando para iniciar la aplicación
CMD ["npm", "start"]
