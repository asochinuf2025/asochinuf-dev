# 🚀 Migración Completa: Neon → Railway

He creado 4 scripts completos para migrar tu base de datos de **Neon a Railway** manteniendo **todos los datos intactos**.

---

## 📋 Archivos Creados

```
backend/scripts/
├── init-db-railway.js          ← Crea esquema en Railway
├── migrate-db.js                ← Migra TODOS los datos
├── validate-migration.js        ← Valida que la migración fue exitosa
└── MIGRATION_GUIDE.md           ← Guía detallada

MIGRATION_STEPS.md              ← Resumen de pasos rápidos
```

---

## ⚡ Pasos Rápidos (6 minutos)

### 1️⃣ Obtener URL de Railway
```
railway.app → Tu proyecto → PostgreSQL → "Connect" → Copiar URL
```

### 2️⃣ Actualizar `.env`
```bash
# Editar: backend/.env

# Agregar al final:
RAILWAY_DATABASE_URL=postgresql://postgres:PASSWORD@host:PORT/railway?sslmode=require
```

### 3️⃣ Inicializar BD en Railway
```bash
cd backend
node scripts/init-db-railway.js
```
**Deberías ver:** ✅ BASE DE DATOS RAILWAY INICIALIZADA CORRECTAMENTE

### 4️⃣ Migrar todos los datos
```bash
cd backend
node scripts/migrate-db.js
```
**Deberías ver:** ✅ MIGRACIÓN COMPLETADA CON ÉXITO

### 5️⃣ Validar la migración
```bash
cd backend
node scripts/validate-migration.js
```
**Deberías ver:** ✅ MIGRACIÓN EXITOSA - 15/15 tablas coinciden

### 6️⃣ Cambiar `.env` a Railway (producción)
```env
# Reemplazar DATABASE_URL:
DATABASE_URL=postgresql://postgres:PASSWORD@host:PORT/railway?sslmode=require

# Opcional (comentar Neon):
# DATABASE_URL=postgresql://neondb_owner:...
```

### 7️⃣ Probar
```bash
cd backend && npm run dev
# En otra terminal:
cd frontend && yarn start
```

---

## 🔍 Qué Hace Cada Script

### `init-db-railway.js`
- ✅ Crea 15 tablas en Railway
- ✅ Crea todos los índices
- ✅ Inserta datos predefinidos (planteles, categorías)
- ⏱️ Tiempo: ~10 segundos

### `migrate-db.js`
- ✅ Copia TODOS los usuarios desde Neon
- ✅ Copia TODOS los pacientes
- ✅ Copia TODAS las mediciones antropométricas
- ✅ Copia cursos, inscripciones, cuotas, pagos
- ✅ Mantiene integridad referencial
- ⏱️ Tiempo: Depende del volumen (1-5 minutos)

### `validate-migration.js`
- ✅ Compara registros en ambas BDs
- ✅ Valida integridad referencial
- ✅ Verifica que no hay referencias rotas
- ⏱️ Tiempo: ~10 segundos

---

## 📊 Datos que se Migran

| Tabla | Descripción |
|-------|-------------|
| t_usuarios | 100% de usuarios (admin, nutricionista, cliente) |
| t_pacientes | 100% de pacientes/jugadores |
| t_clientes | Relaciones usuario-cliente |
| t_nutricionistas | Relaciones usuario-nutricionista |
| t_cursos | Todos los cursos |
| t_inscripciones | Inscripciones a cursos |
| t_planteles | 44 equipos de fútbol |
| t_categorias | 12 categorías (Sub-12, Sub-17, Adulta, etc.) |
| t_sesion_mediciones | Sesiones de mediciones |
| t_informe_antropometrico | **TODAS las mediciones** (peso, talla, pliegues, etc.) |
| t_excel_uploads | Historial de cargas Excel |
| t_recovery_tokens | Tokens de recuperación de contraseña |
| t_cuotas_mensuales | Cuotas mensuales |
| t_cuotas_usuario | Cuotas asignadas a usuarios |
| t_pagos_cuotas | Pagos registrados |

---

## ❌ Si algo sale mal

### Error: "RAILWAY_DATABASE_URL no está configurada"
```
❌ Solución: Verifica que agregaste la línea en .env
```

### Error: "Connection timeout"
```
❌ Solución: Copia la URL de Railway nuevamente (puede cambiar)
```

### Error: "table does not exist"
```
❌ Solución: Ejecuta init-db-railway.js ANTES de migrate-db.js
```

### Rollback a Neon
```bash
# En .env, vuelve a usar:
DATABASE_URL=postgresql://neondb_owner:npg_If01onjwDtFT@...

# Reinicia servidor:
cd backend && npm run dev
```

---

## 🎯 Verificación Final

Después de completar todos los pasos:

- [ ] ✅ `init-db-railway.js` ejecutado sin errores
- [ ] ✅ `migrate-db.js` ejecutado sin errores
- [ ] ✅ `validate-migration.js` muestra "MIGRACIÓN EXITOSA"
- [ ] ✅ Puedes hacer login en la app
- [ ] ✅ El dashboard carga correctamente
- [ ] ✅ Puedes ver cursos, pacientes, mediciones

---

## 📞 Soporte

Si tienes problemas:

1. **Lee la guía detallada:** `backend/scripts/MIGRATION_GUIDE.md`
2. **Revisa los logs:** Los scripts dan mensajes claros de qué sale mal
3. **Valida:** Usa `validate-migration.js` para diagnosticar

---

## 🗺️ Resumen

```
Neon (Desarrollo)  ──────────────┐
                                  ├─→ migrate-db.js ──→ Railway (Producción)
                                  │
                      init-db-railway.js
                    (Crea esquema primero)
```

1. Crea el esquema en Railway con `init-db-railway.js`
2. Migra datos de Neon a Railway con `migrate-db.js`
3. Valida con `validate-migration.js`
4. Cambia `.env` para usar Railway
5. ¡Listo! Tu app ahora usa Railway en producción

---

**¡Buena suerte con tu migración! 🚀**
