# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ASOCHINUF is a full-stack web application for a Chilean football nutrition organization. It features a modern React frontend landing page with animations and authentication, paired with a Node.js/Express backend using PostgreSQL for user management, authentication, and anthropometric data management for football players.

## Development Commands

### Frontend Development
```bash
cd frontend
yarn install              # Install dependencies
yarn dev                 # Start dev server (http://localhost:3000 with hot reload)
yarn start               # Alternative: Start dev server
yarn build               # Build optimized production bundle
yarn preview             # Preview production build locally
```

### Backend Development
```bash
cd backend
npm install              # Install dependencies
npm run dev              # Start development server with nodemon (http://localhost:5001)
npm start                # Start production server
npm run db:init          # Initialize PostgreSQL database with schema
npm run db:setup-ligas   # Setup football leagues (ligas) data
npm run migrate:documentos # Migrate documents to database
npm run regenerate-thumbnails # Regenerate PDF thumbnails
npm run fix:cuotas-sequence   # Fix quota sequence issues
```

### Database Scripts
```bash
cd backend
node scripts/init-db.js              # Initialize database schema
node scripts/create-admin.js         # Create admin user
node scripts/create-test-user.js     # Create test user
node scripts/seed-courses.js         # Seed sample courses
node scripts/seed-anthropometric.js  # Seed anthropometric test data
node scripts/setup-ligas.js          # Setup leagues (ligas) with teams and categories
```

## Architecture

### Frontend Stack
- **Framework:** React 19.0.0 with React Router 7.5.1
- **Build:** Vite 5.0.11 (NOT Create React App)
- **Styling:** Tailwind CSS 3.4.17 with Shadcn/ui components (46+ components, New York style)
- **Forms:** React Hook Form + Zod validation
- **Animations:** Framer Motion with scroll-based parallax effects
- **Icons:** Lucide React 0.507.0
- **HTTP:** Axios 1.8.4
- **Notifications:** Sonner 2.0.3
- **Excel:** XLSX library for reading Excel files

### Backend Stack
- **Framework:** Express.js 4.18.2 (Node.js with ES modules - `"type": "module"`)
- **Database:** PostgreSQL via pg (Railway)
- **Auth:** JWT (jsonwebtoken), bcryptjs
- **Email:** Nodemailer
- **Form Validation:** Joi
- **File Upload:** Multer (10MB limit, Excel files only)
- **Excel Processing:** XLSX library for parsing anthropometric data
- **Dev Server:** Nodemon with hot reload

### Directory Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Home.jsx              # Main landing page (~1117 lines)
│   │   ├── LoginModal.jsx        # Login form modal
│   │   ├── AuthModal.jsx         # Registration form modal
│   │   ├── Header.jsx, Sidebar.jsx, BottomNav.jsx, MainContent.jsx
│   │   └── ui/                   # 46+ Shadcn/ui components
│   ├── pages/
│   │   ├── Inicio.jsx            # Main dashboard page (section-based)
│   │   ├── DashboardSection/     # Dashboard overview
│   │   ├── ExcelSection/         # Excel upload and data management
│   │   ├── DatosSection/         # Patient data section
│   │   ├── CursosSection/        # Courses section (user view)
│   │   ├── CuotasSection/        # Fee/quota management section
│   │   ├── PerfilSection/        # User profile section
│   │   ├── ConfiguracionSection/ # Settings section
│   │   ├── GestionUsuariosSection/ # User management (admin only)
│   │   ├── GestionCursosSection/ # Course management (admin only)
│   │   └── GestionPlantelesSection/ # Team/squad management (admin only)
│   ├── context/
│   │   └── AuthContext.jsx       # Auth state + theme provider
│   ├── mock.js                   # Mock data for landing page
│   └── App.js                    # Root component with routing

