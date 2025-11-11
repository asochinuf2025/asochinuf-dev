# 🚀 MIGRACIÓN NEON → RAILWAY - COMIENZA AQUÍ

## ¿Qué tienes?

He creado **4 scripts completos** para migrar tu base de datos de Neon a Railway sin perder ningún dato.

```
✅ init-db-railway.js      → Crea el esquema en Railway
✅ migrate-db.js           → Copia todos los datos
✅ validate-migration.js   → Valida que todo está OK
✅ quick-test.js           → Prueba conexiones
```

---

## ⚡ PLAN DE ACCIÓN (5-10 minutos)

### PASO 1: Obtener URL de Railway

1. Abre https://railway.app
2. Ve a tu proyecto **ASOCHINUF**
3. Selecciona el servicio **PostgreSQL**
4. Haz click en "Connect"
5. Copia la **Connection string** completa (comienza con `postgresql://`)

**Ejemplo:**
```
postgresql://postgres:PASSWORD123@railway.proxy.rlwy.net:10217/railway?sslmode=require
```

### PASO 2: Actualizar `.env`

1. Abre: `backend/.env`
2. **Busca dónde termina el archivo** (línea con CLOUDINARY_URL comentada)
3. **Agrega ESTA línea** (reemplaza PASSWORD y host con tu URL):

```env
RAILWAY_DATABASE_URL=postgresql://postgres:PASSWORD123@railway.proxy.rlwy.net:10217/railway?sslmode=require
```

**Así debe quedar:**
```env
...
#CLOUDINARY_URL=cloudinary://474564119143581:iEoMm4rlslmBgcO0tDv-PulRnwE@dc8qanjnd

# NUEVA LINEA:
RAILWAY_DATABASE_URL=postgresql://postgres:PASSWORD123@railway.proxy.rlwy.net:10217/railway?sslmode=require
```

### PASO 3: Ejecutar script de inicialización

Abre una terminal PowerShell en `backend/` y ejecuta:

```powershell
cd c:\MisProyectosReact\asochinuf-dev\backend
node scripts/quick-test.js
```

**Deberías ver algo así:**
```
═════════════════════════════════════════════
   PRUEBA DE CONEXIÓN: NEON vs RAILWAY
═════════════════════════════════════════════

✅ Neon: Conectado exitosamente
   15 tablas encontradas
   5 usuarios

✅ Railway: Conectado exitosamente
   0 tablas encontradas
   0 usuarios

═════════════════════════════════════════════
⚠️  Railway OK pero sin tablas (normal)
Ejecuta: node scripts/init-db-railway.js
```

**Si ves error**, verifica:
- [ ] Copiaste bien la URL de Railway
- [ ] La URL está en `RAILWAY_DATABASE_URL` (no en DATABASE_URL)
- [ ] Guardaste el archivo `.env`

### PASO 4: Inicializar Railway

Ejecuta:

```powershell
node scripts/init-db-railway.js
```

**Deberías ver:** (demora ~10 segundos)
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

### PASO 5: Migrar los datos

Ejecuta:

```powershell
node scripts/migrate-db.js
```

**Deberías ver:** (demora 1-5 minutos)
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

### PASO 6: Validar la migración

Ejecuta:

```powershell
node scripts/validate-migration.js
```

**Deberías ver:**
```
═══════════════════════════════════════════════════════
   VALIDACIÓN DE MIGRACIÓN: NEON ↔ RAILWAY
═══════════════════════════════════════════════════════

Comparando registros por tabla:

Tabla                          | Neon | Railway | ✓/✗
─────────────────────────────────────────────────────
t_usuarios                     |    5 |       5 | ✓
t_pacientes                    |   42 |      42 | ✓
...
✅ MIGRACIÓN EXITOSA - 15/15 tablas coinciden
═══════════════════════════════════════════════════════
```

### PASO 7: Cambiar a Railway en `.env`

Ahora que todo está migrado, abre `backend/.env` y:

**OPCIÓN A: Si quieres usar Railway en desarrollo**

