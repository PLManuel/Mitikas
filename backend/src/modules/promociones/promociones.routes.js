
import { Router } from 'express';
import * as promocionesController from './promociones.controller.js';
import { autenticar, soloAdmin } from '../../middlewares/auth.middleware.js';

const router = Router();

router.delete('/:id', autenticar, soloAdmin, promocionesController.eliminarPromocion);

// Rutas públicas
router.get('/', promocionesController.listarPromociones);
router.get('/vigentes', promocionesController.listarPromocionesVigentes);
router.get('/:id', promocionesController.obtenerPromocionPorId);
router.get('/:id/variantes', promocionesController.obtenerVariantesDePromocion);

// Rutas protegidas - Solo admin
router.post('/', autenticar, soloAdmin, promocionesController.crearPromocion);
router.put('/:id', autenticar, soloAdmin, promocionesController.actualizarPromocion);
router.patch('/:id/desactivar', autenticar, soloAdmin, promocionesController.desactivarPromocion);
router.patch('/:id/activar', autenticar, soloAdmin, promocionesController.activarPromocion);

// Gestión de variantes en promociones
router.post('/:id/variantes', autenticar, soloAdmin, promocionesController.agregarVarianteAPromocion);
router.delete('/:id/variantes/:idVariante', autenticar, soloAdmin, promocionesController.quitarVarianteDePromocion);

export default router;
