# 🔧 Fix: Error 413 - Payload Too Large

## Problema
Al intentar guardar una foto, el servidor retorna:
```
413 Payload Too Large
```

## Causa
Express tiene un límite por defecto muy bajo para el tamaño del JSON que acepta (100KB). Cuando enviamos la imagen en base64, el tamaño se multiplica por ~1.33x, superando este límite.

**Ejemplo:**
- Imagen original: 2MB
- Base64 convertida: ~2.67MB
- Límite por defecto: 100KB ❌
- Resultado: Error 413

## Solución
Se aumentó el límite de tamaño en `backend/server.js` a **10MB**:

```javascript
// Antes:
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Después:
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

## Archivo Modificado
- `backend/server.js` - Líneas 32-33

## Pasos para Aplicar el Fix

### 1. Reiniciar Backend
Si el backend está corriendo en terminal:
```bash
# Presiona Ctrl+C para detener
# Luego reinicia:
npm run dev
```

**Deberías ver:**
```
[db] Conectado a Railway ✓
Server running on port 5002
```

### 2. Probar Nuevamente
1. En el navegador, ir a Dashboard → Perfil
2. Click en cámara
3. Seleccionar una imagen
4. Hacer crop
5. Click "Guardar"

**Debería funcionar sin errores 413 ✅**

## Límites de Tamaño

Ahora el sistema acepta:

| Concepto | Límite |
|----------|--------|
| Base64 payload | 10MB |
| Imagen original (recomendado) | 5MB |
| Foto comprimida al guardar | ~1-2MB |

## Notas Técnicas

### ¿Por qué base64?
- Permite enviar la imagen como JSON (sin multipart/form-data)
- Funciona bien con Cloudinary
- Compatible con el flujo de crop actual

### ¿Es seguro aumentar el límite?
Sí, porque:
- Las imágenes están limitadas a 5MB en el frontend
- El servidor tiene límite de 10MB (protección adicional)
- Cloudinary no acepta imágenes > 500MB
- En producción se puede reducir si es necesario

### Alternativa: Usar Multipart Form Data
Si querés reducir el tamaño:
1. Cambiar el componente CloudinaryImageCrop para usar FormData en lugar de base64
2. Sería más eficiente (~25% menos datos)
3. Pero requeriría cambios significativos

## Verificación

Para verificar que el fix funcionó:

**En terminal del backend:**
```
[db] Conectado a Railway ✓
Server running on port 5002
POST /api/cloudinary/upload-perfil 200 - 1.234 s
✅ Foto de usuario 5 actualizada en BD: https://res.cloudinary.com/...
```

**En el navegador (DevTools):**
1. Abre DevTools → Network
2. Intenta guardar foto
3. Busca la request POST a `/api/cloudinary/upload-perfil`
4. Debería mostrar **200 OK** en lugar de **413**

## Troubleshooting

### Sigue dando 413
1. Asegúrate de haber reiniciado el backend (Ctrl+C + npm run dev)
2. Verificar que los cambios se guardaron en `server.js`:
   ```bash
   grep -n "limit: '10mb'" backend/server.js
   # Debería mostrar 2 líneas
   ```

### Error diferente (5xx)
- Problema en Cloudinary o BD
- Revisar logs del backend para más detalles
- Verificar que las credenciales de Cloudinary son correctas

## Resumen

✅ **Problema:** Express rechaza el payload de 10MB
✅ **Causa:** Límite por defecto muy bajo
✅ **Solución:** Aumentar límite a 10MB
✅ **Archivo:** `backend/server.js`
✅ **Acción:** Reiniciar backend

**¡Listo! Ahora deberías poder guardar fotos sin errores 413.**
