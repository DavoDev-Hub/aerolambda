import { Request, Response } from 'express';
import Booking from '../models/Booking';
import Seat from '../models/Seat';
import Flight from '../models/Flight';
import { Types } from 'mongoose';

// Crear una reserva (PRIVADO - Cliente)
export const crearReserva = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vueloId, asientoId, pasajero } = req.body;
    const usuarioId = req.usuario?.id;

    // Verificar que el vuelo exista y esté disponible
    const vuelo = await Flight.findById(vueloId);
    if (!vuelo) {
      res.status(404).json({
        success: false,
        message: 'Vuelo no encontrado'
      });
      return;
    }

    if (vuelo.estado !== 'programado') {
      res.status(400).json({
        success: false,
        message: 'El vuelo no está disponible para reservas'
      });
      return;
    }

    if (vuelo.asientosDisponibles <= 0) {
      res.status(400).json({
        success: false,
        message: 'No hay asientos disponibles en este vuelo'
      });
      return;
    }

    // Verificar que el asiento exista y esté disponible o bloqueado
    const asiento = await Seat.findById(asientoId);
    if (!asiento) {
      res.status(404).json({
        success: false,
        message: 'Asiento no encontrado'
      });
      return;
    }

    if (asiento.estado === 'ocupado') {
      res.status(400).json({
        success: false,
        message: 'El asiento ya está ocupado'
      });
      return;
    }

    // Verificar que no haya reserva duplicada (mismo usuario, mismo vuelo, estado confirmada)
    const reservaDuplicada = await Booking.findOne({
      usuario: usuarioId,
      vuelo: vueloId,
      estado: { $in: ['pendiente', 'confirmada'] }
    });

    if (reservaDuplicada) {
      res.status(400).json({
        success: false,
        message: 'Ya tienes una reserva activa para este vuelo'
      });
      return;
    }

    // Crear la reserva en estado pendiente
    const nuevaReserva = await Booking.create({
      usuario: usuarioId,
      vuelo: vueloId,
      asiento: asientoId,
      pasajero,
      precioTotal: vuelo.precio,
      estado: 'pendiente'
    });

    // Bloquear el asiento (15 minutos para completar el pago)
    const tiempoBloqueo = 15 * 60 * 1000; // 15 minutos
    asiento.estado = 'bloqueado';
    asiento.bloqueadoHasta = new Date(Date.now() + tiempoBloqueo);
    asiento.reserva = nuevaReserva._id as Types.ObjectId;
    await asiento.save();

    // Populate para devolver información completa
    const reservaCompleta = await Booking.findById(nuevaReserva._id)
      .populate('vuelo', 'numeroVuelo origen destino fechaSalida horaSalida fechaLlegada horaLlegada')
      .populate('asiento', 'numero fila columna tipo');

    res.status(201).json({
      success: true,
      message: 'Reserva creada. Tienes 15 minutos para completar el pago',
      data: reservaCompleta
    });
  } catch (error: any) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear reserva',
      error: error.message
    });
  }
};

// Confirmar pago y completar reserva (PRIVADO - Cliente)
export const confirmarPago = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reservaId, metodoPago } = req.body;
    const usuarioId = req.usuario?.id;

    // Validar formato de ObjectId
    if (!reservaId || !Types.ObjectId.isValid(reservaId)) {
      res.status(400).json({
        success: false,
        message: 'ID de reserva inválido'
      });
      return;
    }

    // Buscar la reserva por ID
    const reserva = await Booking.findOne({ _id: new Types.ObjectId(reservaId) });
    
    if (!reserva) {
      res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
      return;
    }

    // Verificar que sea del usuario
    const reservaUsuarioId = reserva.usuario instanceof Types.ObjectId 
      ? reserva.usuario.toString() 
      : reserva.usuario;

    if (reservaUsuarioId !== usuarioId) {
      res.status(403).json({
        success: false,
        message: 'No tienes permiso para confirmar esta reserva'
      });
      return;
    }

    // Verificar que esté en estado pendiente
    if (reserva.estado !== 'pendiente') {
      res.status(400).json({
        success: false,
        message: `La reserva no está en estado pendiente. Estado actual: ${reserva.estado}`
      });
      return;
    }

    // Confirmar la reserva
    reserva.estado = 'confirmada';
    reserva.metodoPago = metodoPago || 'Tarjeta (Simulado)';
    await reserva.save();

    // Marcar el asiento como ocupado
    const asientoId = reserva.asiento instanceof Types.ObjectId 
      ? reserva.asiento 
      : new Types.ObjectId(reserva.asiento as any);
    
    const asiento = await Seat.findById(asientoId);
    if (asiento) {
      asiento.estado = 'ocupado';
      asiento.bloqueadoHasta = undefined;
      await asiento.save();
    }

    // Reducir asientos disponibles del vuelo
    const vueloId = reserva.vuelo instanceof Types.ObjectId 
      ? reserva.vuelo 
      : new Types.ObjectId(reserva.vuelo as any);
    
    const vuelo = await Flight.findById(vueloId);
    if (vuelo) {
      vuelo.asientosDisponibles = Math.max(0, vuelo.asientosDisponibles - 1);
      await vuelo.save();
    }

    // Obtener reserva completa con populate
    const reservaCompleta = await Booking.findById(reserva._id)
      .populate('vuelo', 'numeroVuelo origen destino fechaSalida horaSalida fechaLlegada horaLlegada precio')
      .populate('asiento', 'numero fila columna tipo');

    res.json({
      success: true,
      message: 'Pago confirmado. Reserva completada exitosamente',
      data: reservaCompleta
    });
  } catch (error: any) {
    console.error('Error al confirmar pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al confirmar pago',
      error: error.message
    });
  }
};
// Obtener historial de reservas del usuario (PRIVADO - Cliente)
export const obtenerMisReservas = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = req.usuario?.id;
    const { estado } = req.query;

    const filtros: any = { usuario: usuarioId };
    
    if (estado) {
      filtros.estado = estado;
    }

    const reservas = await Booking.find(filtros)
      .populate('vuelo', 'numeroVuelo origen destino fechaSalida horaSalida fechaLlegada horaLlegada estado')
      .populate('asiento', 'numero tipo')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        reservas,
        total: reservas.length
      }
    });
  } catch (error: any) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reservas',
      error: error.message
    });
  }
};

