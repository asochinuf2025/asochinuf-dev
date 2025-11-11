import pkg from 'pg';
import { neon, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import { promisify } from 'util';

const { Pool } = pkg;
const dnsResolve4 = promisify(dns.resolve4);
const dnsResolve = promisify(dns.resolve);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

dotenv.config({ path: envPath });

const NEON_URL = process.env.DATABASE_URL;
const RAILWAY_URL = process.env.RAILWAY_DATABASE_URL;

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║          DIAGNÓSTICO DE CONEXIÓN A BASES DE DATOS        ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Parsear URLs
const parseURL = (url) => {
  try {
    const parsed = new URL(url);
    return {
      hostname: parsed.hostname,
      port: parsed.port || '5432',
      database: parsed.pathname.split('/')[1],
      user: parsed.username,
      valid: true
    };
  } catch (e) {
    return { valid: false, error: e.message };
  }
};

console.log('1️⃣  VERIFICANDO VARIABLES DE ENTORNO\n');

if (NEON_URL) {
  console.log('✓ DATABASE_URL (Neon) configurada');
  const neonParsed = parseURL(NEON_URL);
  if (neonParsed.valid) {
    console.log(`  Host: ${neonParsed.hostname}`);
    console.log(`  Puerto: ${neonParsed.port}`);
    console.log(`  BD: ${neonParsed.database}`);
    console.log(`  Usuario: ${neonParsed.user}\n`);
  }
} else {
  console.log('❌ DATABASE_URL no configurada\n');
}

if (RAILWAY_URL) {
  console.log('✓ RAILWAY_DATABASE_URL configurada');
  const railwayParsed = parseURL(RAILWAY_URL);
  if (railwayParsed.valid) {
    console.log(`  Host: ${railwayParsed.hostname}`);
    console.log(`  Puerto: ${railwayParsed.port}`);
    console.log(`  BD: ${railwayParsed.database}`);
    console.log(`  Usuario: ${railwayParsed.user}\n`);
  }
} else {
  console.log('❌ RAILWAY_DATABASE_URL no configurada\n');
}

// Resolver DNS
console.log('2️⃣  RESOLVIENDO DNS\n');

const testDNS = async (hostname, name) => {
  try {
    const addresses = await dnsResolve4(hostname);
    console.log(`✓ ${name}:`);
    console.log(`  Host: ${hostname}`);
    console.log(`  IPs: ${addresses.join(', ')}\n`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}: No se pudo resolver DNS`);
    console.log(`  Host: ${hostname}`);
    console.log(`  Error: ${error.message}\n`);
    return false;
  }
};

const neonParsed = parseURL(NEON_URL);
const railwayParsed = parseURL(RAILWAY_URL);

const neonDNS = neonParsed.valid ? await testDNS(neonParsed.hostname, 'Neon DNS') : false;
const railwayDNS = railwayParsed.valid ? await testDNS(railwayParsed.hostname, 'Railway DNS') : false;

// Test conexión Neon
console.log('3️⃣  PROBANDO CONEXIÓN A NEON\n');

if (NEON_URL) {
  try {
    console.log('Intentando conexión con pg.Pool...');
    const pool = new Pool({
      connectionString: NEON_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000, // 10 segundos
      idleTimeoutMillis: 30000,
      statement_timeout: 10000,
    });

    const result = await pool.query('SELECT NOW()');
    console.log('✓ Conexión exitosa con pg.Pool');
    console.log(`  Hora BD: ${result.rows[0].now}\n`);
    await pool.end();
  } catch (error) {
    console.log('❌ Fallo con pg.Pool');
    console.log(`  Error: ${error.message}`);
    console.log(`  Código: ${error.code}\n`);
  }

  // Probar con Neon SDK
  try {
    console.log('Intentando conexión con Neon SDK...');
    neonConfig.wsEndpoint = (host) => `wss://${host}/sql`;
    neonConfig.webSocketConstructor = ws;

    const sql = neon(NEON_URL);
    const result = await sql('SELECT NOW()');
    console.log('✓ Conexión exitosa con Neon SDK');
    console.log(`  Hora BD: ${result[0].now}\n`);
  } catch (error) {
    console.log('❌ Fallo con Neon SDK');
    console.log(`  Error: ${error.message}\n`);
  }
}

// Test conexión Railway
console.log('4️⃣  PROBANDO CONEXIÓN A RAILWAY\n');

if (RAILWAY_URL) {
  try {
    console.log('Intentando conexión con pg.Pool...');
    const pool = new Pool({
      connectionString: RAILWAY_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      statement_timeout: 10000,
    });

    const result = await pool.query('SELECT NOW()');
    console.log('✓ Conexión exitosa a Railway');
    console.log(`  Hora BD: ${result.rows[0].now}\n`);
    await pool.end();
  } catch (error) {
    console.log('❌ Fallo conexión a Railway');
    console.log(`  Error: ${error.message}`);
    console.log(`  Código: ${error.code}\n`);
  }
}

// Resumen
console.log('═══════════════════════════════════════════════════════');
console.log('📋 RESUMEN\n');

console.log('Neon:');
console.log(`  DNS: ${neonDNS ? '✓ OK' : '❌ Error'}`);
console.log();

console.log('Railway:');
console.log(`  DNS: ${railwayDNS ? '✓ OK' : '❌ Error'}`);
console.log();

console.log('═══════════════════════════════════════════════════════');
console.log('\n💡 SOLUCIONES POSIBLES:\n');

console.log('Si ambas fallan:');
console.log('  1. Problema de RED/DNS local');
console.log('     → Reinicia tu modem/router');
console.log('     → Prueba con VPN');
console.log('     → Cambia DNS a 8.8.8.8\n');

console.log('  2. Firewall bloqueando conexiones');
console.log('     → Desactiva firewall temporalmente');
console.log('     → Verifica reglas de salida TCP 5432, 10217\n');

console.log('  3. Proxy/VPN interfiriendo');
console.log('     → Desactiva proxy/VPN');
console.log('     → Intenta en red diferente\n');

console.log('Si solo Neon falla:');
console.log('  → Neon puede estar down (verifica https://status.neon.tech)');
console.log('  → Credenciales expiradas\n');

console.log('Si solo Railway falla:');
console.log('  → Railway puede estar down');
console.log('  → URL incorrecta (copia nuevamente de railway.app)');
console.log('  → Base de datos no creada aún\n');

process.exit(0);
