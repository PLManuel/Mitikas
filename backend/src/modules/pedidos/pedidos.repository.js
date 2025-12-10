import pool from '../../config/db.js';

export const findByUsuario = async (idUsuario) => {
  const [rows] = await pool.query(`
    SELECT 
      p.id, p.fecha, p.nombre, p.apellido, p.direccion, p.idZonaDelivery, z.distrito, z.costo as costoEnvio, z.dias_estimados as diasEstimados,
      p.costo_envio, p.proceso, p.idUsuario, u.nombre as nombreUsuario, u.apellidos as apellidosUsuario, p.idMetodoPago, m.metodo as metodoPago
    FROM pedidos p
    LEFT JOIN usuarios u ON p.idUsuario = u.id
    LEFT JOIN zonas_delivery z ON p.idZonaDelivery = z.id
    LEFT JOIN metodospago m ON p.idMetodoPago = m.id
    WHERE p.idUsuario = ?
    ORDER BY p.fecha DESC
  `, [idUsuario]);
  return rows;
};


export const findAll = async () => {
  const [rows] = await pool.query(`
    SELECT 
      p.id, p.fecha, p.nombre, p.apellido, p.direccion, p.idZonaDelivery, z.distrito, z.costo as costoEnvio, z.dias_estimados as diasEstimados,
      p.costo_envio, p.proceso, p.idUsuario, u.nombre as nombreUsuario, u.apellidos as apellidosUsuario, p.idMetodoPago, m.metodo as metodoPago
    FROM pedidos p
    LEFT JOIN usuarios u ON p.idUsuario = u.id
    LEFT JOIN zonas_delivery z ON p.idZonaDelivery = z.id
    LEFT JOIN metodospago m ON p.idMetodoPago = m.id
    ORDER BY p.fecha DESC
  `);
  return rows;
};

export const findById = async (id) => {
  const [rows] = await pool.query(`
    SELECT 
      p.id, p.fecha, p.nombre, p.apellido, p.direccion, p.idZonaDelivery, z.distrito, z.costo as costoEnvio, z.dias_estimados as diasEstimados,
      p.costo_envio, p.proceso, p.idUsuario, u.nombre as nombreUsuario, u.apellidos as apellidosUsuario, p.idMetodoPago, m.metodo as metodoPago
    FROM pedidos p
    LEFT JOIN usuarios u ON p.idUsuario = u.id
    LEFT JOIN zonas_delivery z ON p.idZonaDelivery = z.id
    LEFT JOIN metodospago m ON p.idMetodoPago = m.id
    WHERE p.id = ?
  `, [id]);
  return rows[0] || null;
};

export const create = async (pedido) => {
  const { fecha, nombre, apellido, direccion, idZonaDelivery, costoEnvio, proceso, idUsuario, idMetodoPago, idTarjetaSimulada } = pedido;

  const [result] = await pool.query(
    'INSERT INTO pedidos (fecha, nombre, apellido, direccion, idZonaDelivery, costo_envio, proceso, idUsuario, idMetodoPago, idTarjetaSimulada) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [fecha, nombre, apellido, direccion, idZonaDelivery, costoEnvio, proceso, idUsuario, idMetodoPago, idTarjetaSimulada]
  );

  return result.insertId;
};

export const updateProceso = async (id, proceso, idRepartidor = null) => {
  let query = 'UPDATE pedidos SET proceso = ?';
  let params = [proceso];
  
  if (idRepartidor !== null) {
    query += ', id_repartidor = ?';
    params.push(idRepartidor);
  }
  
  query += ' WHERE id = ?';
  params.push(id);
  
  const [result] = await pool.query(query, params);
  return result.affectedRows;
};
