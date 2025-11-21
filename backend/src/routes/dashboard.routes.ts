import { Router } from 'express';
import {
  obtenerEstadisticas,
  obtenerReservasPorMes,
  obtenerActividadReciente,
  obtenerIngresosPorVuelo,
  obtenerReservasPorVuelo,
  obtenerTopClientes
} from '../controllers/dashboard.controller';
import { autenticar, esAdmin } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación y rol admin
router.use(autenticar, esAdmin);

// Dashboard
router.get('/estadisticas', obtenerEstadisticas);
router.get('/reservas-por-mes', obtenerReservasPorMes);
router.get('/actividad-reciente', obtenerActividadReciente);

// Reportes
router.get('/ingresos-por-vuelo', obtenerIngresosPorVuelo);
router.get('/reservas-por-vuelo', obtenerReservasPorVuelo);
router.get('/top-clientes', obtenerTopClientes);

export default router;