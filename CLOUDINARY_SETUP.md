# 🖼️ Integración de Cloudinary - Guía Completa

## Resumen

He implementado Cloudinary para tu aplicación ASOCHINUF con las siguientes características:

✅ **Subida de imágenes a Cloudinary** (no a servidor local)
✅ **Cropping gratuito** con zona seleccionable
✅ **Fotos de perfil** con validación
✅ **Fotos de cursos** con validación
✅ **Optimización automática** de imágenes
✅ **Almacenamiento en carpetas** (asochinuf/perfiles, asochinuf/cursos)

---

## 🔧 Configuración Backend

### 1. Paquetes instalados

```bash
npm install cloudinary
```

### 2. Archivos creados

#### `/backend/services/cloudinaryService.js`
Servicio que maneja todas las operaciones con Cloudinary:
- `subirImagenCloudinary()` - Subir imagen a Cloudinary
- `eliminarImagenCloudinary()` - Eliminar imagen
- `obtenerURLTransformada()` - Obtener URL con transformaciones

**Ejemplo de uso:**
```javascript
import { subirImagenCloudinary } from './services/cloudinaryService.js';

const resultado = await subirImagenCloudinary(
  imagenBase64,           // Imagen en formato base64 Data URL
  'asochinuf/perfiles',   // Carpeta en Cloudinary
  `usuario-${usuarioId}`  // Nombre público
);

// Respuesta:
// {
//   url: 'https://res.cloudinary.com/...',
//   publicId: 'asochinuf/perfiles/usuario-123',
//   urlOriginal: 'http://...'
// }
```

#### `/backend/routes/cloudinary.js`
Endpoints REST para subida de imágenes:

```
POST /api/cloudinary/upload-perfil
  Body: { imagenBase64: "data:image/jpeg;base64,..." }
  Response: { success: true, url, publicId }

POST /api/cloudinary/upload-curso
  Body: { imagenBase64, cursoId }
  Response: { success: true, url, publicId }

DELETE /api/cloudinary/delete
  Body: { publicId: "asochinuf/perfiles/usuario-123" }
  Response: { success: true, mensaje }
```

### 3. Variables de entorno (ya configuradas)

```env
CLOUDINARY_CLOUD_NAME="dc8qanjnd"
CLOUDINARY_API_KEY="474564119143581"
CLOUDINARY_API_SECRET="iEoMm4rlslmBgcO0tDv-PulRnwE"
```

---

## 🎨 Configuración Frontend

### 1. Componente principal: `CloudinaryImageCrop.jsx`

**Características:**
- Crop de imágenes en zona circular o rectangular
- Zoom ajustable (1x a 3x)
- Rotación de 90°
- Subida automática a Cloudinary después del crop
- Manejo de errores con toast notifications

**Propiedades:**
```jsx
<CloudinaryImageCrop
  isOpen={boolean}              // Mostrar/ocultar modal
  onClose={function}            // Callback al cerrar
  imageSrc={base64String}        // Imagen en base64
  onUploadComplete={function}    // Callback al completar subida
  isDarkMode={boolean}           // Modo oscuro
  tipo={'perfil' | 'curso'}      // Tipo de imagen
  cursoId={number}               // ID del curso (si tipo='curso')
  token={string}                 // JWT token
/>
```

**Ejemplo de uso:**
```jsx
import CloudinaryImageCrop from '@/components/CloudinaryImageCrop';

export function MiFoto() {
  const [isOpen, setIsOpen] = useState(false);
  const [imagen, setImagen] = useState(null);
  const { token } = useContext(AuthContext);

  const handleUpload = ({ url, publicId }) => {
    console.log('Imagen subida:', url);
    // Guardar URL en BD
    guardarURLEnBD(url);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Cambiar foto
      </button>

      <CloudinaryImageCrop
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        imageSrc={imagen}
        onUploadComplete={handleUpload}
        tipo="perfil"
        token={token}
      />
    </>
  );
}
```

### 2. Ejemplo integrado: `PerfilCloudinary.jsx`

Componente completo que muestra:
- Avatar circular actual
- Botón para cambiar foto
- Validación de archivo (tipo, tamaño)
- Modal de crop integrado

**Usar en tu PerfilSection:**
```jsx
import PerfilCloudinary from '@/pages/PerfilSection/PerfilCloudinary';

// En tu componente:
<PerfilCloudinary
  usuario={usuarioActual}
  onFotoActualizada={(foto) => actualizarPerfilEnBD(foto)}
/>
```

---

## 💾 Actualizar Base de Datos

Para guardar URLs de Cloudinary en BD, necesitas agregar columnas:

```sql
-- Para usuarios (foto de perfil)
ALTER TABLE t_usuarios ADD COLUMN foto_cloudinary_url VARCHAR(500);
ALTER TABLE t_usuarios ADD COLUMN foto_cloudinary_id VARCHAR(255);

-- Para cursos (foto de portada)
ALTER TABLE t_cursos ADD COLUMN imagen_cloudinary_url VARCHAR(500);
ALTER TABLE t_cursos ADD COLUMN imagen_cloudinary_id VARCHAR(255);
```

