import * as pedidosService from './pedidos.service.js';
import { generarBoletaPdf } from '../../utils/pdf.js';

export const listarPedidos = async (req, res, next) => {
  try {
    const pedidos = await pedidosService.listarPedidos();
    res.json(pedidos);
  } catch (error) {
    next(error);
  }
};

export const listarPedidosUsuario = async (req, res, next) => {
  try {
    const pedidos = await pedidosService.listarPedidos();
    res.json(pedidos);
  } catch (error) {
    next(error);
  }
};

export const obtenerPedidoPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pedido = await pedidosService.obtenerPedidoPorId(id);
    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    res.json(pedido);
  } catch (error) {
    next(error);
  }
};

export const crearPedido = async (req, res, next) => {
  try {
    if (!req.session || !req.session.usuario) {
      return res.status(401).json({ message: 'No autenticado. Por favor inicia sesión' });
    }
    const idUsuario = req.session.usuario.id;
    const data = req.body;

    const nuevoPedido = await pedidosService.crearPedido(idUsuario, data);

    // Devolver JSON con el pedido creado e indicar URL de la boleta
    res.status(201).json({ 
      message: 'Pedido creado exitosamente',
      pedido: nuevoPedido,
      boletaUrl: `/api/pedidos/${nuevoPedido.id}/boleta`
    });
  } catch (error) {
    if (error.message.includes('carrito') || error.message.includes('zona') || error.message.includes('pago') || error.message.includes('obligatorios')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const obtenerBoleta = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const pedido = await pedidosService.obtenerPedidoPorId(id);
    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // calcular resumen
    const detalle = pedido.detalle || [];
    
    let subtotal = 0; let descuentos = 0;
    const productos = detalle.map(item => {
      const precioOriginal = Number(item.precioUnitario) * item.cantidad;
      const precioPromo = item.precioPromocion !== null ? Number(item.precioPromocion) * item.cantidad : precioOriginal;
      subtotal += precioOriginal;
      descuentos += precioOriginal - precioPromo;
      return {
        nombreProducto: item.nombreProducto,
        tamano: item.tamano,
        cantidad: item.cantidad,
        precioUnitario: Number(item.precioUnitario),
        precioPromocion: item.precioPromocion !== null ? Number(item.precioPromocion) : null
      };
    });
    const total = subtotal - descuentos + Number(pedido.costoEnvio || 0);

    const boletaData = {
      id: pedido.id,
      fecha: pedido.fecha,
      nombre: pedido.nombre,
      apellido: pedido.apellido,
      direccion: pedido.direccion,
      distrito: pedido.distrito,
      costoEnvio: Number(pedido.costoEnvio || 0),
      subtotal,
      descuentos,
      total,
      productos
    };

    const pdfBuffer = await generarBoletaPdf(boletaData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=boleta_${pedido.id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('[BOLETA] Error generando boleta:', error);
    next(error);
  }
};

export const cambiarEstadoPedido = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { proceso, idRepartidor } = req.body;
    const resultado = await pedidosService.cambiarEstadoPedido(id, proceso, idRepartidor);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no válido')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};
