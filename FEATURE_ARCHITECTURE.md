# Quota Assignment Feature - Architecture Diagrams

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          BROWSER / FRONTEND                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  React Components                                               │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │ GestionUsuariosSection                                   │  │   │
│  │  │ - Manages user CRUD operations                           │  │   │
│  │  │ - formData state with cuotasSeleccionadas               │  │   │
│  │  │ - Calls UsuarioModal component                          │  │   │
│  │  └──────────────┬───────────────────────────────────────────┘  │   │
│  │               │                                                 │   │
│  │               ▼                                                 │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │ UsuarioModal                                             │  │   │
│  │  │ - Displays user creation/edit form                       │  │   │
│  │  │ - Loads cuotas when tipo_perfil changes               │  │   │
│  │  │ - Renders quota checkboxes                             │  │   │
│  │  │ - Calls cargarCuotas() function                         │  │   │
│  │  └──────────────┬───────────────────────────────────────────┘  │   │
│  │               │                                                 │   │
│  │               │ axios.get(API_ENDPOINTS.CUOTAS.GET_DISPONIBLES)│   │
│  │               │                                                 │   │
│  │  ┌────────────▼─────────────────────────────────────────────┐  │   │
│  │  │ CuotasNotification Component                             │  │   │
│  │  │ - Bell icon in header                                    │  │   │
│  │  │ - Shows notifications for admin/nutricionista           │  │   │
│  │  │ - Shows "Sin notificaciones" for clients                │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  apiConfig.js                                                          │
│  - API_ENDPOINTS.CUOTAS.GET_DISPONIBLES                               │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                    HTTP / HTTPS / AXIOS
                               │
┌──────────────────────────────▼──────────────────────────────────────────┐
│                         BACKEND / API                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Express Routes (routes/cuotas.js)                              │   │
│  │                                                                 │   │
│  │ GET /resumen              → obtenerResumenCuotas              │   │
│  │ GET /disponibles/todas    → obtenerCuotasDisponibles (NEW)   │   │
│  │ GET /globales/todas       → obtenerCuotasGlobales            │   │
│  │ GET /usuarios/todos       → obtenerTodosLosUsuarios          │   │
│  │ GET /estadisticas/general → obtenerEstadisticas              │   │
│  │ GET /                     → obtenerCuotas                    │   │
│  │ GET /:id                  → obtenerCuotaById                 │   │
│  │ POST /                    → crearCuota                       │   │
│  │ PUT /:id                  → editarCuota                      │   │
│  │ DELETE /:id               → eliminarCuota                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                          │                                             │
│                          ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Controllers (cuotasController.js)                              │   │
│  │                                                                 │   │
│  │ obtenerCuotasDisponibles()                                    │   │
│  │ ├─ Check user is admin (403 if not)                          │   │
│  │ ├─ SELECT from t_cuotas_mensuales                            │   │
│  │ └─ Return array of quotas                                    │   │
│  │                                                                 │   │
│  │ crearUsuario() (in authController.js)                         │   │
│  │ ├─ Create user in t_usuarios                                 │   │
│  │ ├─ If nutricionista/admin:                                   │   │
│  │ │  ├─ If cuotasSeleccionadas provided:                      │   │
│  │ │  │  └─ Use provided quota IDs                             │   │
│  │ │  └─ Else:                                                  │   │
│  │ │     └─ Assign ALL available quotas                        │   │
│  │ └─ INSERT into t_cuotas_usuario                              │   │
│  │                                                                 │   │
│  │ actualizarUsuario() (in authController.js)                    │   │
│  │ ├─ Detect tipo_perfil change                                 │   │
│  │ ├─ If cliente → nutricionista/admin:                         │   │
│  │ │  ├─ DELETE existing t_cuotas_usuario entries              │   │
│  │ │  └─ INSERT new entries                                     │   │
│  │ └─ Else if updating existing quotas:                         │   │
│  │    └─ DELETE and INSERT new assignments                     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                          │                                             │
│                          ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Middleware (auth.js)                                           │   │
│  │ - verificarToken: Validates JWT                              │   │
│  │ - Extracts user data from token                             │   │
│  │ - Checks user.tipo_perfil                                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                         Database Connection
                               │
