# 📊 Cloudinary - Integración con Base de Datos

## ¿Qué se hizo?

Se agregó **persistencia en base de datos** para las imágenes de Cloudinary. Ahora:

1. ✅ La foto de perfil se guarda en `t_usuarios.foto` (URL de Cloudinary)
2. ✅ La foto de curso se guarda en `t_cursos.imagen_portada` (URL de Cloudinary)
3. ✅ Las fotos persisten al recargar la página
4. ✅ El header muestra la foto del usuario desde la BD

## Flujo Completo

### Foto de Perfil

```
Usuario selecciona foto
    ↓
Modal de crop (CloudinaryImageCrop)
    ↓
Usuario confirma crop
    ↓
Base64 enviado al backend
    ↓
Cloudinary recibe y optimiza imagen
    ↓
URL retornada por Cloudinary
    ↓
Backend guarda URL en t_usuarios.foto
    ↓
Frontend actualiza contexto (AuthContext)
    ↓
localStorage se actualiza automáticamente
    ↓
Foto aparece en perfil y header
```

### Foto de Curso

```
Admin selecciona foto para curso
    ↓
Modal de crop
    ↓
Admin confirma crop
    ↓
Backend sube a Cloudinary
    ↓
Backend guarda URL en t_cursos.imagen_portada
    ↓
Frontend actualiza formulario del curso
```

## Cambios en el Backend

### Archivo: `backend/routes/cloudinary.js`

**1. Upload Perfil - Ahora guarda en BD:**
```javascript
// Guardar URL en la base de datos
await pool.query(
  'UPDATE t_usuarios SET foto = $1 WHERE id = $2',
  [resultado.url, usuarioId]
);
```

**2. Upload Curso - Ahora guarda en BD:**
```javascript
// Guardar URL en la base de datos
await pool.query(
  'UPDATE t_cursos SET imagen_portada = $1 WHERE id_curso = $2',
  [resultado.url, cursoId]
);
```

## Cambios en el Frontend

### Archivo: `frontend/src/pages/PerfilSection/MiPerfil.jsx`

La función `handleUploadComplete` ya actualiza el contexto:
```javascript
const handleUploadComplete = ({ url, publicId }) => {
  setCloudinaryUrl(url);
  setIsCropModalOpen(false);
  setSelectedImage(null);
  toast.success('Foto de perfil actualizada exitosamente');

  // Actualizar contexto (guarda en localStorage automáticamente)
  if (url) {
    actualizarUsuario({ foto: url });
  }
};
```

### Archivo: `frontend/src/components/CloudinaryImageCrop.jsx`

Ya está configurado para enviar la imagen y recibir la URL correctamente.

## Base de Datos

### Tabla: `t_usuarios`
```sql
ALTER TABLE t_usuarios ADD COLUMN foto VARCHAR(500);
```
La columna `foto` ahora almacena URLs de Cloudinary en lugar de nombres de archivos locales.

**Ejemplo:**
```
https://res.cloudinary.com/dc8qanjnd/image/upload/v1234567890/asochinuf/perfiles/usuario-5_abc123.jpg
```

### Tabla: `t_cursos`
```sql
ALTER TABLE t_cursos ADD COLUMN imagen_portada VARCHAR(500);
```
La columna `imagen_portada` almacena URLs de Cloudinary.

**Ejemplo:**
```
https://res.cloudinary.com/dc8qanjnd/image/upload/v1234567890/asochinuf/cursos/curso-12_def456.jpg
```

## Verificación

### 1. Foto de Perfil se Persiste

```bash
# En el navegador:
1. Login
2. Ir a Perfil
3. Cambiar foto
4. Recargar página (F5)
5. Foto debe estar ahí

# En la BD:
SELECT id, nombre, foto FROM t_usuarios WHERE id = 5;
# Debería mostrar la URL de Cloudinary
```

### 2. Header Muestra Foto

```bash
# En el navegador:
1. Login
2. Ir a cualquier página del dashboard
3. En el header superior debe aparecer tu foto
4. Recargar página
5. La foto sigue apareciendo
```

### 3. Foto de Curso se Guarda

```bash
# En el navegador (como admin):
1. Ir a Gestion → Cursos
2. Crear o editar un curso
3. Subir una imagen
4. Guardar curso
5. Recargar página
6. El curso debe tener su imagen

# En la BD:
SELECT id_curso, nombre, imagen_portada FROM t_cursos WHERE id_curso = 1;
# Debería mostrar la URL de Cloudinary
```

## Características

✅ **Persistencia automática** - Las URLs se guardan en la BD sin código adicional

✅ **Sincronización** - Contexto + localStorage + BD siempre en sincronía

✅ **Optimización** - Cloudinary optimiza automáticamente las imágenes

✅ **CDN global** - Las imágenes se sirven desde el CDN de Cloudinary (rápido)

✅ **Almacenamiento seguro** - No hay archivos locales, todo en la nube

## Eliminación de Imágenes

Si necesitas limpiar imágenes antiguas:

```javascript
// DELETE /api/cloudinary/delete
{
  "publicId": "asochinuf/perfiles/usuario-5_abc123"
}
```

También puedes eliminarlas desde el dashboard de Cloudinary.

## Próximas Mejoras (Opcionales)

1. Agregar transformaciones de URL para diferentes tamaños:
   ```javascript
   // Imagen de perfil redimensionada
   https://res.cloudinary.com/dc8qanjnd/image/upload/w_200,h_200,c_fill/asochinuf/perfiles/usuario-5_abc123.jpg
   ```

2. Agregar caché-busting para forzar actualización:
   ```javascript
   `${url}?t=${Date.now()}`
   ```

3. Crear una tabla de auditoría para historial de fotos

4. Implementar borrado de fotos anteriores automáticamente

## Troubleshooting

### Foto no persiste después de recargar
- Verificar que el backend guardó en BD: `SELECT foto FROM t_usuarios WHERE id = 5;`
- Verificar que el localStorage tiene la URL:
  ```javascript
  // En DevTools Console:
  JSON.parse(localStorage.getItem('asochinuf_usuario')).foto
  ```

### Error 500 en servidor
- Revisar logs del backend
- Verificar que las credenciales de Cloudinary están correctas
- Verificar que la BD tiene la columna `foto` y `imagen_portada`

### Foto se ve pixelada
- Cloudinary está optimizando automáticamente
- Usar transformaciones para mejor calidad:
  ```
  /image/upload/q_auto:best/... para máxima calidad
  ```

## Referencias

- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Cloudinary API Reference](https://cloudinary.com/documentation/image_upload_api_reference)
- [URL Transformations](https://cloudinary.com/documentation/transformation_reference)
