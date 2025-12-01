// Devuelve pedidos del usuario con detalles y totales
export const listarPedidosPorUsuario = async (idUsuario) => {
  const pedidos = await pedidosRepository.findByUsuario(idUsuario);
  // Para cada pedido, obtener detalle y totales
  const pedidosConDetalle = await Promise.all(pedidos.map(async (p) => {
    const detalle = await detallePedidoRepository.findByPedido(p.id);
    // Calcular subtotal, descuentos y total
    let subtotal = 0;
    let descuentos = 0;
    detalle.forEach(item => {
      const precioOriginal = Number(item.precioUnitario) * item.cantidad;
      const precioPromo = item.precioPromocion !== null ? Number(item.precioPromocion) * item.cantidad : precioOriginal;
      subtotal += precioOriginal;
      descuentos += precioOriginal - precioPromo;
    });
    const total = subtotal - descuentos + Number(p.costoEnvio || 0);
    return {
      id: p.id,
      fecha: p.fecha,
      tipoEntrega: p.idZonaDelivery ? 'domicilio' : 'local',
      direccion: p.direccion,
      costoEnvio: Number(p.costoEnvio || 0),
      subtotal,
      descuentos,
      total,
      proceso: p.proceso,
      productos: detalle.map(item => ({
        id: item.id,
        nombreProducto: item.nombreProducto,
        tamano: item.tamano,
        cantidad: item.cantidad,
        precioUnitario: Number(item.precioUnitario),
        precioPromocion: item.precioPromocion !== null ? Number(item.precioPromocion) : null,
        idPromocion: item.idPromocion,
        nombrePromocion: item.nombrePromocion,
      })),
    };
  }));
  return pedidosConDetalle;
};
import * as pedidosRepository from './pedidos.repository.js';
import * as detallePedidoRepository from './detalle-pedido.repository.js';
import * as carritoService from '../carrito/carrito.service.js';
import * as zonasDeliveryRepository from '../zonas-delivery/zonas-delivery.repository.js';
import * as metodosPagoRepository from '../metodos-pago/metodos-pago.repository.js';
import * as tarjetasService from '../tarjetas/tarjetas.service.js';

export const listarPedidos = async () => {
  const pedidos = await pedidosRepository.findAll();
  const pedidosConDetalle = await Promise.all(pedidos.map(async (p) => {
    const detalle = await detallePedidoRepository.findByPedido(p.id);
    let subtotal = 0;
    let descuentos = 0;
    detalle.forEach(item => {
      const precioOriginal = Number(item.precioUnitario) * item.cantidad;
      const precioPromo = item.precioPromocion !== null ? Number(item.precioPromocion) * item.cantidad : precioOriginal;
      subtotal += precioOriginal;
      descuentos += precioOriginal - precioPromo;
    });
    const total = subtotal - descuentos + Number(p.costoEnvio || 0);
    return {
      id: p.id,
      fecha: p.fecha,
      nombre: p.nombre,
      apellido: p.apellido,
      direccion: p.direccion,
      idZonaDelivery: p.idZonaDelivery,
      distrito: p.distrito,
      costoEnvio: Number(p.costoEnvio || 0),
      subtotal,
      descuentos,
      total,
      proceso: p.proceso,
      productos: detalle.map(item => ({
        id: item.id,
        nombreProducto: item.nombreProducto,
        tamano: item.tamano,
        cantidad: item.cantidad,
        precioUnitario: Number(item.precioUnitario),
        precioPromocion: item.precioPromocion !== null ? Number(item.precioPromocion) : null,
        idPromocion: item.idPromocion,
        nombrePromocion: item.nombrePromocion,
      })),
    };
  }));
  return pedidosConDetalle;
};

export const obtenerPedidoPorId = async (id) => {
  const pedido = await pedidosRepository.findById(id);
  if (!pedido) return null;
  const detalle = await detallePedidoRepository.findByPedido(id);
  return { ...pedido, detalle };
};