backend/
├── config/
│   └── database.js               # PostgreSQL config (Railway)
├── middleware/
│   └── auth.js                   # JWT authentication (verificarToken)
├── controllers/
│   ├── authController.js         # Authentication logic
│   └── excelController.js        # Excel upload and processing (~324 lines)
├── routes/
│   ├── auth.js                   # Auth endpoints
│   ├── excel.js                  # Excel upload endpoints with Multer
│   ├── cursos.js                 # Course management endpoints
│   ├── planteles.js              # Team/squad management endpoints
│   ├── categorias.js             # Category management endpoints
│   ├── cuotas.js                 # Fee/quota management endpoints
│   └── pagos.js                  # Payment management endpoints
├── utils/
│   └── excelParser.js            # Excel parsing and validation (~233 lines)
├── services/
│   └── emailService.js           # Email sending
├── scripts/
│   └── init-db.js                # Database initialization
└── server.js                     # Express server entry
```

## Key Architectural Patterns

### Data Flow
1. **Mock-Driven Frontend:** Landing page content (courses, testimonials, org structure) comes from `src/mock.js`
2. **Monolithic Landing Page:** Home.jsx (~1117 lines) contains all sections
3. **Modular Dashboard:** Dashboard split into section components in `pages/` directory
4. **Animations:** Framer Motion with useScroll hooks for parallax effects
5. **Theme Support:** Dark/light mode toggle via AuthContext and localStorage

### Backend API Structure

**Express Routes (prefix: /api)**
```
/auth
├── POST   /registro                    → Register new user
├── POST   /login                       → User login (returns JWT token)
├── POST   /logout                      → User logout
├── GET    /me                          → Get current user (protected)
├── POST   /google                      → Google OAuth login
├── POST   /solicitar-recuperacion      → Request password recovery
├── GET    /verificar-token/:token      → Verify password recovery token
├── POST   /restablecer-contrasena      → Reset password
├── GET    /verificar-email/:token      → Verify email token
├── POST   /confirmar-email             → Confirm email verification
├── GET    /usuarios                    → Get all users (admin only)
├── POST   /usuarios                    → Create new user (admin only)
├── PUT    /usuarios/:id                → Update user (admin only)
├── DELETE /usuarios/:id                → Delete user (admin only)
├── POST   /cambiar-contrasena          → Change password (protected)
└── POST   /actualizar-foto             → Update user profile photo (protected, Cloudinary)

/excel
├── POST   /upload        → Upload Excel file (nutricionistas/admin only)
├── GET    /history       → Get upload history
└── GET    /session/:id   → Get measurement session details

/anthropometric
├── GET    /stats                    → Get anthropometric statistics (protected)
├── GET    /filter-options           → Get filter options for data (protected)
└── GET    /player/:paciente_id      → Get player anthropometric data (protected)

/cursos
├── GET    /              → Get all courses
├── POST   /              → Create new course (admin only)
├── PUT    /:id           → Update course (admin only)
└── DELETE /:id           → Delete course (admin only)

/detalles-cursos
└── GET    /curso/:courseId          → Get detailed course content with lessons (protected)

/cursos-dashboard
└── GET    /                          → Get courses for dashboard view (protected)

/planteles
├── GET    /              → Get all teams/squads
├── POST   /              → Create new team (admin only)
├── PUT    /:id           → Update team (admin only)
└── DELETE /:id           → Delete team (admin only)

/ligas
├── GET    /              → Get all leagues
├── POST   /              → Create new league (admin only)
└── GET    /:id           → Get league with teams and categories

/categorias
├── GET    /              → Get all categories
├── GET    /activas       → Get active categories
├── GET    /:id           → Get specific category
├── POST   /              → Create new category (admin only)
├── PUT    /:id           → Update category (admin only)
└── DELETE /:id           → Delete category (admin only)

/cuotas
├── GET    /resumen                  → Get quota summary
├── GET    /disponibles/todas        → Get all available quotas
├── GET    /globales/todas           → Get global quotas
├── GET    /usuarios/todos           → Get all users for quota assignment
├── GET    /estadisticas/general     → Get quota statistics
├── GET    /                         → Get quotas (role-based access)
├── GET    /:id                      → Get specific quota
├── POST   /                         → Create new quota (admin/nutricionista)
├── PUT    /:id                      → Update quota (admin/nutricionista)
├── DELETE /:id                      → Delete quota (admin only)
├── POST   /:cuotaId/pagos           → Register payment for quota
└── GET    /:cuotaId/pagos           → Get payments for quota

