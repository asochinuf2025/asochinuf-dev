import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

dotenv.config({ path: envPath });

console.log('═══════════════════════════════════════════');
console.log('   TEST: Cloudinary Configuration');
console.log('═══════════════════════════════════════════\n');

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('📋 Credenciales detectadas:');
console.log(`   CLOUD_NAME:  ${cloudName ? '✅ ' + cloudName : '❌ NO CONFIGURADA'}`);
console.log(`   API_KEY:     ${apiKey ? '✅ ' + apiKey.substring(0, 10) + '...' : '❌ NO CONFIGURADA'}`);
console.log(`   API_SECRET:  ${apiSecret ? '✅ ' + apiSecret.substring(0, 10) + '...' : '❌ NO CONFIGURADA'}\n`);

if (!cloudName || !apiKey || !apiSecret) {
  console.log('❌ Faltan credenciales. Verifica tu archivo .env\n');
  process.exit(1);
}

// Configurar Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

console.log('🔍 Intentando conectar a Cloudinary...\n');

// Test de conexión
cloudinary.api.resources({ max_results: 1 }, (error, result) => {
  if (error) {
    console.log('❌ Error de conexión a Cloudinary:');
    console.log(`   ${error.message}\n`);
    console.log('⚠️  Posibles soluciones:');
    console.log('   1. Verificar que CLOUDINARY_CLOUD_NAME sea correcto');
    console.log('   2. Verificar que CLOUDINARY_API_KEY sea correcto');
    console.log('   3. Verificar que CLOUDINARY_API_SECRET sea correcto');
    console.log('   4. En Railway: revisar que las variables de entorno estén configuradas');
    console.log('   5. Intentar en localhost primero para descartar problemas de .env\n');
    process.exit(1);
  }

  console.log('✅ Conectado a Cloudinary exitosamente\n');
  console.log('📊 Información de la cuenta:');
  console.log(`   Total recursos: ${result.total_count}\n`);
  console.log('✅ Las credenciales son válidas\n');
  process.exit(0);
});
