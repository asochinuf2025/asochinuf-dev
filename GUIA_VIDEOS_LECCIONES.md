# Guía: URLs de Videos en Lecciones

## Conversión Automática de URLs

El sistema convierte automáticamente URLs comunes de video a formatos embebibles. No necesitas hacer nada especial - solo pega la URL tal como la tienes.

### URLs Soportadas

#### YouTube
- **URL normal (watch):** `https://www.youtube.com/watch?v=dQw4w9WgXcQ` ✅
- **URL corta:** `https://youtu.be/dQw4w9WgXcQ` ✅
- **URL embed:** `https://www.youtube.com/embed/dQw4w9WgXcQ` ✅

#### Vimeo
- **URL normal:** `https://vimeo.com/123456789` ✅
- **URL embed:** `https://player.vimeo.com/video/123456789` ✅

#### Google Drive
- **URL con preview:** `https://drive.google.com/file/d/FILE_ID/preview` ✅
- **URL normal:** Se convierte automáticamente

#### Videos Hospedados
- **URL directa:** `https://example.com/video.mp4` ✅
- **Formatos:** .mp4, .webm, .ogg, .mov

### Ejemplo de Uso en la BD

```sql
-- Al crear una lección con video de YouTube
INSERT INTO t_detalles_cursos (
  id_curso, 
  tipo, 
  url, 
  titulo,
  descripcion,
  duracion
) VALUES (
  1,
  'video',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',  -- URL normal, se convierte automáticamente
  'Mi Primer Video',
  'Descripción del video',
  5
);
```

## Funcionalidad de Pantalla Completa

Cada video/PDF en el modal tiene un botón flotante en la esquina superior derecha.

- **Icono Maximize (⛶):** Haz clic para entrar a pantalla completa
- **Icono Minimize (⊟):** Haz clic para salir de pantalla completa

El video se mantiene dentro del modal y funciona perfectamente en pantalla completa.

### Navegadores Compatibles
- Chrome/Chromium ✅
- Firefox ✅
- Safari ✅
- Edge ✅
- Opera ✅

## Tipos de Contenido Soportados

### Video
- Detecta automáticamente URLs de YouTube, Vimeo y videos directos
- Muestra icono 🎥 azul
- Badge: "Video"
- Soporta pantalla completa

### PDF
- Detecta automáticamente PDFs y Google Drive preview
- Muestra icono 📄 rojo
- Badge: "Documento PDF"
- Soporta pantalla completa

### Otros
- Artículo, Quiz, etc.
- Se pueden agregar más tipos según sea necesario

## Troubleshooting

### El video no se reproduce
1. **URL corta/inválida:** Copia la URL completa del video
2. **YouTube privado:** El video debe ser público o listar
3. **Vimeo restringido:** Asegúrate de que el video permite embed

### El botón fullscreen no funciona
- Algunos navegadores viejos no soportan fullscreen
- Intenta en otro navegador o actualiza el tuyo

### Pantalla completa salió con lag
- Algunos videos pueden ser pesados
- Asegúrate de que tu conexión es estable
- Los videos de YouTube se optimizan automáticamente

## Código Relevante

**Archivo:** `frontend/src/utils/videoUrlConverter.js`
- Función: `convertirAEmbedUrl(url)` - Convierte URLs a embed
- Función: `detectarTipoContenido(url)` - Detecta tipo de contenido

**Archivo:** `frontend/src/pages/CursosSection/CursoDetallePage.jsx`
- Línea 731: Uso de `convertirAEmbedUrl()` en video
- Línea 756: Uso de `convertirAEmbedUrl()` en PDF
- Línea 232-265: Función `handleFullscreen()`
