# Quota Assignment Feature - Implementation Summary

## Overview

This document summarizes the complete implementation of the quota assignment feature for ASOCHINUF. The feature enables admins to assign specific quotas to new or existing nutricionista/admin users during user creation and profile updates.

## What Was Implemented

### 1. Backend Changes

#### A. New API Endpoint: GET /api/cuotas/disponibles/todas

**File:** `backend/controllers/cuotasController.js` (lines 674-698)

**Purpose:** Fetches all available quotas for selection when creating/updating users

**Access Control:** Admin only (returns 403 for non-admin users)

**Response:** Array of quota objects with:
- `id` - Quota ID
- `mes` - Month (1-12)
- `ano` - Year
- `monto` - Amount in CLP
- `fecha_vencimiento` - Due date
- `descripcion` - Description (optional)

**Example Request:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5001/api/cuotas/disponibles/todas
```

#### B. User Creation Enhancement: POST /api/auth/usuarios

**File:** `backend/controllers/authController.js` (lines 308-389)

**New Parameters:**
- `cuotasSeleccionadas` (array of quota IDs)

**Logic:**
1. When creating a nutricionista/admin user:
   - If `cuotasSeleccionadas` array is provided with specific quota IDs, assign only those
   - If array is empty or not provided, assign ALL available quotas automatically
2. Creates entries in `t_cuotas_usuario` table linking user to assigned quotas
3. Each assigned quota has status "pendiente"

**Example Request Body:**
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@example.com",
  "password": "secure123",
  "tipo_perfil": "nutricionista",
  "cuotasSeleccionadas": [1, 2, 3]
}
```

#### C. User Update Enhancement: PUT /api/auth/usuarios/:id

**File:** `backend/controllers/authController.js` (lines 391-523)

**New Parameters:**
- `cuotasSeleccionadas` (array of quota IDs)

**Logic:**
1. Detects when user type changes from "cliente" to "nutricionista" or "admin"
2. On type change:
   - Deletes all existing quota assignments
   - Assigns new quotas based on `cuotasSeleccionadas` parameter
   - If no specific quotas selected, assigns ALL available quotas
3. If updating quotas without changing type, updates assignments accordingly

**Example Request Body:**
```json
{
  "tipo_perfil": "nutricionista",
  "cuotasSeleccionadas": [1, 2]
}
```

#### D. Route Ordering Fix: backend/routes/cuotas.js

**Issue:** Generic route `/` was matching `/disponibles/todas` requests

**Solution:** Reordered routes to place specific paths BEFORE parameterized paths:

```javascript
// Specific GET routes MUST come first
router.get('/resumen', obtenerResumenCuotas);
router.get('/disponibles/todas', obtenerCuotasDisponibles);  // NEW
router.get('/globales/todas', obtenerCuotasGlobales);
router.get('/usuarios/todos', obtenerTodosLosUsuarios);
router.get('/estadisticas/general', obtenerEstadisticas);

// Generic routes AFTER
router.get('/', obtenerCuotas);
router.get('/:id', obtenerCuotaById);
```

### 2. Frontend Changes

#### A. API Configuration: frontend/src/config/apiConfig.js

**Added Endpoint:**
```javascript
CUOTAS: {
  // ... other endpoints
  GET_DISPONIBLES: `${API_URL}/api/cuotas/disponibles/todas`,  // NEW
}
```

#### B. User Modal Component: frontend/src/pages/GestionUsuariosSection/UsuarioModal.jsx

**New State Variables:**
- `cuotas` - Array of available quotas
- `cargandoCuotas` - Loading state for quota fetching

**New Functions:**
- `cargarCuotas()` - Fetches available quotas when modal opens with nutricionista/admin type
- `toggleCuota(cuotaId)` - Toggles individual quota selection
- `seleccionarTodas()` - Selects all quotas
- `deseleccionarTodas()` - Deselects all quotas

**New UI Section:**
When `tipo_perfil` is "nutricionista" or "admin":
- Shows animated section with quota selection interface
- Displays loading state while fetching quotas
- Shows error message if no quotas available
- Renders checkbox list of quotas with:
  - Month/year display (e.g., "Ene 2024")
  - Amount in CLP currency format
  - Select All / Deselect All buttons

