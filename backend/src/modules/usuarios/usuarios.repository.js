import pool from '../../config/db.js';

export const findAll = async () => {
  const [rows] = await pool.query(
    'SELECT id, nombre, apellidos, dni, telefono, correo, rol, activo FROM usuarios'
  );
  return rows;
};

export const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, nombre, apellidos, dni, telefono, correo, rol, activo FROM usuarios WHERE id = ?',
    [id]
  );
  return rows[0] || null;
};

export const create = async (usuario) => {
  const {
    nombre,
    apellidos,
    dni,
    telefono,
    correo,
    password,
    rol,
    activo
  } = usuario;

  const [result] = await pool.query(
    `INSERT INTO usuarios 
     (nombre, apellidos, dni, telefono, correo, password, rol, activo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombre, apellidos, dni, telefono, correo, password, rol, activo]
  );

  return result.insertId;
};

export const findByCorreo = async (correo) => {
  const [rows] = await pool.query(
    'SELECT * FROM usuarios WHERE correo = ?',
    [correo]
  );
  return rows[0] || null;
};

export const updateActivo = async (id, activo) => {
  const [result] = await pool.query(
    'UPDATE usuarios SET activo = ? WHERE id = ?',
    [activo, id]
  );
  return result.affectedRows;
};

export const update = async (id, usuario) => {
  const { nombre, apellidos, dni, telefono, correo, rol, password } = usuario;
  
  let query = 'UPDATE usuarios SET nombre = ?, apellidos = ?, dni = ?, telefono = ?, correo = ?, rol = ?';
  let params = [nombre, apellidos, dni, telefono, correo, rol];
  
  if (password !== undefined) {
    query += ', password = ?';
    params.push(password);
  }
  
  query += ' WHERE id = ?';
  params.push(id);
  
  const [result] = await pool.query(query, params);
  return result.affectedRows;
};

export const deleteById = async (id) => {
  const [result] = await pool.query(
    'DELETE FROM usuarios WHERE id = ?',
    [id]
  );
  return result.affectedRows;
};

export const findRepartidoresActivos = async () => {
  const [rows] = await pool.query(
    'SELECT id, nombre, apellidos FROM usuarios WHERE rol = "repartidor" AND activo = 1'
  );
  return rows;
};