---

## 🚀 Flujo Completo

### Para Foto de Perfil:

1. Usuario hace clic en botón "Cambiar foto"
2. Selecciona archivo desde dispositivo
3. Validación del lado del cliente (tipo, tamaño)
4. Se abre modal de crop
5. Usuario ajusta zoom, rotación, posición
6. Hace clic en "Guardar y Subir"
7. Imagen se envía a backend `/api/cloudinary/upload-perfil`
8. Backend la sube a Cloudinary en carpeta `asochinuf/perfiles`
9. Se devuelve URL de Cloudinary
10. Frontend actualiza la foto mostrada
11. (Opcional) Se guarda URL en BD

### Para Foto de Curso:

Mismo flujo pero usando `/api/cloudinary/upload-curso` con `cursoId`

---

## 📊 Estructura de Carpetas en Cloudinary

```
asochinuf/
├── perfiles/
│   ├── usuario-1
│   ├── usuario-2
│   └── usuario-N
├── cursos/
│   ├── curso-1
│   ├── curso-2
│   └── curso-N
```

---

## 🔐 Seguridad

- ✅ Token JWT requerido para subir
- ✅ Validación de tipo de archivo (solo imágenes)
- ✅ Límite de tamaño (5MB)
- ✅ Solo admin/nutricionista pueden subir cursos
- ✅ Cualquier usuario autenticado puede cambiar su foto

---

## 🎯 Próximos Pasos

### 1. Integrar en PerfilSection
Reemplaza el componente actual con `PerfilCloudinary`

### 2. Integrar en CursosSection
Crea un componente similar para fotos de cursos:

```jsx
// frontend/src/pages/CursosSection/CursoImagenCrop.jsx
import CloudinaryImageCrop from '@/components/CloudinaryImageCrop';

export function CursoImagenCrop({ cursoId, onUploadComplete }) {
  return (
    <CloudinaryImageCrop
      tipo="curso"
      cursoId={cursoId}
      onUploadComplete={onUploadComplete}
      // ... otras props
    />
  );
}
```

### 3. Actualizar endpoints de cursos
En `/backend/routes/cursos.js`, actualizar para guardar URLs:

```javascript
router.put('/:id', async (req, res) => {
  const { imagen_cloudinary_url, imagen_cloudinary_id } = req.body;

  await pool.query(
    'UPDATE t_cursos SET imagen_cloudinary_url = $1, imagen_cloudinary_id = $2 WHERE id_curso = $3',
    [imagen_cloudinary_url, imagen_cloudinary_id, req.params.id]
  );

  res.json({ success: true });
});
```

### 4. Mostrar imágenes con transformaciones
En frontend, optimizar imágenes:

```jsx
// Mostrar imagen con ancho específico
const getCloudinaryUrl = (url, width = 300) => {
  // Cloudinary permite transformaciones en URL
  return url.replace('/upload/', `/upload/w_${width},c_fill,q_auto/`);
};

// Uso:
<img src={getCloudinaryUrl(fotoURL, 200)} />
```

---

## 📝 Ejemplo Completo de Integración

### Frontend (React):

```jsx
import { useState, useContext } from 'react';
import CloudinaryImageCrop from '@/components/CloudinaryImageCrop';
import { AuthContext } from '@/context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

export function MiFotoPerfil() {
  const [foto, setFoto] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const { usuario, token } = useContext(AuthContext);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImg(e.target.result);
      setIsOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadComplete = async ({ url, publicId }) => {
    setFoto(url);

    // Guardar en BD
    try {
      await axios.put('/api/auth/actualizar-foto', {
        foto_cloudinary_url: url,
        foto_cloudinary_id: publicId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Foto actualizada');
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  return (
    <div>
      <img src={foto || usuario.foto} className="w-24 h-24 rounded-full" />
      <label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        Cambiar foto
      </label>

      <CloudinaryImageCrop
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        imageSrc={selectedImg}
        onUploadComplete={handleUploadComplete}
        tipo="perfil"
        token={token}
      />
    </div>
  );
}
```

---

## ❓ Preguntas Comunes

**P: ¿Qué pasa si elimino una imagen?**
R: Puedes usar `DELETE /api/cloudinary/delete` con el `publicId`

**P: ¿Puedo cambiar tamaño de imagen?**
R: Sí, con transformaciones de Cloudinary en la URL

**P: ¿Cuánto espacio tengo gratis?**
R: 25GB de almacenamiento gratuito en Cloudinary

**P: ¿Cómo optimizo imágenes?**
R: Ya está configurado: `quality: 'auto'` y `format: 'auto'`

---

## 🔗 Recursos

- [Documentación Cloudinary](https://cloudinary.com/documentation)
- [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api)
- [Transformaciones de URL](https://cloudinary.com/documentation/image_transformation_reference)

---

**¿Necesitas ayuda con la integración? Déjame saber dónde quieres implementarlo primero.** 🚀
