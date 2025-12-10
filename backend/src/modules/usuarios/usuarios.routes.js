import { Router } from 'express';
import * as usuariosController from './usuarios.controller.js';
import { autenticar, soloAdmin, soloRolesAdmin } from '../../middlewares/auth.middleware.js';

const router = Router();

// Rutas públicas
router.post('/login', usuariosController.login);
router.post('/logout', usuariosController.logout);
router.get('/session', usuariosController.verificarSesion);
router.get('/me', usuariosController.me);
router.post('/', usuariosController.crearUsuario);

// Rutas protegidas - requieren autenticación
router.get('/', autenticar, usuariosController.listarUsuarios);
router.get('/repartidores/activos', autenticar, soloRolesAdmin, usuariosController.obtenerRepartidoresActivos);
router.get('/:id', autenticar, usuariosController.obtenerUsuarioPorId);

// Rutas solo para admin
router.put('/:id', autenticar, soloAdmin, usuariosController.actualizarUsuario);
router.delete('/:id', autenticar, soloAdmin, usuariosController.eliminarUsuario);
router.patch('/:id/desactivar', autenticar, soloAdmin, usuariosController.desactivarUsuario);
router.patch('/:id/activar', autenticar, soloAdmin, usuariosController.activarUsuario);

export default router;
