# Quick Start Testing Guide - Quota Assignment Feature

## Pre-requisites
- Backend running: `npm run dev` (port 5001)
- Frontend running: `npm start` (port 3000)
- Admin user credentials ready
- At least 1 quota created in the database

## Quick Test (5 minutes)

### Step 1: Start Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

Wait for both to start:
- Backend: Look for "Conexión a PostgreSQL exitosa"
- Frontend: Look for "webpack compiled"

### Step 2: Login as Admin
1. Go to http://localhost:3000
2. Click "Iniciar Sesión"
3. Enter admin credentials
4. Click "Iniciar Sesión"

### Step 3: Navigate to User Management
1. On dashboard, click "Gestión" tab (left sidebar)
2. Should see "Gestión de Usuarios" section

### Step 4: Create New Nutricionista with Quotas
1. Click "Crear Nuevo Usuario" button
2. Fill form:
   - Nombre: "Test"
   - Apellido: "User"
   - Email: "test@example.com"
   - Contraseña: "Test123!"
   - Tipo de Perfil: **Select "Nutricionista"**
3. Wait 1-2 seconds - quota section should appear with "Cargando cuotas..."
4. Wait for quota list to load
5. Check some quotas
6. Click "Crear Usuario"
7. Should see success message

### Step 5: Verify in Console
Open DevTools (F12) → Console tab, look for:
```
✅ Cuotas cargadas: [{...}, {...}, ...]
```

### Step 6: Test Client Notification
1. Log out
2. Log in as a client user
3. Click the bell icon (notifications)
4. Should see "Sin notificaciones" message
5. Should NOT see any quota information
6. Should NOT crash

## Test Results Checklist

| Test | Expected Result | Status |
|------|-----------------|--------|
| Create nutricionista with quotas | User created, quotas assigned | [ ] |
| Quota section appears for nutricionista | Animates into view | [ ] |
| Console shows "✅ Cuotas cargadas" | Success message visible | [ ] |
| Select All button works | All quotas checked | [ ] |
| Deselect All button works | All quotas unchecked | [ ] |
| Create admin without selecting quotas | All quotas assigned automatically | [ ] |
| Client sees "Sin notificaciones" | No crash, clean message | [ ] |
| Change cliente to nutricionista | New quotas assigned | [ ] |

## Debugging Commands

### Check if backend is listening
```bash
curl http://localhost:5001/api/health
# Should return 200 OK
```

### Test quota endpoint directly
```bash
# Get your JWT token from browser localStorage (asochinuf_token)
# Then run:
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/cuotas/disponibles/todas
```

### Check backend logs for errors
Look in backend console for:
- `Error en obtenerCuotasDisponibles:`
- `❌ Error`
- PostgreSQL connection errors

### Check frontend network requests
1. Open DevTools (F12)
2. Network tab
3. Filter by "disponibles"
4. Click button to trigger request
5. Check response and status code (should be 200)

## Common Issues & Fixes

### Issue: "No hay cuotas disponibles"
**Check:**
1. Are there quotas in the database? Check mantenedor tab
2. Is the request being made? Check Network tab in DevTools
3. Is the response 200 or an error? Check Status column

**Fix:**
1. Create at least 1 quota in the system
2. Refresh page
3. Try again

### Issue: Quota section doesn't appear
**Check:**
1. Is `tipo_perfil` changing? Try selecting and deselecting the dropdown
2. Are there JavaScript errors? Check console for red errors
3. Is the component re-rendering? Check React DevTools

**Fix:**
1. Hard refresh (Ctrl+F5 or Cmd+Shift+R)
2. Check browser console for errors
3. Check backend is returning quotas

### Issue: Quota section appears but no quotas
**Check:**
1. Is API returning empty array? Check Network tab
2. Are quotas deleted? Check database
3. Is error message showing? Look for red error box in modal

**Fix:**
1. Create quotas in mantenedor
2. Check backend for errors in console
3. Verify token has admin privileges

### Issue: "Cannot read properties of null (reading 'cuotasMorosas')"
**Check:**
1. Is this error happening for clients? Check user type
2. Is bell icon being clicked? Might be notification load issue
3. Are there quotas in the database?

**Fix:**
1. This should not happen - feature is implemented with null checks
2. Try clearing localStorage and logging back in
3. Check if backend error response from GET_RESUMEN

## Performance Tips

- Quota loading happens once when modal opens
- Selection/deselection is instant (no API calls)
- User creation includes quota assignment atomically
- No page reload needed after quota assignment

## Next Steps After Testing

If all tests pass:
1. Create a git commit with changes
2. Push to feature branch
3. Create pull request for code review
4. Deploy to staging environment
5. Run end-to-end tests

If issues found:
1. Check browser console for error messages
2. Check backend console for database errors
3. Verify API response in Network tab
4. Review the QUOTA_ASSIGNMENT_IMPLEMENTATION.md for detailed documentation
