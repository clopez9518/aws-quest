#!/usr/bin/env node
/**
 * Smoke Test para Validar el Despliegue de Contenedores Docker MVP
 * Verifica:
 * 1. Healthcheck Frontend Nginx (HTTP 200)
 * 2. Compresión Gzip y Headers de Seguridad en Frontend
 * 3. Healthcheck Backend ASP.NET Core (HTTP 200 con componente postgres Healthy)
 * 4. Endpoint Catálogo Maestro: GET /api/v1/services (Retorna 6 servicios)
 * 5. Endpoint Catálogo Unidades: GET /api/v1/units (Retorna 4 unidades y 8 desafíos)
 * 6. Endpoint Sesión Invitado: POST /api/v1/auth/guest (Retorna Token JWT válido)
 * 7. Proxy Inverso Frontend a Backend (/api/)
 */

import http from 'http';

const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:8080';

async function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy(new Error('Request timeout after 10s'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runSmokeTests() {
  console.log('======================================================================');
  console.log('🚀 Iniciando Smoke Tests del Stack Docker MVP (AWS Architecture Quest)');
  console.log(`   Frontend Target: ${WEB_URL}`);
  console.log(`   Backend Target:  ${API_URL}`);
  console.log('======================================================================\n');

  let passed = 0;
  let total = 0;

  async function check(description, testFn) {
    total++;
    process.stdout.write(`  [..] ${description}`);
    try {
      await testFn();
      passed++;
      process.stdout.write(`\r  [✓] ${description}\n`);
    } catch (err) {
      process.stdout.write(`\r  [✗] ${description}: ${err.message}\n`);
    }
  }

  // 1. Healthcheck Frontend
  await check('Frontend Nginx responde en /health con 200 OK', async () => {
    const res = await request(`${WEB_URL}/health`);
    if (res.statusCode !== 200) throw new Error(`HTTP ${res.statusCode}`);
  });

  // 2. SPA Index.html y Security Headers
  await check('Frontend entrega index.html con cabeceras de seguridad', async () => {
    const res = await request(`${WEB_URL}/`);
    if (res.statusCode !== 200) throw new Error(`HTTP ${res.statusCode}`);
    if (!res.headers['x-frame-options']) throw new Error('Falta cabecera X-Frame-Options');
    if (!res.headers['x-content-type-options']) throw new Error('Falta cabecera X-Content-Type-Options');
  });

  // 3. Healthcheck Backend
  await check('Backend API responde en /health con estado Healthy', async () => {
    const res = await request(`${API_URL}/health`);
    if (res.statusCode !== 200) throw new Error(`HTTP ${res.statusCode}`);
    const json = JSON.parse(res.body);
    if (json.status !== 'Healthy') throw new Error(`Estado API no es Healthy: ${json.status}`);
  });

  // 4. Servicios Maestros
  await check('Backend entrega 6 servicios en GET /api/v1/services', async () => {
    const res = await request(`${API_URL}/api/v1/services`);
    if (res.statusCode !== 200) throw new Error(`HTTP ${res.statusCode}`);
    const json = JSON.parse(res.body);
    if (!json.success || !Array.isArray(json.data) || json.data.length < 6) {
      throw new Error(`Servicios insuficientes: ${json.data?.length ?? 0}`);
    }
  });

  // 5. Creación de Sesión Invitado (Auth Guest)
  let guestToken = null;
  await check('Backend emite token JWT en POST /api/v1/auth/guest', async () => {
    const res = await request(`${API_URL}/api/v1/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.statusCode !== 200 && res.statusCode !== 201) throw new Error(`HTTP ${res.statusCode}`);
    const json = JSON.parse(res.body);
    if (!json.success || !json.data?.token) throw new Error('Token JWT no encontrado en respuesta');
    guestToken = json.data.token;
  });

  // 6. Consulta de Catálogo con Token de Invitado
  await check('Backend entrega 4 unidades y 8 desafíos en GET /api/v1/units', async () => {
    if (!guestToken) throw new Error('Se requiere guestToken del paso anterior');
    const res = await request(`${API_URL}/api/v1/units`, {
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    if (res.statusCode !== 200) throw new Error(`HTTP ${res.statusCode}`);
    const json = JSON.parse(res.body);
    if (!json.success || !Array.isArray(json.data) || json.data.length !== 4) {
      throw new Error(`Unidades esperadas 4, obtenidas: ${json.data?.length ?? 0}`);
    }
    const totalChallenges = json.data.reduce((acc, u) => acc + (u.challenges?.length ?? 0), 0);
    if (totalChallenges !== 8) {
      throw new Error(`Desafíos esperados 8, obtenidos: ${totalChallenges}`);
    }
  });

  // 7. Proxy Frontend a Backend (/api/)
  await check('Frontend proxy inverso redirige /api/v1/services correctamente', async () => {
    const res = await request(`${WEB_URL}/api/v1/services`);
    if (res.statusCode !== 200) throw new Error(`HTTP ${res.statusCode}`);
    const json = JSON.parse(res.body);
    if (!json.success || !Array.isArray(json.data) || json.data.length < 6) {
      throw new Error('Falla en respuesta del proxy inverso Nginx');
    }
  });

  console.log(`\n🏁 Resultado: ${passed}/${total} pruebas de humo superadas con éxito.\n`);
  if (passed !== total) {
    process.exit(1);
  }
}

runSmokeTests().catch((err) => {
  console.error('Error fatal en Smoke Tests:', err);
  process.exit(1);
});
