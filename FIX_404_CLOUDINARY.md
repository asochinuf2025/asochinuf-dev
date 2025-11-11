# 🔧 Fix: Error 404 en CloudinaryImageCrop

## Problema
Al intentar guardar una foto de perfil o de curso, el componente CloudinaryImageCrop mostraba un error 404 porque no encontraba los endpoints de Cloudinary.

## Causa
El componente estaba usando rutas relativas (`/api/cloudinary/upload-perfil`) en lugar de usar la configuración centralizada de APIs que maneja las rutas correctas según el entorno (desarrollo/producción).

## Solución Implementada

### 1. Agregar endpoints a apiConfig.js
Se agregó una nueva sección CLOUDINARY a `frontend/src/config/apiConfig.js`:

```javascript
// Cloudinary
CLOUDINARY: {
  UPLOAD_PERFIL: `${API_URL}/api/cloudinary/upload-perfil`,
  UPLOAD_CURSO: `${API_URL}/api/cloudinary/upload-curso`,
  DELETE: `${API_URL}/api/cloudinary/delete`,
},
```

### 2. Actualizar CloudinaryImageCrop.jsx
Se modificó el componente para:
- Importar `API_ENDPOINTS` desde la configuración
- Usar `API_ENDPOINTS.CLOUDINARY.UPLOAD_PERFIL` en lugar de rutas relativas
- Usar `API_ENDPOINTS.CLOUDINARY.UPLOAD_CURSO` para cursos

## Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `frontend/src/config/apiConfig.js` | Agregado objeto CLOUDINARY |
| `frontend/src/components/CloudinaryImageCrop.jsx` | Importado API_ENDPOINTS y actualizado handleSaveAndUpload |

## Pasos para que funcione

### 1. Reiniciar el Backend
```bash
cd backend
# Si está corriendo, presiona Ctrl+C
npm run dev  # O el comando que uses para desarrollo
```

### 2. Reiniciar el Frontend
```bash
cd frontend
# Si está corriendo, presiona Ctrl+C
yarn dev  # O npm start / yarn start
```

### 3. Probar
1. Login al dashboard
2. Ir a Perfil (Profile Tab)
3. Hacer click en la cámara para cambiar foto
4. Seleccionar una imagen
5. Hacer click en "Guardar"

**Debería funcionar sin errores 404**

## Verificación

Si seguís teniendo problemas:

1. **Verificar que el backend está en el puerto correcto:**
   ```bash
   # En terminal del backend, deberías ver:
   # Server running on port 5002  (u otro puerto configurado)
   # [db] Conectado a Railway ✓
   ```

2. **Verificar que el frontend está usando la URL correcta:**
   - Abre DevTools → Network
   - Intenta guardar la foto
   - Busca la request POST a `/api/cloudinary/upload-perfil`
   - Verifica que va a `http://localhost:5002/api/cloudinary/upload-perfil`

3. **Verificar las credenciales de Cloudinary:**
   - En `backend/.env` asegúrate de que tengas:
   ```env
   CLOUDINARY_CLOUD_NAME="dc8qanjnd"
   CLOUDINARY_API_KEY="474564119143581"
   CLOUDINARY_API_SECRET="iEoMm4rlslmBgcO0tDv-PulRnwE"
   ```

## Resultado Esperado

Después de los cambios:
- ✅ La foto se sube a Cloudinary sin errores
- ✅ La foto aparece en tu perfil
- ✅ Los cursos pueden tener imágenes de portada
- ✅ Las imágenes se guardan en Cloudinary de forma permanente

## Notas Técnicas

La configuración centralizada en `apiConfig.js`:
- Detecta automáticamente el entorno (desarrollo/producción)
- Usa `import.meta.env.VITE_API_URL` si está definida (para variables de entorno)
- Usa rutas relativas en producción (donde frontend y backend están en el mismo dominio)
- Usa `http://localhost:5001` en desarrollo local
- Funciona en Railway donde el frontend y backend están monolíticamente servidos
