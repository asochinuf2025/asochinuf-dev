import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import Joi from 'joi';
import crypto from 'crypto';

// Esquemas de validación
const schemaRegistro = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  nombre: Joi.string().required(),
  apellido: Joi.string().required(),
});

const schemaLogin = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

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

export const registro = async (req, res) => {
  try {
    // Validar datos
    const { error, value } = schemaRegistro.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, nombre, apellido } = value;

    // Verificar si el email ya existe
    const usuarioExistente = await pool.query(
      'SELECT id FROM t_usuarios WHERE email = $1',
      [email]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(password, salt);

    // Crear usuario (por defecto cliente)
    const resultado = await pool.query(
      'INSERT INTO t_usuarios (email, password_hash, nombre, apellido, tipo_perfil, activo, fecha_registro) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id, email, nombre, apellido, tipo_perfil, foto',
      [email, passwordHash, nombre, apellido, 'cliente', true]
    );

    const usuario = resultado.rows[0];
    const token = generarToken(usuario);

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      token,
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
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

export const login = async (req, res) => {
  try {
    // Validar datos
    const { error, value } = schemaLogin.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Buscar usuario
    const resultado = await pool.query(
      'SELECT * FROM t_usuarios WHERE email = $1 AND activo = true',
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const usuario = resultado.rows[0];

    // Verificar contraseña
    const esValida = await bcryptjs.compare(password, usuario.password_hash);
    if (!esValida) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    // Generar token
    const token = generarToken(usuario);

    res.json({
      mensaje: 'Login exitoso',
      token,
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
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

export const obtenerPerfil = async (req, res) => {
  try {
    const { id } = req.usuario;

    const resultado = await pool.query(
      'SELECT id, email, nombre, apellido, tipo_perfil, fecha_registro, foto FROM t_usuarios WHERE id = $1',
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

export const logout = (req, res) => {
  // En JWT, el logout es en el frontend (eliminar token)
  // Aquí podríamos hacer blacklist de tokens si fuera necesario
  res.json({ mensaje: 'Sesión cerrada exitosamente' });
};

export const solicitarRecuperacion = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'El email es requerido' });
    }

    // Buscar usuario
    const resultado = await pool.query(
      'SELECT id, nombre FROM t_usuarios WHERE email = $1',
      [email]
    );

    if (resultado.rows.length === 0) {
      // Por seguridad, no revelamos si el email existe
      return res.json({ mensaje: 'Si el email existe, recibirás un enlace de recuperación' });
    }

    const usuario = resultado.rows[0];

    // Limpiar tokens expirados del usuario antes de crear uno nuevo
    await pool.query(
      'DELETE FROM t_recovery_tokens WHERE usuario_id = $1 AND fecha_expiracion < NOW()',
      [usuario.id]
    );

    // También eliminar tokens no usados más antiguos del mismo usuario (para evitar acumulación)
    await pool.query(
      'DELETE FROM t_recovery_tokens WHERE usuario_id = $1 AND usado = false AND fecha_creacion < NOW() - INTERVAL \'24 hours\'',
      [usuario.id]
    );

    // Generar token único
    const token = crypto.randomBytes(32).toString('hex');

    // Guardar token en BD (PostgreSQL calcula la fecha de expiración)
    await pool.query(
      'INSERT INTO t_recovery_tokens (usuario_id, token, fecha_expiracion) VALUES ($1, $2, NOW() + INTERVAL \'1 hour\')',
      [usuario.id, token]
    );

    // Enviar email
    const { enviarCorreoRecuperacion } = await import('../services/emailService.js');
    await enviarCorreoRecuperacion(email, usuario.nombre, token);

    res.json({ mensaje: 'Se ha enviado un enlace de recuperación a tu email' });
  } catch (error) {
    console.error('Error solicitando recuperación:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

export const verificarToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: 'Token no proporcionado' });
    }

    const resultado = await pool.query(
      'SELECT usuario_id, usado FROM t_recovery_tokens WHERE token = $1 AND fecha_expiracion > NOW()',
      [token]
    );

    if (resultado.rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    if (resultado.rows[0].usado) {
      return res.status(400).json({ error: 'Este token ya ha sido utilizado' });
    }

    res.json({ mensaje: 'Token válido', usuario_id: resultado.rows[0].usuario_id });
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(500).json({ error: 'Error al verificar token' });
  }
};

export const restablecerContrasena = async (req, res) => {
  try {
    const { token, nuevaContrasena } = req.body;

    if (!token || !nuevaContrasena) {
      return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
    }

    if (nuevaContrasena.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar token
    const resultadoToken = await pool.query(
      'SELECT usuario_id FROM t_recovery_tokens WHERE token = $1 AND fecha_expiracion > NOW() AND usado = false',
      [token]
    );

    if (resultadoToken.rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const usuarioId = resultadoToken.rows[0].usuario_id;

    // Hash de la nueva contraseña
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(nuevaContrasena, salt);

    // Actualizar contraseña
    await pool.query(
      'UPDATE t_usuarios SET password_hash = $1 WHERE id = $2',
      [passwordHash, usuarioId]
    );

    // Marcar token como usado
    await pool.query(
      'UPDATE t_recovery_tokens SET usado = true, fecha_uso = NOW() WHERE token = $1',
      [token]
    );

    res.json({ mensaje: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    console.error('Error restableciendo contraseña:', error);
    res.status(500).json({ error: 'Error al restablecer contraseña' });
  }
};

// ==================== GESTIÓN DE USUARIOS (ADMIN) ====================

// Obtener todos los usuarios
export const obtenerUsuarios = async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT id, email, nombre, apellido, tipo_perfil, activo, fecha_registro FROM t_usuarios WHERE activo = true ORDER BY fecha_registro DESC'
    );

    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Crear usuario (admin crea nutricionista o admin)
export const crearUsuario = async (req, res) => {
  try {
    const { email, password, nombre, apellido, tipo_perfil } = req.body;

    // Validar datos
    if (!email || !password || !nombre || !apellido || !tipo_perfil) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (!['cliente', 'nutricionista', 'admin'].includes(tipo_perfil)) {
      return res.status(400).json({ error: 'Tipo de perfil inválido. Debe ser cliente, nutricionista o admin' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await pool.query(
      'SELECT id FROM t_usuarios WHERE email = $1',
      [email]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(password, salt);

    // Crear usuario
    const resultado = await pool.query(
      'INSERT INTO t_usuarios (email, password_hash, nombre, apellido, tipo_perfil, activo, fecha_registro) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id, email, nombre, apellido, tipo_perfil, activo, fecha_registro',
      [email, passwordHash, nombre, apellido, tipo_perfil, true]
    );

    const usuario = resultado.rows[0];

    // Si es nutricionista o admin, asignar todas las cuotas globales existentes
    if (tipo_perfil === 'nutricionista' || tipo_perfil === 'admin') {
      try {
        // Obtener todas las cuotas globales
        const cuotasResult = await pool.query(
          'SELECT id FROM t_cuotas_mensuales ORDER BY ano DESC, mes DESC'
        );

        // Asignar cada cuota al nuevo usuario
        for (const cuota of cuotasResult.rows) {
          await pool.query(
            `INSERT INTO t_cuotas_usuario (usuario_id, cuota_id, estado)
             VALUES ($1, $2, 'pendiente')
             ON CONFLICT (usuario_id, cuota_id) DO NOTHING`,
            [usuario.id, cuota.id]
          );
        }

        console.log(`✅ Asignadas ${cuotasResult.rows.length} cuotas al nuevo usuario ${usuario.id}`);
      } catch (error) {
        console.error('⚠️ Error asignando cuotas al nuevo usuario:', error);
        // No fallar la creación del usuario si hay error en cuotas
      }
    }

    res.status(201).json({
      mensaje: 'Usuario creado exitosamente',
      usuario,
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

// Actualizar usuario
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, tipo_perfil, activo, password } = req.body;

    // Validar que id sea válido
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // Verificar que el usuario existe
    const usuarioExiste = await pool.query(
      'SELECT id FROM t_usuarios WHERE id = $1',
      [id]
    );

    if (usuarioExiste.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    let campos = [];
    let valores = [];
    let contador = 1;

    if (nombre !== undefined) {
      campos.push(`nombre = $${contador}`);
      valores.push(nombre);
      contador++;
    }

    if (apellido !== undefined) {
      campos.push(`apellido = $${contador}`);
      valores.push(apellido);
      contador++;
    }

    if (tipo_perfil !== undefined) {
      if (!['cliente', 'nutricionista', 'admin'].includes(tipo_perfil)) {
        return res.status(400).json({ error: 'Tipo de perfil inválido' });
      }
      campos.push(`tipo_perfil = $${contador}`);
      valores.push(tipo_perfil);
      contador++;
    }

    if (activo !== undefined) {
      campos.push(`activo = $${contador}`);
      valores.push(activo);
      contador++;
    }

    if (password !== undefined) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }
      const salt = await bcryptjs.genSalt(10);
      const passwordHash = await bcryptjs.hash(password, salt);
      campos.push(`password_hash = $${contador}`);
      valores.push(passwordHash);
      contador++;
    }

    if (campos.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    valores.push(id);
    const sql = `UPDATE t_usuarios SET ${campos.join(', ')} WHERE id = $${contador} RETURNING id, email, nombre, apellido, tipo_perfil, activo, fecha_registro`;

    const resultado = await pool.query(sql, valores);
    const usuarioActualizado = resultado.rows[0];

    res.json({
      mensaje: 'Usuario actualizado exitosamente',
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// Eliminar usuario
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que id sea válido
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // Verificar que el usuario existe
    const usuarioExiste = await pool.query(
      'SELECT id, tipo_perfil FROM t_usuarios WHERE id = $1',
      [id]
    );

    if (usuarioExiste.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Marcar usuario como inactivo (soft delete)
    await pool.query(
      'UPDATE t_usuarios SET activo = false WHERE id = $1',
      [id]
    );

    res.json({ mensaje: 'Usuario marcado como inactivo exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

// Cambiar contraseña
export const cambiarContrasena = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const usuarioId = req.usuario.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    // Obtener usuario
    const resultado = await pool.query(
      'SELECT password_hash FROM t_usuarios WHERE id = $1',
      [usuarioId]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const esValida = await bcryptjs.compare(currentPassword, resultado.rows[0].password_hash);
    if (!esValida) {
      return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
    }

    // Hash de la nueva contraseña
    const salt = await bcryptjs.genSalt(10);
    const hashNueva = await bcryptjs.hash(newPassword, salt);

    // Actualizar contraseña
    await pool.query(
      'UPDATE t_usuarios SET password_hash = $1 WHERE id = $2',
      [hashNueva, usuarioId]
    );

    res.json({ mensaje: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
};

// Actualizar foto de perfil
export const actualizarFoto = async (req, res) => {
  try {
    console.log('📸 actualizarFoto llamado');
    console.log('👤 Usuario ID:', req.usuario?.id);
    console.log('📁 req.file:', req.file);

    const usuarioId = req.usuario.id;

    if (!req.file) {
      console.log('❌ No se recibió archivo');
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
    }

    console.log('✅ Archivo recibido:', req.file.filename, 'Tamaño:', req.file.size);

    // El nombre del archivo guardado por multer
    const nombreArchivo = req.file.filename;

    // Obtener foto anterior del usuario
    const resultado = await pool.query(
      'SELECT foto FROM t_usuarios WHERE id = $1',
      [usuarioId]
    );

    const fotoAnterior = resultado.rows[0]?.foto;
    console.log('🗑️ Foto anterior en BD:', fotoAnterior);
    console.log('📝 Nuevo archivo:', nombreArchivo);

    // Si existe una foto anterior Y es diferente a la nueva, eliminarla del sistema de archivos
    // (Si es el mismo nombre, Multer ya sobrescribió el archivo, no hacemos nada)
    if (fotoAnterior && fotoAnterior !== nombreArchivo) {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const rutaFotoAnterior = path.join(__dirname, '../../frontend/public/foto_perfil', fotoAnterior);

      console.log('🗑️ Eliminando foto antigua diferente:', rutaFotoAnterior);
      // Eliminar archivo si existe
      if (fs.existsSync(rutaFotoAnterior)) {
        fs.unlinkSync(rutaFotoAnterior);
        console.log('✅ Foto anterior eliminada');
      }
    } else if (fotoAnterior === nombreArchivo) {
      console.log('ℹ️ Mismo archivo (Multer sobrescribió), no se elimina');
    }

    console.log('💾 Guardando en BD:', nombreArchivo);

    // Actualizar en la base de datos
    await pool.query(
      'UPDATE t_usuarios SET foto = $1 WHERE id = $2',
      [nombreArchivo, usuarioId]
    );

    console.log('✅ Foto actualizada exitosamente');

    res.json({
      mensaje: 'Foto de perfil actualizada exitosamente',
      foto: nombreArchivo
    });
  } catch (error) {
    console.error('❌ Error al actualizar foto:', error);
    res.status(500).json({ error: 'Error al actualizar foto de perfil' });
  }
};
