export const deleteById = async (id) => {
  const [result] = await pool.query('DELETE FROM zonas_delivery WHERE id = ?', [id]);
  return result.affectedRows;
};
import pool from '../../config/db.js';

export const findAll = async () => {
  const [rows] = await pool.query(`
    SELECT 
      id, 
      distrito, 
      costo, 
      dias_estimados as diasEstimados,
      activo 
    FROM zonas_delivery
  `);
  return rows;
};

export const findById = async (id) => {
  const [rows] = await pool.query(`
    SELECT 
      id, 
      distrito, 
      costo, 
      dias_estimados as diasEstimados,
      activo 
    FROM zonas_delivery 
    WHERE id = ?
  `, [id]);
  return rows[0] || null;
};

export const findActivas = async () => {
  const [rows] = await pool.query(`
    SELECT 
      id, 
      distrito, 
      costo, 
      dias_estimados as diasEstimados,
      activo 
    FROM zonas_delivery 
    WHERE activo = TRUE
  `);
  return rows;
};

export const create = async (zona) => {
  const { distrito, costo, diasEstimados } = zona;

  const [result] = await pool.query(
    'INSERT INTO zonas_delivery (distrito, costo, dias_estimados, activo) VALUES (?, ?, ?, TRUE)',
    [distrito, costo, diasEstimados]
  );

  return result.insertId;
};

export const update = async (id, zona) => {
  const { distrito, costo, diasEstimados } = zona;
  
  const [result] = await pool.query(
    'UPDATE zonas_delivery SET distrito = ?, costo = ?, dias_estimados = ? WHERE id = ?',
    [distrito, costo, diasEstimados, id]
  );
  
  return result.affectedRows;
};

export const updateActivo = async (id, activo) => {
  const [result] = await pool.query(
    'UPDATE zonas_delivery SET activo = ? WHERE id = ?',
    [activo, id]
  );
  return result.affectedRows;
};
