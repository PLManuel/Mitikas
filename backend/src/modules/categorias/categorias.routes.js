import { Router } from 'express';
import * as categoriasController from './categorias.controller.js';
import { autenticar, soloAdminOAlmacen } from '../../middlewares/auth.middleware.js';
import { upload } from '../../config/upload.js';

const router = Router();

// Rutas públicas
router.get('/', categoriasController.listarCategorias);
router.get('/:id', categoriasController.obtenerCategoriaPorId);

// Rutas protegidas - Admin y Almacen
router.post('/', autenticar, soloAdminOAlmacen, upload.single('imagen'), categoriasController.crearCategoria);
router.put('/:id', autenticar, soloAdminOAlmacen, upload.single('imagen'), categoriasController.actualizarCategoria);
router.delete('/:id', autenticar, soloAdminOAlmacen, categoriasController.eliminarCategoria);
router.patch('/:id/desactivar', autenticar, soloAdminOAlmacen, categoriasController.desactivarCategoria);
router.patch('/:id/activar', autenticar, soloAdminOAlmacen, categoriasController.activarCategoria);

export default router;
