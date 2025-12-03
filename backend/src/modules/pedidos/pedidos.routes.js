import { Router } from 'express';
import * as pedidosController from './pedidos.controller.js';
import { autenticar, soloAdmin, soloRolesAdmin } from '../../middlewares/auth.middleware.js';

const router = Router();


// Usuarios autenticados
router.get('/', autenticar, pedidosController.listarPedidos);
router.get('/mis-pedidos', autenticar, pedidosController.listarPedidosUsuario);
router.get('/:id/boleta', autenticar, pedidosController.obtenerBoleta);
router.get('/:id', autenticar, pedidosController.obtenerPedidoPorId);
router.post('/', autenticar, pedidosController.crearPedido);

// Admin, almacen y logistica pueden cambiar estado
router.patch('/:id/estado', autenticar, soloRolesAdmin, pedidosController.cambiarEstadoPedido);

export default router;
