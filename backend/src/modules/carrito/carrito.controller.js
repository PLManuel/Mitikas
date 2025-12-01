import * as carritoService from './carrito.service.js';

export const obtenerCarrito = async (req, res, next) => {
  try {
    const idUsuario = req.session.usuario.id;
    const carrito = await carritoService.obtenerCarrito(idUsuario);
    res.json(carrito);
  } catch (error) {
    next(error);
  }
};

export const agregarAlCarrito = async (req, res, next) => {
  try {
    const idUsuario = req.session.usuario.id;
    const data = req.body;

    if (!data.idProducto || !data.idVariante) {
      return res.status(400).json({ 
        message: 'idProducto e idVariante son requeridos' 
      });
    }

    const resultado = await carritoService.agregarAlCarrito(idUsuario, data);
    res.status(201).json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrado') || 
        error.message.includes('no está disponible') ||
        error.message.includes('no pertenece') ||
        error.message.includes('no válida') ||
        error.message.includes('no está incluida') ||
        error.message.includes('cantidad')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const actualizarCantidad = async (req, res, next) => {
  try {
    const idUsuario = req.session.usuario.id;
    const { id } = req.params;
    const { cantidad } = req.body;

    if (!cantidad) {
      return res.status(400).json({ message: 'Cantidad es requerida' });
    }

    const resultado = await carritoService.actualizarCantidad(idUsuario, id, cantidad);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('permiso') || error.message.includes('cantidad')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

export const eliminarDelCarrito = async (req, res, next) => {
  try {
    const idUsuario = req.session.usuario.id;
    const { id } = req.params;

    const resultado = await carritoService.eliminarDelCarrito(idUsuario, id);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('permiso')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

export const vaciarCarrito = async (req, res, next) => {
  try {
    const idUsuario = req.session.usuario.id;
    const resultado = await carritoService.vaciarCarrito(idUsuario);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

export const aplicarPromocion = async (req, res, next) => {
  try {
    const idUsuario = req.session.usuario.id;
    const { id } = req.params;
    const { idPromocion } = req.body;

    const resultado = await carritoService.aplicarPromocion(idUsuario, id, idPromocion);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('permiso') || 
        error.message.includes('no válida') ||
        error.message.includes('no está incluida')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};
