# 🎨 Cloudinary Crop - Aspecto de Imagen Dinámico

## ¿Qué se hizo?

Se actualizó el componente `CloudinaryImageCrop.jsx` para que use diferentes aspectos de imagen según el tipo (perfil vs curso):

- **Perfil:** Circular 1:1 (cuadrado)
- **Curso:** Rectangular 3:2 (landscape)

## Problema Anterior

El componente estaba fijo para fotos de perfil:
```javascript
aspect={1}           // Siempre 1:1 (cuadrado)
cropShape="round"    // Siempre circular
```

Esto no era visual correcto para imágenes de curso que necesitan aspecto rectangular.

## Solución

Se hizo dinámico según el parámetro `tipo`:

```javascript
aspect={tipo === 'perfil' ? 1 : 1.5}
cropShape={tipo === 'perfil' ? 'round' : 'rect'}
```

## Cambios Específicos

**Archivo:** `frontend/src/components/CloudinaryImageCrop.jsx`

### 1. Aspecto de Imagen (línea 184)
```javascript
// Antes:
aspect={1}

// Después:
aspect={tipo === 'perfil' ? 1 : 1.5}
// 1 = 1:1 (cuadrado) para perfil
// 1.5 = 3:2 (landscape) para cursos
```

### 2. Forma del Crop (línea 189)
```javascript
// Antes:
cropShape="round"

// Después:
cropShape={tipo === 'perfil' ? 'round' : 'rect'}
// 'round' = circular para perfil
// 'rect' = rectangular para cursos
```

### 3. Padding Bottom (línea 177)
```javascript
// Antes:
paddingBottom: '100%'   // Siempre cuadrado

// Después:
paddingBottom: tipo === 'perfil' ? '100%' : '66.67%'
// 100% = cuadrado 1:1 para perfil
// 66.67% = landscape 3:2 para cursos
```

## Resultado Visual

### Modo Perfil
```
┌─────────┐
│         │  Circular
│  [IMG]  │
│         │
└─────────┘
Aspecto: 1:1
```

### Modo Curso
```
┌─────────────────┐
│                 │
│     [IMG]       │ Rectangular
│                 │
└─────────────────┘
Aspecto: 3:2 (Landscape)
```

## Uso

El componente detecta automáticamente el tipo:

```jsx
// Perfil - Circular
<CloudinaryImageCrop
  tipo="perfil"
  {...props}
/>

// Curso - Rectangular
<CloudinaryImageCrop
  tipo="curso"
  cursoId={123}
  {...props}
/>
```

## Ventajas

✅ **Mejor UX:** Usuarios ven exactamente el aspecto que tendrá la imagen

✅ **Reutilizable:** Un solo componente para dos casos de uso

✅ **Flexible:** Fácil agregar más tipos en el futuro

✅ **Consistente:** Las imágenes se ven igual en el modal y en la app

## Compatibilidad

| Tipo | Aspecto | Forma | Padding Bottom |
|------|---------|-------|---|
| perfil | 1:1 | Circular | 100% |
| curso | 3:2 | Rectangular | 66.67% |

## Próximas Mejoras (Opcionales)

1. Agregar más aspectos (banner 16:9, thumbnail 4:3, etc)
2. Permitir al usuario elegir aspecto
3. Mostrar preview del resultado final
4. Guardar preferencia de aspecto por tipo

## Referencias Técnicas

- **react-easy-crop:** Librería usada para el crop
- **aspect:** Ratio entre ancho y alto (width:height)
- **cropShape:** Forma del área de crop ("round" o "rect")
- **padding-bottom trick:** Mantiene aspecto responsivo

## Archivos Modificados

```
frontend/
└── src/
    └── components/
        └── CloudinaryImageCrop.jsx  ← ACTUALIZADO
```

---

**¡Listo! Ahora las imágenes de curso tendrán un área de crop rectangular adecuada.**
