import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Solo cargar .env en desarrollo
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Verificar que DATABASE_URL esté disponible
const DATABASE_URL = process.env.DATABASE_URL;
console.log('🔍 DATABASE_URL:', DATABASE_URL ? 'Configurada' : 'NO CONFIGURADA');
console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL no está configurada');
  console.error('Variables de entorno disponibles:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('NEON')));
  throw new Error('DATABASE_URL environment variable is required');
}

// Usar Neon serverless para mejor rendimiento
const sql = neon(DATABASE_URL);

// Crear un objeto compatible con las queries existentes
const pool = {
  query: async (text, params) => {
    try {
      const result = await sql(text, params);
      return {
        rows: result,
        rowCount: result.length,
      };
    } catch (error) {
      console.error('❌ Error en la consulta:', error.message);
      throw error;
    }
  },
};

console.log('✅ Conectado a Neon con serverless');

export default pool;
