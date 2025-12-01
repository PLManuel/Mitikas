export const listarPedidosUsuario = async (req, res, next) => {
  try {
    const idUsuario = req.session.usuario.id;
    const pedidos = await pedidosService.listarPedidosPorUsuario(idUsuario);
    res.json(pedidos);
  } catch (error) {
    next(error);
  }
};
import * as pedidosService from './pedidos.service.js';

export const listarPedidos = async (req, res, next) => {
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
    const idUsuario = req.session.usuario.id;
    const data = req.body;

    const nuevoPedido = await pedidosService.crearPedido(idUsuario, data);
    res.status(201).json(nuevoPedido);
  } catch (error) {
    if (error.message.includes('carrito') || error.message.includes('zona') || error.message.includes('pago') || error.message.includes('obligatorios')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const cambiarEstadoPedido = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { proceso } = req.body;
    const resultado = await pedidosService.cambiarEstadoPedido(id, proceso);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no válido')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};
