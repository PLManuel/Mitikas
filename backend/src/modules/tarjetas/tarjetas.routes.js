import { Router } from 'express';
import * as tarjetasController from './tarjetas.controller.js';
import { autenticar } from '../../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.get('/', autenticar, tarjetasController.listarTarjetas);
router.get('/:id', autenticar, tarjetasController.obtenerTarjetaPorId);
router.post('/', autenticar, tarjetasController.crearTarjeta);
router.delete('/:id', autenticar, tarjetasController.eliminarTarjeta);
router.patch('/:id/saldo', autenticar, tarjetasController.actualizarSaldo);

export default router;
