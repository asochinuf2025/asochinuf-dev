import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

dotenv.config({ path: envPath });

console.log('═══════════════════════════════════════════');
console.log('   DIAGNÓSTICO: Variables Cloudinary');
console.log('═══════════════════════════════════════════\n');

const cloudinaryVars = {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

console.log('📊 Variables leídas:');
Object.entries(cloudinaryVars).forEach(([key, value]) => {
  console.log(`\n${key}:`);
  console.log(`  Valor: "${value}"`);
  console.log(`  Tipo: ${typeof value}`);
  console.log(`  Largo: ${value?.length || 0} caracteres`);

  // Verificar si contiene comillas
  if (value?.includes('"')) {
    console.log(`  ⚠️  CONTIENE COMILLAS DENTRO DEL VALOR`);
  }

  // Mostrar códigos ASCII de primeros y últimos caracteres
  if (value) {
    console.log(`  Primer carácter: "${value[0]}" (ASCII: ${value.charCodeAt(0)})`);
    console.log(`  Último carácter: "${value[value.length - 1]}" (ASCII: ${value.charCodeAt(value.length - 1)})`);
  }
});

console.log('\n═══════════════════════════════════════════');
console.log('📋 Resumen:');
console.log('═══════════════════════════════════════════\n');

if (cloudinaryVars.CLOUDINARY_API_KEY?.includes('"')) {
  console.log('❌ PROBLEMA ENCONTRADO: API_KEY contiene comillas');
  console.log(`   Valor actual: ${cloudinaryVars.CLOUDINARY_API_KEY}`);
  console.log(`   Debería ser: 474564119143581 (sin comillas)`);
} else if (cloudinaryVars.CLOUDINARY_API_KEY === '474564119143581') {
  console.log('✅ API_KEY es correcto (sin comillas)');
} else if (!cloudinaryVars.CLOUDINARY_API_KEY) {
  console.log('❌ PROBLEMA: API_KEY no está definida');
} else {
  console.log('⚠️  API_KEY tiene un valor diferente al esperado:');
  console.log(`   Valor: ${cloudinaryVars.CLOUDINARY_API_KEY}`);
}

console.log('\n');