export const crearPedido = async (idUsuario, data) => {
  // Validaciones básicas
  if (!data.nombre || !data.apellido || !data.idMetodoPago) {
    throw new Error('Faltan datos obligatorios para el pedido');
  }

  // Validar método de pago
  const metodo = await metodosPagoRepository.findById(data.idMetodoPago);
  if (!metodo || !metodo.activo) {
    throw new Error('Método de pago no válido');
  }

  // Obtener carrito del usuario
  const carrito = await carritoService.obtenerCarrito(idUsuario);
  if (!carrito.items.length) {
    throw new Error('El carrito está vacío');
  }

  // ¿Es entrega en local o a domicilio?
  const esDomicilio = !!data.idZonaDelivery;
  let zona = null;
  let costoEnvio = null;
  let direccion = null;
  if (esDomicilio) {
    // Validar zona de delivery
    zona = await zonasDeliveryRepository.findById(data.idZonaDelivery);
    if (!zona || !zona.activo) {
      throw new Error('Zona de delivery no válida');
    }
    costoEnvio = zona.costo;
    direccion = data.direccion;
    if (!direccion) {
      throw new Error('La dirección es obligatoria para entrega a domicilio');
    }
  }

  // Calcular totales
  const subtotal = carrito.resumen.subtotal;
  const descuentos = carrito.resumen.descuentos;
  const total = carrito.resumen.total + (costoEnvio ? costoEnvio : 0);

  // Si el método de pago es tarjeta de crédito (id=2), validar y descontar saldo
  let idTarjetaSimulada = null;
  if (data.idMetodoPago === 2) {
    if (!data.idTarjetaSimulada) {
      throw new Error('Debe seleccionar una tarjeta simulada');
    }
    // Validar que la tarjeta exista y sea del usuario
    const tarjeta = await tarjetasService.obtenerTarjetaPorId(data.idTarjetaSimulada, idUsuario);
    if (!tarjeta) {
      throw new Error('Tarjeta simulada no encontrada');
    }
    if (Number(tarjeta.saldo) < total) {
      throw new Error('Saldo insuficiente en la tarjeta simulada');
    }
    // Descontar saldo
    await tarjetasService.actualizarSaldo(data.idTarjetaSimulada, idUsuario, Number(tarjeta.saldo) - total);
    idTarjetaSimulada = data.idTarjetaSimulada;
  }

  // Crear pedido
  const pedidoData = {
    fecha: new Date(),
    nombre: data.nombre,
    apellido: data.apellido,
    direccion: direccion,
    idZonaDelivery: esDomicilio ? data.idZonaDelivery : null,
    costoEnvio: costoEnvio,
    proceso: 'solicitud_recibida',
    idUsuario,
    idMetodoPago: data.idMetodoPago,
    idTarjetaSimulada
  };

  const idPedido = await pedidosRepository.create(pedidoData);

  // Crear detalle de pedido
  for (const item of carrito.items) {
    await detallePedidoRepository.create({
      idPedido,
      idProducto: item.idProducto,
      idVariante: item.idVariante,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      precioPromocion: item.precioConDescuento ?? item.precioUnitario,
      subtotal: item.subtotal,
      estado: 'confirmado',
      idPromocion: item.idPromocion || null
    });
  }

  // Vaciar carrito
  await carritoService.vaciarCarrito(idUsuario);

  return { id: idPedido, total, subtotal, descuentos, costoEnvio: zona ? zona.costo : 0 };
};

export const cambiarEstadoPedido = async (id, proceso) => {
  const validos = ['solicitud_recibida','en_preparacion','en_camino','entregado'];
  if (!validos.includes(proceso)) {
    throw new Error('Estado de proceso no válido');
  }
  await pedidosRepository.updateProceso(id, proceso);
  return { message: 'Estado actualizado correctamente' };
};
