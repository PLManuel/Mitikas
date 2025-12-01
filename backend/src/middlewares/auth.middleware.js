// Middleware para verificar si el usuario está autenticado
export const autenticar = (req, res, next) => {
  if (!req.session.usuario) {
    return res.status(401).json({ 
      message: 'No autenticado. Por favor inicia sesión' 
    });
  }

  if (!req.session.usuario.activo) {
    return res.status(403).json({ 
      message: 'Usuario desactivado' 
    });
  }

  req.usuario = req.session.usuario;
  next();
};

// Middleware para verificar si el usuario es admin
export const soloAdmin = (req, res, next) => {
  if (!req.session.usuario) {
    return res.status(401).json({ 
      message: 'No autenticado. Por favor inicia sesión' 
    });
  }

  if (req.session.usuario.rol !== 'admin') {
    return res.status(403).json({ 
      message: 'Acceso denegado. Solo administradores' 
    });
  }

  next();
};

// Middleware para permitir admin y almacen (gestión de inventario)
export const soloAdminOAlmacen = (req, res, next) => {
  if (!req.session.usuario) {
    return res.status(401).json({ 
      message: 'No autenticado. Por favor inicia sesión' 
    });
  }

  const rol = req.session.usuario.rol;
  const permitido = ['admin', 'almacen'];

  if (!permitido.includes(rol)) {
    return res.status(403).json({ 
      message: 'Acceso denegado. Solo administradores y personal de almacén' 
    });
  }

  next();
};

// Middleware para permitir varios roles administrativos
export const soloRolesAdmin = (req, res, next) => {
  if (!req.session.usuario) {
    return res.status(401).json({ 
      message: 'No autenticado. Por favor inicia sesión' 
    });
  }

  const rol = req.session.usuario.rol;
  const permitido = ['admin', 'almacen', 'logistica'];

  if (!permitido.includes(rol)) {
    return res.status(403).json({ message: 'Acceso denegado. Rol no autorizado' });
  }

  next();
};