import { Router } from 'express';
import {
  crearVuelo,
  obtenerVuelos,
  obtenerVueloPorId,
  actualizarVuelo,
  eliminarVuelo,
  buscarVuelos,
  cambiarEstadoVuelo,
  obtenerRutasDisponibles
} from '../controllers/flight.controller';
import { validate } from '../middleware/validate';
import { crearVueloSchema, actualizarVueloSchema } from '../validators/flight.validator';
import { autenticar, esAdmin } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/vuelos/buscar
 * @desc    Buscar vuelos (público - para clientes)
 * @access  Público
 */
router.get('/buscar', buscarVuelos);

/**
 * @route   GET /api/vuelos/rutas-disponibles
 * @desc    Obtener rutas y fechas disponibles
 * @access  Público
 */
router.get('/rutas-disponibles', obtenerRutasDisponibles);
/**
 * @route   POST /api/vuelos
 * @desc    Crear un nuevo vuelo
 * @access  Privado - Solo Admin
 */
router.post('/', autenticar, esAdmin, validate(crearVueloSchema), crearVuelo);

/**
 * @route   GET /api/vuelos
 * @desc    Obtener todos los vuelos (con filtros y paginación)
 * @access  Privado - Solo Admin
 */
router.get('/', autenticar, esAdmin, obtenerVuelos);

/**
 * @route   GET /api/vuelos/:id
 * @desc    Obtener un vuelo por ID
 * @access  Privado - Solo Admin
 */
router.get('/:id', autenticar, esAdmin, obtenerVueloPorId);

/**
 * @route   PUT /api/vuelos/:id
 * @desc    Actualizar un vuelo
 * @access  Privado - Solo Admin
 */
router.put('/:id', autenticar, esAdmin, validate(actualizarVueloSchema), actualizarVuelo);

/**
 * @route   DELETE /api/vuelos/:id
 * @desc    Eliminar un vuelo
 * @access  Privado - Solo Admin
 */
router.delete('/:id', autenticar, esAdmin, eliminarVuelo);

/**
 * @route   PATCH /api/vuelos/:id/estado
 * @desc    Cambiar el estado de un vuelo
 * @access  Privado - Solo Admin
 */
router.patch('/:id/estado', autenticar, esAdmin, cambiarEstadoVuelo);


export default router;