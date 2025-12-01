import * as productosService from './productos.service.js';

export const listarProductos = async (req, res, next) => {
  try {
    const productos = await productosService.listarProductos();
    res.json(productos);
  } catch (error) {
    next(error);
  }
};

export const obtenerProductoPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const producto = await productosService.obtenerProductoPorId(id);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    next(error);
  }
};

export const obtenerProductosPorCategoria = async (req, res, next) => {
  try {
    const { idCategoria } = req.params;
    const productos = await productosService.obtenerProductosPorCategoria(idCategoria);
    res.json(productos);
  } catch (error) {
    next(error);
  }
};

export const crearProducto = async (req, res, next) => {
  try {
    const data = req.body;
    const imagen = req.file;

    if (!data.nombre || !data.descripcion || !data.idCategoria) {
      return res.status(400).json({ 
        message: 'Nombre, descripción e idCategoria son requeridos' 
      });
    }

    const nuevoProducto = await productosService.crearProducto(data, imagen);
    res.status(201).json(nuevoProducto);
  } catch (error) {
    if (error.message.includes('categoría') || error.message.includes('imagen')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const actualizarProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const imagen = req.file;

    const productoActualizado = await productosService.actualizarProducto(id, data, imagen);
    res.json(productoActualizado);
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('categoría')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const desactivarProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await productosService.desactivarProducto(id);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const activarProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await productosService.activarProducto(id);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};
