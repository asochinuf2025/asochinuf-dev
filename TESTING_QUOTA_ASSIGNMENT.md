# Testing Quota Assignment Feature

This document provides step-by-step testing instructions for the newly implemented quota assignment feature.

## Feature Summary

The quota assignment feature allows admins to:
1. Assign specific quotas to new nutricionista/admin users during user creation
2. Assign/reassign quotas when changing an existing cliente user to nutricionista/admin
3. Select all quotas at once or deselect all quotas
4. See available quotas load dynamically in the user modal

## Prerequisites

- Backend running on `http://localhost:5001`
- Frontend running on `http://localhost:3000`
- Admin user logged in with access to user management section
- At least 1 quota created in the system (preferably multiple)

## Test Case 1: Create New Nutricionista with Selected Quotas

### Steps:
1. Navigate to Dashboard → Gestión (User Management section)
2. Click "Crear Nuevo Usuario" button
3. Fill in the form:
   - **Nombre:** "Test Nutricionista"
   - **Apellido:** "One"
   - **Email:** "testnutri1@example.com"
   - **Contraseña:** "Password123!"
   - **Tipo de Perfil:** Select "Nutricionista"
4. When you select "Nutricionista", the "Asignar Cuotas" section should appear below
5. Verify that cuotas load (should see "Cargando cuotas..." initially, then a list)
6. **Expected**: Should see a list of available quotas with checkboxes
7. Check the boxes for 3-4 quotas (e.g., Select "Ene 2024", "Feb 2024", "Mar 2024")
8. Click "Seleccionar Todas" button - all quotas should be checked
9. Click "Deseleccionar Todas" button - all should be unchecked
10. Manually select 2-3 quotas again
11. Click "Crear Usuario" button
12. **Expected**: User should be created successfully and quotas assigned

### Verification:
- Check backend logs for:
  - `✅ Cuotas cargadas:` message with quota list
  - No errors when creating user
  - Confirm user was created with assigned quotas

## Test Case 2: Create New Admin with All Quotas

### Steps:
1. Click "Crear Nuevo Usuario" button
2. Fill in:
   - **Nombre:** "Test Admin"
   - **Apellido:** "Two"
   - **Email:** "testadmin2@example.com"
   - **Contraseña:** "Password123!"
   - **Tipo de Perfil:** Select "Admin"
3. When Admin is selected, quota section should appear
4. **Do NOT select any specific quotas** (leave all unchecked)
5. Click "Crear Usuario"
6. **Expected**: User should be created and ALL available quotas should be assigned automatically

### Verification:
- Verify in backend logs that all quotas were assigned
- Check database to confirm `t_cuotas_usuario` entries were created for all quotas

## Test Case 3: Change Cliente to Nutricionista

### Steps:
1. In the user management section, find an existing "cliente" type user
2. Click the edit button (pencil icon) next to that user
3. Change **Tipo de Perfil** from "Cliente" to "Nutricionista"
4. When you change the type, quota section should appear
5. Select 2-3 quotas
6. Click "Guardar Cambios"
7. **Expected**: User type should change, previous quota assignments (if any) should be replaced with new selections

### Verification:
- Confirm the user's `tipo_perfil` changed in the database
- Check `t_cuotas_usuario` table shows only the newly selected quotas for this user

## Test Case 4: Client User Sees No Quota Notifications

### Steps:
1. Log out from admin account
2. Log in as a "cliente" type user
3. Click the notification bell icon (top right area)
4. **Expected**: Should see notification popup with message "Sin notificaciones"
5. **Expected**: NO quota-related information should be displayed
6. Should NOT crash or show errors

### Verification:
- Check browser console - should have no errors related to quotas
- Notification should open/close smoothly without crashes

## Test Case 5: Admin Sees Quota Notifications

### Steps:
1. Log out and log back in as admin
2. Click the notification bell icon
3. **Expected**: Should see notification popup with quota-related information
4. If the admin has pending quotas, should see "Cuotas Pendientes" section
5. If the admin has overdue quotas, should see "Estás en morosidad" alert
6. Should be able to see list of up to 3 overdue quotas
7. Should see "Ver Cuotas y Pagos" button if there are pending/overdue quotas

### Verification:
- Notifications display correctly without errors
- Can click "Ver Cuotas y Pagos" to navigate to cuotas tab

## Expected Console Logs

### Successful quota loading:
```
✅ Cuotas cargadas: [
  { id: 1, mes: 1, ano: 2024, monto: 50000, ... },
  { id: 2, mes: 2, ano: 2024, monto: 50000, ... },
  ...
]
```

### Error scenario (403 Forbidden for non-admin trying to access endpoint):
```
❌ Error al cargar cuotas: Error
Status: 403
```

### Error scenario (No quotas in database):
```
✅ Cuotas cargadas: []
```

## Troubleshooting

### Issue: "No hay cuotas disponibles" message appears
- **Check**: Is there at least 1 quota created in the system?
- **Check**: Is the endpoint returning data? Check network tab in DevTools
- **Check**: Is the API URL correct? Should be `http://localhost:5001/api/cuotas/disponibles/todas`

### Issue: Quota section doesn't appear when selecting nutricionista
- **Check**: Did you change the `tipo_perfil` to "nutricionista"?
- **Check**: Is JavaScript running? Check browser console for errors
- **Check**: Is the component state updating? Check React DevTools

### Issue: Quotas selected but not saved
- **Check**: Does the form submit successfully? Check backend logs
- **Check**: Is `cuotasSeleccionadas` being sent in request body?
- **Check**: Check network tab to see what's being sent to backend

### Issue: Page crashes when clicking notifications
- **Check**: Is it a "Cannot read properties of null" error?
- **Check**: Check if optional chaining (`?.`) is being used correctly
- **Check**: Make sure `esCliente` variable is properly set based on `usuario?.tipo_perfil`

## Performance Notes

- Quotas are loaded each time the modal opens with matching `tipo_perfil`
- Loading state shows "Cargando cuotas..." during API call
- Selecting/deselecting is instant (client-side state)
- Form submission includes `cuotasSeleccionadas` array in request body

## API Endpoints Used

- **GET** `/api/cuotas/disponibles/todas` - Fetch all available quotas (admin only)
- **POST** `/api/auth/usuarios` - Create user with `cuotasSeleccionadas` in body
- **PUT** `/api/auth/usuarios/:id` - Update user with `cuotasSeleccionadas` in body

## Database Tables Involved

- `t_usuarios` - User records
- `t_cuotas_mensuales` - Quota definitions
- `t_cuotas_usuario` - Junction table linking users to assigned quotas
