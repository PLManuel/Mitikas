import { Router } from 'express';
import * as solicitudesController from './solicitudes-productos.controller.js';
import { autenticar, soloRolesAdmin } from '../../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación y roles admin
router.use(autenticar, soloRolesAdmin);

// Crear solicitudes (almacén reporta faltantes)
router.post('/', solicitudesController.crearSolicitudes);

// Obtener solicitudes agrupadas (para logística)
router.get('/agrupadas', solicitudesController.obtenerSolicitudesAgrupadas);

// Obtener solicitudes por pedido (para almacén)
router.get('/pedido/:idPedido', solicitudesController.obtenerSolicitudesPorPedido);

// Cambiar estado de solicitudes (logística simula pedido a proveedor o marca como recibido)
router.patch('/estado', solicitudesController.cambiarEstadoSolicitudes);

// Obtener todas las solicitudes
router.get('/', solicitudesController.obtenerTodasSolicitudes);

export default router;
