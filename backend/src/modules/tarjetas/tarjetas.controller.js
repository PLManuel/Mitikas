import * as tarjetasService from './tarjetas.service.js';

export const listarTarjetas = async (req, res, next) => {
  try {
    const idUsuario = req.session.usuario.id;
    const tarjetas = await tarjetasService.listarTarjetas(idUsuario);
    res.json(tarjetas);
  } catch (error) {
    next(error);
  }
};

export const obtenerTarjetaPorId = async (req, res, next) => {
  try {
    const idUsuario = req.session.usuario.id;
    const { id } = req.params;
    const tarjeta = await tarjetasService.obtenerTarjetaPorId(id, idUsuario);
    if (!tarjeta) {
      return res.status(404).json({ message: 'Tarjeta no encontrada' });
    }
    res.json(tarjeta);
  } catch (error) {
    next(error);
  }
};

export const crearTarjeta = async (req, res, next) => {
  try {
    const idUsuario = req.session.usuario.id;
    const data = req.body;
    const nuevaTarjeta = await tarjetasService.crearTarjeta(idUsuario, data);
    res.status(201).json(nuevaTarjeta);
  } catch (error) {
    if (error.message.includes('obligatorios') || error.message.includes('dígitos') || error.message.includes('saldo')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const eliminarTarjeta = async (req, res, next) => {
  try {
    const idUsuario = req.session.usuario.id;
    const { id } = req.params;
    const resultado = await tarjetasService.eliminarTarjeta(id, idUsuario);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const actualizarSaldo = async (req, res, next) => {
  try {
    const idUsuario = req.session.usuario.id;
    const { id } = req.params;
    const { saldo } = req.body;
    const resultado = await tarjetasService.actualizarSaldo(id, idUsuario, saldo);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('saldo')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};
