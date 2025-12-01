export const eliminarZona = async (id) => {
  const zona = await zonasDeliveryRepository.findById(id);
  if (!zona) {
    throw new Error('Zona de delivery no encontrada');
  }
  await zonasDeliveryRepository.deleteById(id);
  return { message: 'Zona de delivery eliminada correctamente' };
};
import * as zonasDeliveryRepository from './zonas-delivery.repository.js';

export const listarZonasDelivery = () => {
  return zonasDeliveryRepository.findAll();
};

export const listarZonasActivas = () => {
  return zonasDeliveryRepository.findActivas();
};

export const obtenerZonaPorId = (id) => {
  return zonasDeliveryRepository.findById(id);
};

export const crearZona = async (data) => {
  // Validaciones
  if (!data.distrito || data.distrito.trim().length === 0) {
    throw new Error('El distrito es requerido');
  }

  const costo = parseFloat(data.costo);
  if (isNaN(costo) || costo < 0) {
    throw new Error('El costo debe ser un número válido mayor o igual a 0');
  }

  const diasEstimados = parseInt(data.diasEstimados);
  if (isNaN(diasEstimados) || diasEstimados <= 0) {
    throw new Error('Los días estimados deben ser un número válido mayor a 0');
  }

  const zonaData = {
    distrito: data.distrito.trim(),
    costo: costo,
    diasEstimados: diasEstimados
  };

  const insertId = await zonasDeliveryRepository.create(zonaData);
  return {
    id: insertId,
    ...zonaData,
    activo: true
  };
};

export const actualizarZona = async (id, data) => {
  const zona = await zonasDeliveryRepository.findById(id);
  
  if (!zona) {
    throw new Error('Zona de delivery no encontrada');
  }

  // Validaciones opcionales
  if (data.costo !== undefined) {
    const costo = parseFloat(data.costo);
    if (isNaN(costo) || costo < 0) {
      throw new Error('El costo debe ser un número válido mayor o igual a 0');
    }
  }

  if (data.diasEstimados !== undefined) {
    const diasEstimados = parseInt(data.diasEstimados);
    if (isNaN(diasEstimados) || diasEstimados <= 0) {
      throw new Error('Los días estimados deben ser un número válido mayor a 0');
    }
  }

  const zonaData = {
    distrito: data.distrito ? data.distrito.trim() : zona.distrito,
    costo: data.costo !== undefined ? parseFloat(data.costo) : zona.costo,
    diasEstimados: data.diasEstimados !== undefined ? parseInt(data.diasEstimados) : zona.diasEstimados
  };

  await zonasDeliveryRepository.update(id, zonaData);
  return {
    id: parseInt(id),
    ...zonaData,
    activo: zona.activo
  };
};

export const desactivarZona = async (id) => {
  const zona = await zonasDeliveryRepository.findById(id);
  
  if (!zona) {
    throw new Error('Zona de delivery no encontrada');
  }

  await zonasDeliveryRepository.updateActivo(id, false);
  return { message: 'Zona de delivery desactivada correctamente' };
};

export const activarZona = async (id) => {
  const zona = await zonasDeliveryRepository.findById(id);
  
  if (!zona) {
    throw new Error('Zona de delivery no encontrada');
  }

  await zonasDeliveryRepository.updateActivo(id, true);
  return { message: 'Zona de delivery activada correctamente' };
};
