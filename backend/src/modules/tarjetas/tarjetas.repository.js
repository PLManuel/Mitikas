import pool from '../../config/db.js';

export const findAllByUsuario = async (idUsuario) => {
  const [rows] = await pool.query(`
    SELECT id, numero_tarjeta as numeroTarjeta, nombre_titular as nombreTitular, fecha_expiracion as fechaExpiracion, cvv, saldo
    FROM tarjetas_simuladas
    WHERE idUsuario = ?
  `, [idUsuario]);
  return rows;
};

export const findById = async (id, idUsuario) => {
  const [rows] = await pool.query(`
    SELECT id, numero_tarjeta as numeroTarjeta, nombre_titular as nombreTitular, fecha_expiracion as fechaExpiracion, cvv, saldo
    FROM tarjetas_simuladas
    WHERE id = ? AND idUsuario = ?
  `, [id, idUsuario]);
  return rows[0] || null;
};

export const create = async (tarjeta) => {
  const { numeroTarjeta, nombreTitular, fechaExpiracion, cvv, saldo, idUsuario } = tarjeta;
  const [result] = await pool.query(
    'INSERT INTO tarjetas_simuladas (numero_tarjeta, nombre_titular, fecha_expiracion, cvv, saldo, idUsuario) VALUES (?, ?, ?, ?, ?, ?)',
    [numeroTarjeta, nombreTitular, fechaExpiracion, cvv, saldo, idUsuario]
  );
  return result.insertId;
};

export const updateSaldo = async (id, idUsuario, saldo) => {
  const [result] = await pool.query(
    'UPDATE tarjetas_simuladas SET saldo = ? WHERE id = ? AND idUsuario = ?',
    [saldo, id, idUsuario]
  );
  return result.affectedRows;
};

export const deleteById = async (id, idUsuario) => {
  const [result] = await pool.query(
    'DELETE FROM tarjetas_simuladas WHERE id = ? AND idUsuario = ?',
    [id, idUsuario]
  );
  return result.affectedRows;
};
