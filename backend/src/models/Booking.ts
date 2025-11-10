import mongoose, { Document, Schema, Types } from 'mongoose';

// Interface para pasajero
interface IPasajero {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  tipoDocumento: 'INE' | 'Pasaporte';
  numeroDocumento: string;
}

// Interface para el documento de Reserva
export interface IBooking extends Document {
  codigoReserva: string;
  usuario: Types.ObjectId;
  vuelo: Types.ObjectId;
  asiento: Types.ObjectId;
  pasajero: IPasajero;
  precioTotal: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  metodoPago?: string;
  fechaReserva: Date;
  fechaCancelacion?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schema de Mongoose
const bookingSchema = new Schema<IBooking>(
  {
    codigoReserva: {
      type: String,
      unique: true,
      uppercase: true,
      index: true
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es requerido'],
      index: true
    },
    vuelo: {
      type: Schema.Types.ObjectId,
      ref: 'Flight',
      required: [true, 'El vuelo es requerido'],
      index: true
    },
    asiento: {
      type: Schema.Types.ObjectId,
      ref: 'Seat',
      required: [true, 'El asiento es requerido']
    },
    pasajero: {
      nombre: {
        type: String,
        required: [true, 'El nombre del pasajero es requerido'],
        trim: true
      },
      apellido: {
        type: String,
        required: [true, 'El apellido del pasajero es requerido'],
        trim: true
      },
      email: {
        type: String,
        required: [true, 'El email del pasajero es requerido'],
        lowercase: true,
        trim: true
      },
      telefono: {
        type: String,
        trim: true
      },
      tipoDocumento: {
        type: String,
        enum: ['INE', 'Pasaporte'],
        required: [true, 'El tipo de documento es requerido']
      },
      numeroDocumento: {
        type: String,
        required: [true, 'El número de documento es requerido'],
        trim: true
      }
    },
    precioTotal: {
      type: Number,
      required: [true, 'El precio total es requerido'],
      min: [0, 'El precio no puede ser negativo']
    },
    estado: {
      type: String,
      enum: ['pendiente', 'confirmada', 'cancelada', 'completada'],
      default: 'pendiente'
    },
    metodoPago: {
      type: String,
      default: 'Tarjeta (Simulado)'
    },
    fechaReserva: {
      type: Date,
      default: Date.now
    },
    fechaCancelacion: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Índice compuesto: prevenir reservas duplicadas
bookingSchema.index({ usuario: 1, vuelo: 1, estado: 1 });

// Generar código de reserva único antes de guardar
bookingSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      this.codigoReserva = await generarCodigoReserva();
      next();
    } catch (error: any) {
      next(error);
    }
  } else {
    next();
  }
});

// Función auxiliar para generar código de reserva único
async function generarCodigoReserva(): Promise<string> {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo: string;
  let existe: boolean;
  let intentos = 0;
  const maxIntentos = 10;

  do {
    // Formato: AL-2024-XXXXXX (6 caracteres aleatorios)
    const year = new Date().getFullYear();
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
      randomPart += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    codigo = `AL-${year}-${randomPart}`;

    // Verificar si el código ya existe
    const Booking = mongoose.model<IBooking>('Booking');
    const reservaExistente = await Booking.findOne({ codigoReserva: codigo });
    existe = !!reservaExistente;
    
    intentos++;
    if (intentos >= maxIntentos) {
      throw new Error('No se pudo generar un código de reserva único');
    }
  } while (existe);

  return codigo;
}

// Crear y exportar el modelo
const Booking = mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;