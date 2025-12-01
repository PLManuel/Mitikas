import { Router } from 'express';
import * as productosController from './productos.controller.js';
import { autenticar, soloAdminOAlmacen } from '../../middlewares/auth.middleware.js';
import { upload } from '../../config/upload.js';

const router = Router();

// Rutas públicas
router.get('/', productosController.listarProductos);
router.get('/:id', productosController.obtenerProductoPorId);
router.get('/categoria/:idCategoria', productosController.obtenerProductosPorCategoria);

// Rutas protegidas - Admin y Almacen
router.post('/', autenticar, soloAdminOAlmacen, upload.single('imagen'), productosController.crearProducto);
router.put('/:id', autenticar, soloAdminOAlmacen, upload.single('imagen'), productosController.actualizarProducto);
router.patch('/:id/desactivar', autenticar, soloAdminOAlmacen, productosController.desactivarProducto);
router.patch('/:id/activar', autenticar, soloAdminOAlmacen, productosController.activarProducto);

export default router;
