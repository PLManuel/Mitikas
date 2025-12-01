import { Router } from 'express';
import * as zonasDeliveryController from './zonas-delivery.controller.js';
import { autenticar, soloAdmin } from '../../middlewares/auth.middleware.js';

const router = Router();

// Rutas públicas
router.get('/', zonasDeliveryController.listarZonasDelivery);
router.get('/activas', zonasDeliveryController.listarZonasActivas);
router.get('/:id', zonasDeliveryController.obtenerZonaPorId);

// Rutas protegidas - Solo admin
router.post('/', autenticar, soloAdmin, zonasDeliveryController.crearZona);
router.put('/:id', autenticar, soloAdmin, zonasDeliveryController.actualizarZona);
router.patch('/:id/desactivar', autenticar, soloAdmin, zonasDeliveryController.desactivarZona);
router.patch('/:id/activar', autenticar, soloAdmin, zonasDeliveryController.activarZona);
router.delete('/:id', autenticar, soloAdmin, zonasDeliveryController.eliminarZona);

export default router;
