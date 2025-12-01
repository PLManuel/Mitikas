import * as variantesService from './variantes.service.js';

export const listarVariantes = async (req, res, next) => {
  try {
    const variantes = await variantesService.listarVariantes();
    res.json(variantes);
  } catch (error) {
    next(error);
  }
};

export const obtenerVariantePorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const variante = await variantesService.obtenerVariantePorId(id);
    if (!variante) {
      return res.status(404).json({ message: 'Variante no encontrada' });
    }
    res.json(variante);
  } catch (error) {
    next(error);
  }
};

export const obtenerVariantesPorProducto = async (req, res, next) => {
  try {
    const { idProducto } = req.params;
    const variantes = await variantesService.obtenerVariantesPorProducto(idProducto);
    res.json(variantes);
  } catch (error) {
    next(error);
  }
};

export const crearVariante = async (req, res, next) => {
  try {
    console.log('REQ.BODY crearVariante:', req.body);
    const data = req.body;

    if (!data.idProducto || !data.tamano || !data.precioVenta) {
      return res.status(400).json({ 
        message: 'idProducto, tamano y precioVenta son requeridos' 
      });
    }

    const nuevaVariante = await variantesService.crearVariante(data);
    res.status(201).json(nuevaVariante);
  } catch (error) {
    if (error.message.includes('producto') || error.message.includes('precio')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const actualizarVariante = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('REQ.BODY actualizarVariante:', req.body);
    const data = req.body;

    const varianteActualizada = await variantesService.actualizarVariante(id, data);
    res.json(varianteActualizada);
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('producto') || error.message.includes('precio')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const desactivarVariante = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await variantesService.desactivarVariante(id);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const activarVariante = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await variantesService.activarVariante(id);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};
