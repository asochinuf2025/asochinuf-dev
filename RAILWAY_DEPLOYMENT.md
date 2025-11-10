# Guía de Despliegue en Railway para ASOCHINUF

## Configuración Actual (Verificada ✅)

Tu repositorio tiene una configuración multi-servicio lista:

- **railway.json** - Define dos servicios: backend y frontend
- **backend/Dockerfile** - Node.js en puerto 8080 con health check
- **frontend/Dockerfile** - React + Nginx en puerto 80
- **.railwayignore** - Optimiza el tamaño del build

## Pasos para Desplegar

### 1️⃣ Accede a Railway
Abre: https://railway.app/project/serene-transformation

### 2️⃣ IMPORTANTE: Elimina el servicio antiguo
Si tienes un servicio anterior que muestra errores 502:
1. Haz clic en el servicio
2. Ve a **Settings** (engranaje abajo derecha)
3. Haz clic en **Delete Service** (botón rojo)
4. Confirma la eliminación

**Por qué:** Railway necesita limpiar el estado anterior para detectar el new railway.json

### 3️⃣ Trigger automático de redeploy
Ahora que eliminaste el servicio:
1. Ve a **Deployments** en tu proyecto
2. Si no hay uno en progreso, haz clic en **Deploy** o **Redeploy**
3. Railway leerá tu `railway.json` y creará:
   - **Servicio: backend** (Node.js puerto 8080)
   - **Servicio: frontend** (Nginx puerto 80)

### 4️⃣ Espera a que se creen ambos servicios
Railway mostrará:
```
✅ backend - Successfully deployed
✅ frontend - Successfully deployed
```

### 5️⃣ Configura Variables de Entorno

**Para Backend:**
1. Abre el servicio **backend**
2. Ve a **Variables** (en el panel izquierdo)
3. Agrega estas variables:
   ```
   NODE_ENV=production
   PORT=8080
   JWT_SECRET=tu_clave_secreta_aqui_cambia_esto
   JWT_EXPIRE=7d
   FRONTEND_URL=https://[frontend-url].railway.app
   DATABASE_URL=postgresql://user:pass@host/db
   ```

**Para Frontend:**
1. Abre el servicio **frontend**
2. Ve a **Variables**
3. Agrega:
   ```
   REACT_APP_API_URL=https://[backend-url].railway.app/api
   ```
   (Reemplaza [backend-url] con la URL real que Railway te asigne)

### 6️⃣ Obtén las URLs de tus servicios
1. En cada servicio, ve a **Settings**
2. Busca la sección **Railway Provided Variables** o **Service URL**
3. Copia ambas URLs

Las URLs serán algo como:
- Backend: `https://asochinuf-backend-production.railway.app`
- Frontend: `https://asochinuf-frontend-production.railway.app`

### 7️⃣ Actualiza las variables cruzadas

Después de obtener las URLs:
- Actualiza `FRONTEND_URL` en backend con la URL del frontend
- Actualiza `REACT_APP_API_URL` en frontend con la URL del backend

### 8️⃣ Configura la Base de Datos

**Opción A: Usar PostgreSQL de Railway (Recomendado)**
1. Ve a tu proyecto en Railway
2. Haz clic en **+ Create New** en arriba a la derecha
3. Selecciona **PostgreSQL**
4. Railway automáticamente agregará `DATABASE_URL` al backend

**Opción B: Usa tu Neon PostgreSQL existente**
1. Obtén tu `DATABASE_URL` de Neon
2. Agrégala manualmente en el backend

### 9️⃣ Verifica que funciona

- **Backend Health Check:** https://[backend-url]/api/health
  Debería devolver:
  ```json
  {
    "status": "Backend funcionando correctamente",
    "database": "conectado"
  }
  ```

- **Frontend:** https://[frontend-url]
  Debería mostrar tu aplicación React

## Troubleshooting

### Railway no crea los dos servicios
- **Solución:** Elimina el servicio antiguo completamente y vuelve a desplegar

### Los servicios no se conectan entre sí
- **Verificar:** `REACT_APP_API_URL` en frontend debe apuntar a la URL del backend
- **Verificar:** `FRONTEND_URL` en backend debe apuntar a la URL del frontend

### Error de base de datos
- **Si usas Neon:** Verifica que `DATABASE_URL` sea accesible desde Railway
- **Si usas PostgreSQL de Railway:** Asegúrate de que está en el mismo proyecto

## URLs de Referencia
- Dashboard de Railway: https://railway.app/dashboard
- Tu Proyecto: https://railway.app/project/serene-transformation
- Documentación Railway: https://docs.railway.app
