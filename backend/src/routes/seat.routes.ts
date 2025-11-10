import { Router } from 'express';
import {
  obtenerMapaAsientos,
  bloquearAsiento,
  liberarAsiento
} from '../controllers/seat.controller';
import { autenticar } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/asientos/vuelo/:vueloId
 * @desc    Obtener mapa de asientos de un vuelo
 * @access  Público
 */
router.get('/vuelo/:vueloId', obtenerMapaAsientos);

/**
 * @route   POST /api/asientos/:asientoId/bloquear
 * @desc    Bloquear un asiento temporalmente
 * @access  Privado
 */
router.post('/:asientoId/bloquear', autenticar, bloquearAsiento);

/**
 * @route   POST /api/asientos/:asientoId/liberar
 * @desc    Liberar un asiento bloqueado
 * @access  Privado
 */
router.post('/:asientoId/liberar', autenticar, liberarAsiento);

export default router;