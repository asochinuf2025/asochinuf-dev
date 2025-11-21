# Script de Verificación de Email

Este script agrega de forma **no invasiva** la funcionalidad de verificación de email a tu base de datos PostgreSQL existente.

## ⚡ Inicio Rápido

### Opción 1: Node.js (Recomendado)
Si el backend está corriendo y tienes acceso a la terminal:

```bash
cd backend
node scripts/add-email-verification.js
```

**Ventajas:**
- ✅ No necesitas credenciales de PostgreSQL directas
- ✅ Usa la misma conexión que el backend
- ✅ Retorna estadísticas finales
- ✅ Mensajes de progreso en español

### Opción 2: SQL Directo (PostgreSQL CLI)
Si prefieres ejecutar SQL manualmente:

```bash
psql -U tu_usuario -d tu_base_datos -f scripts/add-email-verification.sql
```

O dentro de pgAdmin/DBeaver:
1. Abre el editor SQL
2. Copia el contenido de `add-email-verification.sql`
3. Ejecuta

## 🔍 ¿Qué hace el script?

### No invasivo - Solo agrega:

1. **Columna `email_verificado` en `t_usuarios`**
   - BOOLEAN DEFAULT false
   - Indica si el usuario verificó su email

2. **Columna `google_id` en `t_usuarios`**
   - VARCHAR(255)
   - Para almacenar el ID de Google OAuth

3. **Nueva tabla `t_verification_tokens`**
   - Almacena tokens de verificación hasheados
   - Incluye fecha de expiración (24 horas)
   - Marca si fue usado (one-time use)
   - Referencia a usuario_id

4. **Índices para optimización**
   - `idx_verification_tokens_usuario_id`
   - `idx_verification_tokens_token_hash`

5. **Datos existentes**
   - Todos los usuarios existentes se marcan como verificados
   - No se pierden datos
   - No se bloquea acceso a usuarios ya registrados

## ✅ Verificación

Después de ejecutar, verás:

```
✅ ¡Actualización completada exitosamente!

📝 Resumen de cambios:
   • Columna email_verificado agregada a t_usuarios
   • Columna google_id agregada a t_usuarios
   • Tabla t_verification_tokens creada
   • Índices para optimización creados
   • Usuarios existentes marcados como verificados
```

## 🔄 Rollback (si algo sale mal)

Si necesitas revertir:

```sql
-- Simplemente eliminar tabla de verificación
DROP TABLE IF EXISTS t_verification_tokens;

-- Opcional: eliminar columnas (mantiene datos)
ALTER TABLE t_usuarios DROP COLUMN IF EXISTS email_verificado;
ALTER TABLE t_usuarios DROP COLUMN IF EXISTS google_id;
```

## 🛡️ Seguridad

- ✅ Los tokens se guardan hasheados (SHA-256)
- ✅ Los tokens son únicos y de una sola vez
- ✅ Expiran después de 24 horas
- ✅ Las contraseñas de usuarios NO se modifican
- ✅ Los datos existentes se preservan

## 📋 Requisitos

- PostgreSQL 10+ (es muy probable que ya tengas esta versión)
- Acceso a la base de datos con permisos de ALTER TABLE y CREATE TABLE
- La tabla `t_usuarios` debe existir

## ⚠️ Notas Importantes

- **No borra nada**: El script solo agrega nuevas columnas y tablas
- **Usuarios existentes**: Se marcan automáticamente como verificados para que no se bloquee su acceso
- **Nuevos usuarios**: A partir de ahora deben verificar email (excepto Google OAuth)
- **Sin downtime**: Puedes ejecutarlo con el backend corriendo

## 🆘 Si hay error

Errores comunes y soluciones:

### "Relation t_usuarios does not exist"
La tabla t_usuarios no existe. Primero ejecuta:
```bash
npm run db:init
```

### "Connection refused"
PostgreSQL no está corriendo o las credenciales en .env son incorrectas.
Verifica:
```bash
echo $DATABASE_URL
```

### "Permission denied"
Tu usuario de PostgreSQL no tiene permisos. Asegúrate de que el usuario pueda:
- ALTER TABLE
- CREATE TABLE
- CREATE INDEX

## 📞 Soporte

Si algo no funciona:
1. Revisa que PostgreSQL esté corriendo
2. Verifica que la tabla `t_usuarios` exista
3. Comprueba que .env tenga DATABASE_URL correcto
4. Revisa logs de PostgreSQL para mensajes de error

## 🎯 Siguientes Pasos

Después de ejecutar este script:

1. **En el Frontend:**
   - Crear página `/verificar-email`
   - Actualizar modal de registro
   - Mejorar manejo de login

2. **En el Backend:**
   - ✅ Ya está implementado
   - Endpoints listos: `/verificar-email/:token` y `/confirmar-email`

3. **Opcional:**
   - Crear endpoint para reenviar email de verificación
   - Agregar limpieza automática de tokens expirados
