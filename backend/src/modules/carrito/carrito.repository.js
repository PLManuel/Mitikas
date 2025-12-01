import pool from '../../config/db.js';

export const findByUsuario = async (idUsuario) => {
  const [rows] = await pool.query(`
    SELECT 
      c.id,
      c.idUsuario,
      c.idProducto,
      p.nombre as nombreProducto,
      p.imagen as imagenProducto,
      c.idVariante,
      v.tamano,
      v.precio_venta as precioUnitario,
      c.cantidad,
      c.idPromocion,
      pr.nombre as nombrePromocion,
      pr.tipo as tipoPromocion,
      pr.valor as valorPromocion,
      (v.precio_venta * c.cantidad) as subtotal
    FROM carrito c
    JOIN productos p ON c.idProducto = p.id
    JOIN variantes_producto v ON c.idVariante = v.id
    LEFT JOIN promociones pr ON c.idPromocion = pr.id
    WHERE c.idUsuario = ?
  `, [idUsuario]);
  return rows;
};

export const findById = async (id) => {
  const [rows] = await pool.query(`
    SELECT 
      c.id,
      c.idUsuario,
      c.idProducto,
      c.idVariante,
      c.cantidad,
      c.idPromocion
    FROM carrito c
    WHERE c.id = ?
  `, [id]);
  return rows[0] || null;
};

export const findByUsuarioAndVariante = async (idUsuario, idVariante) => {
  const [rows] = await pool.query(
    'SELECT * FROM carrito WHERE idUsuario = ? AND idVariante = ?',
    [idUsuario, idVariante]
  );
  return rows[0] || null;
};

export const create = async (item) => {
  const { idUsuario, idProducto, idVariante, cantidad, idPromocion } = item;

  const [result] = await pool.query(
    'INSERT INTO carrito (idUsuario, idProducto, idVariante, cantidad, idPromocion) VALUES (?, ?, ?, ?, ?)',
    [idUsuario, idProducto, idVariante, cantidad, idPromocion || null]
  );

  return result.insertId;
};

export const updateCantidad = async (id, cantidad) => {
  const [result] = await pool.query(
    'UPDATE carrito SET cantidad = ? WHERE id = ?',
    [cantidad, id]
  );
  return result.affectedRows;
};

export const updatePromocion = async (id, idPromocion) => {
  const [result] = await pool.query(
    'UPDATE carrito SET idPromocion = ? WHERE id = ?',
    [idPromocion, id]
  );
  return result.affectedRows;
};

export const deleteById = async (id) => {
  const [result] = await pool.query(
    'DELETE FROM carrito WHERE id = ?',
    [id]
  );
  return result.affectedRows;
};

export const deleteByUsuario = async (idUsuario) => {
  const [result] = await pool.query(
    'DELETE FROM carrito WHERE idUsuario = ?',
    [idUsuario]
  );
  return result.affectedRows;
};

export const countByUsuario = async (idUsuario) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as total FROM carrito WHERE idUsuario = ?',
    [idUsuario]
  );
  return rows[0].total;
};