**Key Code:**
```javascript
useEffect(() => {
  if (isOpen && (formData.tipo_perfil === 'nutricionista' || formData.tipo_perfil === 'admin')) {
    cargarCuotas();
  }
}, [isOpen, formData.tipo_perfil]);

const cargarCuotas = async () => {
  try {
    setCargandoCuotas(true);
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_ENDPOINTS.CUOTAS.GET_DISPONIBLES, config);
    const data = Array.isArray(response.data) ? response.data : [];
    setCuotas(data);
    console.log('✅ Cuotas cargadas:', data);
  } catch (err) {
    console.error('❌ Error al cargar cuotas:', err);
    setCuotas([]);
    const errorMsg = err.response?.data?.error || err.message || 'No se pudieron cargar las cuotas';
    setError(errorMsg);
  } finally {
    setCargandoCuotas(false);
  }
};
```

#### C. Parent Component: frontend/src/pages/GestionUsuariosSection/GestionUsuariosSection.jsx

**Changes:**
1. Added `cuotasSeleccionadas: []` to initial form state
2. Updated all form reset operations to include `cuotasSeleccionadas`
3. Modified user creation/update handlers to pass `cuotasSeleccionadas` in request body

**Locations Updated:**
- Line 26: Initial `formData` state definition
- Line 64: Form reset after successful user creation
- Line 96: Form reset after successful user update
- Line 138: When editing a user
- Line 152: When opening modal for new user
- Line 166: When closing modal

#### D. Notification Component Fix: frontend/src/components/CuotasNotification.jsx

**Changes:**
1. Added `esCliente` variable to detect client users
2. Added null/undefined checks using optional chaining (`?.`)
3. Modified rendering to show "Sin notificaciones" for clients
4. Wrapped all quota-specific content in `!esCliente &&` conditions

**Key Code:**
```javascript
const esCliente = usuario?.tipo_perfil === 'cliente';

// For clients
{esCliente && (
  <motion.div>
    <p>Sin notificaciones</p>
    <p>No hay notificaciones disponibles en este momento</p>
  </motion.div>
)}

// For admin/nutricionista
{!esCliente && resumen?.esMoroso && (
  // Show overdue quotas
)}
```

## Database Changes

### Table: t_cuotas_usuario

This junction table links users to their assigned quotas:

```sql
CREATE TABLE t_cuotas_usuario (
  usuario_id INT NOT NULL,
  cuota_id INT NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente',
  PRIMARY KEY (usuario_id, cuota_id),
  FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id),
  FOREIGN KEY (cuota_id) REFERENCES t_cuotas_mensuales(id)
);
```

**Entry Creation:**
When assigning quotas to a user, entries are created with `estado = 'pendiente'`

## Data Flow Diagrams

### User Creation Flow with Quota Assignment

```
1. Admin clicks "Crear Nuevo Usuario"
2. Modal opens with form
3. Admin fills: Nombre, Apellido, Email, Contraseña
4. Admin selects Tipo de Perfil = "Nutricionista"
5. Modal detects nutricionista selection
6. Component calls cargarCuotas()
7. API call: GET /api/cuotas/disponibles/todas
8. Quota list displays with checkboxes
9. Admin selects 2-3 quotas or clicks "Seleccionar Todas"
10. Admin clicks "Crear Usuario"
11. Form submission includes cuotasSeleccionadas array
12. Backend creates user
13. Backend creates t_cuotas_usuario entries for each quota
14. Modal closes, user list updates
```

### User Type Change Flow

```
1. Admin clicks edit button on "cliente" user
2. Modal opens with existing user data
3. Admin changes Tipo de Perfil from "Cliente" to "Nutricionista"
4. Quota section appears
5. Admin selects 2-3 quotas
6. Admin clicks "Guardar Cambios"
7. Form submission includes cuotasSeleccionadas
8. Backend detects type change
9. Backend deletes all existing quota assignments
10. Backend creates new t_cuotas_usuario entries
11. Modal closes, user list updates
```

## Error Handling

### Frontend Error Handling

**In UsuarioModal.jsx:**
- Try/catch block in `cargarCuotas()`
- Detailed error logging with status codes
- User-friendly error messages displayed in modal
- Error state can be cleared by clicking X button

**Console Output Examples:**

Success:
```
✅ Cuotas cargadas: [{id: 1, mes: 1, ano: 2024, monto: 50000}, ...]
```

Error Response:
```
❌ Error al cargar cuotas: Error: Request failed with status code 403
Response error: {error: "Solo administradores pueden obtener cuotas disponibles"}
Status: 403
```

