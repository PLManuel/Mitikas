import { Router } from 'express';
import * as metodosPagoController from './metodos-pago.controller.js';
import { autenticar, soloAdmin } from '../../middlewares/auth.middleware.js';

const router = Router();

// Rutas públicas
router.get('/', metodosPagoController.listarMetodosPago);
router.get('/activos', metodosPagoController.listarMetodosActivos);
router.get('/:id', metodosPagoController.obtenerMetodoPorId);

// Rutas protegidas - Solo admin
router.post('/', autenticar, soloAdmin, metodosPagoController.crearMetodo);
router.put('/:id', autenticar, soloAdmin, metodosPagoController.actualizarMetodo);

router.delete('/:id', autenticar, soloAdmin, metodosPagoController.eliminarMetodo);
router.patch('/:id/desactivar', autenticar, soloAdmin, metodosPagoController.desactivarMetodo);
router.patch('/:id/activar', autenticar, soloAdmin, metodosPagoController.activarMetodo);

export default router;
