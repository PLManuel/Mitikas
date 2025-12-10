import pool from '../../config/db.js';

// Crear solicitudes de productos faltantes
export async function crearSolicitudes(idPedido, productosFaltantes) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const producto of productosFaltantes) {
      // Verificar si ya existe una solicitud para esta variante en este pedido
      const [existing] = await connection.query(
        `SELECT id FROM solicitudes_productos 
         WHERE id_pedido = ? AND id_variante = ?`,
        [idPedido, producto.idVariante]
      );
      
      // Solo crear si no existe
      if (existing.length === 0) {
        await connection.query(
          `INSERT INTO solicitudes_productos (id_pedido, id_variante, cantidad_solicitada)
           VALUES (?, ?, ?)`,
          [idPedido, producto.idVariante, producto.cantidad]
        );
      }
    }

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Obtener solicitudes agrupadas por variante (para logística)
export async function obtenerSolicitudesAgrupadas() {
  const [rows] = await pool.query(
    `SELECT 
      v.id as id_variante,
      v.id_producto,
      p.nombre as nombre_producto,
      v.tamano,
      SUM(sp.cantidad_solicitada) as cantidad_total,
      COUNT(DISTINCT sp.id_pedido) as cantidad_pedidos,
      GROUP_CONCAT(DISTINCT sp.id ORDER BY sp.id) as ids_solicitudes,
      sp.estado,
      MIN(sp.fecha_solicitud) as fecha_primera_solicitud
    FROM solicitudes_productos sp
    JOIN variantes_producto v ON sp.id_variante = v.id
    JOIN productos p ON v.id_producto = p.id
    WHERE sp.estado IN ('pendiente', 'en_proceso')
    GROUP BY v.id, v.id_producto, p.nombre, v.tamano, sp.estado
    ORDER BY sp.estado DESC, fecha_primera_solicitud ASC`
  );
  return rows;
}

// Obtener solicitudes por pedido (para verificar disponibilidad en almacén)
export async function obtenerSolicitudesPorPedido(idPedido) {
  const [rows] = await pool.query(
    `SELECT 
      sp.id,
      sp.id_variante,
      sp.cantidad_solicitada,
      sp.estado,
      v.tamano,
      p.nombre as nombre_producto
    FROM solicitudes_productos sp
    JOIN variantes_producto v ON sp.id_variante = v.id
    JOIN productos p ON v.id_producto = p.id
    WHERE sp.id_pedido = ?`,
    [idPedido]
  );
  return rows;
}

// Cambiar estado de solicitudes (para simular pedido a proveedor)
export async function cambiarEstadoSolicitudes(idsSolicitudes, nuevoEstado, fechaRecepcion = null) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const placeholders = idsSolicitudes.map(() => '?').join(',');
    let query = `UPDATE solicitudes_productos 
                 SET estado = ?`;
    
    const params = [nuevoEstado];
    
    if (fechaRecepcion) {
      query += `, fecha_recepcion = ?`;
      // Convertir ISO string a formato MySQL DATETIME
      const fechaMySQL = new Date(fechaRecepcion).toISOString().slice(0, 19).replace('T', ' ');
      params.push(fechaMySQL);
    }
    
    query += ` WHERE id IN (${placeholders})`;
    params.push(...idsSolicitudes);

    await connection.query(query, params);

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Obtener todas las solicitudes con detalles
export async function obtenerTodasSolicitudes() {
  const [rows] = await pool.query(
    `SELECT 
      sp.id,
      sp.id_pedido,
      sp.id_variante,
      sp.cantidad_solicitada,
      sp.estado,
      sp.fecha_solicitud,
      sp.fecha_recepcion,
      sp.notas,
      v.tamano,
      p.nombre as nombre_producto,
      ped.fecha as fecha_pedido,
      u.nombre as nombre_cliente
    FROM solicitudes_productos sp
    JOIN variantes_producto v ON sp.id_variante = v.id
    JOIN productos p ON v.id_producto = p.id
    JOIN pedidos ped ON sp.id_pedido = ped.id
    JOIN usuarios u ON ped.id_usuario = u.id
    ORDER BY sp.fecha_solicitud DESC`
  );
  return rows;
}
