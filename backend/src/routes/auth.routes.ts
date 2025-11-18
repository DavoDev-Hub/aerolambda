import { Router } from 'express';
import { 
  registro, 
  login, 
  perfil, 
  actualizarPerfil, 
  cambiarPassword 
} from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { registroSchema, loginSchema } from '../validators/auth.validator';
import { autenticar } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   POST /api/auth/registro
 * @desc    Registrar un nuevo usuario
 * @access  Público
 */
router.post('/registro', validate(registroSchema), registro);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Público
 */
router.post('/login', validate(loginSchema), login);

/**
 * @route   PUT /api/auth/cambiar-password
 * @desc    Cambiar contraseña del usuario autenticado
 * @access  Privado (requiere token)
 */
router.put('/cambiar-password', autenticar, cambiarPassword);

/**
 * @route   PUT /api/auth/perfil
 * @desc    Actualizar perfil del usuario autenticado
 * @access  Privado (requiere token)
 */
router.put('/perfil', autenticar, actualizarPerfil);

/**
 * @route   GET /api/auth/perfil
 * @desc    Obtener perfil del usuario autenticado
 * @access  Privado (requiere token)
 */
router.get('/perfil', autenticar, perfil);

export default router;