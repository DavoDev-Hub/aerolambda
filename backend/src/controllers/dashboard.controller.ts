import { Request, Response } from 'express';
import Flight from '../models/Flight';
import Booking from '../models/Booking';
import User from '../models/User';

// Obtener estadísticas generales del dashboard
export const obtenerEstadisticas = async (req: Request, res: Response): Promise<void> => {
  try {
    // Contar vuelos activos (programados)
    const vuelosActivos = await Flight.countDocuments({ estado: 'programado' });

    // Contar reservas totales
    const reservasTotales = await Booking.countDocuments();

    // Contar clientes (usuarios con rol cliente)
    const totalClientes = await User.countDocuments({ rol: 'cliente' });

    // Calcular ingresos totales (suma de todas las reservas confirmadas)
    const reservasConfirmadas = await Booking.find({ estado: 'confirmada' });
    const ingresosTotales = reservasConfirmadas.reduce((sum, reserva) => sum + reserva.precioTotal, 0);

    // Reservas por estado
    const reservasPorEstado = await Booking.aggregate([
      {
        $group: {
          _id: '$estado',
          cantidad: { $sum: 1 }
        }
      }
    ]);

    // Vuelos más populares (los que tienen más reservas)
    const vuelosMasPopulares = await Booking.aggregate([
      {
        $group: {
          _id: '$vuelo',
          totalReservas: { $sum: 1 }
        }
      },
      { $sort: { totalReservas: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'flights',
          localField: '_id',
          foreignField: '_id',
          as: 'vueloInfo'
        }
      },
      { $unwind: '$vueloInfo' }
    ]);

    res.json({
      success: true,
      data: {
        vuelosActivos,
        reservasTotales,
        totalClientes,
        ingresosTotales,
        reservasPorEstado,
        vuelosMasPopulares
      }
    });
  } catch (error: any) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

// Obtener reservas por mes (para la gráfica)
export const obtenerReservasPorMes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const reservasPorMes = await Booking.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          cantidad: { $sum: 1 },
          ingresos: { $sum: '$precioTotal' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Crear array con todos los meses (incluso los que no tienen datos)
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const datos = meses.map((mes, index) => {
      const mesData = reservasPorMes.find(r => r._id === index + 1);
      return {
        mes,
        cantidad: mesData?.cantidad || 0,
        ingresos: mesData?.ingresos || 0
      };
    });

    res.json({
      success: true,
      data: datos
    });
  } catch (error: any) {
    console.error('Error al obtener reservas por mes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reservas por mes',
      error: error.message
    });
  }
};

// Obtener actividad reciente
export const obtenerActividadReciente = async (req: Request, res: Response): Promise<void> => {
  try {
    const reservasRecientes = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('usuario', 'nombre apellido email')
      .populate('vuelo', 'numeroVuelo origen destino fechaSalida')
      .populate('asiento', 'numero');

    res.json({
      success: true,
      data: reservasRecientes
    });
  } catch (error: any) {
    console.error('Error al obtener actividad reciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividad reciente',
      error: error.message
    });
  }
};


// Obtener ingresos por vuelo
export const obtenerIngresosPorVuelo = async (req: Request, res: Response): Promise<void> => {
  try {
    const ingresosPorVuelo = await Booking.aggregate([
      {
        $match: {
          estado: 'confirmada'
        }
      },
      {
        $group: {
          _id: '$vuelo',
          totalIngresos: { $sum: '$precioTotal' },
          totalReservas: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'flights',
          localField: '_id',
          foreignField: '_id',
          as: 'vueloInfo'
        }
      },
      { $unwind: '$vueloInfo' },
      { $sort: { totalIngresos: -1 } },
      { $limit: 10 }
    ]);

    const datos = ingresosPorVuelo.map(item => ({
      numeroVuelo: item.vueloInfo.numeroVuelo,
      ruta: `${item.vueloInfo.origen.codigo} → ${item.vueloInfo.destino.codigo}`,
      totalIngresos: item.totalIngresos,
      totalReservas: item.totalReservas
    }));

    res.json({
      success: true,
      data: datos
    });
  } catch (error: any) {
    console.error('Error al obtener ingresos por vuelo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ingresos por vuelo',
      error: error.message
    });
  }
};

// Obtener reservas por vuelo
export const obtenerReservasPorVuelo = async (req: Request, res: Response): Promise<void> => {
  try {
    const reservasPorVuelo = await Booking.aggregate([
      {
        $group: {
          _id: '$vuelo',
          totalReservas: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'flights',
          localField: '_id',
          foreignField: '_id',
          as: 'vueloInfo'
        }
      },
      { $unwind: '$vueloInfo' },
      { $sort: { totalReservas: -1 } },
      { $limit: 10 }
    ]);

    const datos = reservasPorVuelo.map(item => ({
      numeroVuelo: item.vueloInfo.numeroVuelo,
      ruta: `${item.vueloInfo.origen.codigo} → ${item.vueloInfo.destino.codigo}`,
      totalReservas: item.totalReservas
    }));

    res.json({
      success: true,
      data: datos
    });
  } catch (error: any) {
    console.error('Error al obtener reservas por vuelo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reservas por vuelo',
      error: error.message
    });
  }
};

// Obtener top clientes
export const obtenerTopClientes = async (req: Request, res: Response): Promise<void> => {
  try {
    const topClientes = await Booking.aggregate([
      {
        $match: {
          estado: 'confirmada'
        }
      },
      {
        $group: {
          _id: '$usuario',
          totalReservas: { $sum: 1 },
          gastoTotal: { $sum: '$precioTotal' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'usuarioInfo'
        }
      },
      { $unwind: '$usuarioInfo' },
      { $sort: { gastoTotal: -1 } },
      { $limit: 10 }
    ]);

    const datos = topClientes.map(item => ({
      nombre: `${item.usuarioInfo.nombre} ${item.usuarioInfo.apellido}`,
      email: item.usuarioInfo.email,
      totalReservas: item.totalReservas,
      gastoTotal: item.gastoTotal
    }));

    res.json({
      success: true,
      data: datos
    });
  } catch (error: any) {
    console.error('Error al obtener top clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener top clientes',
      error: error.message
    });
  }
};