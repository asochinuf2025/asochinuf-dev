import axios from 'axios';

// Configurar cliente de Mercado Pago
const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const MP_API_URL = 'https://api.mercadopago.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Construir URL del backend para webhook
// En producción (Railway), usar el dominio público de Railway
// En desarrollo, usar localhost:5001
const getBackendUrl = () => {
  // En Railway, RAILWAY_PUBLIC_DOMAIN es el dominio público del backend
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  }

  // En desarrollo local, usar localhost
  if (FRONTEND_URL.includes('localhost') || FRONTEND_URL.includes('127.0.0.1')) {
    return 'http://localhost:5001';
  }

  // En otros casos, no usar webhook
  return null;
};

const BACKEND_URL = getBackendUrl();
const WEBHOOK_URL = BACKEND_URL ? `${BACKEND_URL}/api/payments/webhook` : null;

console.log('📱 FRONTEND_URL:', FRONTEND_URL);
console.log('🖥️ BACKEND_URL:', BACKEND_URL);
console.log('🔔 WEBHOOK_URL:', WEBHOOK_URL);

const mpClient = axios.create({
  baseURL: MP_API_URL,
  headers: {
    'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Crear preferencia de pago para un curso
 * Retorna la URL de Mercado Pago donde redirigir al usuario
 * @param {Object} curso - Datos del curso
 * @param {Object} usuario - Datos del usuario
 * @param {number} montoFinal - Monto final a pagar (con descuento aplicado)
 */
export const crearPreferenciaCurso = async (curso, usuario, montoFinal) => {
  try {
    // Usar montoFinal si se proporciona, sino usar precio del curso
    // Asegurar que el monto sea válido (mínimo 50 CLP)
    const monto = Math.max(50, parseFloat(montoFinal || curso.precio));

    console.log(`💰 Creando preferencia de pago para curso: ${curso.nombre}, Monto: ${monto} CLP`);

    const preference = {
      items: [
        {
          title: `Curso: ${curso.nombre}`,
          description: `Acceso completo al curso de ${curso.nombre} - ${usuario.nombre} ${usuario.apellido}`,
          quantity: 1,
          unit_price: monto,
          currency_id: 'CLP'
        }
      ],
      payer: {
        name: usuario.nombre,
        surname: usuario.apellido || '',
        email: usuario.email
      },
      back_urls: {
        success: `${FRONTEND_URL}/dashboard?tab=cursos&pago=success&curso=${curso.id_curso}`,
        failure: `${FRONTEND_URL}/dashboard?tab=cursos&pago=failure&curso=${curso.id_curso}`,
        pending: `${FRONTEND_URL}/dashboard?tab=cursos&pago=pending&curso=${curso.id_curso}`
      },
      external_reference: `curso-${curso.id_curso}`,
      statement_descriptor: 'ASOCHINUF'
    };

    // Siempre habilitar auto_return para redirigir al usuario después del pago
    // La verificación de acceso se hace en el frontend cuando el usuario regresa
    preference.auto_return = 'approved';

    // Agregar webhook si está disponible (BACKEND_DOMAIN configurado en Railway)
    if (WEBHOOK_URL) {
      preference.notification_url = WEBHOOK_URL;
      console.log('✅ Webhook configurado:', WEBHOOK_URL);
    }

    console.log('📤 Enviando preferencia de curso a Mercado Pago:', JSON.stringify(preference, null, 2));

    // Hacer llamada a API de Mercado Pago
    const response = await mpClient.post('/checkout/preferences', preference);

    console.log('✅ Preferencia de curso creada exitosamente:', response.data.id);
    console.log('🔗 Checkout URL (init_point):', response.data.init_point);

    return {
      id: response.data.id,
      init_point: response.data.init_point,
      sandbox_init_point: response.data.sandbox_init_point,
      cursoId: curso.id_curso,
      montoTotal: monto
    };
  } catch (error) {
    console.error('❌ Error al crear preferencia de curso:');
    console.error('Status:', error.response?.status);
    console.error('Datos del error:', JSON.stringify(error.response?.data, null, 2));
    console.error('Mensaje:', error.message);
    // En desarrollo/testing, retornar un objeto simulado
    if (!MP_ACCESS_TOKEN || MP_ACCESS_TOKEN === 'undefined') {
      console.warn('⚠️ MERCADO_PAGO_ACCESS_TOKEN no configurado. Retornando preferencia simulada para testing.');
      const monto = Math.max(50, parseFloat(montoFinal || curso.precio));
      return {
        id: `pref_test_${Date.now()}`,
        init_point: `${FRONTEND_URL}/payment-processing?curso=${curso.id_curso}&test=true`,
        sandbox_init_point: `${FRONTEND_URL}/payment-processing?curso=${curso.id_curso}&test=true`,
        cursoId: curso.id_curso,
        montoTotal: monto,
        isTestMode: true
      };
    }
    throw error;
  }
};

/**
 * Crear preferencia de pago para una cuota
 * Retorna la URL de Mercado Pago donde redirigir al usuario
 */
export const crearPreferenciaPago = async (cuota, usuario) => {
  try {
    // Asegurar que el monto sea válido (mínimo 50 CLP)
    const monto = Math.max(50, parseFloat(cuota.monto));

    const preference = {
      items: [
        {
          title: `Cuota ${cuota.mes}/${cuota.ano}`,
          description: `Pago de cuota mensual - ${usuario.nombre} ${usuario.apellido}`,
          quantity: 1,
          unit_price: monto,
          currency_id: 'CLP'
        }
      ],
      payer: {
        name: usuario.nombre,
        surname: usuario.apellido || '',
        email: usuario.email
      },
      back_urls: {
        success: `${FRONTEND_URL}/dashboard?tab=cuotas&pago=success&cuota=${cuota.id}`,
        failure: `${FRONTEND_URL}/dashboard?tab=cuotas&pago=failure&cuota=${cuota.id}`,
        pending: `${FRONTEND_URL}/dashboard?tab=cuotas&pago=pending&cuota=${cuota.id}`
      },
      external_reference: `cuota-${cuota.id}`,
      statement_descriptor: 'ASOCHINUF'
    };

    // Siempre habilitar auto_return para redirigir al usuario después del pago
    preference.auto_return = 'approved';

    // Agregar webhook si está disponible (BACKEND_DOMAIN configurado en Railway)
    if (WEBHOOK_URL) {
      preference.notification_url = WEBHOOK_URL;
      console.log('✅ Webhook configurado:', WEBHOOK_URL);
    }

    console.log('📤 Enviando preferencia a Mercado Pago:', JSON.stringify(preference, null, 2));

    // Hacer llamada a API de Mercado Pago
    const response = await mpClient.post('/checkout/preferences', preference);

    console.log('✅ Preferencia creada exitosamente:', response.data.id);
    console.log('🔗 Checkout URL (init_point):', response.data.init_point);

    return {
      id: response.data.id,
      init_point: response.data.init_point,
      sandbox_init_point: response.data.sandbox_init_point,
      cuotaId: cuota.id,
      montoTotal: parseFloat(cuota.monto)
    };
  } catch (error) {
    console.error('❌ Error al crear preferencia de pago:');
    console.error('Status:', error.response?.status);
    console.error('Datos del error:', JSON.stringify(error.response?.data, null, 2));
    console.error('Mensaje:', error.message);
    // En desarrollo/testing, retornar un objeto simulado
    if (!MP_ACCESS_TOKEN || MP_ACCESS_TOKEN === 'undefined') {
      console.warn('⚠️ MERCADO_PAGO_ACCESS_TOKEN no configurado. Retornando preferencia simulada para testing.');
      return {
        id: `pref_test_${Date.now()}`,
        init_point: `${FRONTEND_URL}/payment-processing?cuota=${cuota.id}&test=true`,
        sandbox_init_point: `${FRONTEND_URL}/payment-processing?cuota=${cuota.id}&test=true`,
        cuotaId: cuota.id,
        montoTotal: parseFloat(cuota.monto),
        isTestMode: true
      };
    }
    throw error;
  }
};

/**
 * Verificar estado del pago en Mercado Pago
 */
export const verificarEstadoPago = async (paymentId) => {
  try {
    const response = await mpClient.get(`/v1/payments/${paymentId}`);

    return {
      id: response.data.id,
      status: response.data.status,
      status_detail: response.data.status_detail,
      amount: response.data.transaction_amount,
      external_reference: response.data.external_reference,
      payer_email: response.data.payer?.email
    };
  } catch (error) {
    console.error('Error al verificar pago:', error.response?.data || error.message);
    throw error;
  }
};

export default {
  crearPreferenciaPago,
  crearPreferenciaCurso,
  verificarEstadoPago
};
