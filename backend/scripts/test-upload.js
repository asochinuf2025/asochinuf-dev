import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

dotenv.config({ path: envPath });

console.log('═══════════════════════════════════════════');
console.log('   TEST: Upload a Cloudinary');
console.log('═══════════════════════════════════════════\n');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Crear una imagen simple de prueba en base64 (1x1 pixel azul)
const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

console.log('📤 Intentando subir imagen de prueba a Cloudinary...\n');

cloudinary.uploader.upload(testImageBase64, {
  folder: 'asochinuf/test',
  public_id: 'test-image',
  overwrite: true,
  resource_type: 'auto',
  quality: 'auto:good',
  fetch_format: 'auto',
})
  .then((result) => {
    console.log('✅ Imagen subida exitosamente\n');
    console.log('📊 Detalles:');
    console.log(`   URL: ${result.secure_url}`);
    console.log(`   Public ID: ${result.public_id}`);
    console.log(`   Tamaño: ${result.bytes} bytes\n`);
    console.log('✅ Las credenciales funcionan correctamente\n');
    process.exit(0);
  })
  .catch((error) => {
    console.log('❌ Error al subir imagen:\n');
    console.log(`   ${error.message}\n`);
    console.log('⚠️  Posibles causas:');
    console.log('   1. Credenciales incorrectas o vencidas');
    console.log('   2. Variables de entorno no sincronizadas en Railway');
    console.log('   3. Problema de conectividad con Cloudinary\n');
    console.log('🔧 Para Railway:');
    console.log('   1. Verifica que las variables estén en Railway Dashboard');
    console.log('   2. Reinicia la aplicación en Railway');
    console.log('   3. Usa: railway run npm run test-upload\n');
    process.exit(1);
  });
