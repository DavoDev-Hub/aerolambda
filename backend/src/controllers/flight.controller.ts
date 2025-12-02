import { Request, Response } from 'express';
import Flight from '../models/Flight';

// Crear un nuevo vuelo (ADMIN)
export const crearVuelo = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      numeroVuelo,
      aerolinea,
      origen,
      destino,
      fechaSalida,
      horaSalida,
      fechaLlegada,
      horaLlegada,
      duracion,
      precio,
      capacidadTotal,
      tipoVuelo
    } = req.body;

    // Verificar si el número de vuelo ya existe
    const vueloExistente = await Flight.findOne({ numeroVuelo });
    if (vueloExistente) {
      res.status(400).json({
        success: false,
        message: 'El número de vuelo ya existe'
      });
      return;
    }

    // Crear el vuelo
    const nuevoVuelo = await Flight.create({
      numeroVuelo,
      aerolinea: aerolinea || 'AeroLambda',
      origen,
      destino,
      fechaSalida: new Date(fechaSalida),
      horaSalida,
      fechaLlegada: new Date(fechaLlegada),
      horaLlegada,
      duracion,
      precio,
      capacidadTotal,
      asientosDisponibles: capacidadTotal,
      tipoVuelo: tipoVuelo || 'directo'
    });

    res.status(201).json({
      success: true,
      message: 'Vuelo creado exitosamente',
      data: nuevoVuelo
    });
  } catch (error: any) {
    console.error('Error al crear vuelo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear vuelo',
      error: error.message
    });
  }
};

// Obtener todos los vuelos con filtros (ADMIN)
export const obtenerVuelos = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      origen,
      destino,
      fecha,
      estado,
      page = 1,
      limit = 10
    } = req.query;

    // Construir filtros
    const filtros: any = {};

    if (origen) {
      filtros['origen.codigo'] = (origen as string).toUpperCase();
    }

    if (destino) {
      filtros['destino.codigo'] = (destino as string).toUpperCase();
    }

    if (fecha) {
      const fechaBusqueda = new Date(fecha as string);
      const fechaInicio = new Date(fechaBusqueda.setHours(0, 0, 0, 0));
      const fechaFin = new Date(fechaBusqueda.setHours(23, 59, 59, 999));
      filtros.fechaSalida = {
        $gte: fechaInicio,
        $lte: fechaFin
      };
    }

    if (estado) {
      filtros.estado = estado;
    }

    // Paginación
    const skip = (Number(page) - 1) * Number(limit);

    // Obtener vuelos
    const vuelos = await Flight.find(filtros)
      .sort({ fechaSalida: 1 })
      .skip(skip)
      .limit(Number(limit));

    // Contar total de documentos
    const total = await Flight.countDocuments(filtros);

    res.json({
      success: true,
      data: {
        vuelos,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    console.error('Error al obtener vuelos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener vuelos',
      error: error.message
    });
  }
};

// Obtener un vuelo por ID (ADMIN)
export const obtenerVueloPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const vuelo = await Flight.findById(id);

    if (!vuelo) {
      res.status(404).json({
        success: false,
        message: 'Vuelo no encontrado'
      });
      return;
    }

    res.json({
      success: true,
      data: vuelo
    });
  } catch (error: any) {
    console.error('Error al obtener vuelo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener vuelo',
      error: error.message
    });
  }
};

// Actualizar un vuelo (ADMIN)
export const actualizarVuelo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const actualizaciones = req.body;

    // Verificar si el vuelo existe
    const vuelo = await Flight.findById(id);
    if (!vuelo) {
      res.status(404).json({
        success: false,
        message: 'Vuelo no encontrado'
      });
      return;
    }

    // Si se actualiza el número de vuelo, verificar que no exista
    if (actualizaciones.numeroVuelo && actualizaciones.numeroVuelo !== vuelo.numeroVuelo) {
      const vueloExistente = await Flight.findOne({ numeroVuelo: actualizaciones.numeroVuelo });
      if (vueloExistente) {
        res.status(400).json({
          success: false,
          message: 'El número de vuelo ya existe'
        });
        return;
      }
    }

    // Convertir fechas si vienen como string
    if (actualizaciones.fechaSalida) {
      actualizaciones.fechaSalida = new Date(actualizaciones.fechaSalida);
    }
    if (actualizaciones.fechaLlegada) {
      actualizaciones.fechaLlegada = new Date(actualizaciones.fechaLlegada);
    }

    // Actualizar vuelo
    const vueloActualizado = await Flight.findByIdAndUpdate(
      id,
      actualizaciones,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Vuelo actualizado exitosamente',
      data: vueloActualizado
    });
  } catch (error: any) {
    console.error('Error al actualizar vuelo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar vuelo',
      error: error.message
    });
  }
};