/cuotas-dashboard
├── GET    /                         → Get quota dashboard data (protected)
└── GET    /usuarios-pendientes      → Get users with pending quotas (admin)

/inscripciones
├── GET    /              → Get user course enrollments (protected)
├── POST   /              → Enroll in course (protected)
└── DELETE /:id           → Unenroll from course (protected)

/pacientes
├── GET    /              → Get patients/players
├── GET    /:id           → Get patient details
└── POST   /              → Create new patient

/documentos
├── GET    /              → Get documents (protected)
├── POST   /upload        → Upload document with Cloudinary (protected)
├── DELETE /:id           → Delete document (protected)
└── GET    /:id/thumbnail → Get document thumbnail

/cloudinary
├── POST   /upload-perfil     → Upload profile image (protected)
├── POST   /upload-curso      → Upload course image (protected)
├── POST   /upload-documento  → Upload document (protected)
└── DELETE /delete            → Delete uploaded file (protected)

/client-dashboard
└── GET    /estadisticas             → Get client dashboard statistics (protected)

/payments
├── POST   /                         → Process payment
└── GET    /webhook                  → Payment webhook

/health
└── GET    /              → Server health check (returns DB connection status)
```

**Database Schema (PostgreSQL):**

*User Management:*
- `t_usuarios` - System users (admin, nutricionista, cliente) with authentication
- `t_clientes` - Client profiles linked to usuarios
- `t_nutricionistas` - Nutritionist profiles with specialization
- `t_recovery_tokens` - Password reset tokens
- `t_email_verification` - Email verification tokens

*Patient Management (separate from system users):*
- `t_pacientes` - Football players/patients (cedula, contact info, birth date, position)

*Content & Courses:*
- `t_cursos` - Course catalog with metadata (name, description, image)
- `t_inscripciones` - Course enrollments (user enrollment records)
- `t_secciones_curso` - Course sections/modules
- `t_lecciones_seccion` - Lessons within course sections
- `t_acceso_cursos` - Course access control and permissions
- `t_detalles_cursos` - Extended course details with lessons and sections

*Anthropometric Data System:*
- `t_ligas` - Football leagues (e.g., "Primera División", "Segunda División")
- `t_planteles` - Football teams/squads linked to liga (e.g., "Universidad de Chile")
- `t_categorias` - Player categories (e.g., "Sub-17", "Primera División")
- `t_sesion_mediciones` - Measurement sessions (date, plantel, category, nutritionist, file hash)
- `t_informe_antropometrico` - Anthropometric measurements with 30+ data points:
  - Basic: peso, talla, talla_sentado
  - Diameters: biacromial, torax, biiliocristal, humero, femur, etc.
  - Perimeters: brazo_relajado, brazo_contraido, antebrazo, muslo, pierna, etc.
  - Skinfolds: triceps, subescapular, supraespinal, abdominal, muslo_frontal, pierna_medial
  - Calculated: IMC, suma_6_pliegues, suma_8_pliegues
  - Position: posicion_juego (playing position)

*Fee/Payment System:*
- `t_cuotas` - Fee/quota records (client, amount, due date, payment status)
- `t_pagos` - Payment transactions (linked to cuotas, MercadoPago integration)

*Documents & Files:*
- `t_documentos` - User-uploaded documents (PDF, images) with Cloudinary storage
- `t_eventos` - Events/activities for client dashboard

**Authentication Flow:**
1. User registers via `/api/auth/registro` with email/password
2. Password hashed with bcryptjs, stored in PostgreSQL
3. Login returns JWT token (stored in localStorage: `asochinuf_token`, `asochinuf_usuario`)
4. Protected routes verified by `verificarToken` middleware
5. Frontend AuthContext manages token state across routes
6. User types: `admin`, `nutricionista`, `cliente` (tipo_perfil column)

**Excel Upload Flow:**
1. Nutritionist/admin selects plantel (team) and categoria (category) from UI dropdowns
2. User uploads Excel file via `/api/excel/upload` (max 10MB, .xlsx/.xls)
3. Multer stores file in memory buffer
4. `excelParser.js` validates structure and extracts:
   - Metadata: Session date from cell D3 (plantel/category from UI selection)
   - Patient data: Name, cedula, birth date from rows (starting row 6)
   - Anthropometric measurements: 30+ columns
   - **Longitudinal data support:** Multiple measurement rows per patient (same patient across different dates)
5. File hash generated (SHA-256) to detect duplicate uploads
6. Transaction creates/updates:
   - t_sesion_mediciones entry (session metadata with plantel_id, categoria_id)
   - t_pacientes entries (if new patients by cedula)
   - t_informe_antropometrico entries (ALL measurement data rows, including historical)
7. Duplicate detection: same plantel + categoria + fecha_sesion + hash = rejected
8. **Key difference:** Plantel and category are NOT extracted from Excel - they are selected in the UI before upload

## Key Features and Integrations

### Image/File Storage (Cloudinary)
- Profile photos, course images, and documents stored via Cloudinary API
- Backend routes: `/api/cloudinary/*` for image operations
- Frontend uses ImageCropModal components for user interaction
- Sharp library on backend for image resizing/compression
- Documents stored in `t_documentos` table with Cloudinary URLs

### Payment Processing (MercadoPago Integration)
- Quota/fee payments processed through MercadoPago
- Payment routes: `/api/payments/` with webhook support
- Transaction records stored in `t_pagos` table
- Supports multiple payment methods (card, bank transfer, etc.)

### Email System (Nodemailer)
- Password recovery emails via `emailService.js`
- Email verification for new registrations
- Requires SMTP configuration in `.env` (Gmail recommended)
- Recovery tokens stored in `t_recovery_tokens` with expiration

### Google OAuth Authentication
- Alternative login via Google (route: `POST /api/auth/google`)
- Configured in `authController.js` with `google-auth-library`
- Requires Google OAuth credentials in environment

### Course Management System
- Hierarchical structure: Courses → Sections → Lessons
- Course access controlled via role and assignment
- Enrollment tracking via `t_inscripciones`
- Course details with lessons accessible via `/api/detalles-cursos`

### Anthropometric Data Analysis
- Dashboard statistics via `/api/anthropometric/stats`
- Longitudinal tracking of player measurements over time
- Filter options for analysis (plantel, categoria, date range)
- Player-specific data accessible via `/api/anthropometric/player/:paciente_id`
- Position tracking (`posicion_juego`) for playing position analysis

### Dashboard System
- **Client Dashboard:** Personal statistics and events (protected)
- **Quota Dashboard:** Fee management and payment tracking (admin/user roles)
- **Course Dashboard:** Course listings and progress (user view)
- Role-based rendering: different content for admin, nutricionista, cliente

## Configuration Files

### jsconfig.json
Path alias `@/*` maps to `src/*` for cleaner imports (e.g., `@/components`, `@/hooks`).

### components.json
Shadcn/ui configuration with New York style, JSX (not TSX), Lucide icons.

### vite.config.js
- Path alias resolution (`@/*` → `src/*`)
- Dev server on port 3000 with hot reload
- Build output to `dist/` directory
- Code splitting for vendor libraries (React, React Router)

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5001  # Backend API URL (Note: Port 5001)
```

### Backend (.env)
```
# Database (Railway PostgreSQL - REQUIRED)
DATABASE_URL=postgresql://user:pass@host/dbname

# Server
PORT=5001                             # Express server port (Note: 5001, not 5000)
NODE_ENV=development
FRONTEND_URL=http://localhost:3000    # Frontend URL for CORS

# Authentication
JWT_SECRET=your_secret_key_here       # Use strong, random secret
JWT_EXPIRE=7d

# Email (Nodemailer - for password reset and email verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password           # Use App Password for Gmail, not regular password

# Image/File Storage (Cloudinary - for profile photos, course images, documents)
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth (for login via Google)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Payment Processing (MercadoPago - for quota payments)
MERCADO_PAGO_ACCESS_TOKEN=your_mercado_pago_token
MERCADO_PAGO_WEBHOOK_SECRET=your_webhook_secret
```

**Important Notes:**
- Backend runs on port **5001** (not 5000). Frontend API config must reference this port.
- Railway PostgreSQL uses standard TCP connection pooling via pg
- All third-party API keys (Cloudinary, Google, MercadoPago) are required for production features
- For development: Can skip Cloudinary/Google/MercadoPago if testing those features isn't needed
- SMTP configuration required for email features (password reset, email verification)

## Frontend Routes

**Routes (App.js):**
```
/                           → Home (landing page)
/dashboard                  → Inicio (protected - requires authentication)
/restablecer-contrasena     → Password reset
```

**Dashboard Sections (tabs in Inicio.jsx):**
- **inicio:** Dashboard overview with statistics
- **excel:** Upload anthropometric data, view upload history (nutricionista/admin only)
- **datos:** Patient data management
- **cursos:** Course browsing and enrollment (user view)
- **cuotas:** Fee/quota management (role-based: admin creates, users view/pay)
- **perfil:** User profile management
- **configuracion:** User settings, theme toggle
- **gestionplanteles:** Team/squad management (admin only)
- **gestion:** User management (admin only)
- **gestioncursos:** Course management (admin only)

**Note:** Active tab is stored in sessionStorage (`asochinuf_activeTab`) to persist across page refreshes.

## Content Management

**Frontend Mock Data (src/mock.js):**
Landing page content consumed by Home.jsx:
- Hero section with rotating text animations
- 10 sponsor logos (Chilean football teams and universities)
- 3 main courses with descriptions and duration
- 4 training workshops with icons
- 3 professional testimonials with photos
- Organizational structure (2025-2027) with team member bios

To update landing page content, edit `src/mock.js`.

## Database Setup and Seeding

### Initial Database Setup
```bash
cd backend
npm run db:init                      # Initialize schema (creates all tables)
npm run db:setup-ligas               # Populate leagues, teams, categories
node scripts/create-admin.js         # Create initial admin user
node scripts/seed-courses.js         # Seed sample courses with sections/lessons
node scripts/seed-anthropometric.js  # Add test anthropometric data
```

### Seeding Test Data
The following seed scripts populate the database with realistic test data:
- `seed-courses.js` - Creates courses with sections and lessons
- `seed-anthropometric.js` - Adds player measurement data
- `seed-cuotas-dashboard.js` - Creates quota/fee records
- `seed-inscripciones-solo.js` - Creates course enrollments
- `seed-acceso-cursos.js` - Sets up course access rules

### Fixing Common Issues
```bash
# Fix quota sequence (when IDs conflict after bulk operations)
npm run fix:cuotas-sequence

# Regenerate PDF thumbnails after document migration
npm run regenerate-thumbnails

# Migrate documents from old storage to Cloudinary
npm run migrate:documentos
```

## Testing the Application

### API Testing
Use the test files in `backend/` directory:
- `test-api.js` - General API endpoint testing
- `test-registration.js` - Test user registration flow
- `test-password-recovery.js` - Test password reset
- `test-excel-upload.js` - Test anthropometric Excel upload
- `test-cursos.js` - Test course endpoints
- `test-quota-endpoint.js` - Test quota/fee endpoints
- `test-cloudinary.js` - Test image upload functionality

**Running tests:**
```bash
cd backend
node test-api.js              # Run API tests
node test-excel-upload.js     # Test Excel upload
```

### Manual Testing Checklist
1. **Authentication:** Register → Login → Verify token in localStorage
2. **Excel Upload:** Login as nutricionista → Select plantel/categoria → Upload test Excel
3. **Courses:** Browse courses → Enroll → View sections and lessons
4. **Payments:** Create quota → Process payment via MercadoPago
5. **Admin Functions:** Create users → Create courses → Manage quotas
6. **Dashboard:** View statistics → Check anthropometric data

## Common Development Workflows

### Add a New Frontend Route
1. Create component in `frontend/src/pages/` or `frontend/src/components/`
2. Add route to `App.js` in the `<Routes>` component
3. If protected, wrap with `<ProtectedRoute>` component
4. AuthContext provides token and user data via context

### Add a New API Endpoint
1. Create controller function in appropriate controller (e.g., `authController.js`)
2. Add route to appropriate route file (e.g., `auth.js`)
3. Import and register in `server.js` with `app.use('/api/endpoint', routeModule)`
4. Protected routes use `verificarToken` middleware from `middleware/auth.js`

### Add a New Dashboard Section
1. Create new section component in `frontend/src/pages/[SectionName]/`
2. Import the section in `MainContent.jsx`
3. Add conditional render in MainContent based on activeTab value
4. Add tab button/link in `Sidebar.jsx` (desktop) and `BottomNav.jsx` (mobile)
5. If admin-only, add role check: `{usuario?.tipo_perfil === 'admin' && ...}`
6. Section receives `containerVariants` and `itemVariants` for animations

### Add a New UI Component from Shadcn
```bash
cd frontend
npx shadcn-ui@latest add [component-name]
# Example: npx shadcn-ui@latest add dialog
```
Imported components are placed in `src/components/ui/`

### Test Authentication Flow
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && yarn start`
3. Go to `http://localhost:3000`
4. Click login/register modal and submit credentials
5. Check browser DevTools → Application → localStorage for `asochinuf_token` and `asochinuf_usuario`
6. Navigate to `/dashboard` to verify protected route works

### Test Excel Upload Flow
1. Ensure backend and frontend are running
2. Login as nutricionista or admin user
3. Navigate to Dashboard → Excel tab
4. **Select plantel (team) and categoria (category)** from dropdowns (required)
5. Upload Excel file (.xlsx/.xls) with structure:
   - Cell D3: Measurement date (e.g., "Fecha: 29/10/2025")
   - Row 5: Column headers (A5: PACIENTES, B5: Informes, etc.)
   - Row 6+: Patient data and measurements
   - **Important:** Each patient's first row has name in column A; subsequent rows without name in A are additional measurements for same patient (longitudinal data)
6. Backend validates structure, extracts ALL measurement rows, creates session
7. View upload history and session details in Excel section

### Add New Anthropometric Measurement Column
1. Update database schema in `scripts/init-db.js` - add column to `t_informe_antropometrico`
2. Update `utils/excelParser.js` - add column mapping in `columnMap`
3. Update frontend Excel section to display new field
4. Run `npm run db:init` to apply schema changes

## Key Implementation Details

**Frontend Authentication (AuthContext.jsx):**
- Stores token and user data in localStorage (`asochinuf_token`, `asochinuf_usuario`)
- Provides `login()`, `logout()`, `registro()` functions via context
- Theme management with `isDarkMode` state and localStorage (`asochinuf_theme`)
- ProtectedRoute checks token before rendering

**Backend Authentication (middleware/auth.js):**
- Validates JWT token from Authorization header (`Bearer <token>`)
- Attaches decoded user data to `req.usuario` (includes id, email, tipo_perfil)
- Returns 401 if token missing/invalid
- Middleware name: `verificarToken`
- Additional middleware: `verificarAdmin`, `verificarNutricionista`

**Excel Parser (utils/excelParser.js):**
- Reads Excel file using XLSX library
- Validates structure: checks Fecha (D3), Headers (row 5)
- **Does NOT extract plantel/category** - these come from UI selection
- Extracts ALL patient measurement rows (longitudinal data):
  - Patient name in column A marks new patient
  - Rows without name in A are additional measurements for previous patient
  - Each measurement row includes fecha_medicion (date of that specific measurement)
- Maps 30+ anthropometric measurement columns
- Generates SHA-256 file hash for duplicate detection
- Returns structured data for database insertion

**Database Connection (config/database.js):**
- Uses pg.Pool with TCP (Railway)
- Queries return `{ rows, rowCount }` for compatibility
- Connection via `DATABASE_URL` environment variable
- SSL enabled automatically for non-localhost connections

**Password Reset Flow:**
- ResetPassword.jsx handles frontend form
- Backend emailService.js sends reset link (requires SMTP config)
- Tokens stored in `t_recovery_tokens` with expiration

**Dashboard Tab System:**
- MainContent.jsx acts as router for dashboard sections based on activeTab state
- Each section is a separate component with AnimatePresence transitions
- Tab state persists in sessionStorage to maintain active tab across refreshes
- Role-based rendering: some tabs only visible to admin/nutricionista users

**Image/File Handling:**
- Course images stored in `frontend/public/foto_curso/`
- Backend serves static files via Express (`/foto_curso` route)
- ImageCropModal components for user profile and course image cropping
- Sharp library used for server-side image processing (resizing, compression)

## Troubleshooting & Known Issues

### Common Problems

**Database Connection Issues**
- Ensure `DATABASE_URL` in `.env` is correct (test with `npm run db:init`)
- Pool exhaustion: restart backend server if receiving "no more connections available"

**Port Already in Use**
- Frontend (3000): `lsof -i :3000 | grep LISTEN` → kill process or change port in vite.config.js
- Backend (5001): `lsof -i :5001 | grep LISTEN` → kill process or set PORT env var

**File Upload Issues**
- Excel uploads: Ensure file is `.xlsx` format (not `.xls` or `.csv`)
- Image uploads: Verify Cloudinary credentials are set in `.env`
- Multer 10MB limit: Larger files are rejected - check file size before upload

**Excel Parser Errors**
- Verify Excel structure: Date in D3 (format "Fecha: DD/MM/YYYY")
- Headers must be in row 5 with exact column names
- Patient data starts row 6 - blank rows in column A indicate additional measurements for previous patient
- Common mistake: Uploading without selecting plantel/categoria first (required)

**Token/Authentication Errors**
- 401 Unauthorized: JWT expired - user needs to login again
- 403 Forbidden: Insufficient permissions for operation - check user role
- Token not in localStorage: CORS issue or incorrect origin in `.env`

**Email/SMTP Issues**
- Gmail rejects connections: Use "App Password" from Google Account, not regular password
- SMTP timeout: Check firewall - may need to allowlist port 587
- Test email setup: Use scripts in `backend/scripts/test-*.js`

### Frontend-Specific

**React Router Issues**
- SPA fallback in server.js (line 115) serves index.html - required for client-side routing
- If seeing 404 on page refresh: ensure server.js SPA fallback is active

**Tab State Persistence**
- Active dashboard tab stored in sessionStorage (`asochinuf_activeTab`)
- Clearing sessionStorage resets active tab to "inicio"

### Backend-Specific

**Railway PostgreSQL Connection**
- Uses TCP via pg.Pool - standard SQL, no limitations
- Query results return `{ rows, rowCount }` format - compatible with standard pg library

**Nodemon Hot Reload Issues**
- Sometimes doesn't restart on file changes: restart manually with `npm run dev`
- Clear node_modules and reinstall if persistent: `rm -rf node_modules && npm install`

**Script Execution Errors**
- Scripts must be run from `/backend` directory: `cd backend && node scripts/script-name.js`
- Many scripts read/write to database - ensure `.env` is configured first
- Some scripts are idempotent, others aren't - check script contents before rerunning

### Controller/Route Patterns

**Adding Protected Routes**
- Always use `verificarToken` middleware for user data access
- For admin-only: chain with `verificarAdmin` middleware
- For nutricionista-only: use custom role check in controller

**Error Handling**
- Controllers should return `res.status(400).json({ error: 'message' })` for validation
- Database errors: catch and return `res.status(500).json({ error: error.message })`
- Avoid exposing full error details in production - log internally instead

## Performance Considerations

- **Excel Upload:** Large files (>10MB) are rejected - consider chunking for bigger datasets
- **Anthropometric Queries:** Filter options endpoint returns large datasets - consider pagination for many records
- **Cloudinary:** All image uploads go through Cloudinary - may have rate limits on free tier
- **Database:** Complex queries on `t_informe_antropometrico` with large sessions may be slow - consider indexes
