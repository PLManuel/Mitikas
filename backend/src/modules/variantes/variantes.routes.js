
import { Router } from 'express';
import * as variantesController from './variantes.controller.js';
import { autenticar, soloAdminOAlmacen } from '../../middlewares/auth.middleware.js';
import { upload } from '../../config/upload.js';

const router = Router();

// Rutas públicas
router.get('/', variantesController.listarVariantes);
router.get('/:id', variantesController.obtenerVariantePorId);
router.get('/producto/:idProducto', variantesController.obtenerVariantesPorProducto);

// Rutas protegidas - Admin y Almacen
router.post('/', autenticar, soloAdminOAlmacen, upload.none(), variantesController.crearVariante);
router.put('/:id', autenticar, soloAdminOAlmacen, upload.none(), variantesController.actualizarVariante);
router.patch('/:id/desactivar', autenticar, soloAdminOAlmacen, variantesController.desactivarVariante);
router.patch('/:id/activar', autenticar, soloAdminOAlmacen, variantesController.activarVariante);

export default router;
