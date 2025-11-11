# Guía de Migración: Neon → Railway

## Descripción General

Esta guía te ayuda a migrar todos los datos y esquema de tu base de datos desde **Neon** (desarrollo) a **Railway** (producción).

Tenemos 2 scripts:
1. **`init-db-railway.js`** - Crea el esquema en Railway
2. **`migrate-db.js`** - Copia todos los datos de Neon a Railway

---

## Paso 1: Obtener la URL de Railway

1. Ve a [railway.app](https://railway.app)
2. Abre tu proyecto ASOCHINUF
3. Selecciona el servicio de PostgreSQL
4. En "Connect" → "Connection string", copia la URL completa
5. Debe verse así:
   ```
   postgresql://postgres:PASSWORD@host:PORT/dbname?sslmode=require
   ```

---

## Paso 2: Actualizar el archivo `.env`

Abre `backend/.env` y agrega la siguiente línea **al final**:

```env
RAILWAY_DATABASE_URL=postgresql://postgres:PASSWORD@host:PORT/dbname?sslmode=require
```

**Ejemplo:**
```env
# Neon (actual)
DATABASE_URL=postgresql://neondb_owner:npg_If01onjwDtFT@ep-aged-band-a4k3ysul-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

# Railway (NUEVA - agregar esta línea)
RAILWAY_DATABASE_URL=postgresql://postgres:TuPasswordAqui@railway.proxy.rlwy.net:10217/railway?sslmode=require
```

---

## Paso 3: Inicializar BD en Railway

Ejecuta este comando para crear el esquema en Railway:

```bash
cd backend
node scripts/init-db-railway.js
```

**Deberías ver algo como:**
```
═══════════════════════════════════════════════════════
   INICIALIZANDO BD RAILWAY
═══════════════════════════════════════════════════════

Creando tabla t_usuarios...
✓ Tabla t_usuarios creada
...
✅ BASE DE DATOS RAILWAY INICIALIZADA CORRECTAMENTE
═══════════════════════════════════════════════════════
```

---

## Paso 4: Migrar los datos

Ahora copia TODOS los datos de Neon a Railway:

```bash
cd backend
node scripts/migrate-db.js
```

**Deberías ver algo como:**
```
═══════════════════════════════════════════════════════
   MIGRACIÓN DE BD: NEON → RAILWAY
═══════════════════════════════════════════════════════

🔌 Conectando a bases de datos...
✓ Conectado a Neon (origen)
✓ Conectado a Railway (destino)

📋 Iniciando migración de datos...

1️⃣  Deshabilitando constraints en Railway...
2️⃣  Migrando t_usuarios...
   ✓ 5 usuarios migrados
3️⃣  Migrando t_pacientes...
   ✓ 42 pacientes migrados
...
✅ MIGRACIÓN COMPLETADA CON ÉXITO
═══════════════════════════════════════════════════════
```

---

## Paso 5: Cambiar a Railway en Producción

Una vez confirmado que la migración fue exitosa:

### Opción A: Cambiar archivo `.env`

Comenta la línea de Neon y descomenta Railway:

```env
# Base de datos - Comentar para producción
# DATABASE_URL=postgresql://neondb_owner:npg_If01onjwDtFT@...

# Base de datos - Railway para producción
DATABASE_URL=postgresql://postgres:PASSWORD@host:PORT/railway?sslmode=require
```

### Opción B: Usar variables de entorno en Railway

1. En Railway → Project Settings → Environment
2. Agrega o actualiza `DATABASE_URL` con tu URL de Railway
3. No necesitas cambiar el archivo local

---

## Paso 6: Verificar la Migración

Para asegurarte de que todo se migró correctamente:

### Opción 1: Desde Railway Dashboard
1. Ve a Railway → PostgreSQL → Data
2. Verifica que las tablas tengan datos

### Opción 2: Conectarse con CLI
```bash
# Reemplaza con tu URL de Railway
psql "postgresql://postgres:PASSWORD@host:PORT/railway?sslmode=require"

# Dentro de psql:
\dt                                    # Listar tablas
SELECT COUNT(*) FROM t_usuarios;       # Contar usuarios
SELECT COUNT(*) FROM t_pacientes;      # Contar pacientes
SELECT COUNT(*) FROM t_informe_antropometrico;  # Contar mediciones
\q                                     # Salir
```

---

## ¿Qué se migra?

✅ **Tablas y esquema:**
- t_usuarios
- t_pacientes
- t_clientes
- t_nutricionistas
- t_cursos
- t_inscripciones
- t_planteles (44 equipos)
- t_categorias (12 categorías)
- t_sesion_mediciones
- t_informe_antropometrico (TODOS los datos de mediciones)
- t_excel_uploads
- t_recovery_tokens
- t_cuotas_mensuales
- t_cuotas_usuario
- t_pagos_cuotas

✅ **Índices:** Todos los índices se recrean automáticamente

✅ **Datos:** 100% de los datos se copian

---

## Solución de Problemas

### "RAILWAY_DATABASE_URL no está configurada"
**Solución:** Asegúrate de haber agregado la línea correcta en `.env`

### "Connection timeout"
**Solución:** Verifica que la URL sea correcta. Copia de Railway nuevamente.

### "Error: no existe la tabla..."
**Solución:** Ejecuta `init-db-railway.js` primero antes de `migrate-db.js`

### "Algunos datos no se copiaron"
**Solución:** Es probable un error de integridad referencial. Verifica:
1. Los usuarios existen antes de los pacientes
2. Los planteles existen antes de sesiones

---

## Rollback (si algo sale mal)

Si necesitas volver atrás:

1. **Elimina los datos de Railway** (cuidado):
   ```bash
   # PELIGRO - Esto elimina TODO
   node scripts/init-db-railway.js  # Reinicia limpio
   ```

2. **Vuelve a Neon en `.env`:**
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_If01onjwDtFT@...
   ```

3. **Reinicia el servidor:**
   ```bash
   npm run dev
   ```

---

## Verificación Final

Después de la migración, prueba en tu aplicación:

1. **Login:** ¿Funciona con las credenciales de Neon?
2. **Dashboard:** ¿Se cargan los datos?
3. **Excel Upload:** ¿Puedes subir y ver datos?
4. **Cursos:** ¿Se ven los cursos?

---

## Más info

- **Script de migración:** `backend/scripts/migrate-db.js`
- **Script de init Railway:** `backend/scripts/init-db-railway.js`
- **Documentación:** Ver CLAUDE.md

