import * as categoriasRepository from './categorias.repository.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const listarCategorias = () => {
  return categoriasRepository.findAll();
};

export const obtenerCategoriaPorId = (id) => {
  return categoriasRepository.findById(id);
};

export const crearCategoria = async (data, imagen) => {
  const categoriaData = {
    nombre: data.nombre,
    imagen: imagen ? imagen.filename : null
  };

  const insertId = await categoriasRepository.create(categoriaData);
  return {
    id: insertId,
    categoria: categoriaData.nombre,
    imagen: categoriaData.imagen,
    activo: true
  };
};

export const desactivarCategoria = async (id) => {
  const categoria = await categoriasRepository.findById(id);
  
  if (!categoria) {
    throw new Error('Categoría no encontrada');
  }

  await categoriasRepository.updateActivo(id, false);
  return { message: 'Categoría desactivada correctamente' };
};

export const activarCategoria = async (id) => {
  const categoria = await categoriasRepository.findById(id);
  
  if (!categoria) {
    throw new Error('Categoría no encontrada');
  }

  await categoriasRepository.updateActivo(id, true);
  return { message: 'Categoría activada correctamente' };
};

export const actualizarCategoria = async (id, data, imagen) => {
  const categoria = await categoriasRepository.findById(id);
  
  if (!categoria) {
    throw new Error('Categoría no encontrada');
  }

  const categoriaData = {
    nombre: data.nombre || categoria.categoria,
    imagen: imagen ? imagen.filename : categoria.imagen
  };

  // Si hay nueva imagen, eliminar la anterior
  if (imagen && categoria.imagen) {
    const oldImagePath = path.join(__dirname, '../../../uploads', categoria.imagen);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }

  await categoriasRepository.update(id, categoriaData);
  return {
    id: parseInt(id),
    categoria: categoriaData.nombre,
    imagen: categoriaData.imagen,
    activo: categoria.activo
  };
};

export const eliminarCategoria = async (id) => {
  const categoria = await categoriasRepository.findById(id);
  
  if (!categoria) {
    throw new Error('Categoría no encontrada');
  }

  // Eliminar imagen si existe
  if (categoria.imagen) {
    const imagePath = path.join(__dirname, '../../../uploads', categoria.imagen);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  await categoriasRepository.deleteById(id);
  return { message: 'Categoría eliminada correctamente' };
};
