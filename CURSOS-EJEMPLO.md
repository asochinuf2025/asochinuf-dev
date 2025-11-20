# Cursos de Ejemplo - ASOCHINUF

Se han creado 3 cursos de ejemplo con contenido completo de secciones y lecciones, todos con URLs de videos de YouTube y Vimeo para testing.

## Resumen de Cursos

### 1. Nutrición Deportiva Profesional
- **Código:** NUTRI-001
- **Duración:** 40 horas
- **Nivel:** Intermedio
- **Precio:** $49.99
- **Secciones:** 3
- **Lecciones:** 8

**Contenido:**
1. **Fundamentos de Macronutrientes** (3 lecciones)
   - Proteínas en el Deporte (15 min)
   - Carbohidratos para Energía (12 min)
   - Grasas Saludables (10 min)

2. **Micronutrientes Esenciales** (2 lecciones)
   - Hierro y Rendimiento (14 min)
   - Hidratación y Electrolitos (16 min)

3. **Planes de Alimentación Personalizados** (3 lecciones)
   - Ganancia Muscular (18 min)
   - Pérdida de Grasa (15 min)
   - Recuperación Post-Entrenamiento (12 min)

---

### 2. Fisiología del Ejercicio
- **Código:** FISIO-001
- **Duración:** 35 horas
- **Nivel:** Intermedio
- **Precio:** $44.99
- **Secciones:** 3
- **Lecciones:** 7

**Contenido:**
1. **Sistemas Energéticos** (3 lecciones)
   - Sistema ATP-PC (13 min)
   - Sistema Glucolítico (14 min)
   - Sistema Oxidativo (16 min)

2. **Adaptaciones Cardiovasculares** (2 lecciones)
   - Gasto Cardíaco y VO2 (15 min)
   - Angiogénesis (12 min)

3. **Biomecánica Neuromuscular** (2 lecciones)
   - Tipos de Fibra Muscular (14 min)
   - Curva Fuerza-Velocidad (13 min)

---

### 3. Evaluación Antropométrica en Deportistas
- **Código:** ANTRO-001
- **Duración:** 30 horas
- **Nivel:** Principiante
- **Precio:** $39.99
- **Secciones:** 3
- **Lecciones:** 8

**Contenido:**
1. **Técnicas Básicas de Medición** (3 lecciones)
   - Instrumentos de Medición (12 min)
   - Tomas de Medidas Longitudinales (15 min)
   - Puntos Anatómicos de Referencia (13 min)

2. **Pliegues Cutáneos y Perímetros** (2 lecciones)
   - Técnica de Calibre (16 min)
   - Perímetros Corporales (14 min)

3. **Análisis e Interpretación de Datos** (3 lecciones)
   - Cálculo de IMC y Composición Corporal (15 min)
   - Ecuaciones de Densidad Corporal (14 min)
   - Seguimiento Longitudinal (13 min)

---

## Acceso de Usuarios

El usuario **heisinger.vivanco@gmail.com** tiene acceso **comprado** al **Curso 1: Nutrición Deportiva Profesional**.

---

## Videos de Prueba

Todas las lecciones incluyen URLs de videos de YouTube y Vimeo para testing:

- **YouTube:** URLs embebidas directamente de YouTube
- **Vimeo:** Videos del showcase de educación de Vimeo

Los videos están configurados en el campo `url_contenido` de cada lección en la tabla `t_detalles_cursos`.

---

## Cómo Ejecutar el Script

Para recrear los cursos en la base de datos:

```bash
cd backend
node scripts/seed-cursos.js
```

El script:
1. Limpia los cursos anteriores si existen
2. Crea 3 cursos nuevos
3. Agrega todas las secciones y lecciones
4. Asigna acceso comprado al usuario heisinger.vivanco@gmail.com para el Curso 1

---

## Información de Debugging

Para verificar los cursos en la base de datos:

```sql
-- Ver todos los cursos
SELECT * FROM t_cursos WHERE codigo_curso IN ('NUTRI-001', 'FISIO-001', 'ANTRO-001');

-- Ver lecciones de un curso
SELECT * FROM t_detalles_cursos WHERE id_curso = 1;

-- Ver acceso de usuarios a cursos
SELECT * FROM t_acceso_cursos WHERE usuario_id = 3;
```

---

## Notas

- Los videos están configurados como tipo `'video'` en la tabla
- Todas las lecciones tienen URLs embebidas listas para mostrar en un reproductor
- Los tiempos de duración están en minutos
- El campo `url_contenido` contiene URLs embebidas de YouTube y Vimeo
