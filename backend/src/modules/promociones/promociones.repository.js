export const deleteById = async (id) => {
  // Elimina asociaciones primero
  await pool.query('DELETE FROM promociones_variantes WHERE id_promocion = ?', [id]);
  // Luego elimina la promoción
  const [result] = await pool.query('DELETE FROM promociones WHERE id = ?', [id]);
  return result.affectedRows;
};
import pool from '../../config/db.js';

export const findAll = async () => {
  const [rows] = await pool.query(`
    SELECT 
      id, 
      nombre, 
      tipo, 
      valor, 
      fecha_inicio as fechaInicio,
      fecha_fin as fechaFin,
      activo 
    FROM promociones
  `);
  return rows;
};

export const findById = async (id) => {
  const [rows] = await pool.query(`
    SELECT 
      id, 
      nombre, 
      tipo, 
      valor, 
      fecha_inicio as fechaInicio,
      fecha_fin as fechaFin,
      activo 
    FROM promociones 
    WHERE id = ?
  `, [id]);
  return rows[0] || null;
};

export const findVigentes = async () => {
  const [rows] = await pool.query(`
    SELECT 
      id, 
      nombre, 
      tipo, 
      valor, 
      fecha_inicio as fechaInicio,
      fecha_fin as fechaFin,
      activo 
    FROM promociones 
    WHERE activo = TRUE 
    AND fecha_inicio <= CURDATE() 
    AND fecha_fin >= CURDATE()
  `);
  return rows;
};

export const create = async (promocion) => {
  const { nombre, tipo, valor, fechaInicio, fechaFin } = promocion;

  const [result] = await pool.query(
    'INSERT INTO promociones (nombre, tipo, valor, fecha_inicio, fecha_fin, activo) VALUES (?, ?, ?, ?, ?, TRUE)',
    [nombre, tipo, valor, fechaInicio, fechaFin]
  );

  return result.insertId;
};

export const update = async (id, promocion) => {
  const { nombre, tipo, valor, fechaInicio, fechaFin } = promocion;
  
  const [result] = await pool.query(
    'UPDATE promociones SET nombre = ?, tipo = ?, valor = ?, fecha_inicio = ?, fecha_fin = ? WHERE id = ?',
    [nombre, tipo, valor, fechaInicio, fechaFin, id]
  );
  
  return result.affectedRows;
};

export const updateActivo = async (id, activo) => {
  const [result] = await pool.query(
    'UPDATE promociones SET activo = ? WHERE id = ?',
    [activo, id]
  );
  return result.affectedRows;
};

// Gestión de variantes asociadas a la promoción
export const findVariantesByPromocion = async (idPromocion) => {
  const [rows] = await pool.query(`
    SELECT 
      pv.id,
      pv.id_variante as idVariante,
      v.tamano,
      v.precio_venta as precioVenta,
      p.nombre as nombreProducto,
      p.id as idProducto
    FROM promociones_variantes pv
    JOIN variantes_producto v ON pv.id_variante = v.id
    JOIN productos p ON v.id_producto = p.id
    WHERE pv.id_promocion = ?
  `, [idPromocion]);
  return rows;
};

export const addVarianteToPromocion = async (idPromocion, idVariante) => {
  const [result] = await pool.query(
    'INSERT INTO promociones_variantes (id_promocion, id_variante) VALUES (?, ?)',
    [idPromocion, idVariante]
  );
  return result.insertId;
};

export const removeVarianteFromPromocion = async (idPromocion, idVariante) => {
  const [result] = await pool.query(
    'DELETE FROM promociones_variantes WHERE id_promocion = ? AND id_variante = ?',
    [idPromocion, idVariante]
  );
  return result.affectedRows;
};

export const clearVariantesFromPromocion = async (idPromocion) => {
  const [result] = await pool.query(
    'DELETE FROM promociones_variantes WHERE id_promocion = ?',
    [idPromocion]
  );
  return result.affectedRows;
};
