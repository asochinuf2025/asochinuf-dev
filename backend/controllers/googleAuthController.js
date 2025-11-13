import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generar JWT
const generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      tipo_perfil: usuario.tipo_perfil,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

/**
 * Verificar token de Google y crear/actualizar usuario
 * POST /api/auth/google
 * Body: { token: "google-jwt-token" }
 */
export const loginConGoogle = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token de Google es requerido' });
    }

    // Verificar token de Google
    console.log('🔐 Verificando token de Google...');
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload['sub'];
    const email = payload['email'];
    const nombre = payload['given_name'] || '';
    const apellido = payload['family_name'] || '';
    const foto = payload['picture'] || null;

    console.log(`✅ Token válido. Email: ${email}, Google ID: ${googleId}`);

    // Buscar usuario por google_id o email
    console.log('🔍 Buscando usuario en BD...');
    let usuarioResult = await pool.query(
      'SELECT * FROM t_usuarios WHERE google_id = $1 OR LOWER(email) = $2',
      [googleId, email.toLowerCase()]
    );

    let usuario;

    if (usuarioResult.rows.length > 0) {
      // Usuario existe: actualizar google_id si no lo tiene
      usuario = usuarioResult.rows[0];
      console.log(`👤 Usuario encontrado: ${usuario.email}`);

      if (!usuario.google_id) {
        console.log('📝 Actualizando usuario con google_id...');
        await pool.query(
          'UPDATE t_usuarios SET google_id = $1 WHERE id = $2',
          [googleId, usuario.id]
        );
        usuario.google_id = googleId;
      }

      // Actualizar foto si viene de Google
      if (foto && foto !== usuario.foto) {
        await pool.query(
          'UPDATE t_usuarios SET foto = $1 WHERE id = $2',
          [foto, usuario.id]
        );
        usuario.foto = foto;
      }
    } else {
      // Crear nuevo usuario
      console.log('✨ Creando nuevo usuario...');
      const resultado = await pool.query(
        `INSERT INTO t_usuarios (email, nombre, apellido, google_id, tipo_perfil, activo, foto, fecha_registro)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         RETURNING id, email, nombre, apellido, tipo_perfil, foto, google_id`,
        [email.toLowerCase(), nombre, apellido, googleId, 'cliente', true, foto]
      );

      usuario = resultado.rows[0];
      console.log(`✅ Usuario creado: ${usuario.email}`);
    }

    // Generar JWT propio
    const jwtToken = generarToken(usuario);

    res.json({
      mensaje: 'Login con Google exitoso',
      token: jwtToken,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        tipo_perfil: usuario.tipo_perfil,
        foto: usuario.foto,
      },
    });
  } catch (error) {
    console.error('❌ Error en loginConGoogle:', error.message);

    // Diferenciar errores
    if (error.message.includes('Invalid token')) {
      return res.status(401).json({ error: 'Token de Google inválido' });
    }

    if (error.message.includes('Token used too late')) {
      return res.status(401).json({ error: 'Token de Google expirado' });
    }

    res.status(500).json({ error: 'Error al procesar login con Google' });
  }
};
