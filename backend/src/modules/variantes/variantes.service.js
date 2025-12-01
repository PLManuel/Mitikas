import * as variantesRepository from './variantes.repository.js';
import * as productosRepository from '../productos/productos.repository.js';

export const listarVariantes = () => {
  return variantesRepository.findAll();
};

export const obtenerVariantePorId = (id) => {
  return variantesRepository.findById(id);
};

export const obtenerVariantesPorProducto = (idProducto) => {
  return variantesRepository.findByProducto(idProducto);
};

export const crearVariante = async (data) => {
  // Validar que el producto existe
  const producto = await productosRepository.findById(data.idProducto);
  if (!producto) {
    throw new Error('El producto especificado no existe');
  }

  // Validar precio
  if (!data.precioVenta || parseFloat(data.precioVenta) <= 0) {
    throw new Error('El precio de venta debe ser mayor a 0');
  }

  const varianteData = {
    idProducto: data.idProducto,
    tamano: data.tamano,
    precioVenta: parseFloat(data.precioVenta)
  };

  const insertId = await variantesRepository.create(varianteData);
  
  // Retornar la variante completa usando findById para tener la misma estructura
  const varianteCreada = await variantesRepository.findById(insertId);
  return varianteCreada;
};

export const actualizarVariante = async (id, data) => {
  const variante = await variantesRepository.findById(id);
  
  if (!variante) {
    throw new Error('Variante no encontrada');
  }

  // Validar producto si se está actualizando
  if (data.idProducto) {
    const producto = await productosRepository.findById(data.idProducto);
    if (!producto) {
      throw new Error('El producto especificado no existe');
    }
  }

  // Validar precio si se está actualizando
  if (data.precioVenta && parseFloat(data.precioVenta) <= 0) {
    throw new Error('El precio de venta debe ser mayor a 0');
  }

  const varianteData = {
    idProducto: data.idProducto || variante.idProducto,
      tamano: data.tamano || variante.tamano,
    precioVenta: data.precioVenta ? parseFloat(data.precioVenta) : variante.precioVenta
  };

  await variantesRepository.update(id, varianteData);
  return {
    id: parseInt(id),
    ...varianteData,
    activo: variante.activo
  };
};

export const desactivarVariante = async (id) => {
  const variante = await variantesRepository.findById(id);
  
  if (!variante) {
    throw new Error('Variante no encontrada');
  }

  await variantesRepository.updateActivo(id, false);
  return { message: 'Variante desactivada correctamente' };
};

export const activarVariante = async (id) => {
  const variante = await variantesRepository.findById(id);
  
  if (!variante) {
    throw new Error('Variante no encontrada');
  }

  await variantesRepository.updateActivo(id, true);
  return { message: 'Variante activada correctamente' };
};