// Eliminar un vuelo (ADMIN)
export const eliminarVuelo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Verificar si el vuelo existe
    const vuelo = await Flight.findById(id);
    if (!vuelo) {
      res.status(404).json({
        success: false,
        message: 'Vuelo no encontrado'
      });
      return;
    }

    // TODO: Verificar si tiene reservas activas antes de eliminar
    // Por ahora permitimos eliminar cualquier vuelo

    await Flight.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Vuelo eliminado exitosamente'
    });
  } catch (error: any) {
    console.error('Error al eliminar vuelo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar vuelo',
      error: error.message
    });
  }
};

// Buscar vuelos (PÚBLICO - para clientes)
export const buscarVuelos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { origen, destino, fecha } = req.query;

    // Validar que al menos origen y destino estén presentes
    if (!origen || !destino) {
      res.status(400).json({
        success: false,
        message: 'Origen y destino son requeridos'
      });
      return;
    }

    // Construir filtros
    const filtros: any = {
      'origen.codigo': (origen as string).toUpperCase(),
      'destino.codigo': (destino as string).toUpperCase(),
      estado: 'programado', // Solo mostrar vuelos programados
      asientosDisponibles: { $gt: 0 } // Solo vuelos con asientos disponibles
    };

    // Si se proporciona fecha, filtrar por ese día
    if (fecha) {
      const fechaBusqueda = new Date(fecha as string);
      const fechaInicio = new Date(fechaBusqueda.setHours(0, 0, 0, 0));
      const fechaFin = new Date(fechaBusqueda.setHours(23, 59, 59, 999));
      filtros.fechaSalida = {
        $gte: fechaInicio,
        $lte: fechaFin
      };
    } else {
      // Si no hay fecha, solo mostrar vuelos futuros
      filtros.fechaSalida = { $gte: new Date() };
    }

    // Buscar vuelos
    const vuelos = await Flight.find(filtros)
      .sort({ fechaSalida: 1, horaSalida: 1 });

    res.json({
      success: true,
      data: {
        vuelos,
        total: vuelos.length
      }
    });
  } catch (error: any) {
    console.error('Error al buscar vuelos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar vuelos',
      error: error.message
    });
  }
};

// Cambiar estado de un vuelo (ADMIN)
export const cambiarEstadoVuelo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado || !['programado', 'en_vuelo', 'completado', 'cancelado'].includes(estado)) {
      res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
      return;
    }

    const vuelo = await Flight.findById(id);
    if (!vuelo) {
      res.status(404).json({
        success: false,
        message: 'Vuelo no encontrado'
      });
      return;
    }

    vuelo.estado = estado;
    await vuelo.save();

    // TODO: Notificar a los clientes si el vuelo se cancela

    res.json({
      success: true,
      message: `Estado del vuelo cambiado a ${estado}`,
      data: vuelo
    });
  } catch (error: any) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del vuelo',
      error: error.message
    });
  }
};


// Obtener rutas disponibles con fechas (PÚBLICO)
export const obtenerRutasDisponibles = async (req: Request, res: Response): Promise<void> => {
  try {
    // Obtener todos los vuelos programados y en vuelo
    const vuelos = await Flight.find({
      estado: { $in: ['programado', 'en_vuelo'] },
      fechaSalida: { $gte: new Date() } // Solo vuelos futuros
    })
      .select('origen destino fechaSalida')
      .sort({ fechaSalida: 1 });

    // Agrupar por ruta (origen -> destino)
    const rutasMap = new Map<string, {
      origen: { codigo: string; ciudad: string; aeropuerto: string };
      destino: { codigo: string; ciudad: string; aeropuerto: string };
      fechasDisponibles: string[];
    }>();

    vuelos.forEach(vuelo => {
      const rutaKey = `${vuelo.origen.codigo}-${vuelo.destino.codigo}`;
      const fechaString = vuelo.fechaSalida.toISOString().split('T')[0];

      if (rutasMap.has(rutaKey)) {
        const ruta = rutasMap.get(rutaKey)!;
        if (!ruta.fechasDisponibles.includes(fechaString)) {
          ruta.fechasDisponibles.push(fechaString);
        }
      } else {
        rutasMap.set(rutaKey, {
          origen: {
            codigo: vuelo.origen.codigo,
            ciudad: vuelo.origen.ciudad,
            aeropuerto: vuelo.origen.aeropuerto
          },
          destino: {
            codigo: vuelo.destino.codigo,
            ciudad: vuelo.destino.ciudad,
            aeropuerto: vuelo.destino.aeropuerto
          },
          fechasDisponibles: [fechaString]
        });
      }
    });

    // Convertir Map a Array y ordenar fechas
    const rutas = Array.from(rutasMap.values()).map(ruta => ({
      ...ruta,
      fechasDisponibles: ruta.fechasDisponibles.sort()
    }));

    res.json({
      success: true,
      data: {
        rutas,
        totalRutas: rutas.length
      }
    });
  } catch (error: any) {
    console.error('Error al obtener rutas disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener rutas disponibles',
      error: error.message
    });
  }
};