┌──────────────────────────────▼──────────────────────────────────────────┐
│                     DATABASE / POSTGRESQL                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Tables                                                          │   │
│  │                                                                 │   │
│  │ t_usuarios                                                      │   │
│  │ ├─ id (PK)                                                     │   │
│  │ ├─ email                                                       │   │
│  │ ├─ password                                                    │   │
│  │ ├─ tipo_perfil (admin, nutricionista, cliente)               │   │
│  │ └─ ...                                                         │   │
│  │                                                                 │   │
│  │ t_cuotas_mensuales                                              │   │
│  │ ├─ id (PK)                                                     │   │
│  │ ├─ mes (1-12)                                                  │   │
│  │ ├─ ano                                                         │   │
│  │ ├─ monto                                                       │   │
│  │ ├─ fecha_vencimiento                                           │   │
│  │ └─ ...                                                         │   │
│  │                                                                 │   │
│  │ t_cuotas_usuario (Junction Table) ⭐ KEY TABLE                │   │
│  │ ├─ usuario_id (FK → t_usuarios)                              │   │
│  │ ├─ cuota_id (FK → t_cuotas_mensuales)                        │   │
│  │ ├─ estado (pendiente, pagado, etc.)                          │   │
│  │ └─ PRIMARY KEY (usuario_id, cuota_id)                        │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## User Creation Flow with Quota Assignment

```
START
  │
  ├─► Admin clicks "Crear Nuevo Usuario"
  │
  ├─► Modal opens
  │   ├─ formData = {nombre, apellido, email, password, tipo_perfil, cuotasSeleccionadas: []}
  │
  ├─► Admin fills form fields
  │   ├─ Nombre: "Juan"
  │   ├─ Apellido: "Pérez"
  │   ├─ Email: "juan@example.com"
  │   ├─ Contraseña: "Secure123!"
  │
  ├─► Admin selects tipo_perfil = "nutricionista"
  │   │
  │   ├─► useEffect detects tipo_perfil change
  │   │
  │   ├─► cargarCuotas() function called
  │   │   │
  │   │   ├─ API Request: GET /api/cuotas/disponibles/todas
  │   │   │  ├─ Header: Authorization: Bearer {token}
  │   │   │  │
  │   │   │  └─► Backend receives request
  │   │   │      ├─ verificarToken middleware checks JWT
  │   │   │      ├─ obtenerCuotasDisponibles() executes
  │   │   │      ├─ Checks if user.tipo_perfil === 'admin'
  │   │   │      ├─ Query: SELECT * FROM t_cuotas_mensuales
  │   │   │      └─ Returns: [{id:1, mes:1, ano:2024, ...}, ...]
  │   │   │
  │   │   └─ API Response: 200 OK with quota array
  │   │
  │   ├─► State updates: setCuotas([...])
  │   │
  │   └─► Quota section renders with checkboxes
  │       ├─ "Cargando cuotas..." loading state (briefly)
  │       ├─ Checkbox list appears
  │       ├─ "Seleccionar Todas" button
  │       └─ "Deseleccionar Todas" button
  │
  ├─► Admin selects 3 quotas by clicking checkboxes
  │   │
  │   ├─► toggleCuota(1) called
  │   │   └─ cuotasSeleccionadas = [1, 2, 3]
  │   │
  │   └─ formData updates: { ..., cuotasSeleccionadas: [1, 2, 3] }
  │
  ├─► Admin clicks "Crear Usuario" button
  │   │
  │   ├─► Form submits with onSubmit()
  │   │
  │   ├─► API Request: POST /api/auth/usuarios
  │   │   └─ Body: {
  │   │       nombre: "Juan",
  │   │       apellido: "Pérez",
  │   │       email: "juan@example.com",
  │   │       password: "Secure123!",
  │   │       tipo_perfil: "nutricionista",
  │   │       cuotasSeleccionadas: [1, 2, 3]
  │   │     }
  │   │
  │   └─► Backend receives request
  │       ├─ crearUsuario() executes
  │       ├─ INSERT into t_usuarios (creates user)
  │       ├─ Check if tipo_perfil === 'nutricionista' ✓
  │       ├─ Check if cuotasSeleccionadas provided ✓
  │       ├─ Use provided quota IDs: [1, 2, 3]
  │       ├─ INSERT into t_cuotas_usuario:
  │       │  ├─ (usuario_id=123, cuota_id=1, estado='pendiente')
  │       │  ├─ (usuario_id=123, cuota_id=2, estado='pendiente')
  │       │  └─ (usuario_id=123, cuota_id=3, estado='pendiente')
  │       │
  │       └─ Returns: 200 OK with user data
  │
  ├─► API Response: Success message
  │   └─ formData resets: { ..., cuotasSeleccionadas: [] }
  │
  ├─► Modal closes
  │
  ├─► User list refreshes to show new user
  │
  └─► END - User created with 3 quotas assigned
```

