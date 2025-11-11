# 🚀 Cloudinary - Quick Start

## ¿Qué se implementó?

✅ Backend service para subir imágenes a Cloudinary
✅ Endpoints REST para subida
✅ Componente de crop de imágenes con zona seleccionable (gratuito)
✅ Ejemplo completo para perfil de usuario
✅ Integración en MiPerfil.jsx (perfil de usuario)
✅ Integración en GestionCursosSection.jsx (cursos admin)

---

## Archivos creados/modificados

### Backend
- `backend/services/cloudinaryService.js` - Servicio de Cloudinary ✅
- `backend/routes/cloudinary.js` - Endpoints REST ✅
- `backend/server.js` - Registrado cloudinaryRoutes ✅

### Frontend
- `frontend/src/components/CloudinaryImageCrop.jsx` - Componente principal de crop ✅
- `frontend/src/pages/PerfilSection/PerfilCloudinary.jsx` - Ejemplo para perfil ✅
- `frontend/src/pages/PerfilSection/MiPerfil.jsx` - **MODIFICADO** para usar CloudinaryImageCrop ✅
- `frontend/src/pages/CursosSection/GestionCursosSection.jsx` - **MODIFICADO** para usar CloudinaryImageCrop ✅

### Documentación
- `CLOUDINARY_SETUP.md` - Guía completa
- `CLOUDINARY_QUICK_START.md` - Este archivo

---

## Uso rápido

### 1. Cambiar foto de perfil (Frontend)

```jsx
import CloudinaryImageCrop from '@/components/CloudinaryImageCrop';

// En tu componente:
const [isOpen, setIsOpen] = useState(false);
const [imagen, setImagen] = useState(null);
const { token } = useContext(AuthContext);

const handleUpload = ({ url, publicId }) => {
  console.log('URL:', url);
  // Guardar en BD si quieres
};

return (
  <>
    <input
      type="file"
      onChange={(e) => {
        const reader = new FileReader();
        reader.onload = (e) => setImagen(e.target.result);
        reader.readAsDataURL(e.target.files[0]);
        setIsOpen(true);
      }}
    />

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
```

### 2. Subir foto de curso (Mismo componente)

```jsx
<CloudinaryImageCrop
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  imageSrc={imagen}
  onUploadComplete={handleUpload}
  tipo="curso"      // ← Cambiar esto
  cursoId={123}     // ← Agregar ID
  token={token}
/>
```

---

## API Endpoints

### Upload Perfil
```
POST /api/cloudinary/upload-perfil
Headers: Authorization: Bearer <token>
Body: { imagenBase64: "data:image/..." }
Response: { success: true, url, publicId }
```

### Upload Curso
```
POST /api/cloudinary/upload-curso
Headers: Authorization: Bearer <token>
Body: { imagenBase64, cursoId }
Response: { success: true, url, publicId }
```

### Eliminar
```
DELETE /api/cloudinary/delete
Headers: Authorization: Bearer <token>
Body: { publicId: "asochinuf/perfiles/usuario-123" }
Response: { success: true, mensaje }
```

---

## Características del Crop

- ✅ Zoom ajustable (1x - 3x)
- ✅ Rotación de 90°
- ✅ Crop circular o rectangular
- ✅ Grid de guía
- ✅ Vista previa en tiempo real
- ✅ Carga automática a Cloudinary

---

## ¿Dónde integrarlo?

### Perfil de Usuario
1. En `frontend/src/pages/PerfilSection/PerfilSection.jsx`
2. Reemplazar componente de foto actual con `PerfilCloudinary`

### Cursos
1. En `frontend/src/pages/CursosSection/CrearCurso.jsx`
2. Agregar `CloudinaryImageCrop` para portada

### Planteles
Similar a cursos si lo necesitas

---

## Validaciones implementadas

✅ Solo imágenes (image/*)
✅ Máximo 5MB
✅ Token JWT requerido
✅ Solo admin/nutricionista pueden subir cursos
✅ Optimización automática de calidad

---

## Almacenamiento

Las imágenes se guardan en Cloudinary en:
- Perfil: `/asochinuf/perfiles/usuario-{id}`
- Cursos: `/asochinuf/cursos/curso-{id}`

---

## Variables de Entorno (ya configuradas)

```env
CLOUDINARY_CLOUD_NAME="dc8qanjnd"
CLOUDINARY_API_KEY="474564119143581"
CLOUDINARY_API_SECRET="iEoMm4rlslmBgcO0tDv-PulRnwE"
```

---

## Estado Actual

✅ **Completado:**
1. ✅ Integrado en MiPerfil.jsx (Perfil de Usuario)
2. ✅ Integrado en GestionCursosSection.jsx (Gestión de Cursos para Admin)
3. ✅ Backend totalmente funcional con 3 endpoints

## Próximos pasos (Opcionales)

1. (Opcional) Agregar transformaciones de URL para optimizar imágenes
2. (Opcional) Eliminar carpeta local /foto_curso y usar solo Cloudinary
3. (Opcional) Agregar previsualizaciones de cursos en otras secciones
4. (Opcional) Implementar galerías de imágenes con Cloudinary

---

## Ejemplo completo de integración

Ver `PerfilCloudinary.jsx` - es un ejemplo listo para usar

---

**¿Necesitas ayuda para integrarlo en tu app?** 🚀