// Obtener una reserva por ID (PRIVADO - Cliente)
export const obtenerReservaPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario?.id;

    const reserva = await Booking.findById(id)
      .populate('vuelo', 'numeroVuelo aerolinea origen destino fechaSalida horaSalida fechaLlegada horaLlegada duracion precio estado')
      .populate('asiento', 'numero fila columna tipo');

    if (!reserva) {
      res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
      return;
    }

    // Verificar que sea del usuario (o que sea admin)
    if (reserva.usuario.toString() !== usuarioId && req.usuario?.rol !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta reserva'
      });
      return;
    }

    res.json({
      success: true,
      data: reserva
    });
  } catch (error: any) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reserva',
      error: error.message
    });
  }
};

// Cancelar una reserva (PRIVADO - Cliente)
export const cancelarReserva = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario?.id;

    const reserva = await Booking.findById(id);
    if (!reserva) {
      res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
      return;
    }

    // Verificar que sea del usuario
    if (reserva.usuario.toString() !== usuarioId) {
      res.status(403).json({
        success: false,
        message: 'No tienes permiso para cancelar esta reserva'
      });
      return;
    }

    // Verificar que esté en estado confirmada
    if (reserva.estado !== 'confirmada') {
      res.status(400).json({
        success: false,
        message: 'Solo se pueden cancelar reservas confirmadas'
      });
      return;
    }

    // Verificar tiempo límite de cancelación (24 horas antes del vuelo)
    const vuelo = await Flight.findById(reserva.vuelo);
    if (vuelo) {
      const ahora = new Date();
      const tiempoRestante = vuelo.fechaSalida.getTime() - ahora.getTime();
      const horasRestantes = tiempoRestante / (1000 * 60 * 60);

      if (horasRestantes < 24) {
        res.status(400).json({
          success: false,
          message: 'No se puede cancelar la reserva con menos de 24 horas de anticipación'
        });
        return;
      }

      // Liberar el asiento
      const asiento = await Seat.findById(reserva.asiento);
      if (asiento) {
        asiento.estado = 'disponible';
        asiento.reserva = undefined;
        await asiento.save();
      }

      // Incrementar asientos disponibles
      vuelo.asientosDisponibles += 1;
      await vuelo.save();
    }

    // Marcar reserva como cancelada
    reserva.estado = 'cancelada';
    reserva.fechaCancelacion = new Date();
    await reserva.save();

    res.json({
      success: true,
      message: 'Reserva cancelada exitosamente',
      data: reserva
    });
  } catch (error: any) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar reserva',
      error: error.message
    });
  }
};

// Obtener todas las reservas (ADMIN)
export const obtenerTodasReservas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vueloId, estado, page = 1, limit = 20 } = req.query;

    const filtros: any = {};
    
    if (vueloId) {
      filtros.vuelo = vueloId;
    }
    
    if (estado) {
      filtros.estado = estado;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const reservas = await Booking.find(filtros)
      .populate('usuario', 'nombre apellido email')
      .populate('vuelo', 'numeroVuelo origen destino fechaSalida estado')
      .populate('asiento', 'numero tipo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filtros);

    res.json({
      success: true,
      data: {
        reservas,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reservas',
      error: error.message
    });
  }
};