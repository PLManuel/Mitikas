import * as tarjetasRepository from './tarjetas.repository.js';

export const listarTarjetas = (idUsuario) => {
  return tarjetasRepository.findAllByUsuario(idUsuario);
};

export const obtenerTarjetaPorId = (id, idUsuario) => {
  return tarjetasRepository.findById(id, idUsuario);
};

export const crearTarjeta = async (idUsuario, data) => {
  // Validaciones básicas
  if (!data.numeroTarjeta || !data.nombreTitular || !data.fechaExpiracion || !data.cvv || !data.saldo) {
    throw new Error('Todos los campos son obligatorios');
  }
  if (String(data.numeroTarjeta).length !== 16) {
    throw new Error('El número de tarjeta debe tener 16 dígitos');
  }
  if (String(data.cvv).length !== 3) {
    throw new Error('El CVV debe tener 3 dígitos');
  }
  if (isNaN(parseFloat(data.saldo)) || parseFloat(data.saldo) < 0) {
    throw new Error('El saldo debe ser un número válido mayor o igual a 0');
  }

  const tarjetaData = {
    numeroTarjeta: String(data.numeroTarjeta),
    nombreTitular: data.nombreTitular,
    fechaExpiracion: data.fechaExpiracion,
    cvv: String(data.cvv),
    saldo: parseFloat(data.saldo),
    idUsuario
  };

  const insertId = await tarjetasRepository.create(tarjetaData);
  return {
    id: insertId,
    ...tarjetaData
  };
};

export const eliminarTarjeta = async (id, idUsuario) => {
  const tarjeta = await tarjetasRepository.findById(id, idUsuario);
  if (!tarjeta) {
    throw new Error('Tarjeta no encontrada');
  }
  await tarjetasRepository.deleteById(id, idUsuario);
  return { message: 'Tarjeta eliminada correctamente' };
};

export const actualizarSaldo = async (id, idUsuario, saldo) => {
  if (isNaN(parseFloat(saldo)) || parseFloat(saldo) < 0) {
    throw new Error('El saldo debe ser un número válido mayor o igual a 0');
  }
  await tarjetasRepository.updateSaldo(id, idUsuario, parseFloat(saldo));
  return { message: 'Saldo actualizado correctamente' };
};
