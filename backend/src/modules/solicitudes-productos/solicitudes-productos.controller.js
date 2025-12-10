import * as solicitudesService from './solicitudes-productos.service.js';

// Crear solicitudes de productos faltantes
export async function crearSolicitudes(req, res) {
  try {
    const { idPedido, productosFaltantes } = req.body;

    if (!idPedido || !productosFaltantes || !Array.isArray(productosFaltantes)) {
      return res.status(400).json({ message: 'Datos inválidos' });
    }

    if (productosFaltantes.length === 0) {
      return res.status(400).json({ message: 'Debe especificar al menos un producto' });
    }

    // Validar estructura de cada producto
    for (const producto of productosFaltantes) {
      if (!producto.idVariante || !producto.cantidad || producto.cantidad <= 0) {
        return res.status(400).json({ message: 'Datos de producto inválidos' });
      }
    }

    await solicitudesService.crearSolicitudes(idPedido, productosFaltantes);
    res.json({ message: 'Solicitudes creadas exitosamente' });
  } catch (error) {
    console.error('Error al crear solicitudes:', error);
    res.status(500).json({ message: 'Error al crear solicitudes' });
  }
}

// Obtener solicitudes agrupadas (para logística)
export async function obtenerSolicitudesAgrupadas(req, res) {
  try {
    const solicitudes = await solicitudesService.obtenerSolicitudesAgrupadas();
    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes agrupadas:', error);
    res.status(500).json({ message: 'Error al obtener solicitudes' });
  }
}

// Obtener solicitudes por pedido (para almacén)
export async function obtenerSolicitudesPorPedido(req, res) {
  try {
    const { idPedido } = req.params;
    const solicitudes = await solicitudesService.obtenerSolicitudesPorPedido(idPedido);
    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes del pedido:', error);
    res.status(500).json({ message: 'Error al obtener solicitudes' });
  }
}

// Cambiar estado de solicitudes (simular pedido a proveedor o marcar como recibido)
export async function cambiarEstadoSolicitudes(req, res) {
  try {
    const { idsSolicitudes, estado, fechaRecepcion } = req.body;

    if (!idsSolicitudes || !Array.isArray(idsSolicitudes) || !estado) {
      return res.status(400).json({ message: 'Datos inválidos' });
    }

    if (idsSolicitudes.length === 0) {
      return res.status(400).json({ message: 'Debe especificar al menos una solicitud' });
    }

    const estadosValidos = ['pendiente', 'en_proceso', 'recibido'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    await solicitudesService.cambiarEstadoSolicitudes(idsSolicitudes, estado, fechaRecepcion);
    res.json({ message: 'Estado actualizado exitosamente' });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ message: 'Error al cambiar estado' });
  }
}

// Obtener todas las solicitudes con detalles
export async function obtenerTodasSolicitudes(req, res) {
  try {
    const solicitudes = await solicitudesService.obtenerTodasSolicitudes();
    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ message: 'Error al obtener solicitudes' });
  }
}
