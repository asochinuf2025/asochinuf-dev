# Email Verification System Setup

## Overview
Se ha implementado un sistema completo de verificación de email para registros normales (sin Google OAuth). Los usuarios ahora deben verificar su email antes de poder iniciar sesión.

## Changes Made

### 1. Backend - Database Schema

#### New Table: `t_verification_tokens`
```sql
CREATE TABLE t_verification_tokens (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  fecha_expiracion TIMESTAMP NOT NULL,
  usado BOOLEAN DEFAULT false,
  fecha_uso TIMESTAMP,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id) ON DELETE CASCADE
);
```

#### Modified Table: `t_usuarios`
Se agregaron dos columnas a `t_usuarios`:
- `email_verificado` (BOOLEAN DEFAULT false) - Indica si el email ha sido verificado
- `google_id` (VARCHAR(255)) - Para autenticación con Google (ya existía en algunos casos)

**Script de actualización (si la tabla ya existe):**
```sql
ALTER TABLE t_usuarios ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT false;
ALTER TABLE t_usuarios ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_usuario_id ON t_verification_tokens(usuario_id);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token_hash ON t_verification_tokens(token_hash);
```

### 2. Email Service Updates

**File:** `backend/services/emailService.js`

#### New Function: `enviarVerificacionEmail(email, nombre, token)`
Envía un email de verificación con:
- Logo de ASOCHINUF desde Cloudinary
- Enlace con token válido por 24 horas
- Instrucciones claras

#### Updated Functions:
- `enviarRecuperacion()` - Ahora incluye logo
- `enviarBienvenida()` - Ahora incluye logo

**Logo URL:**
```
https://res.cloudinary.com/dc8qanjnd/image/upload/v1763733056/logo-letras_q5rp7d.png
```

### 3. Authentication Controller

**File:** `backend/controllers/authController.js`

#### Updated: `registro()`
- El usuario se crea con `activo = false` y `email_verificado = false`
- Se genera un token de verificación único y se guarda en `t_verification_tokens`
- Se envía un email de verificación automáticamente
- Retorna un mensaje pidiendo que verifique el email (sin JWT token)

#### New: `verificarTokenEmail(token)`
- GET `/api/auth/verificar-email/:token`
- Valida el token sin consumirlo
- Retorna usuario_id si es válido

#### New: `confirmarEmail(token)`
- POST `/api/auth/confirmar-email`
- Valida y consume el token
- Actualiza usuario: `email_verificado = true`, `activo = true`
- Retorna JWT token y datos del usuario

#### Updated: `login()`
- Verifica que `email_verificado = true` antes de permitir login
- Si no verificado, retorna error 403 con mensaje informativo
- Si usuario inactivo, retorna error 403

### 4. API Routes

**File:** `backend/routes/auth.js`

Nuevos endpoints:
```javascript
router.get('/verificar-email/:token', verificarTokenEmail);
router.post('/confirmar-email', confirmarEmail);
```

### 5. Email Templates

Todos los emails incluyen ahora:
1. Logo de ASOCHINUF en el header
2. Diseño consistente con gradiente púrpura
3. Botones con CTA claros
4. Link alternativo de texto

**Emails actualizados:**
- Recuperación de contraseña
- Bienvenida (cuando se confirma email)
- Verificación de email (nuevo)

## Frontend Integration Needed

### Register Flow Changes

1. **Registro sin Google:**
   - Usuario completa formulario y envía
   - Backend responde con `requiresEmailVerification: true`
   - Frontend debe mostrar mensaje: "Por favor, verifica tu email para continuar"
   - Mostrar input para que el usuario pegue el token manualmente (alternativa)
   - O automáticamente abrir página de verificación si tiene el token en URL

2. **Verificación de Email:**
   - Nueva ruta: `/verificar-email?token=xxxxx`
   - Página debe:
     - Validar token con GET `/api/auth/verificar-email/:token`
     - Si válido, mostrar opción para confirmar
     - Confirmar con POST `/api/auth/confirmar-email` con el token
     - Si éxito, guardar token JWT y redirigir a dashboard
     - Si error, mostrar mensaje con opción de re-enviar

