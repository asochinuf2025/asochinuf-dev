# Gestión de Planteles - Tab Interface

## User Interface Structure

The Gestión de Planteles section now has a tab-based interface for managing different aspects:

```
┌─────────────────────────────────────────────────────────────────┐
│ Gestión de Planteles                                            │
│ Administra los planteles deportivos                              │
└─────────────────────────────────────────────────────────────────┘

┌─ Tab Navigation ────────────────────────────────────────────────┐
│                                                                  │
│  🏆 Planteles  │  📊 Categorías y Ligas                         │
│  ─────────────┘                                                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Tab 1: Planteles (Default)

Shows the drag-and-drop interface for managing teams organized by divisions:

```
┌─────────────────────────────────────────────────────────────────┐
│  Search: ________________         [+ Nuevo Plantel]             │
│                                                                  │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐  │
│  │ 🥇 Primera   │ 🥈 Primera B │ 🥉 Segunda   │ ⚽ Tercera    │  │
│  │ División (2) │        (1)   │ División (1) │ División (3) │  │
│  ├──────────────┼──────────────┼──────────────┼──────────────┤  │
│  │ ≡ Colo-Colo │ ≡ Universidad│ ≡ Huachipato │ ≡ Ñublense    │  │
│  │   [✏️][🗑️]  │     Chile    │              │              │  │
│  │              │   [✏️][🗑️]  │   [✏️][🗑️]  │   [✏️][🗑️]  │  │
│  │              │              │              │              │  │
│  │ ≡ Universidad│              │              │              │  │
│  │   Católica   │              │              │              │  │
│  │   [✏️][🗑️]  │              │              │              │  │
│  │              │              │              │              │  │
│  └──────────────┴──────────────┴──────────────┴──────────────┘  │
│                                                                  │
│  [💾 Guardar Cambios]  [❌ Descartar]     (Cambios pendientes)  │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- Drag and drop planteles between divisions
- Create new planteles
- Edit plantel details (nombre, ciudad, región)
- Delete/deactivate planteles
- Search planteles by name
- Batch save changes or discard

---

### Tab 2: Categorías y Ligas

Two sub-tabs for managing categories and leagues with plantel assignments:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌─ Categorías Tab ┬─ Ligas Tab ──────────────────────────────┐ │
│  │                 │                                           │ │
│  └─────────────────┴───────────────────────────────────────────┘ │
│                                                                  │
│  Search: ___________________     [+ Nueva Categoría]            │
│                                                                  │
│  ┌─ Categorías ──────────────────────────────────────────────┐ │
│  │  Nombre    │ Descripción      │ Orden │ Planteles │ Acción │ │
│  ├────────────┼──────────────────┼───────┼───────────┼────────┤ │
│  │ Liga       │ Fútbol profesional     │ 1  │    5    │ [🔗] │ │
│  │ Masculina  │                        │    │         │ [✏️] │ │
│  │ Adulta     │                        │    │         │ [🗑️] │ │
│  ├────────────┼──────────────────┼───────┼───────────┼────────┤ │
│  │ Liga       │ Categorías menores     │ 2  │    8    │ [🔗] │ │
│  │ Femenina   │                        │    │         │ [✏️] │ │
│  │            │                        │    │         │ [🗑️] │ │
│  └────────────┴──────────────────┴───────┴───────────┴────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Sub-tab A: Categorías

**Features:**
- View all categories (divisiones)
- See count of planteles assigned to each
- Create new category
- Edit category (nombre, descripción, orden)
- Delete category
- **Link Planteles Button** - Opens modal to assign/unassign planteles

**Plantel Assignment Modal:**
```
┌──────────────────────────────────────────┐
│  Asignar Planteles - Liga Femenina      │
├──────────────────────────────────────────┤
│                                          │
│  ☑ Colo-Colo                            │
│  ☐ Universidad de Chile                 │
│  ☑ Universidad Católica                 │
│  ☐ Huachipato                           │
│  ☑ Ñublense                             │
│  ...                                     │
│                                          │
│  [Cancelar]              [Guardar]      │
└──────────────────────────────────────────┘
```

