import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './config/database.js';
import authRoutes from './routes/auth.js';
import excelRoutes from './routes/excel.js';
import cursosRoutes from './routes/cursos.js';
import plantelesRoutes from './routes/planteles.js';
import categoriasRoutes from './routes/categorias.js';
import ligasRoutes from './routes/ligas.js';
import cuotasRoutes from './routes/cuotas.js';
import pagosRoutes from './routes/pagos.js';
import inscripcionesRoutes from './routes/inscripciones.js';
import cloudinaryRoutes from './routes/cloudinary.js';
import documentosRoutes from './routes/documentos.js';
import detallesCursosRoutes from './routes/detallesCursos.js';
import pacientesRoutes from './routes/pacientes.js';
import anthropometricRoutes from './routes/anthropometric.js';
import cuotasDashboardRoutes from './routes/cuotasDashboard.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
}));
// Aumentar límite de tamaño para imágenes en base64 (10MB máximo)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para configurar caché de archivos estáticos
const cacheMiddleware = (req, res, next) => {
  // Assets con hash (JS, CSS) - caché largo porque tienen hash en el nombre
  if (req.path.match(/\.(js|css)$/)) {
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // Imágenes y otros assets estáticos - caché largo
  else if (req.path.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // HTML (index.html) - caché corto para permitir actualizaciones
  else if (req.path === '/' || req.path.endsWith('.html')) {
    res.set('Cache-Control', 'public, max-age=3600, must-revalidate');
  }
  next();
};

app.use(cacheMiddleware);

// Servir archivos estáticos del frontend compilado (SPA)
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Servir archivos estáticos - Imágenes de cursos (solo si existen en monorepo)
const fotoCursoPath = path.join(__dirname, '..', 'frontend', 'public', 'foto_curso');
try {
  app.use('/foto_curso', express.static(fotoCursoPath));
} catch (err) {
  console.warn(`⚠️ No se pudo servir archivos estáticos de ${fotoCursoPath}`);
}

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/cursos', cursosRoutes);
app.use('/api/planteles', plantelesRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/ligas', ligasRoutes);
app.use('/api/cuotas', cuotasRoutes);
app.use('/api/payments', pagosRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/documentos', documentosRoutes);
app.use('/api/detalles-cursos', detallesCursosRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/anthropometric', anthropometricRoutes);
app.use('/api/cuotas-dashboard', cuotasDashboardRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Verificar también que la BD está disponible
    await pool.query('SELECT NOW()');
    res.json({
      status: 'Backend funcionando correctamente',
      database: 'conectado',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'Backend en funcionamiento pero BD no disponible',
      database: 'desconectado',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// SPA fallback - Servir index.html para rutas del frontend (React Router)
// DEBE estar ANTES del manejador 404
app.get('*', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // Si no existe index.html, retornar error JSON
      res.status(404).json({ error: 'No se encontró la página solicitada' });
    }
  });
});

// Iniciar servidor
const iniciarServidor = async () => {
  try {
    // Probar conexión a BD con reintentos
    console.log('🔄 Intentando conectar a Neon con reintentos...');
    const resultado = await pool.connect();
    console.log('✅ Conexión a PostgreSQL exitosa:', resultado[0]);

    app.listen(PORT, () => {
      console.log(`✓ Servidor ejecutándose en puerto ${PORT}`);
      console.log(`✓ URL: http://localhost:${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('✗ Error al conectar a PostgreSQL:', error.message);
    console.error('ℹ️ El servidor continuará iniciando. La conexión se reintentará en la próxima query.');

    // En Railway, permitimos que el servidor inicie aunque la BD no esté disponible
    // Las queries se reintentan automáticamente
    app.listen(PORT, () => {
      console.log(`✓ Servidor ejecutándose en puerto ${PORT} (sin verificación de BD)`);
      console.log(`✓ URL: http://localhost:${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
    });
  }
};

iniciarServidor();

export default app;
