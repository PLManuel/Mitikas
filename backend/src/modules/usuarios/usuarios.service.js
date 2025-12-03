import * as usuariosRepository from './usuarios.repository.js';
import { hashPassword, comparePassword } from '../../utils/password.js';

export const listarUsuarios = () => {
  return usuariosRepository.findAll();
};

export const obtenerUsuarioPorId = (id) => {
  return usuariosRepository.findById(id);
};

export const crearUsuario = async (data) => {
  const passwordHasheado = await hashPassword(data.password);

  const usuarioParaGuardar = {
    ...data,
    password: passwordHasheado,
    rol: data.rol || 'cliente',
    activo: true
  };

  const insertId = await usuariosRepository.create(usuarioParaGuardar);
  return { id: insertId, ...usuarioParaGuardar };
};

export const desactivarUsuario = async (id, usuarioActual) => {
  // Verificar que el usuario existe
  const usuario = await usuariosRepository.findById(id);
  
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  // No permitir que un usuario se desactive a sí mismo
  if (usuarioActual.id === parseInt(id)) {
    throw new Error('No puedes desactivarte a ti mismo');
  }

  // Solo admin puede desactivar otros admins
  if (usuario.rol === 'admin' && usuarioActual.rol !== 'admin') {
    throw new Error('No tienes permiso para desactivar administradores');
  }

  await usuariosRepository.updateActivo(id, false);
  return { message: 'Usuario desactivado correctamente' };
};

export const activarUsuario = async (id) => {
  const usuario = await usuariosRepository.findById(id);
  
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  await usuariosRepository.updateActivo(id, true);
  return { message: 'Usuario activado correctamente' };
};

export const login = async (correo, password) => {
  const usuario = await usuariosRepository.findByCorreo(correo);

  if (!usuario) {
    return { 
      success: false, 
      message: 'Credenciales inválidas' 
    };
  }

  const passwordValido = await comparePassword(password, usuario.password);

  if (!passwordValido) {
    return { 
      success: false, 
      message: 'Credenciales inválidas' 
    };
  }

  if (!usuario.activo) {
    return { 
      success: false, 
      message: 'Usuario desactivado' 
    };
  }

  // Remover password antes de devolver
  const { password: _, ...usuarioSinPassword } = usuario;

  return {
    success: true,
    usuario: usuarioSinPassword
  };
};

export const logout = () => {
  return { message: 'Sesión cerrada correctamente' };
};

export const actualizarUsuario = async (id, data, usuarioActual) => {
  const usuario = await usuariosRepository.findById(id);
  
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  // Solo admin puede cambiar el rol
  if (data.rol && usuarioActual.rol !== 'admin') {
    throw new Error('No tienes permiso para cambiar roles');
  }

  // Si se actualiza el correo, verificar que no exista otro usuario con ese correo
  if (data.correo && data.correo !== usuario.correo) {
    const existente = await usuariosRepository.findByCorreo(data.correo);
    if (existente) {
      throw new Error('El correo ya está en uso');
    }
  }

  const usuarioData = {
    nombre: data.nombre || usuario.nombre,
    apellidos: data.apellidos || usuario.apellidos,
    dni: data.dni || usuario.dni,
    telefono: data.telefono || usuario.telefono,
    correo: data.correo || usuario.correo,
    rol: data.rol || usuario.rol
  };

  // Si se envía nueva contraseña, hashearla
  if (data.password) {
    usuarioData.password = await hashPassword(data.password);
  }

  await usuariosRepository.update(id, usuarioData);
  return { id: parseInt(id), ...usuarioData, activo: usuario.activo };
};

export const actualizarPerfil = async (idUsuario, data) => {
  const usuario = await usuariosRepository.findById(idUsuario);
  
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  // Si se actualiza el correo, verificar que no exista otro usuario con ese correo
  if (data.correo && data.correo !== usuario.correo) {
    const existente = await usuariosRepository.findByCorreo(data.correo);
    if (existente) {
      throw new Error('El correo ya está en uso');
    }
  }

  const usuarioData = {
    nombre: data.nombre || usuario.nombre,
    apellidos: data.apellidos || usuario.apellidos,
    dni: data.dni || usuario.dni,
    telefono: data.telefono || usuario.telefono,
    correo: data.correo || usuario.correo,
    rol: usuario.rol, // Mantener el rol existente
  };

  // Si se envía nueva contraseña, hashearla
  if (data.password) {
    usuarioData.password = await hashPassword(data.password);
  }

  await usuariosRepository.update(idUsuario, usuarioData);
  
  // Retornar usuario sin password
  const { password, ...usuarioSinPassword } = { 
    id: parseInt(idUsuario), 
    ...usuarioData, 
    activo: usuario.activo,
  };
  
  return usuarioSinPassword;
};

export const eliminarUsuario = async (id, usuarioActual) => {
  const usuario = await usuariosRepository.findById(id);
  
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  // No permitir que un usuario se elimine a sí mismo
  if (usuarioActual.id === parseInt(id)) {
    throw new Error('No puedes eliminarte a ti mismo');
  }

  // Solo admin puede eliminar otros admins
  if (usuario.rol === 'admin' && usuarioActual.rol !== 'admin') {
    throw new Error('No tienes permiso para eliminar administradores');
  }

  await usuariosRepository.deleteById(id);
  return { message: 'Usuario eliminado correctamente' };
};