---

## User Type Change Flow (Cliente → Nutricionista)

```
START
  │
  ├─► Admin finds existing "cliente" user in list
  │
  ├─► Admin clicks edit button
  │   │
  │   └─► Modal opens with existing user data
  │       ├─ nombre: "Maria"
  │       ├─ apellido: "García"
  │       ├─ tipo_perfil: "cliente" (currently)
  │       └─ cuotasSeleccionadas: [] (not shown for clients)
  │
  ├─► Admin changes tipo_perfil dropdown from "cliente" to "nutricionista"
  │   │
  │   ├─► useEffect detects tipo_perfil change
  │   │
  │   └─► Quota section appears with checkboxes (same as create flow)
  │
  ├─► Admin selects 2 quotas: [5, 6]
  │   └─ formData: { ..., tipo_perfil: "nutricionista", cuotasSeleccionadas: [5, 6] }
  │
  ├─► Admin clicks "Guardar Cambios"
  │   │
  │   ├─► Form submits
  │   │
  │   ├─► API Request: PUT /api/auth/usuarios/456
  │   │   └─ Body: {
  │   │       tipo_perfil: "nutricionista",
  │   │       cuotasSeleccionadas: [5, 6]
  │   │     }
  │   │
  │   └─► Backend receives request
  │       ├─ actualizarUsuario(456) executes
  │       ├─ Get current user: tipo_perfil = 'cliente'
  │       ├─ New type: 'nutricionista'
  │       ├─ Detect type change! (cliente !== nutricionista)
  │       │
  │       ├─ DELETE from t_cuotas_usuario WHERE usuario_id=456
  │       │  └─ Removes any old quota assignments (there were none)
  │       │
  │       ├─ INSERT into t_cuotas_usuario:
  │       │  ├─ (usuario_id=456, cuota_id=5, estado='pendiente')
  │       │  └─ (usuario_id=456, cuota_id=6, estado='pendiente')
  │       │
  │       ├─ UPDATE t_usuarios SET tipo_perfil='nutricionista' WHERE id=456
  │       │
  │       └─ Returns: 200 OK with updated user data
  │
  ├─► API Response: Success message
  │   └─ formData resets
  │
  ├─► Modal closes
  │
  ├─► User list refreshes
  │   └─ Maria now shows tipo_perfil = "nutricionista"
  │
  └─► END - User type changed and quotas assigned
```

---

## Data Flow Diagram - Component State

