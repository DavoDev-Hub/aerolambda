import { Request, Response } from 'express';
import Booking from '../models/Booking';
import Seat from '../models/Seat';
import Flight from '../models/Flight';
import { Types } from 'mongoose';

export const crearReserva = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vueloId, asientoId, asientos, pasajero, pasajeros } = req.body;
    const usuarioId = req.usuario?.id;

    // Determinar si es una reserva simple o múltiple
    const esReservaMultiple = Array.isArray(asientos) && Array.isArray(pasajeros);
    
    // Validaciones básicas
    if (esReservaMultiple) {
      if (asientos.length !== pasajeros.length) {
        res.status(400).json({
          success: false,
          message: 'El número de asientos debe coincidir con el número de pasajeros'
        });
        return;
      }

      if (asientos.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Debe proporcionar al menos un asiento y pasajero'
        });
        return;
      }
    } else if (!asientoId || !pasajero) {
      res.status(400).json({
        success: false,
        message: 'Datos de reserva incompletos'
      });
      return;
    }

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

    const numReservas = esReservaMultiple ? asientos.length : 1;
    
    if (vuelo.asientosDisponibles < numReservas) {
      res.status(400).json({
        success: false,
        message: `No hay suficientes asientos disponibles. Disponibles: ${vuelo.asientosDisponibles}`
      });
      return;
    }

    // Procesar reserva simple
    if (!esReservaMultiple) {
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
  
      const precioAsiento = asiento.tipo === 'ejecutiva' ? vuelo.precio * 2 : vuelo.precio;

      // Crear la reserva
        const nuevaReserva = await Booking.create({
          usuario: usuarioId,
          vuelo: vueloId,
          asiento: asientoId,
          pasajero,
          precioTotal: precioAsiento,  // ← PRECIO CORRECTO
          estado: 'pendiente'
        });

      // Bloquear el asiento
      const tiempoBloqueo = 15 * 60 * 1000;
      asiento.estado = 'bloqueado';
      asiento.bloqueadoHasta = new Date(Date.now() + tiempoBloqueo);
      asiento.reserva = nuevaReserva._id as Types.ObjectId;
      await asiento.save();

      const reservaCompleta = await Booking.findById(nuevaReserva._id)
        .populate('vuelo', 'numeroVuelo origen destino fechaSalida horaSalida fechaLlegada horaLlegada')
        .populate('asiento', 'numero fila columna tipo');

      res.status(201).json({
        success: true,
        message: 'Reserva creada. Tienes 15 minutos para completar el pago',
        data: reservaCompleta
      });
      return;
    }

    // Procesar reservas múltiples
    // Verificar todos los asientos primero
    const asientosObjs = await Seat.find({ _id: { $in: asientos } });
    
    if (asientosObjs.length !== asientos.length) {
      res.status(404).json({
        success: false,
        message: 'Uno o más asientos no encontrados'
      });
      return;
    }

    // Verificar que todos estén disponibles
    const asientoOcupado = asientosObjs.find(a => a.estado === 'ocupado');
    if (asientoOcupado) {
      res.status(400).json({
        success: false,
        message: `El asiento ${asientoOcupado.numero} ya está ocupado`
      });
      return;
    }

    // Crear todas las reservas
    const reservasCreadas = [];
    const tiempoBloqueo = 15 * 60 * 1000;

