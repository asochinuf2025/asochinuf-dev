# PASOS RÁPIDOS: Migrar Neon → Railway

## Resumen en 6 pasos

```
┌─────────────────────────────────────────┐
│  PASO 1: Obtener URL de Railway         │
│  Railway.app → PostgreSQL → Copy URL    │
└─────────────────────────────────────────┘
                ⬇️
┌─────────────────────────────────────────┐
│  PASO 2: Actualizar .env                │
│  Agregar: RAILWAY_DATABASE_URL=...      │
└─────────────────────────────────────────┘
                ⬇️
┌─────────────────────────────────────────┐
│  PASO 3: Inicializar BD en Railway      │
│  node scripts/init-db-railway.js        │
└─────────────────────────────────────────┘
                ⬇️
┌─────────────────────────────────────────┐
│  PASO 4: Migrar datos Neon → Railway    │
│  node scripts/migrate-db.js             │
└─────────────────────────────────────────┘
                ⬇️
┌─────────────────────────────────────────┐
│  PASO 5: Cambiar .env a Railway         │
│  DATABASE_URL = Railway URL             │
└─────────────────────────────────────────┘
                ⬇️
┌─────────────────────────────────────────┐
│  PASO 6: Probar la aplicación           │
│  npm run dev & yarn dev                 │
└─────────────────────────────────────────┘
```

---

## Comandos Exactos

### 1. Copiar URL de Railway
```
Abre: https://railway.app
→ Tu proyecto → PostgreSQL
→ "Connect" → Copia la URL completa
```

### 2. Editar `.env`
```env
# Agregar esta línea:
RAILWAY_DATABASE_URL=postgresql://postgres:PASSWORD@host/dbname?sslmode=require
```

### 3. Inicializar Railway
```bash
cd backend
npm install  # si no lo has hecho
node scripts/init-db-railway.js
```

### 4. Migrar datos
```bash
cd backend
node scripts/migrate-db.js
```

### 5. Cambiar a Railway (elegir una opción)

**Opción A: Cambiar .env local**
```env
# Comentar Neon
# DATABASE_URL=postgresql://neondb_owner:...

# Descomentar Railway
DATABASE_URL=postgresql://postgres:PASSWORD@host/dbname?sslmode=require
```

**Opción B: Usar Railway env variables** (recomendado para producción)
1. Railway.app → Environment → Agregar/Actualizar `DATABASE_URL`

### 6. Probar
```bash
cd backend && npm run dev
cd ../frontend && yarn start
```

---

## Archivos Creados

| Archivo | Propósito |
|---------|-----------|
| `backend/scripts/init-db-railway.js` | Crea esquema en Railway |
| `backend/scripts/migrate-db.js` | Copia datos Neon → Railway |
| `backend/scripts/MIGRATION_GUIDE.md` | Guía detallada |

---

## ¿Qué se migra?

- ✅ 15 tablas completas
- ✅ Todos los índices
- ✅ TODOS los datos (usuarios, pacientes, mediciones, etc.)
- ✅ Integridad referencial preservada

---

## Checklist Final

- [ ] URL de Railway copiada
- [ ] `.env` actualizado con `RAILWAY_DATABASE_URL`
- [ ] `init-db-railway.js` ejecutado correctamente
- [ ] `migrate-db.js` ejecutado sin errores
- [ ] `.env` cambiado a usar Railway
- [ ] Servidor iniciado y pruebas pasadas
- [ ] ✅ Migración completa

