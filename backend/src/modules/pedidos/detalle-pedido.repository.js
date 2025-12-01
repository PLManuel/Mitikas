import pool from '../../config/db.js';

export const findByPedido = async (idPedido) => {
  const [rows] = await pool.query(`
    SELECT 
      d.id, d.idPedido, d.idProducto, p.nombre as nombreProducto, d.idVariante, v.tamano, d.cantidad, d.precio_unitario as precioUnitario, d.precio_promocion as precioPromocion, d.subtotal, d.estado, d.idPromocion,
      pr.nombre as nombrePromocion, pr.tipo as tipoPromocion, pr.valor as valorPromocion
    FROM detalle_pedido d
    LEFT JOIN productos p ON d.idProducto = p.id
    LEFT JOIN variantes_producto v ON d.idVariante = v.id
    LEFT JOIN promociones pr ON d.idPromocion = pr.id
    WHERE d.idPedido = ?
  `, [idPedido]);
  return rows;
};

export const create = async (detalle) => {
  const { idPedido, idProducto, idVariante, cantidad, precioUnitario, precioPromocion, subtotal, estado, idPromocion } = detalle;

  const [result] = await pool.query(
    'INSERT INTO detalle_pedido (idPedido, idProducto, idVariante, cantidad, precio_unitario, precio_promocion, subtotal, estado, idPromocion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [idPedido, idProducto, idVariante, cantidad, precioUnitario, precioPromocion, subtotal, estado, idPromocion || null]
  );

  return result.insertId;
};