for (let i = 0; i < asientos.length; i++) {
        // Calcular precio según tipo de asiento
        const asientoObj = asientosObjs[i];
        const precioAsiento = asientoObj.tipo === 'ejecutiva' ? vuelo.precio * 2 : vuelo.precio;
        
        const nuevaReserva = await Booking.create({
          usuario: usuarioId,
          vuelo: vueloId,
          asiento: asientos[i],
          pasajero: pasajeros[i],
          precioTotal: precioAsiento,  // ← PRECIO CORRECTO
          estado: 'pendiente'
        });

      // Bloquear el asiento
      const asiento = asientosObjs[i];
      asiento.estado = 'bloqueado';
      asiento.bloqueadoHasta = new Date(Date.now() + tiempoBloqueo);
      asiento.reserva = nuevaReserva._id as Types.ObjectId;
      await asiento.save();

      reservasCreadas.push(nuevaReserva);
    }

    // Populate todas las reservas
    const reservasCompletas = await Booking.find({ 
      _id: { $in: reservasCreadas.map(r => r._id) } 
    })
      .populate('vuelo', 'numeroVuelo origen destino fechaSalida horaSalida fechaLlegada horaLlegada')
      .populate('asiento', 'numero fila columna tipo');

        const precioTotal = reservasCreadas.reduce((total, reserva) => 
          total + reserva.precioTotal, 0
        );

        res.status(201).json({
          success: true,
          message: `${reservasCreadas.length} reservas creadas...`,
          data: {
            reservas: reservasCompletas,
            precioTotal: precioTotal  // ← SUMA CORRECTA
          }
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

export const obtenerMisReservas = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = req.usuario?.id;
    const { estado } = req.query;

    const filtros: any = { usuario: usuarioId };
    
    if (estado) {
      filtros.estado = estado;
    }

    const reservas = await Booking.find(filtros)
      .populate('vuelo', 'numeroVuelo origen destino fechaSalida horaSalida fechaLlegada horaLlegada estado equipaje')
      .populate('asiento', 'numero tipo')
      .sort({ createdAt: -1 });

    // Filtrar reservas con vuelos válidos
    const reservasValidas = reservas.filter(r => r.vuelo !== null);

    res.json({
      success: true,
      data: {
        reservas: reservasValidas,
        total: reservasValidas.length
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

// 🆕 Obtener reportes con filtros de fecha (ADMIN)
export const obtenerReportes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fechaInicio, fechaFin, vueloId, origen, destino, estado } = req.query;

    // Construir filtros
    const filtros: any = {};

    // Filtro de fechas (usando createdAt de la reserva)
    if (fechaInicio || fechaFin) {
      filtros.createdAt = {};
      if (fechaInicio) {
        filtros.createdAt.$gte = new Date(fechaInicio as string);
      }
      if (fechaFin) {
        const fechaFinDate = new Date(fechaFin as string);
        fechaFinDate.setHours(23, 59, 59, 999); // Incluir todo el día
        filtros.createdAt.$lte = fechaFinDate;
      }
    }

    if (vueloId) {
      filtros.vuelo = vueloId;
    }

    if (estado) {
      filtros.estado = estado;
    }

    // Obtener todas las reservas con populate
    const reservas = await Booking.find(filtros)
      .populate({
        path: 'vuelo',
        select: 'numeroVuelo origen destino fechaSalida precio'
      })
      .populate('usuario', 'nombre apellido email')
      .populate('asiento', 'numero tipo')
      .sort({ createdAt: -1 });

    // Filtrar por origen/destino si se proporcionan (después del populate)
    let reservasFiltradas = reservas.filter(r => r.vuelo !== null);

    if (origen) {
      reservasFiltradas = reservasFiltradas.filter(r => 
        (r.vuelo as any)?.origen?.codigo === origen
      );
    }

    if (destino) {
      reservasFiltradas = reservasFiltradas.filter(r => 
        (r.vuelo as any)?.destino?.codigo === destino
      );
    }

    // Calcular estadísticas
    const totalReservas = reservasFiltradas.length;
    const reservasConfirmadas = reservasFiltradas.filter(r => r.estado === 'confirmada').length;
    const reservasCanceladas = reservasFiltradas.filter(r => r.estado === 'cancelada').length;
    const reservasPendientes = reservasFiltradas.filter(r => r.estado === 'pendiente').length;

    const ingresosTotal = reservasFiltradas
      .filter(r => r.estado === 'confirmada')
      .reduce((sum, r) => sum + r.precioTotal, 0);

    const tasaCancelacion = totalReservas > 0 
      ? ((reservasCanceladas / totalReservas) * 100) 
      : 0;

    // Agrupar por día (reservas por fecha)
    const reservasPorDia: { [key: string]: number } = {};
    reservasFiltradas.forEach(r => {
      const fecha = new Date(r.createdAt).toISOString().split('T')[0];
      reservasPorDia[fecha] = (reservasPorDia[fecha] || 0) + 1;
    });

    // Agrupar por vuelo (ingresos por vuelo)
    const ingresosPorVuelo: { [key: string]: { vuelo: string; ingresos: number; reservas: number } } = {};
    reservasFiltradas
      .filter(r => r.estado === 'confirmada')
      .forEach(r => {
        const vueloNum = (r.vuelo as any)?.numeroVuelo || 'Desconocido';
        if (!ingresosPorVuelo[vueloNum]) {
          ingresosPorVuelo[vueloNum] = { vuelo: vueloNum, ingresos: 0, reservas: 0 };
        }
        ingresosPorVuelo[vueloNum].ingresos += r.precioTotal;
        ingresosPorVuelo[vueloNum].reservas += 1;
      });

    // Distribución por estado
    const distribucionEstados = {
      confirmadas: reservasConfirmadas,
      canceladas: reservasCanceladas,
      pendientes: reservasPendientes
    };

    res.json({
      success: true,
      data: {
        resumen: {
          totalReservas,
          reservasConfirmadas,
          reservasCanceladas,
          reservasPendientes,
          ingresosTotal,
          tasaCancelacion,
          pasajerosTransportados: reservasConfirmadas
        },
        reservasPorDia: Object.entries(reservasPorDia).map(([fecha, cantidad]) => ({
          fecha,
          cantidad
        })).sort((a, b) => a.fecha.localeCompare(b.fecha)),
        ingresosPorVuelo: Object.values(ingresosPorVuelo).sort((a, b) => b.ingresos - a.ingresos),
        distribucionEstados,
        reservas: reservasFiltradas
      }
    });
  } catch (error: any) {
    console.error('Error al obtener reportes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reportes',
      error: error.message
    });
  }
};