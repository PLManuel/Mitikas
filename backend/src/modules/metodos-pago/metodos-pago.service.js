export const eliminarMetodo = async (id) => {
  const metodo = await metodosPagoRepository.findById(id);
  if (!metodo) throw new Error('Método de pago no encontrado');
  await metodosPagoRepository.remove(id);
};
import * as metodosPagoRepository from './metodos-pago.repository.js';

export const listarMetodosPago = () => {
  return metodosPagoRepository.findAll();
};

export const listarMetodosActivos = () => {
  return metodosPagoRepository.findActivos();
};

export const obtenerMetodoPorId = (id) => {
  return metodosPagoRepository.findById(id);
};

export const crearMetodo = async (data) => {
  // Validaciones
  if (!data.metodo || data.metodo.trim().length === 0) {
    throw new Error('El nombre del método de pago es requerido');
  }

  const metodo = data.metodo.trim();
  const insertId = await metodosPagoRepository.create(metodo);
  
  return {
    id: insertId,
    metodo: metodo,
    activo: true
  };
};

export const actualizarMetodo = async (id, data) => {
  const metodo = await metodosPagoRepository.findById(id);
  
  if (!metodo) {
    throw new Error('Método de pago no encontrado');
  }

  if (!data.metodo || data.metodo.trim().length === 0) {
    throw new Error('El nombre del método de pago es requerido');
  }

  const nuevoMetodo = data.metodo.trim();
  await metodosPagoRepository.update(id, nuevoMetodo);
  
  return {
    id: parseInt(id),
    metodo: nuevoMetodo,
    activo: metodo.activo
  };
};

export const desactivarMetodo = async (id) => {
  const metodo = await metodosPagoRepository.findById(id);
  
  if (!metodo) {
    throw new Error('Método de pago no encontrado');
  }

  await metodosPagoRepository.updateActivo(id, false);
  return { message: 'Método de pago desactivado correctamente' };
};

export const activarMetodo = async (id) => {
  const metodo = await metodosPagoRepository.findById(id);
  
  if (!metodo) {
    throw new Error('Método de pago no encontrado');
  }

  await metodosPagoRepository.updateActivo(id, true);
  return { message: 'Método de pago activado correctamente' };
};
