import pool from '../config/database.js';

// Posiciones de juego disponibles
export const POSICIONES_JUEGO = [
  'Portero',
  'Defensa Central',
  'defensa lateral',
  'Volante Defensivo',
  'Volante ofensivo',
  'Volante mixto',
  'delantero centro',
  'delantero extremo'
];

// Obtener todas las posiciones disponibles
export const obtenerPosiciones = async (req, res) => {
  try {
    res.json({ posiciones: POSICIONES_JUEGO });
  } catch (error) {
    console.error('Error al obtener posiciones:', error);
    res.status(500).json({
      error: 'Error al obtener posiciones',
      detail: error.message
    });
  }
};

// Obtener todos los pacientes
export const obtenerPacientes = async (req, res) => {
  try {
    const { busqueda, posicion } = req.query;

    let query = 'SELECT * FROM t_pacientes WHERE activo = true';
    const params = [];

    if (busqueda) {
      query += ' AND (nombre ILIKE $' + (params.length + 1) + ' OR apellido ILIKE $' + (params.length + 1) + ' OR cedula = $' + (params.length + 2) + ')';
      params.push('%' + busqueda + '%', busqueda);
    }

    if (posicion && posicion !== 'todas') {
      query += ' AND posicion_juego = $' + (params.length + 1);
      params.push(posicion);
    }

    query += ' ORDER BY nombre, apellido';

    const result = await pool.query(query, params);

    res.json({
      pacientes: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({
      error: 'Error al obtener pacientes',
      detail: error.message
    });
  }
};

// Obtener paciente por ID
export const obtenerPaciente = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM t_pacientes WHERE id = $1 AND activo = true',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener paciente:', error);
    res.status(500).json({
      error: 'Error al obtener paciente',
      detail: error.message
    });
  }
};

// Actualizar paciente
export const actualizarPaciente = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      apellido,
      cedula,
      email,
      telefono,
      fecha_nacimiento,
      posicion_juego
    } = req.body;

    // Validar que sea admin
    if (req.usuario?.tipo_perfil !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden actualizar pacientes' });
    }

    // Verificar que el paciente existe
    const existing = await pool.query(
      'SELECT * FROM t_pacientes WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    // Actualizar
    const result = await pool.query(
      `UPDATE t_pacientes
       SET nombre = $1, apellido = $2, cedula = $3, email = $4,
           telefono = $5, fecha_nacimiento = $6, posicion_juego = $7
       WHERE id = $8
       RETURNING *`,
      [nombre, apellido, cedula, email, telefono, fecha_nacimiento, posicion_juego, id]
    );

    res.json({
      mensaje: 'Paciente actualizado exitosamente',
      paciente: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    res.status(500).json({
      error: 'Error al actualizar paciente',
      detail: error.message
    });
  }
};

// Crear paciente
export const crearPaciente = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      cedula,
      email,
      telefono,
      fecha_nacimiento,
      posicion_juego
    } = req.body;

    // Validar que sea admin
    if (req.usuario?.tipo_perfil !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden crear pacientes' });
    }

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const result = await pool.query(
      `INSERT INTO t_pacientes
       (nombre, apellido, cedula, email, telefono, fecha_nacimiento, posicion_juego)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [nombre, apellido, cedula, email, telefono, fecha_nacimiento, posicion_juego]
    );

    res.status(201).json({
      mensaje: 'Paciente creado exitosamente',
      paciente: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear paciente:', error);
    res.status(500).json({
      error: 'Error al crear paciente',
      detail: error.message
    });
  }
};

// Eliminar paciente (soft delete)
export const eliminarPaciente = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que sea admin
    if (req.usuario?.tipo_perfil !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden eliminar pacientes' });
    }

    // Verificar que el paciente existe
    const existing = await pool.query(
      'SELECT * FROM t_pacientes WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    await pool.query(
      'UPDATE t_pacientes SET activo = false WHERE id = $1',
      [id]
    );

    res.json({ mensaje: 'Paciente eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    res.status(500).json({
      error: 'Error al eliminar paciente',
      detail: error.message
    });
  }
};
