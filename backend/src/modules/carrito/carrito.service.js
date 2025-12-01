import * as carritoRepository from './carrito.repository.js';
import * as productosRepository from '../productos/productos.repository.js';
import * as variantesRepository from '../variantes/variantes.repository.js';
import * as promocionesRepository from '../promociones/promociones.repository.js';

const calcularPrecioConPromocion = (precioOriginal, promocion) => {
  // DEBUG
  console.log('[PROMO] calcularPrecioConPromocion', { precioOriginal, promocion });
  if (!promocion) return precioOriginal;
  
  if (promocion.tipoPromocion === 'porcentaje') {
    const descuento = (precioOriginal * promocion.valorPromocion) / 100;
    return precioOriginal - descuento;
  } else if (promocion.tipoPromocion === 'precio_fijo') {
    return promocion.valorPromocion;
  }
  return precioOriginal;
};

const calcularTotalesItem = (item) => {
  const promoObj = item.idPromocion ? item : null;
  const precioConPromocion = calcularPrecioConPromocion(item.precioUnitario, promoObj);
  const subtotal = precioConPromocion * item.cantidad;
  const descuento = (item.precioUnitario * item.cantidad) - subtotal;
  // DEBUG
  console.log('[PROMO] calcularTotalesItem', {
    idVariante: item.idVariante,
    idPromocion: item.idPromocion,
    precioUnitario: item.precioUnitario,
    precioConPromocion,
    subtotal,
    descuento
  });
  return {
    ...item,
    precioConDescuento: precioConPromocion,
    subtotal: subtotal,
    descuento: descuento
  };
};

export const obtenerCarrito = async (idUsuario) => {
  const items = await carritoRepository.findByUsuario(idUsuario);
  console.log('[PROMO] obtenerCarrito items', items);
  const itemsConTotales = items.map(calcularTotalesItem);
  console.log('[PROMO] obtenerCarrito itemsConTotales', itemsConTotales);
  const total = itemsConTotales.reduce((sum, item) => sum + item.subtotal, 0);
  const totalDescuentos = itemsConTotales.reduce((sum, item) => sum + item.descuento, 0);
  const cantidadItems = itemsConTotales.length;
  const cantidadProductos = itemsConTotales.reduce((sum, item) => sum + item.cantidad, 0);

  return {
    items: itemsConTotales,
    resumen: {
      cantidadItems,
      cantidadProductos,
      subtotal: total + totalDescuentos,
      descuentos: totalDescuentos,
      total: total
    }
  };
};

export const agregarAlCarrito = async (idUsuario, data) => {
  console.log('[PROMO] agregarAlCarrito', { idUsuario, data });
  // Validar producto
  const producto = await productosRepository.findById(data.idProducto);
  if (!producto) {
    throw new Error('Producto no encontrado');
  }

  if (!producto.activo) {
    throw new Error('El producto no está disponible');
  }

  // Validar variante
  const variante = await variantesRepository.findById(data.idVariante);
  if (!variante) {
    throw new Error('Variante no encontrada');
  }

  if (!variante.activo) {
    throw new Error('La variante no está disponible');
  }

  if (variante.idProducto !== parseInt(data.idProducto)) {
    throw new Error('La variante no pertenece al producto especificado');
  }

  // Validar cantidad
  const cantidad = parseInt(data.cantidad) || 1;
  if (cantidad <= 0) {
    throw new Error('La cantidad debe ser mayor a 0');
  }

  // Validar promoción si se proporciona
  let idPromocion = null;
  if (data.idPromocion) {
    const promocion = await promocionesRepository.findById(data.idPromocion);
    if (!promocion || !promocion.activo) {
      throw new Error('Promoción no válida');
    }

    // Verificar que la variante esté en la promoción
    const variantesPromocion = await promocionesRepository.findVariantesByPromocion(data.idPromocion);
    const varianteEnPromocion = variantesPromocion.find(v => v.idVariante === parseInt(data.idVariante));
    
    if (!varianteEnPromocion) {
      throw new Error('Esta variante no está incluida en la promoción');
    }

    idPromocion = data.idPromocion;
  }

  // Verificar si ya existe en el carrito
  const itemExistente = await carritoRepository.findByUsuarioAndVariante(idUsuario, data.idVariante);

  if (itemExistente) {
    console.log('[PROMO] itemExistente', itemExistente);
    // Actualizar cantidad
    const nuevaCantidad = itemExistente.cantidad + cantidad;
    await carritoRepository.updateCantidad(itemExistente.id, nuevaCantidad);
    // Siempre actualizar la promoción (aunque sea igual)
    await carritoRepository.updatePromocion(itemExistente.id, idPromocion);
    console.log('[PROMO] updateCantidad y updatePromocion', { id: itemExistente.id, nuevaCantidad, idPromocion });
    return { 
      message: 'Cantidad actualizada en el carrito',
      id: itemExistente.id
    };
  } else {
    // Crear nuevo item
    const itemData = {
      idUsuario,
      idProducto: data.idProducto,
      idVariante: data.idVariante,
      cantidad,
      idPromocion
    };

    const insertId = await carritoRepository.create(itemData);
    return { 
      message: 'Producto agregado al carrito',
      id: insertId
    };
  }
};

export const actualizarCantidad = async (idUsuario, idItem, cantidad) => {
  const item = await carritoRepository.findById(idItem);

  if (!item) {
    throw new Error('Item no encontrado en el carrito');
  }

  if (item.idUsuario !== idUsuario) {
    throw new Error('No tienes permiso para modificar este item');
  }

  const nuevaCantidad = parseInt(cantidad);
  if (nuevaCantidad <= 0) {
    throw new Error('La cantidad debe ser mayor a 0');
  }

  await carritoRepository.updateCantidad(idItem, nuevaCantidad);
  return { message: 'Cantidad actualizada correctamente' };
};

export const eliminarDelCarrito = async (idUsuario, idItem) => {
  const item = await carritoRepository.findById(idItem);

  if (!item) {
    throw new Error('Item no encontrado en el carrito');
  }

  if (item.idUsuario !== idUsuario) {
    throw new Error('No tienes permiso para eliminar este item');
  }

  await carritoRepository.deleteById(idItem);
  return { message: 'Producto eliminado del carrito' };
};

export const vaciarCarrito = async (idUsuario) => {
  const affectedRows = await carritoRepository.deleteByUsuario(idUsuario);
  return { 
    message: 'Carrito vaciado correctamente',
    itemsEliminados: affectedRows
  };
};

export const aplicarPromocion = async (idUsuario, idItem, idPromocion) => {
  const item = await carritoRepository.findById(idItem);

  if (!item) {
    throw new Error('Item no encontrado en el carrito');
  }

  if (item.idUsuario !== idUsuario) {
    throw new Error('No tienes permiso para modificar este item');
  }

  if (idPromocion) {
    const promocion = await promocionesRepository.findById(idPromocion);
    if (!promocion || !promocion.activo) {
      throw new Error('Promoción no válida');
    }

    // Verificar que la variante esté en la promoción
    const variantesPromocion = await promocionesRepository.findVariantesByPromocion(idPromocion);
    const varianteEnPromocion = variantesPromocion.find(v => v.idVariante === item.idVariante);
    
    if (!varianteEnPromocion) {
      throw new Error('Esta variante no está incluida en la promoción');
    }
  }

  await carritoRepository.updatePromocion(idItem, idPromocion);
  return { message: 'Promoción aplicada correctamente' };
};
