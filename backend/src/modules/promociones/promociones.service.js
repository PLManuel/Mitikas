export const eliminarPromocion = async (id) => {
  const promocion = await promocionesRepository.findById(id);
  if (!promocion) {
    throw new Error('Promoción no encontrada');
  }
  await promocionesRepository.deleteById(id);
  return { message: 'Promoción eliminada correctamente' };
};
import * as promocionesRepository from './promociones.repository.js';
import * as variantesRepository from '../variantes/variantes.repository.js';


export const listarPromociones = async () => {
  // Traer todas las promociones
  const promos = await promocionesRepository.findAll();
  // Para cada promoción, traer sus variantes asociadas
  const promosWithVariants = await Promise.all(
    promos.map(async (promo) => {
      const variantes = await promocionesRepository.findVariantesByPromocion(promo.id);
      return { ...promo, variantes };
    })
  );
  return promosWithVariants;
};

export const listarPromocionesVigentes = () => {
  return promocionesRepository.findVigentes();
};

export const obtenerPromocionPorId = (id) => {
  return promocionesRepository.findById(id);
};

export const crearPromocion = async (data) => {
  // Validaciones
  if (!['porcentaje', 'precio_fijo'].includes(data.tipo)) {
    throw new Error('El tipo debe ser "porcentaje" o "precio_fijo"');
  }

  const valor = parseFloat(data.valor);
  if (valor <= 0) {
    throw new Error('El valor debe ser mayor a 0');
  }

  if (data.tipo === 'porcentaje' && valor > 100) {
    throw new Error('El porcentaje no puede ser mayor a 100');
  }

  const fechaInicio = new Date(data.fechaInicio);
  const fechaFin = new Date(data.fechaFin);

  if (fechaFin < fechaInicio) {
    throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
  }

  const promocionData = {
    nombre: data.nombre,
    tipo: data.tipo,
    valor: valor,
    fechaInicio: data.fechaInicio,
    fechaFin: data.fechaFin
  };

  const insertId = await promocionesRepository.create(promocionData);
  
  // Si se proporcionaron variantes, asociarlas
  if (data.variantes && Array.isArray(data.variantes) && data.variantes.length > 0) {
    for (const idVariante of data.variantes) {
      await promocionesRepository.addVarianteToPromocion(insertId, idVariante);
    }
  }

  return {
    id: insertId,
    ...promocionData,
    activo: true
  };
};

export const actualizarPromocion = async (id, data) => {
  const promocion = await promocionesRepository.findById(id);
  
  if (!promocion) {
    throw new Error('Promoción no encontrada');
  }

  // Validaciones si se actualizan valores
  if (data.tipo && !['porcentaje', 'precio_fijo'].includes(data.tipo)) {
    throw new Error('El tipo debe ser "porcentaje" o "precio_fijo"');
  }

  if (data.valor) {
    const valor = parseFloat(data.valor);
    if (valor <= 0) {
      throw new Error('El valor debe ser mayor a 0');
    }
    if ((data.tipo || promocion.tipo) === 'porcentaje' && valor > 100) {
      throw new Error('El porcentaje no puede ser mayor a 100');
    }
  }

  if (data.fechaInicio && data.fechaFin) {
    const fechaInicio = new Date(data.fechaInicio);
    const fechaFin = new Date(data.fechaFin);
    if (fechaFin < fechaInicio) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }
  }

  const promocionData = {
    nombre: data.nombre || promocion.nombre,
    tipo: data.tipo || promocion.tipo,
    valor: data.valor ? parseFloat(data.valor) : promocion.valor,
    fechaInicio: data.fechaInicio || promocion.fechaInicio,
    fechaFin: data.fechaFin || promocion.fechaFin
  };

  await promocionesRepository.update(id, promocionData);

  return {
    id: parseInt(id),
    ...promocionData,
    activo: promocion.activo
  };
};

export const desactivarPromocion = async (id) => {
  const promocion = await promocionesRepository.findById(id);
  
  if (!promocion) {
    throw new Error('Promoción no encontrada');
  }

  // Limpiar asociaciones de variantes
  await promocionesRepository.clearVariantesFromPromocion(id);
  await promocionesRepository.updateActivo(id, false);
  return { message: 'Promoción desactivada correctamente y variantes limpiadas' };
};

export const activarPromocion = async (id) => {
  const promocion = await promocionesRepository.findById(id);
  
  if (!promocion) {
    throw new Error('Promoción no encontrada');
  }

  await promocionesRepository.updateActivo(id, true);
  return { message: 'Promoción activada correctamente' };
};

// Gestión de variantes
export const obtenerVariantesDePromocion = async (id) => {
  const promocion = await promocionesRepository.findById(id);
  
  if (!promocion) {
    throw new Error('Promoción no encontrada');
  }

  return promocionesRepository.findVariantesByPromocion(id);
};

export const agregarVarianteAPromocion = async (idPromocion, idVariante) => {
  const promocion = await promocionesRepository.findById(idPromocion);
  if (!promocion) {
    throw new Error('Promoción no encontrada');
  }

  const variante = await variantesRepository.findById(idVariante);
  if (!variante) {
    throw new Error('Variante no encontrada');
  }

  try {
    await promocionesRepository.addVarianteToPromocion(idPromocion, idVariante);
    return { message: 'Variante agregada a la promoción correctamente' };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Esta variante ya está asociada a la promoción');
    }
    throw error;
  }
};

export const quitarVarianteDePromocion = async (idPromocion, idVariante) => {
  const promocion = await promocionesRepository.findById(idPromocion);
  if (!promocion) {
    throw new Error('Promoción no encontrada');
  }

  const affectedRows = await promocionesRepository.removeVarianteFromPromocion(idPromocion, idVariante);
  
  if (affectedRows === 0) {
    throw new Error('La variante no está asociada a esta promoción');
  }

  return { message: 'Variante removida de la promoción correctamente' };
};

export const calcularPrecioConPromocion = (precioOriginal, promocion) => {
  if (promocion.tipo === 'porcentaje') {
    const descuento = (precioOriginal * promocion.valor) / 100;
    return precioOriginal - descuento;
  } else if (promocion.tipo === 'precio_fijo') {
    return promocion.valor;
  }
  return precioOriginal;
};
