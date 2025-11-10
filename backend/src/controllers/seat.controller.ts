import { Request, Response } from 'express';
import Seat from '../models/Seat';
import Flight from '../models/Flight';
import { generarAsientosParaVuelo } from '../utils/seatGenerator';

// Obtener mapa de asientos de un vuelo (PÚBLICO)
export const obtenerMapaAsientos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vueloId } = req.params;

    // Verificar que el vuelo exista
    const vuelo = await Flight.findById(vueloId);
    if (!vuelo) {
      res.status(404).json({
        success: false,
        message: 'Vuelo no encontrado'
      });
      return;
    }

    // Verificar si tiene asientos generados, si no, generarlos
    let asientos = await Seat.find({ vuelo: vueloId })
      .select('numero fila columna tipo estado')
      .sort({ fila: 1, columna: 1 });

    if (asientos.length === 0) {
      // Generar asientos automáticamente
      await generarAsientosParaVuelo(vueloId);
      asientos = await Seat.find({ vuelo: vueloId })
        .select('numero fila columna tipo estado')
        .sort({ fila: 1, columna: 1 });
    }

    // Liberar asientos bloqueados expirados antes de mostrar
    const ahora = new Date();
    await Seat.updateMany(
      {
        vuelo: vueloId,
        estado: 'bloqueado',
        bloqueadoHasta: { $lte: ahora }
      },
      {
        $set: { estado: 'disponible' },
        $unset: { bloqueadoHasta: '', reserva: '' }
      }
    );

    // Volver a obtener los asientos actualizados
    asientos = await Seat.find({ vuelo: vueloId })
      .select('numero fila columna tipo estado')
      .sort({ fila: 1, columna: 1 });

    res.json({
      success: true,
      data: {
        vuelo: {
          id: vuelo._id,
          numeroVuelo: vuelo.numeroVuelo,
          origen: vuelo.origen,
          destino: vuelo.destino,
          capacidadTotal: vuelo.capacidadTotal
        },
        asientos,
        resumen: {
          total: asientos.length,
          disponibles: asientos.filter(a => a.estado === 'disponible').length,
          ocupados: asientos.filter(a => a.estado === 'ocupado').length,
          bloqueados: asientos.filter(a => a.estado === 'bloqueado').length
        }
      }
    });
  } catch (error: any) {
    console.error('Error al obtener mapa de asientos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mapa de asientos',
      error: error.message
    });
  }
};

// Bloquear un asiento temporalmente (PRIVADO)
export const bloquearAsiento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { asientoId } = req.params;
    const usuarioId = req.usuario?.id;

    // Verificar que el asiento exista
    const asiento = await Seat.findById(asientoId);
    if (!asiento) {
      res.status(404).json({
        success: false,
        message: 'Asiento no encontrado'
      });
      return;
    }

    // Verificar que esté disponible
    if (asiento.estado !== 'disponible') {
      res.status(400).json({
        success: false,
        message: 'El asiento no está disponible'
      });
      return;
    }

    // Bloquear por 10 minutos
    const tiempoBloqueo = 10 * 60 * 1000; // 10 minutos en milisegundos
    asiento.estado = 'bloqueado';
    asiento.bloqueadoHasta = new Date(Date.now() + tiempoBloqueo);
    await asiento.save();

    res.json({
      success: true,
      message: 'Asiento bloqueado temporalmente',
      data: {
        asiento: {
          id: asiento._id,
          numero: asiento.numero,
          estado: asiento.estado,
          bloqueadoHasta: asiento.bloqueadoHasta
        }
      }
    });
  } catch (error: any) {
    console.error('Error al bloquear asiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al bloquear asiento',
      error: error.message
    });
  }
};

// Liberar un asiento bloqueado (PRIVADO)
export const liberarAsiento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { asientoId } = req.params;

    const asiento = await Seat.findById(asientoId);
    if (!asiento) {
      res.status(404).json({
        success: false,
        message: 'Asiento no encontrado'
      });
      return;
    }

    if (asiento.estado === 'bloqueado') {
      asiento.estado = 'disponible';
      asiento.bloqueadoHasta = undefined;
      asiento.reserva = undefined;
      await asiento.save();
    }

    res.json({
      success: true,
      message: 'Asiento liberado',
      data: {
        asiento: {
          id: asiento._id,
          numero: asiento.numero,
          estado: asiento.estado
        }
      }
    });
  } catch (error: any) {
    console.error('Error al liberar asiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al liberar asiento',
      error: error.message
    });
  }
};