export const eliminarZona = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await zonasDeliveryService.eliminarZona(id);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};
import * as zonasDeliveryService from './zonas-delivery.service.js';

export const listarZonasDelivery = async (req, res, next) => {
  try {
    const zonas = await zonasDeliveryService.listarZonasDelivery();
    res.json(zonas);
  } catch (error) {
    next(error);
  }
};

export const listarZonasActivas = async (req, res, next) => {
  try {
    const zonas = await zonasDeliveryService.listarZonasActivas();
    res.json(zonas);
  } catch (error) {
    next(error);
  }
};

export const obtenerZonaPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const zona = await zonasDeliveryService.obtenerZonaPorId(id);
    if (!zona) {
      return res.status(404).json({ message: 'Zona de delivery no encontrada' });
    }
    res.json(zona);
  } catch (error) {
    next(error);
  }
};

export const crearZona = async (req, res, next) => {
  try {
    const data = req.body;

    if (!data.distrito || !data.costo || !data.diasEstimados) {
      return res.status(400).json({ 
        message: 'Distrito, costo y diasEstimados son requeridos' 
      });
    }

    const nuevaZona = await zonasDeliveryService.crearZona(data);
    res.status(201).json(nuevaZona);
  } catch (error) {
    if (error.message.includes('distrito') || error.message.includes('costo') || error.message.includes('días')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const actualizarZona = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const zonaActualizada = await zonasDeliveryService.actualizarZona(id, data);
    res.json(zonaActualizada);
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('costo') || error.message.includes('días')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const desactivarZona = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await zonasDeliveryService.desactivarZona(id);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const activarZona = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await zonasDeliveryService.activarZona(id);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};
