import { Router } from 'express';
import * as carritoController from './carrito.controller.js';
import { autenticar } from '../../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.get('/', autenticar, carritoController.obtenerCarrito);
router.post('/', autenticar, carritoController.agregarAlCarrito);
router.put('/:id', autenticar, carritoController.actualizarCantidad);
router.delete('/:id', autenticar, carritoController.eliminarDelCarrito);
router.delete('/', autenticar, carritoController.vaciarCarrito);
router.patch('/:id/promocion', autenticar, carritoController.aplicarPromocion);

export default router;
