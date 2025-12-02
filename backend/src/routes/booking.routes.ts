import { Router } from 'express';
import {
  crearReserva,
  confirmarPago,
  obtenerMisReservas,
  obtenerReservaPorId,
  cancelarReserva,
  obtenerTodasReservas,
  obtenerReportes
} from '../controllers/booking.controller';
import { validate } from '../middleware/validate';
import { crearReservaSchema, confirmarPagoSchema } from '../validators/booking.validator';
import { autenticar, esAdmin } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   POST /api/reservas
 * @desc    Crear una nueva reserva
 * @access  Privado - Cliente
 */
router.post('/', autenticar, validate(crearReservaSchema), crearReserva);

/**
 * @route   POST /api/reservas/confirmar-pago
 * @desc    Confirmar pago y completar reserva
 * @access  Privado - Cliente
 */
router.post('/confirmar-pago', autenticar, validate(confirmarPagoSchema), confirmarPago);

/**
 * @route   GET /api/reservas/mis-reservas
 * @desc    Obtener historial de reservas del usuario
 * @access  Privado - Cliente
 */
router.get('/mis-reservas', autenticar, obtenerMisReservas);

/**
 * @route   GET /api/reservas/reportes
 * @desc    Obtener reportes con filtros de fecha
 * @access  Privado - Admin
 */
router.get('/reportes', autenticar, esAdmin, obtenerReportes);

/**
 * @route   GET /api/reservas/todas
 * @desc    Obtener todas las reservas (Admin)
 * @access  Privado - Admin
 */
router.get('/todas', autenticar, esAdmin, obtenerTodasReservas);

/**
 * @route   GET /api/reservas/:id
 * @desc    Obtener una reserva por ID
 * @access  Privado - Cliente/Admin
 */
router.get('/:id', autenticar, obtenerReservaPorId);

/**
 * @route   DELETE /api/reservas/:id
 * @desc    Cancelar una reserva
 * @access  Privado - Cliente
 */
router.delete('/:id', autenticar, cancelarReserva);

export default router;