```
GestionUsuariosSection
│
├─ State: formData
│  ├─ nombre
│  ├─ apellido
│  ├─ email
│  ├─ password
│  ├─ tipo_perfil
│  └─ cuotasSeleccionadas: []  ⭐
│
├─ State: isModalOpen
├─ State: isEditing
├─ State: error
│
└─► UsuarioModal (props: formData, setFormData, ...)
    │
    ├─ State: cuotas: []         ⭐
    ├─ State: cargandoCuotas
    ├─ State: error
    │
    ├─► Effect: when tipo_perfil changes
    │   └─ cargarCuotas()
    │       ├─ API call to GET /api/cuotas/disponibles/todas
    │       ├─ setCuotas(response.data)
    │       └─ setCargandoCuotas(false)
    │
    ├─► Function: toggleCuota(cuotaId)
    │   └─ Updates parent formData.cuotasSeleccionadas
    │
    ├─► Function: seleccionarTodas()
    │   └─ setFormData({ ...formData, cuotasSeleccionadas: cuotas.map(c => c.id) })
    │
    ├─► Function: deseleccionarTodas()
    │   └─ setFormData({ ...formData, cuotasSeleccionadas: [] })
    │
    └─► UI: Conditional render
        └─ {tipo_perfil === 'nutricionista' || tipo_perfil === 'admin' && (
             <motion.div>
               ├─ Loading: {cargandoCuotas && "Cargando cuotas..."}
               ├─ Empty: {cuotas.length === 0 && "No hay cuotas disponibles"}
               ├─ Checkboxes: {cuotas.map(cuota => (
               │   <input
               │     checked={formData.cuotasSeleccionadas.includes(cuota.id)}
               │     onChange={() => toggleCuota(cuota.id)}
               │   />
               │ ))}
               ├─ Select All Button
               └─ Deselect All Button
           )}
```

---

## API Endpoint Sequence Diagram

```
Frontend                     Backend                      Database
   │                           │                             │
   │ GET /api/cuotas/          │                             │
   │ disponibles/todas         │                             │
   ├──────────────────────────►│                             │
   │ (JWT Token in Header)     │                             │
   │                           │ verificarToken middleware   │
   │                           ├─ Extract JWT               │
   │                           ├─ Decode & validate         │
   │                           │ Get user.tipo_perfil       │
   │                           │                             │
   │                           │ Check if tipo_perfil === 'admin'
   │                           ├─ If NO: Return 403         │
   │                           │                             │
   │                           │ obtenerCuotasDisponibles()  │
   │                           ├────────────────────────────►│
   │                           │ SELECT id, mes, ano,        │
   │                           │ monto FROM t_cuotas_mensuales
   │                           │                             │
   │                           │◄────────────────────────────┤
   │                           │ [                           │
   │◄──────────────────────────┤  {id:1, mes:1, ano:2024},  │
   │ 200 OK                    │  {id:2, mes:2, ano:2024},  │
   │ [{id:1,...}, ...]         │  ...                        │
   │                           │ ]                           │
   │                           │                             │
   ├─ Render in UI            │                             │
   │  Checkboxes              │                             │
   │  "Seleccionar Todas"     │                             │
```

---

## Error Handling Flow

```
User selects "Nutricionista" tipo_perfil
│
├─► cargarCuotas() called
│
├─► try {
│   │
│   ├─ axios.get(API_ENDPOINTS.CUOTAS.GET_DISPONIBLES)
│   │
│   ├─ Two possible outcomes:
│   │
│   ├─► SUCCESS
│   │   ├─ response.data received
│   │   ├─ Array.isArray() check ✓
│   │   ├─ setCuotas(data)
│   │   ├─ console.log('✅ Cuotas cargadas:', data)
│   │   └─ UI shows quota checkboxes
│   │
│   └─► ERROR (Network/Server)
│       ├─ Error caught in catch block
│       │
│       └─ catch (err) {
│           │
│           ├─ console.error('❌ Error al cargar cuotas:', err)
│           ├─ console.error('Response error:', err.response?.data)
│           ├─ console.error('Status:', err.response?.status)
│           │
│           ├─ If 403 (Non-Admin):
│           │  └─ errorMsg = "Solo administradores pueden obtener cuotas disponibles"
│           │
│           ├─ If 500 (Server Error):
│           │  └─ errorMsg = "Error al obtener cuotas disponibles"
│           │
│           ├─ If Network Error:
│           │  └─ errorMsg = "Network Error"
│           │
│           ├─ setError(errorMsg)
│           │  └─ Red error box displays in modal with X to close
│           │
│           └─ setCuotas([])
│              └─ UI shows "No hay cuotas disponibles"
│       }
│
└─► finally {
    ├─ setCargandoCuotas(false)
    └─ Hide loading state
}
```

