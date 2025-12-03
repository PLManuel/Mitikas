import pool from '../../config/db.js';

export const findAll = async () => {
  const [rows] = await pool.query(`
    SELECT 
      v.id, 
      v.id_producto as idProducto,
      p.nombre as nombreProducto,
      v.tamano,
      v.precio_venta as precioVenta,
      pv.id_promocion as idPromocion,
      v.activo 
    FROM variantes_producto v
    LEFT JOIN productos p ON v.id_producto = p.id
    LEFT JOIN promociones_variantes pv ON v.id = pv.id_variante
  `);
  return rows;
};

export const findById = async (id) => {
  const [rows] = await pool.query(`
    SELECT 
      v.id, 
      v.id_producto as idProducto,
      p.nombre as nombreProducto,
      v.tamano,
      v.precio_venta as precioVenta,
      pv.id_promocion as idPromocion,
      v.activo 
    FROM variantes_producto v
    LEFT JOIN productos p ON v.id_producto = p.id
    LEFT JOIN promociones_variantes pv ON v.id = pv.id_variante
    WHERE v.id = ?
  `, [id]);
  return rows[0] || null;
};

export const findByProducto = async (idProducto) => {
  const [rows] = await pool.query(`
    SELECT 
      v.id, 
      v.id_producto as idProducto,
      p.nombre as nombreProducto,
      v.tamano,
      v.precio_venta as precioVenta,
      pv.id_promocion as idPromocion,
      CASE 
        WHEN pv.id_promocion IS NOT NULL THEN
          CASE 
            WHEN pro.tipo = 'porcentaje' THEN v.precio_venta * (1 - pro.valor / 100)
            WHEN pro.tipo = 'precio_fijo' THEN v.precio_venta - pro.valor
            ELSE v.precio_venta
          END
        ELSE v.precio_venta
      END as precioConPromo,
      v.activo 
    FROM variantes_producto v
    LEFT JOIN productos p ON v.id_producto = p.id
    LEFT JOIN promociones_variantes pv ON v.id = pv.id_variante
    LEFT JOIN promociones pro ON pv.id_promocion = pro.id
    WHERE v.id_producto = ?
  `, [idProducto]);
  return rows;
};

export const create = async (variante) => {
  const { idProducto, tamano, precioVenta } = variante;

  const [result] = await pool.query(
    'INSERT INTO variantes_producto (id_producto, tamano, precio_venta, activo) VALUES (?, ?, ?, TRUE)',
    [idProducto, tamano, precioVenta]
  );

  return result.insertId;
};

export const update = async (id, variante) => {
  const { idProducto, tamano, precioVenta } = variante;
  
  const [result] = await pool.query(
    'UPDATE variantes_producto SET id_producto = ?, tamano = ?, precio_venta = ? WHERE id = ?',
    [idProducto, tamano, precioVenta, id]
  );
  
  return result.affectedRows;
};

export const updateActivo = async (id, activo) => {
  const [result] = await pool.query(
    'UPDATE variantes_producto SET activo = ? WHERE id = ?',
    [activo, id]
  );
  return result.affectedRows;
};