#### Sub-tab B: Ligas

**Features:**
- View all ligas (leagues)
- Filter by category dropdown
- See count of measurement sessions for each liga
- Create new liga
- Edit liga (nombre, categoría, descripción, orden)
- Delete liga
- Search ligas by name

---

## Data Flow Diagram

### Plantel Assignment Flow

```
Admin navigates to:
  Dashboard → Gestion → Planteles → Tab: Categorías y Ligas

1. Categorías Tab:
   ├─ See all 6 categories
   ├─ Click "Link Planteles" for a category
   ├─ Modal opens with checkbox list of all planteles
   ├─ Admin checks/unchecks planteles
   └─ Click "Guardar" to save assignments

2. Changes:
   ├─ POST /api/ligas/plantel/categoria/asignar
   │  (for newly checked planteles)
   └─ DELETE /api/ligas/plantel/:id/categoria/:id
      (for unchecked planteles)
```

### Liga Creation Flow

```
Admin in Ligas Tab:

1. Click "+ Nueva Liga"
2. Modal opens:
   ├─ Nombre: ___________
   ├─ Categoría: [Dropdown ▼]
   ├─ Descripción: ___________
   └─ Orden: ____

3. Click "Crear"
4. POST /api/ligas
5. Liga added to list
```

### Excel Upload Flow (After Setup)

```
Nutricionista uploads Excel:

1. Dashboard → Excel Tab
2. Select Plantel (team)
   ├─ API call: GET /api/ligas/plantel/{id}/categorias
   └─ Shows only categories assigned to that plantel

3. Select Categoría (division)
   ├─ API call: GET /api/ligas/plantel/{plantel}/categoria/{cat}/ligas
   └─ Shows only ligas for that category

4. Select Liga (specific league)
   └─ Ready to upload

5. Upload Excel file
   └─ Backend stores liga_id with session
```

---

## Key Implementation Details

### Component Hierarchy

```
GestionPlantelesSection
├─ [activeTab state: 'planteles' | 'categorias-ligas']
├─ When activeTab === 'planteles':
│  └─ Existing drag-drop interface (unchanged)
├─ When activeTab === 'categorias-ligas':
│  └─ CategoriasLigasManager component
│     ├─ [activeTab state: 'categorias' | 'ligas']
│     ├─ Categorías tab with modal system
│     └─ Ligas tab with filter and modal system
```

### API Endpoints Used

**In Categorías Tab:**
```
GET    /api/ligas/categorias/todas                    - List categories
GET    /api/planteles                                 - List planteles (for assignment)
POST   /api/ligas/plantel/categoria/asignar           - Assign plantel to category
DELETE /api/ligas/plantel/{id}/categoria/{id}        - Unassign plantel
```

**In Ligas Tab:**
```
GET    /api/ligas                                     - List all ligas
GET    /api/ligas/categoria/{id}                      - Filter ligas by category
POST   /api/ligas                                     - Create new liga
PUT    /api/ligas/{id}                               - Update liga
DELETE /api/ligas/{id}                               - Delete liga
```

---

## User Experience

### Admin Workflow

1. **Initial Setup (one-time):**
   - Run database setup: `npm run db:setup-ligas`
   - Navigate to Gestión → Planteles → Categorías y Ligas
   - Assign planteles to categories

2. **Daily Use:**
   - Create/manage ligas in Ligas tab
   - Assign new planteles in Categorías tab
   - Manage plantel details in Planteles tab

### Nutritionist Workflow

1. **Excel Upload:**
   - Navigate to Dashboard → Excel
   - Select Plantel → Category → Liga (3-step dependent selection)
   - Upload file (validation ensures liga is selected)
   - See success message with liga name

---

## Responsive Design

- Desktop: Two-column tab interface
- Tablet: Single column with scrollable tables
- Mobile: Stacked layout with full-width buttons
- Dark Mode: Full support with color theme
- Animations: Smooth transitions between tabs

---
