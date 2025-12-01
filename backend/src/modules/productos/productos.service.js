import * as productosRepository from './productos.repository.js';
import * as categoriasRepository from '../categorias/categorias.repository.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const listarProductos = () => {
  return productosRepository.findAll();
};

export const obtenerProductoPorId = (id) => {
  return productosRepository.findById(id);
};

export const obtenerProductosPorCategoria = (idCategoria) => {
  return productosRepository.findByCategoria(idCategoria);
};

export const crearProducto = async (data, imagen) => {
  // Validar que la categoría existe
  const categoria = await categoriasRepository.findById(data.idCategoria);
  if (!categoria) {
    throw new Error('La categoría especificada no existe');
  }

  if (!imagen) {
    throw new Error('La imagen del producto es requerida');
  }

  const productoData = {
    nombre: data.nombre,
    descripcion: data.descripcion,
    imagen: imagen.filename,
    idCategoria: data.idCategoria
  };

  const insertId = await productosRepository.create(productoData);
  return {
    id: insertId,
    ...productoData,
    activo: true
  };
};

export const actualizarProducto = async (id, data, imagen) => {
  const producto = await productosRepository.findById(id);
  
  if (!producto) {
    throw new Error('Producto no encontrado');
  }

  // Validar categoría si se está actualizando
  if (data.idCategoria) {
    const categoria = await categoriasRepository.findById(data.idCategoria);
    if (!categoria) {
      throw new Error('La categoría especificada no existe');
    }
  }

  const productoData = {
    nombre: data.nombre || producto.nombre,
    descripcion: data.descripcion || producto.descripcion,
    idCategoria: data.idCategoria || producto.idCategoria,
    imagen: imagen ? imagen.filename : producto.imagen
  };

  // Si hay nueva imagen, eliminar la anterior
  if (imagen && producto.imagen) {
    const oldImagePath = path.join(__dirname, '../../../uploads', producto.imagen);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }

  await productosRepository.update(id, productoData);
  return {
    id: parseInt(id),
    ...productoData,
    activo: producto.activo
  };
};

export const desactivarProducto = async (id) => {
  const producto = await productosRepository.findById(id);
  
  if (!producto) {
    throw new Error('Producto no encontrado');
  }

  await productosRepository.updateActivo(id, false);
  return { message: 'Producto desactivado correctamente' };
};

export const activarProducto = async (id) => {
  const producto = await productosRepository.findById(id);
  
  if (!producto) {
    throw new Error('Producto no encontrado');
  }

  await productosRepository.updateActivo(id, true);
  return { message: 'Producto activado correctamente' };
};
