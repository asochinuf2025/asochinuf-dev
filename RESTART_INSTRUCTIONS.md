# 🔄 Instrucciones para Reiniciar Backend y Frontend

## 📋 Resumen de Cambios

Se han realizado los siguientes cambios que requieren reinicio:

1. ✅ `backend/routes/cloudinary.js` - Agregado UPDATE a base de datos
2. ✅ `frontend/src/config/apiConfig.js` - Agregados endpoints de Cloudinary
3. ✅ `frontend/src/components/CloudinaryImageCrop.jsx` - Importados endpoints

## 🚀 Reiniciar Backend

### Terminal 1: Backend

```bash
# Navega a la carpeta backend
cd c:\MisProyectosReact\asochinuf-dev\backend

# Si npm run dev está corriendo, presiona Ctrl+C

# Inicia el servidor
npm run dev
```

**Esperado en la consola:**
```
⚙️  Iniciando servidor...
[db] DATABASE_URL: Configurada
[db] NODE_ENV: development
[db] Detectado: RAILWAY
[db] Usando pg.Pool (TCP directo - Railway)
[db] Conectado ✓
Server running on port 5002
```

**Si ves errores:**
- Verificar que `.env` tiene `DATABASE_URL` configurada
- Verificar conexión a internet (Railway está en la nube)
- Reintentar: `npm run dev`

## 🎨 Reiniciar Frontend

### Terminal 2: Frontend (abrir otra terminal)

```bash
# Navega a la carpeta frontend
cd c:\MisProyectosReact\asochinuf-dev\frontend

# Si yarn dev está corriendo, presiona Ctrl+C

# Inicia el servidor
yarn dev
```

**Esperado en la consola:**
```
VITE v5.0.11  ready in 234 ms

➜  Local:   http://localhost:3000/
➜  press h to show help
```

**Si ves errores:**
- Verificar que `node_modules` existe: `ls -la node_modules | head -20`
- Si no existe, ejecutar: `yarn install`
- Reintentar: `yarn dev`

## ✅ Verificación

### 1. Backend está listo
- Abre en el navegador: `http://localhost:5002/api/health`
- Deberías ver:
  ```json
  {
    "status": "Backend funcionando correctamente",
    "database": "conectado",
    "timestamp": "2025-11-11T..."
  }
  ```

### 2. Frontend está listo
- Abre en el navegador: `http://localhost:3000`
- Deberías ver la landing page de ASOCHINUF

### 3. Login y prueba

1. Click en "Login"
2. Login con credenciales válidas
3. Ir a Dashboard → Perfil
4. Click en cámara para cambiar foto
5. Seleccionar imagen
6. Ajustar crop
7. Click "Guardar"
8. **Debe funcionar sin errores 404**

## 🛠️ Troubleshooting

### Backend no inicia
```bash
# Opción 1: Matar proceso en puerto 5002
netstat -ano | findstr :5002
# Ver PID y ejecutar: taskkill /PID [PID] /F

# Opción 2: Cambiar puerto en .env
PORT=5003
npm run dev
```

### Frontend no inicia
```bash
# Opción 1: Limpiar cache
rm -rf node_modules
yarn install
yarn dev

# Opción 2: Usar npm en lugar de yarn
npm install
npm start
```

### Errores de conexión BD
```bash
# Verificar que Railway está accesible
ping mainline.proxy.rlwy.net

# Verificar en backend/.env:
# DATABASE_URL=postgresql://...@mainline.proxy.rlwy.net:10217/railway
```

## 📝 Checklist Antes de Empezar

- [ ] Terminal 1 lista para backend
- [ ] Terminal 2 lista para frontend
- [ ] Conexión a internet activa
- [ ] `.env` en backend configurado
- [ ] `node_modules` en frontend existe

## 🎯 Pasos Exactos (Copy-Paste)

### Terminal 1
```bash
cd c:\MisProyectosReact\asochinuf-dev\backend
npm run dev
```

### Terminal 2 (nueva terminal)
```bash
cd c:\MisProyectosReact\asochinuf-dev\frontend
yarn dev
```

## ⏱️ Tiempo esperado
- Backend: 2-3 segundos
- Frontend: 5-10 segundos (primera vez puede tardar más)

## 📞 Si algo falla
- Verifica que ambas terminales están corriendo
- Comprueba que no hay otro proceso en los puertos 5002 y 3000
- Revisa los logs de error en las terminales
- Reinicia ambos procesos completamente
