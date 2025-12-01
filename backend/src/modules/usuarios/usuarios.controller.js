import * as usuariosService from './usuarios.service.js';

export const listarUsuarios = async (req, res, next) => {
  try {
    const usuarios = await usuariosService.listarUsuarios();
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
};

export const obtenerUsuarioPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await usuariosService.obtenerUsuarioPorId(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    next(error);
  }
};

export const crearUsuario = async (req, res, next) => {
  try {
    const data = req.body;
    const nuevoUsuario = await usuariosService.crearUsuario(data);
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    next(error);
  }
};

export const desactivarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await usuariosService.desactivarUsuario(id, req.usuario);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('permiso') || error.message.includes('No puedes')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

export const activarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await usuariosService.activarUsuario(id);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { correo, password } = req.body;
    
    if (!correo || !password) {
      return res.status(400).json({ message: 'Correo y contraseña requeridos' });
    }

    const resultado = await usuariosService.login(correo, password);
    
    if (!resultado.success) {
      return res.status(401).json({ message: resultado.message });
    }

    // Guardar usuario en la sesión
    req.session.usuario = resultado.usuario;

    res.json({
      message: 'Login exitoso',
      usuario: resultado.usuario
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie('mitikas_session');
      res.json({ message: 'Sesión cerrada correctamente' });
    });
  } catch (error) {
    next(error);
  }
};

export const verificarSesion = (req, res) => {
  if (req.session.usuario) {
    res.json({
      autenticado: true,
      usuario: req.session.usuario
    });
  } else {
    res.json({ autenticado: false });
  }
};

export const me = (req, res) => {
  try {
    if (req.session && req.session.usuario) {
      // Return the user object stored in session (omit sensitive fields if present)
      const { password, ...usuario } = req.session.usuario || {};
      return res.json(usuario);
    }
    return res.status(401).json({ message: 'No autenticado' });
  } catch (error) {
    return res.status(500).json({ message: 'Error interno' });
  }
};

export const actualizarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const usuarioActualizado = await usuariosService.actualizarUsuario(id, data, req.usuario);
    res.json(usuarioActualizado);
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('permiso') || error.message.includes('ya está en uso')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

export const eliminarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await usuariosService.eliminarUsuario(id, req.usuario);
    res.json(resultado);
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('permiso') || error.message.includes('No puedes')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};
