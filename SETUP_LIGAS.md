# Setup Ligas - Guía de Instalación

Este documento explica cómo configurar la nueva estructura de Ligas sin afectar el resto de la base de datos.

## 📋 Qué hace el script `setup-ligas.js`

El script **NO es invasivo** y hace lo siguiente:

1. ✅ **Crea tabla `t_ligas`** - Solo si no existe
   - Almacena 23 ligas predefinidas según especificación del cliente
   - Asociadas a 6 categorías principales

2. ✅ **Crea tabla `t_plantel_categoria`** - Solo si no existe
   - Relación muchos-a-muchos entre planteles y categorías
   - Permite asignar múltiples categorías a cada plantel

3. ✅ **Actualiza `t_sesion_mediciones`** - Solo si es necesario
   - Agrega columna `liga_id` si no existe
   - **Preserva todos los datos existentes** (migracion segura)
   - Los registros antiguos tendrán `liga_id = NULL`

4. ✅ **Crea índices** - Para optimizar consultas

## 🚀 Cómo ejecutar

### Opción 1: Desde la línea de comandos (Recomendado)

```bash
cd backend
npm run db:setup-ligas
```

### Opción 2: Directamente con Node

```bash
cd backend
node scripts/setup-ligas.js
```

## ✨ Salida esperada

Verás algo como esto:

```
🔧 Configurando tablas de ligas...

Creando tabla t_ligas...
✓ Tabla t_ligas creada/verificada
Insertando 23 ligas...
✓ 23 ligas insertadas, 0 ya existían

Creando índices para t_ligas...
✓ Índices en t_ligas creados

Creando tabla t_plantel_categoria...
✓ Tabla t_plantel_categoria creada/verificada

Creando índices para t_plantel_categoria...
✓ Índices en t_plantel_categoria creados

Verificando tabla t_sesion_mediciones...
✓ Columna liga_id ya existe en t_sesion_mediciones
Creando índices para t_sesion_mediciones...
✓ Índices en t_sesion_mediciones creados

========================================
✓ CONFIGURACIÓN COMPLETADA CORRECTAMENTE
========================================

Tablas/funcionalidades actualizadas:
  • t_ligas (23 ligas predefinidas)
  • t_plantel_categoria (relación plantel-categoría)
  • t_sesion_mediciones (con liga_id)

Próximos pasos:
  1. Asignar categorías a planteles vía API o admin panel
  2. Probar flujo en ExcelSection
```

## 🔄 ¿Puedo ejecutarlo múltiples veces?

**SÍ, es completamente seguro ejecutarlo múltiples veces:**
- Las tablas solo se crean si no existen (`CREATE TABLE IF NOT EXISTS`)
- Las ligas solo se insertan si no existen (`ON CONFLICT ... DO NOTHING`)
- Los índices solo se crean si no existen (`CREATE INDEX IF NOT EXISTS`)
- No hay pérdida de datos

## 📊 Estructura de Ligas Insertadas

```
Liga Masculina Adulta (id=1)
├── Primera A
├── Primera B
├── Segunda Profesional
├── Tercera A
└── Tercera B

Futbol Formativo Masculino (id=2)
├── Sub21
├── Sub18
├── Sub16
└── Sub15

Campeonato Infantil (id=3)
├── Sub14
├── Sub13
├── Sub12
└── Sub11

Liga Femenina (id=4)
├── Campeonato Primera División
├── Liga Ascenso
└── Femenino Juvenil

Futsal (id=5)
├── Campeonato Primera
├── Campeonato Ascenso
├── Campeonato Futsal Femenino
├── Campeonato Futsal Sub20
├── Campeonato Futsal Sub17
└── Campeonato Futsal Nacional

Futbol Playa (id=6)
└── División Principal
```

## 🔧 Próximos pasos después de ejecutar el script

### 1. Asignar Categorías a Planteles

Hay 3 formas de hacerlo:

**Opción A: Vía API (Recomendado para automatización)**

```bash
curl -X POST http://localhost:5001/api/ligas/plantel/categoria/asignar \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plantel_id": 1,
    "categoria_id": 4
  }'
```

**Opción B: Crear un script SQL**

```sql
-- Asignar Liga Femenina a Colo-Colo
INSERT INTO t_plantel_categoria (plantel_id, categoria_id, activo)
VALUES (1, 4, true)
ON CONFLICT (plantel_id, categoria_id) DO NOTHING;
```

**Opción C: Admin Panel (cuando esté implementado)**

Crear un CRUD en el frontend para gestionar estas relaciones.

### 2. Probar en ExcelSection

1. Ve a Dashboard → Excel
2. Selecciona un Plantel
3. Deberías ver las categorías disponibles para ese plantel
4. Selecciona una Categoría
5. Deberías ver las ligas disponibles para esa categoría
6. Carga un Excel

## ❌ Si algo sale mal

### Problema: "Column liga_id already exists"

**Solución:** Es normal si ya ejecutaste el script antes. El script detecta esto y no intenta recrearla.

### Problema: "Foreign key violation on categoria_id"

**Causa:** Las categorías no existen. Necesitas ejecutar `npm run db:init` primero.

**Solución:**
```bash
npm run db:init  # Solo una vez para initializar todo
npm run db:setup-ligas  # Luego ejecuta esto
```

### Problema: Conexión a BD rechazada

**Verificar:**
1. ¿Está la BD online?
2. ¿`DATABASE_URL` está en `.env`?
3. ¿Tienes permisos en la BD?

## 📝 Datos importantes

- **23 ligas** predefinidas según especificación
- **6 categorías** (divisiones principales)
- **Liga_id es requerido** para cargar Excel
- **Plantel y Categoría deben estar asignados** antes de poder seleccionar ligas

## 🎯 Diferencia con `npm run db:init`

| Aspecto | `db:init` | `db:setup-ligas` |
|---------|-----------|------------------|
| **Invasividad** | ⚠️ Recrea TODAS las tablas | ✅ Solo crea nuevas tablas |
| **Pérdida de datos** | ⚠️ SÍ (limpia BD completa) | ✅ NO (preserva datos) |
| **Duración** | ⏱️ Lento (inicializa todo) | ✅ Rápido (solo ligas) |
| **Uso recomendado** | Primera instalación | Actualizar estructura |
| **Seguro de ejecutar 2 veces** | ❌ NO | ✅ SÍ |

---

**¿Preguntas?** Revisa los logs de salida del script para más detalles.