3. **Login Mejorado:**
   - Si error 403 con `requiresEmailVerification: true`
   - Mostrar mensaje: "Tu email no ha sido verificado"
   - Botón para re-enviar email de verificación (endpoint a crear)
   - Link a página de verificación

### Google OAuth
- Google OAuth ahora funciona directamente (el email ya está verificado por Google)
- Los usuarios de Google obtienen `email_verificado = true` automáticamente

## Database Initialization

Para nuevas instalaciones:
```bash
cd backend
npm run db:init
```

Para bases de datos existentes, ejecutar manualmente:
```bash
# Agregar columnas a t_usuarios si no existen
ALTER TABLE t_usuarios ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT false;
ALTER TABLE t_usuarios ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);

# Crear tabla de tokens de verificación
CREATE TABLE IF NOT EXISTS t_verification_tokens (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  fecha_expiracion TIMESTAMP NOT NULL,
  usado BOOLEAN DEFAULT false,
  fecha_uso TIMESTAMP,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_verification_tokens_usuario_id ON t_verification_tokens(usuario_id);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token_hash ON t_verification_tokens(token_hash);
```

## API Response Examples

### Registro exitoso:
```json
{
  "mensaje": "Usuario registrado exitosamente. Por favor, verifica tu email para completar el registro.",
  "email": "user@example.com",
  "requiresEmailVerification": true
}
```

### Intento de login sin email verificado:
```json
{
  "error": "Tu email no ha sido verificado. Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación.",
  "requiresEmailVerification": true,
  "email": "user@example.com"
}
```

### Confirmación de email exitosa:
```json
{
  "mensaje": "Email verificado exitosamente. Bienvenido a ASOCHINUF",
  "token": "eyJhbGc...",
  "usuario": {
    "id": 1,
    "email": "user@example.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "tipo_perfil": "cliente",
    "foto": null
  }
}
```

## Environment Variables

Asegúrate de que estas variables estén configuradas en `.env`:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@asochinuf.com

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

# Frontend URL for email links
FRONTEND_URL=http://localhost:3000
```

## Additional Features to Implement

### 1. Re-send Verification Email
Endpoint para que usuarios puedan re-enviar el email de verificación:
```javascript
POST /api/auth/reenviar-verificacion
Body: { email: "user@example.com" }
```

### 2. Email Verification Expiration
Considerar agregar un endpoint para limpiar tokens expirados:
```javascript
// En un job/cron
DELETE FROM t_verification_tokens WHERE fecha_expiracion < NOW() AND usado = false;
```

### 3. Resend Email Handler
Para usuarios que pierdan el email, agregar botón en login para re-enviar.

## Security Considerations

✅ **Implementado:**
- Tokens hasheados con SHA-256 en la BD
- Tokens únicos de 64 caracteres (32 bytes)
- Tokens con expiración de 24 horas
- Tokens de una sola vez (usado = true)
- No se retorna el token sin hash en respuestas

⚠️ **Recomendado:**
- Rate limiting en endpoint de registro/reenvío
- CAPTCHA en formulario de registro
- Validación adicional de email (DNS/MX records)
- Email confirmado dentro del mismo navegador/IP

## Rollback (if needed)

Si necesitas revertir estos cambios:

```sql
-- No eliminar datos, solo agregar flag
UPDATE t_usuarios SET email_verificado = true WHERE google_id IS NOT NULL;
UPDATE t_usuarios SET email_verificado = true WHERE activo = true AND email_verificado = false;
UPDATE t_usuarios SET activo = true WHERE activo = false;

-- Opcional: eliminar tabla de verificación
DROP TABLE t_verification_tokens;

-- Opcional: eliminar columnas
ALTER TABLE t_usuarios DROP COLUMN email_verificado;
ALTER TABLE t_usuarios DROP COLUMN google_id;
```

## Testing Checklist

- [ ] Nuevo usuario registrado puede recibir email
- [ ] Token en email es válido
- [ ] Token expira después de 24 horas
- [ ] Token se invalida después de usarlo una vez
- [ ] Usuario no puede login sin verificar email
- [ ] Usuario puede login después de verificar email
- [ ] Google OAuth funciona sin requerir verificación
- [ ] Email de recuperación incluye logo
- [ ] Email de bienvenida incluye logo
