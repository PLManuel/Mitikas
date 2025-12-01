import * as categoriasService from './categorias.service.js';

export const listarCategorias = async (req, res, next) => {
  try {
    const categorias = await categoriasService.listarCategorias();
    res.json(categorias);
  } catch (error) {
    next(error);
  }
};

export const obtenerCategoriaPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const categoria = await categoriasService.obtenerCategoriaPorId(id);
    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.json(categoria);
  } catch (error) {
    next(error);
  }
};

export const crearCategoria = async (req, res, next) => {
  try {
    const data = req.body;
    const imagen = req.file;
    console.log('Crear categoría - body recibido:', data);
    if (imagen) {
      console.log('Crear categoría - imagen recibida:', imagen.originalname || imagen.filename);
    }

    const nombreCategoria = data.nombre || data.categoria;
    if (!nombreCategoria) {
      console.error('Error: El nombre de la categoría es requerido');
      return res.status(400).json({ message: 'El nombre de la categoría es requerido' });
    }
    // Normalizar el body para el service
    const dataFinal = { ...data, nombre: nombreCategoria };
    const nuevaCategoria = await categoriasService.crearCategoria(dataFinal, imagen);
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    console.error('Error real al crear categoría:', error);
    next(error);
  }
};

export const actualizarCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const imagen = req.file;

    const categoriaActualizada = await categoriasService.actualizarCategoria(id, data, imagen);
    res.json(categoriaActualizada);
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const desactivarCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await categoriasService.desactivarCategoria(id);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const activarCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await categoriasService.activarCategoria(id);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const eliminarCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await categoriasService.eliminarCategoria(id);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};