Reemplaza:
```env
# Antes:
DATABASE_URL=postgresql://neondb_owner:npg_If01onjwDtFT@ep-aged-band-a4k3ysul-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Después:
DATABASE_URL=postgresql://postgres:PASSWORD123@railway.proxy.rlwy.net:10217/railway?sslmode=require
```

**OPCIÓN B: Mantener Neon en desarrollo, Railway en producción**

Deja todo igual. Railway será usado por:
- Las variables de entorno en Railway.app
- El deploy automático

### PASO 8: Probar la aplicación

Abre 2 terminales:

**Terminal 1:**
```powershell
cd c:\MisProyectosReact\asochinuf-dev\backend
npm run dev
```

**Terminal 2:**
```powershell
cd c:\MisProyectosReact\asochinuf-dev\frontend
yarn dev
```

**Verifica que:**
- ✅ El backend inicia sin errores
- ✅ El frontend carga en http://localhost:3000
- ✅ Puedes hacer login
- ✅ Los datos aparecen en el dashboard

---

## 🎯 RESUMEN DE ARCHIVOS

| Archivo | Ubicación | Qué hace |
|---------|-----------|----------|
| `quick-test.js` | `backend/scripts/` | Prueba conexión |
| `init-db-railway.js` | `backend/scripts/` | Crea tablas en Railway |
| `migrate-db.js` | `backend/scripts/` | Copia todos los datos |
| `validate-migration.js` | `backend/scripts/` | Valida resultado |
| `MIGRATION_GUIDE.md` | `backend/scripts/` | Guía detallada |

---

## ❌ SOLUCIÓN DE PROBLEMAS

### Error: "RAILWAY_DATABASE_URL no está configurada"

**Solución:**
1. Abre `backend/.env`
2. Verifica que agregaste `RAILWAY_DATABASE_URL=...`
3. Guarda y reinicia

### Error: "Connection timeout"

**Solución:**
1. Copia nuevamente la URL de Railway (puede cambiar)
2. Verifica que tu IP/red pueda conectar a Railway
3. Prueba conectándote directamente desde Railway Dashboard

### Error: "table does not exist"

**Solución:**
1. Ejecuta `quick-test.js` → debe mostrar 0 tablas en Railway
2. Ejecuta `init-db-railway.js` → debe crear las tablas
3. Luego ejecuta `migrate-db.js`

### Algunos datos no se migran

**Solución:**
1. Ejecuta `validate-migration.js` → verá cuáles faltan
2. Si es un pequeño número, puedes reintentar `migrate-db.js`
3. Usa ON CONFLICT para evitar duplicar

---

## ✅ CHECKLIST FINAL

Antes de considerar terminado:

- [ ] `quick-test.js` muestra "Ambas BDs están listas"
- [ ] `init-db-railway.js` sin errores
- [ ] `migrate-db.js` sin errores
- [ ] `validate-migration.js` muestra "MIGRACIÓN EXITOSA - 15/15 tablas"
- [ ] `.env` tiene `RAILWAY_DATABASE_URL` (o DATABASE_URL actualizada)
- [ ] `npm run dev` en backend sin errores
- [ ] `yarn dev` en frontend sin errores
- [ ] Puedo logearme en la app
- [ ] Los datos aparecen en el dashboard

---

## 📞 DOCUMENTACIÓN COMPLETA

Si necesitas más detalles:

1. **Guía rápida visual:** `MIGRATION_STEPS.md`
2. **Guía detallada:** `MIGRATION_README.md`
3. **Documentación técnica:** `backend/scripts/MIGRATION_GUIDE.md`
4. **Resumen de scripts:** `SCRIPTS_SUMMARY.txt`

---

## 🎬 ¿Estás listo?

Los 4 scripts están en: `backend/scripts/`

**Orden correcto:**
```
1. quick-test.js          (prueba)
2. init-db-railway.js     (crea esquema)
3. migrate-db.js          (migra datos)
4. validate-migration.js  (valida)
```

¡Adelante! 🚀

---

**Última actualización:** 11 de Noviembre de 2025
**Estado:** ✅ Listo para usar
