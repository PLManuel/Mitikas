export const remove = async (id) => {
  const [result] = await pool.query('DELETE FROM metodospago WHERE id = ?', [id]);
  return result.affectedRows;
};
import pool from '../../config/db.js';

export const findAll = async () => {
  const [rows] = await pool.query(`
    SELECT 
      id, 
      metodo, 
      activo 
    FROM metodospago
  `);
  return rows;
};

export const findById = async (id) => {
  const [rows] = await pool.query(`
    SELECT 
      id, 
      metodo, 
      activo 
    FROM metodospago 
    WHERE id = ?
  `, [id]);
  return rows[0] || null;
};

export const findActivos = async () => {
  const [rows] = await pool.query(`
    SELECT 
      id, 
      metodo, 
      activo 
    FROM metodospago 
    WHERE activo = TRUE
  `);
  return rows;
};

export const create = async (metodo) => {
  const [result] = await pool.query(
    'INSERT INTO metodospago (metodo, activo) VALUES (?, TRUE)',
    [metodo]
  );

  return result.insertId;
};

export const update = async (id, metodo) => {
  const [result] = await pool.query(
    'UPDATE metodospago SET metodo = ? WHERE id = ?',
    [metodo, id]
  );
  
  return result.affectedRows;
};

export const updateActivo = async (id, activo) => {
  const [result] = await pool.query(
    'UPDATE metodospago SET activo = ? WHERE id = ?',
    [activo, id]
  );
  return result.affectedRows;
};