---

## Security Model Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                               │
└─────────────────────────────────────────────────────────────────┘

Layer 1: HTTPS/TLS
│
├─► All traffic between frontend and backend encrypted
│
├─► Certificate validation on connection
│
└─► Prevents man-in-the-middle attacks

Layer 2: JWT Authentication (verificarToken middleware)
│
├─► Token required in Authorization header
│   └─ "Bearer <jwt_token>"
│
├─► Token decoded and validated
│   ├─ Signature verification
│   ├─ Expiration check
│   └─ Claims validation
│
├─► Decoded user data attached to req.usuario
│   ├─ id
│   ├─ email
│   └─ tipo_perfil
│
└─► 401 Unauthorized if token missing or invalid

Layer 3: Role-Based Access Control (RBAC)
│
├─► obtenerCuotasDisponibles()
│   │
│   ├─ Check: req.usuario.tipo_perfil === 'admin'
│   │
│   ├─ If false → 403 Forbidden
│   │
│   └─ If true → Allow access
│
├─► crearUsuario()
│   │
│   ├─ Check: req.usuario.tipo_perfil === 'admin'
│   │
│   └─ Allow only admin to create users
│
└─► actualizarUsuario()
    │
    ├─ Check: req.usuario.tipo_perfil === 'admin'
    │
    └─ Allow only admin to update users

Layer 4: Data Validation
│
├─► Frontend validation
│   ├─ Array.isArray(response.data)
│   ├─ Email format validation
│   └─ Required field checks
│
├─► Backend validation
│   ├─ Email format validation (Joi/validator)
│   ├─ Password strength validation
│   ├─ User type validation (enum: admin, nutricionista, cliente)
│   ├─ Quota ID validation (exists in database)
│   └─ Quota array validation (Array type)
│
└─► Database constraints
    ├─ Foreign key constraints
    ├─ Primary key constraints
    ├─ Not null constraints
    └─ Unique constraints (email)

Layer 5: SQL Injection Prevention
│
├─► Parameterized queries
│   │
│   ├─ $1, $2, $3, ... placeholders
│   │
│   └─ Never string concatenation
│
└─► Example:
    ├─ Safe: pool.query('SELECT * FROM t_usuarios WHERE id = $1', [id])
    └─ Unsafe: pool.query(`SELECT * FROM t_usuarios WHERE id = ${id}`)
```

---

## Performance Optimization Points

```
Current Implementation:
│
├─ Quota loading occurs once per modal open
│   └─ Re-loads on every open (not cached)
│
├─ Form submission is single operation
│   └─ User + quotas created atomically
│
└─ Checkbox selection is instant
    └─ No API calls per checkbox

Future Optimization Opportunities:
│
├─ Cache quota list at component level
│   └─ Avoid re-fetching on subsequent opens
│
├─ Implement React Query or SWR for data fetching
│   └─ Built-in caching and background refresh
│
├─ Add debouncing to quota loading
│   └─ Prevent rapid repeated requests
│
├─ Pagination for large quota lists
│   └─ If thousands of quotas exist
│
└─ Batch operations for bulk user assignment
    └─ Assign same quotas to multiple users
```

---

This architecture provides a scalable, secure foundation for quota assignment while maintaining separation of concerns and following React/Express best practices.
