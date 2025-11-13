#!/usr/bin/env node

/**
 * Test script to verify the /api/cuotas/disponibles/todas endpoint
 *
 * Usage:
 *   node test-quota-endpoint.js <token>
 *
 * Example:
 *   node test-quota-endpoint.js "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */

import axios from 'axios';

const API_URL = 'http://localhost:5001';
const token = process.argv[2];

if (!token) {
  console.error('❌ Error: Token required as argument');
  console.log('Usage: node test-quota-endpoint.js <token>');
  process.exit(1);
}

async function testQuotaEndpoint() {
  try {
    console.log('\n🧪 Testing Quota Endpoint: GET /api/cuotas/disponibles/todas\n');

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    console.log(`📡 Making request to: ${API_URL}/api/cuotas/disponibles/todas`);
    console.log(`🔐 Using token: ${token.substring(0, 20)}...\n`);

    const response = await axios.get(`${API_URL}/api/cuotas/disponibles/todas`, config);

    console.log('✅ Request successful!\n');
    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📦 Number of quotas: ${Array.isArray(response.data) ? response.data.length : 'N/A'}`);

    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('\n📋 First 3 quotas:');
      response.data.slice(0, 3).forEach((cuota, index) => {
        console.log(`  ${index + 1}. Mes: ${cuota.mes}, Año: ${cuota.ano}, Monto: $${cuota.monto?.toLocaleString('es-CL')}`);
      });

      if (response.data.length > 3) {
        console.log(`  ... and ${response.data.length - 3} more\n`);
      }
    } else if (Array.isArray(response.data) && response.data.length === 0) {
      console.log('\n⚠️  No quotas found in database');
    } else {
      console.log('\n❌ Unexpected response format');
    }

    console.log('\n📄 Full Response:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('\n❌ Error testing endpoint:\n');

    if (error.response) {
      console.error(`📊 Status: ${error.response.status}`);
      console.error(`📄 Error: ${error.response.data?.error || JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error('No response received from server');
      console.error('Make sure the backend is running on port 5001');
    } else {
      console.error(`Error: ${error.message}`);
    }

    process.exit(1);
  }
}

testQuotaEndpoint();
