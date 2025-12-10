CREATE DATABASE IF NOT EXISTS mitikas;

USE mitikas;

-- =========================
-- USUARIOS
-- =========================
CREATE TABLE
  usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL,
    apellidos VARCHAR(60) NOT NULL,
    dni CHAR(8) NOT NULL UNIQUE,
    telefono VARCHAR(15) NOT NULL,
    correo VARCHAR(80) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    rol ENUM('cliente', 'admin', 'almacen', 'logistica', 'despachador', 'repartidor') NOT NULL DEFAULT 'cliente',
    activo BOOLEAN NOT NULL DEFAULT TRUE
  );

-- =========================
-- CATEGORÍAS
-- =========================
CREATE TABLE
  categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria VARCHAR(100) NOT NULL,
    imagen VARCHAR(150),
    activo BOOLEAN NOT NULL DEFAULT TRUE
  );

-- =========================
-- TARJETAS SIMULADAS
-- =========================
CREATE TABLE
  tarjetas_simuladas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_tarjeta CHAR(16) NOT NULL,
    nombre_titular VARCHAR(100) NOT NULL,
    fecha_expiracion CHAR(5) NOT NULL,
    cvv CHAR(3) NOT NULL,
    saldo DECIMAL(10, 2) NOT NULL,
    idUsuario INT NOT NULL,
    FOREIGN KEY (idUsuario) REFERENCES usuarios (id) ON DELETE CASCADE ON UPDATE CASCADE
  );

-- =========================
-- PRODUCTOS
-- =========================
CREATE TABLE
  productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    imagen VARCHAR(150) NOT NULL,
    idCategoria INT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (idCategoria) REFERENCES categorias (id) ON UPDATE CASCADE
  );

-- =========================
-- VARIANTES DE PRODUCTO
-- =========================
CREATE TABLE
  variantes_producto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    tamano VARCHAR(50) NOT NULL,
    precio_venta DECIMAL(10, 2) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (id_producto) REFERENCES productos (id) ON DELETE CASCADE ON UPDATE CASCADE
  );

-- =========================
-- PROMOCIONES
-- =========================
CREATE TABLE
  promociones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('porcentaje', 'precio_fijo') NOT NULL,
    valor DECIMAL(5, 2) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_promociones_fechas CHECK (fecha_fin >= fecha_inicio)
  );

-- =========================
-- PROMOCIONES POR VARIANTE
-- =========================
CREATE TABLE
  promociones_variantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_promocion INT NOT NULL,
    id_variante INT NOT NULL,
    UNIQUE (id_promocion, id_variante),
    FOREIGN KEY (id_promocion) REFERENCES promociones (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_variante) REFERENCES variantes_producto (id) ON DELETE CASCADE ON UPDATE CASCADE
  );

-- =========================
-- CARRITO
-- =========================
CREATE TABLE
  carrito (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    idProducto INT NOT NULL,
    idVariante INT NOT NULL,
    cantidad INT NOT NULL,
    idPromocion INT DEFAULT NULL,
    FOREIGN KEY (idUsuario) REFERENCES usuarios (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (idProducto) REFERENCES productos (id) ON UPDATE CASCADE,
    FOREIGN KEY (idVariante) REFERENCES variantes_producto (id) ON UPDATE CASCADE,
    FOREIGN KEY (idPromocion) REFERENCES promociones (id) ON DELETE SET NULL ON UPDATE CASCADE
  );

-- =========================
-- MÉTODOS DE PAGO
-- =========================
CREATE TABLE
  metodospago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    metodo VARCHAR(50) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
  );

-- =========================
-- ZONAS DE DELIVERY
-- =========================
CREATE TABLE
  zonas_delivery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    distrito VARCHAR(100) NOT NULL,
    costo DECIMAL(10, 2) NOT NULL,
    dias_estimados INT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
  );

-- =========================
-- PEDIDOS
-- =========================
CREATE TABLE
  pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATETIME NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    apellido VARCHAR(80) NOT NULL,
    direccion VARCHAR(100) NOT NULL,
    idZonaDelivery INT,
    costo_envio DECIMAL(10, 2) NOT NULL,
    proceso ENUM(
      'solicitud_recibida',
      'en_preparacion',
      'listo_para_recoger',
      'en_camino',
      'entregado'
    ) NOT NULL DEFAULT 'solicitud_recibida',
    idUsuario INT NULL,
    idMetodoPago INT NOT NULL,
    idTarjetaSimulada INT DEFAULT NULL,
    id_repartidor INT NULL,
    FOREIGN KEY (idTarjetaSimulada) REFERENCES tarjetas_simuladas (id),
    FOREIGN KEY (idUsuario) REFERENCES usuarios (id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (idMetodoPago) REFERENCES metodospago (id) ON UPDATE CASCADE,
    FOREIGN KEY (idZonaDelivery) REFERENCES zonas_delivery (id),
    FOREIGN KEY (id_repartidor) REFERENCES usuarios (id) ON DELETE SET NULL
  );

-- =========================
-- DETALLE DE PEDIDO
-- =========================
CREATE TABLE
  detalle_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idPedido INT NOT NULL,
    idProducto INT NOT NULL,
    idVariante INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    precio_promocion DECIMAL(10,2) DEFAULT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    estado ENUM('confirmado', 'pendiente') NOT NULL DEFAULT 'confirmado',
    idPromocion INT NULL,
    FOREIGN KEY (idPedido) REFERENCES pedidos (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (idProducto) REFERENCES productos (id) ON UPDATE CASCADE,
    FOREIGN KEY (idVariante) REFERENCES variantes_producto (id) ON UPDATE CASCADE,
    FOREIGN KEY (idPromocion) REFERENCES promociones (id) ON DELETE SET NULL ON UPDATE CASCADE
  );

CREATE TABLE solicitudes_productos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_pedido INT NOT NULL,
  id_variante INT NOT NULL,
  cantidad_solicitada INT NOT NULL,
  estado ENUM('pendiente', 'en_proceso', 'recibido') DEFAULT 'pendiente',
  fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_recepcion TIMESTAMP NULL,
  notas TEXT NULL,
  FOREIGN KEY (id_pedido) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (id_variante) REFERENCES variantes_producto(id) ON DELETE CASCADE,
  INDEX idx_estado (estado),
  INDEX idx_variante (id_variante),
  INDEX idx_pedido (id_pedido)
);