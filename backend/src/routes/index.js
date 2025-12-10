import { Router } from 'express';
import usuariosRoutes from '../modules/usuarios/usuarios.routes.js';
import categoriasRoutes from '../modules/categorias/categorias.routes.js';
import productosRoutes from '../modules/productos/productos.routes.js';
import variantesRoutes from '../modules/variantes/variantes.routes.js';
import promocionesRoutes from '../modules/promociones/promociones.routes.js';
import carritoRoutes from '../modules/carrito/carrito.routes.js';
import zonasDeliveryRoutes from '../modules/zonas-delivery/zonas-delivery.routes.js';
import metodosPagoRoutes from '../modules/metodos-pago/metodos-pago.routes.js';
import pedidosRoutes from '../modules/pedidos/pedidos.routes.js';
import tarjetasRoutes from '../modules/tarjetas/tarjetas.routes.js';
import solicitudesProductosRoutes from '../modules/solicitudes-productos/solicitudes-productos.routes.js';

const router = Router();

router.use('/usuarios', usuariosRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/productos', productosRoutes);
router.use('/variantes', variantesRoutes);
router.use('/promociones', promocionesRoutes);
router.use('/carrito', carritoRoutes);
router.use('/zonas-delivery', zonasDeliveryRoutes);
router.use('/metodos-pago', metodosPagoRoutes);
router.use('/pedidos', pedidosRoutes);
router.use('/tarjetas', tarjetasRoutes);
router.use('/solicitudes-productos', solicitudesProductosRoutes);

export default router;
