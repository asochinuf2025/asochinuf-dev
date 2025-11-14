# Quick Fix: Problemas Encontrados y Soluciones

## Problema 1: Error 404 al crear categoría
**Error**: `POST http://localhost:5001/api/ligas/categorias 404 (Not Found)`

**Solución**: ✅ RESUELTO
- Se agregaron 3 nuevos endpoints en el backend:
  - POST `/api/ligas/categorias` - Crear categoría
  - PUT `/api/ligas/categorias/:id` - Actualizar categoría
  - DELETE `/api/ligas/categorias/:id` - Eliminar categoría

**Archivos modificados**:
- `backend/controllers/plantelCategoriaLigaController.js` - Agregadas funciones: crearCategoria, actualizarCategoria, eliminarCategoria
- `backend/routes/ligas.js` - Agregadas rutas para estos endpoints

**Acción requerida**: Reinicia el servidor backend
```bash
npm run dev
```

---

## Problema 2: No aparece el select de ligas en ExcelSection

**Causa**: Las categorías no están asignadas a planteles en la base de datos

**Cómo funciona el flujo**:
1. Selecciona Plantel
2. Sistema carga categorías **asignadas** a ese plantel (GET `/api/ligas/plantel/{id}/categorias`)
3. Selecciona Categoría
4. Sistema carga ligas para esa categoría (GET `/api/ligas/plantel/{id}/categoria/{id}/ligas`)

**Por qué no ves ligas**:
- No existen planteles asignados a categorías en `t_plantel_categoria`
- Por lo tanto, `cargarCategoriasDelPlantel` devuelve array vacío
- Si no hay categoría seleccionada, el select de ligas no aparece

**Solución Paso a Paso**:

### Step 1: Ejecuta el script de setup
```bash
cd backend
npm run db:setup-ligas
```

Este script:
- ✅ Crea tabla `t_ligas` con 23 ligas
- ✅ Crea tabla `t_plantel_categoria` (vacía inicialmente)
- ✅ Agrega `liga_id` a `t_sesion_mediciones`

### Step 2: Asigna planteles a categorías

**Opción A: Vía API (recomendado para testing)**

```bash
curl -X POST http://localhost:5001/api/ligas/plantel/categoria/asignar \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "plantelId": 1,
    "categoriaId": 4
  }'
```

Repite para varios planteles:
- plantelId: IDs de planteles existentes (verifica en BD)
- categoriaId: 1-6 (las 6 categorías predefinidas)

**Opción B: Vía Admin Panel**

1. Ve a: Dashboard → Gestión → Planteles
2. Tab: "Categorías y Ligas"
3. Tab: "Categorías"
4. Click en botón "Link Planteles" para cada categoría
5. Selecciona planteles y guarda

**Opción C: Directamente en la BD (SQL)**

```sql
INSERT INTO t_plantel_categoria (plantel_id, categoria_id, activo)
VALUES
  (1, 4, true),  -- Asigna plantel 1 a Liga Femenina
  (2, 1, true),  -- Asigna plantel 2 a Liga Masculina Adulta
  (3, 5, true);  -- Asigna plantel 3 a Futsal
```

### Step 3: Verifica en ExcelSection

1. Ve a Dashboard → Excel
2. Selecciona un Plantel
3. Deberías ver las categorías asignadas a ese plantel
4. Selecciona una Categoría
5. Deberías ver el select de Liga poblado con las ligas disponibles

---

## Resumen de cambios backend

### Nuevas funciones en controlador:
```javascript
export const crearCategoria = async (req, res) => {...}
export const actualizarCategoria = async (req, res) => {...}
export const eliminarCategoria = async (req, res) => {...}
```

### Nuevas rutas:
```
POST   /api/ligas/categorias              Crear categoría
PUT    /api/ligas/categorias/:id          Actualizar categoría
DELETE /api/ligas/categorias/:id          Eliminar categoría
```

---

## Flujo completo después del fix

```
Admin:
1. npm run db:setup-ligas          ← Setup inicial
2. Assign planteles to categorías  ← En admin panel o API
3. Test en ExcelSection            ← Ver que todo carga

User:
1. Excel → Select Plantel
2. Auto-loads: Categorías asignadas ← Llama GET /plantel/{id}/categorias
3. Select Categoría
4. Auto-loads: Ligas for categoría  ← Llama GET /plantel/{id}/categoria/{id}/ligas
5. Select Liga
6. Upload Excel con liga_id
```

---

## Verificación

### En ExcelSection - Debug Console

Abre F12 (DevTools) y revisa:

1. Cuando selecciones Plantel:
```javascript
// Debería haber un GET a:
GET /api/ligas/plantel/1/categorias
// Response: Array de categorías (puede estar vacío si no hay asignaciones)
```

2. Cuando selecciones Categoría:
```javascript
// Debería haber un GET a:
GET /api/ligas/plantel/1/categoria/4/ligas
// Response: Array de ligas para esa categoría
```

3. En Network tab:
- Status 200 = OK
- Status 404 = Endpoint no existe (Ahora debería estar arreglado)
- Status 400-500 = Error del servidor

---

## Próximos pasos

1. ✅ Restart backend (`npm run dev`)
2. ✅ Run setup script (`npm run db:setup-ligas`)
3. ✅ Assign planteles in admin panel
4. ✅ Test ExcelSection flow
5. ✅ Upload Excel file with liga_id
6. ✅ Verify data in database

---

Si aún tienes problemas después de esto, revisa:
- ¿Ejecutaste `npm run db:setup-ligas`?
- ¿Hay planteles en la BD? (SELECT * FROM t_planteles;)
- ¿Hay asignaciones en t_plantel_categoria?
- ¿El token JWT es válido y el usuario es admin?