Network Error:
```
❌ Error al cargar cuotas: Error: Network Error
```

### Backend Error Handling

**In obtenerCuotasDisponibles():**
- 403 Forbidden if user is not admin
- 500 Internal Server Error if database query fails
- Error messages logged to console

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] Quota endpoint responds to admin requests
- [ ] Quota endpoint returns 403 for non-admin requests
- [ ] Create new nutricionista with specific quotas selected
- [ ] Create new nutricionista without selecting quotas (should assign all)
- [ ] Create new admin with quota selection
- [ ] Edit existing cliente user, change to nutricionista, assign quotas
- [ ] Edit nutricionista user, change quotas, quotas update correctly
- [ ] Client user sees "Sin notificaciones" when clicking bell
- [ ] Admin user sees quota notifications when clicking bell
- [ ] No console errors during any operations
- [ ] Selected quotas are visible in database after user creation
- [ ] Quota assignments persist across page refreshes

## Troubleshooting Guide

### Issue: "Cuotas.map is not a function"
**Cause:** Response data is not an array
**Fix:** Ensure `Array.isArray(response.data)` is checked before assignment

### Issue: "No hay cuotas disponibles"
**Causes:**
1. No quotas exist in database
2. API endpoint not returning data
3. Route ordering issue (specific routes must come before generic ones)
**Fix:** Check database for existing quotas, verify backend logs

### Issue: URL shows "/undefined/cuotas/disponibles/todas"
**Cause:** Using `API_ENDPOINTS.API_URL` which doesn't exist
**Fix:** Use `API_ENDPOINTS.CUOTAS.GET_DISPONIBLES` instead

### Issue: Modal doesn't show quota section when selecting nutricionista
**Cause:** Component state not updating or condition not met
**Fix:** Check that `formData.tipo_perfil` is being set correctly

### Issue: Page crashes when client clicks notifications
**Cause:** Accessing properties on null/undefined resumen object
**Fix:** Use optional chaining (`?.`) and check `esCliente` variable

## Performance Considerations

1. **Quota Loading:** Quotas are loaded fresh each time modal opens with matching tipo_perfil
   - Could be optimized with caching if needed

2. **API Calls:**
   - GET /api/cuotas/disponibles/todas - called when modal opens
   - POST/PUT with cuotasSeleccionadas - called when form submits

3. **Database Operations:**
   - User creation with quotas requires multiple INSERT operations
   - Use transactions in production for atomicity

## Security Considerations

1. **Access Control:**
   - GET /api/cuotas/disponibles/todas requires admin role
   - Non-admin requests return 403

2. **SQL Injection Prevention:**
   - All queries use parameterized queries with `$1, $2`, etc.

3. **Authorization:**
   - JWT token required for all endpoint access
   - User role verified before sensitive operations

4. **Data Validation:**
   - Array.isArray() check on cuotasSeleccionadas
   - Validation of quota IDs exists on backend

## Files Modified

### Backend
- `backend/controllers/cuotasController.js` - Added obtenerCuotasDisponibles()
- `backend/controllers/authController.js` - Enhanced crearUsuario() and actualizarUsuario()
- `backend/routes/cuotas.js` - Reordered routes

### Frontend
- `frontend/src/config/apiConfig.js` - Added GET_DISPONIBLES endpoint
- `frontend/src/pages/GestionUsuariosSection/UsuarioModal.jsx` - Added quota selection UI
- `frontend/src/pages/GestionUsuariosSection/GestionUsuariosSection.jsx` - Updated form handling
- `frontend/src/components/CuotasNotification.jsx` - Fixed null reference errors

## Next Steps (Optional Enhancements)

1. **Quota Caching:** Cache quota list in component state to avoid repeated API calls
2. **Bulk Operations:** Allow selecting multiple users to assign/reassign quotas at once
3. **Audit Trail:** Log all quota assignments for compliance
4. **Notification:** Send email when quotas are assigned to a user
5. **Analytics:** Track quota assignment patterns
6. **UI Improvements:** Add quota preview/summary before user creation

## References

- [JWT Authentication Pattern](https://jwt.io/)
- [REST API Best Practices](https://restfulapi.net/)
- [React Hooks Documentation](https://react.dev/reference/react/hooks)
- [Express.js Routing](https://expressjs.com/en/guide/routing.html)
