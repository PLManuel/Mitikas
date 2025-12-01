export const eliminarMetodo = async (req, res, next) => {
  try {
    const { id } = req.params;
    await metodosPagoService.eliminarMetodo(id);
    res.json({ message: 'Método de pago eliminado' });
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};
import * as metodosPagoService from './metodos-pago.service.js';

export const listarMetodosPago = async (req, res, next) => {
  try {
    const metodos = await metodosPagoService.listarMetodosPago();
    res.json(metodos);
  } catch (error) {
    next(error);
  }
};

export const listarMetodosActivos = async (req, res, next) => {
  try {
    const metodos = await metodosPagoService.listarMetodosActivos();
    res.json(metodos);
  } catch (error) {
    next(error);
  }
};

export const obtenerMetodoPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const metodo = await metodosPagoService.obtenerMetodoPorId(id);
    if (!metodo) {
      return res.status(404).json({ message: 'Método de pago no encontrado' });
    }
    res.json(metodo);
  } catch (error) {
    next(error);
  }
};

export const crearMetodo = async (req, res, next) => {
  try {
    const data = req.body;

    if (!data.metodo) {
      return res.status(400).json({ 
        message: 'El método de pago es requerido' 
      });
    }

    const nuevoMetodo = await metodosPagoService.crearMetodo(data);
    res.status(201).json(nuevoMetodo);
  } catch (error) {
    if (error.message.includes('requerido')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const actualizarMetodo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const metodoActualizado = await metodosPagoService.actualizarMetodo(id, data);
    res.json(metodoActualizado);
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('requerido')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const desactivarMetodo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await metodosPagoService.desactivarMetodo(id);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const activarMetodo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await metodosPagoService.activarMetodo(id);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};
