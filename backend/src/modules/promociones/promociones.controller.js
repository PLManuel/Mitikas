export const eliminarPromocion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await promocionesService.eliminarPromocion(id);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};
import * as promocionesService from './promociones.service.js';

export const listarPromociones = async (req, res, next) => {
  try {
    const promociones = await promocionesService.listarPromociones();
    res.json(promociones);
  } catch (error) {
    next(error);
  }
};

export const listarPromocionesVigentes = async (req, res, next) => {
  try {
    const promociones = await promocionesService.listarPromocionesVigentes();
    res.json(promociones);
  } catch (error) {
    next(error);
  }
};

export const obtenerPromocionPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const promocion = await promocionesService.obtenerPromocionPorId(id);
    if (!promocion) {
      return res.status(404).json({ message: 'Promoción no encontrada' });
    }
    res.json(promocion);
  } catch (error) {
    next(error);
  }
};

export const crearPromocion = async (req, res, next) => {
  try {
    const data = req.body;

    if (!data.nombre || !data.tipo || !data.valor || !data.fechaInicio || !data.fechaFin) {
      return res.status(400).json({ 
        message: 'Nombre, tipo, valor, fechaInicio y fechaFin son requeridos' 
      });
    }

    const nuevaPromocion = await promocionesService.crearPromocion(data);
    res.status(201).json(nuevaPromocion);
  } catch (error) {
    if (error.message.includes('tipo') || error.message.includes('valor') || 
        error.message.includes('fecha') || error.message.includes('porcentaje')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const actualizarPromocion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const promocionActualizada = await promocionesService.actualizarPromocion(id, data);
    res.json(promocionActualizada);
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('tipo') || error.message.includes('valor') || 
        error.message.includes('fecha') || error.message.includes('porcentaje')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const desactivarPromocion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await promocionesService.desactivarPromocion(id);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const activarPromocion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await promocionesService.activarPromocion(id);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const obtenerVariantesDePromocion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const variantes = await promocionesService.obtenerVariantesDePromocion(id);
    res.json(variantes);
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const agregarVarianteAPromocion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { idVariante } = req.body;

    if (!idVariante) {
      return res.status(400).json({ message: 'idVariante es requerido' });
    }

    const resultado = await promocionesService.agregarVarianteAPromocion(id, idVariante);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('ya está asociada')) {
      return res.status(409).json({ message: error.message });
    }
    next(error);
  }
};

export const quitarVarianteDePromocion = async (req, res, next) => {
  try {
    const { id, idVariante } = req.params;

    const resultado = await promocionesService.quitarVarianteDePromocion(id, idVariante);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrada') || error.message.includes('no está asociada')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};
