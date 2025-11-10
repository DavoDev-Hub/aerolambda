import mongoose, { Document, Schema, Types } from 'mongoose';

// Interface para el documento de Vuelo
export interface IFlight extends Document {
  _id: Types.ObjectId;
  numeroVuelo: string;
  aerolinea: string;
  origen: {
    ciudad: string;
    codigo: string;
    aeropuerto: string;
  };
  destino: {
    ciudad: string;
    codigo: string;
    aeropuerto: string;
  };
  fechaSalida: Date;
  horaSalida: string;
  fechaLlegada: Date;
  horaLlegada: string;
  duracion: string; // Formato: "2h 30m"
  precio: number;
  capacidadTotal: number;
  asientosDisponibles: number;
  estado: 'programado' | 'en_vuelo' | 'completado' | 'cancelado';
  tipoVuelo: 'directo' | '1_escala' | '2+_escalas';
  createdAt: Date;
  updatedAt: Date;
}

// Schema de Mongoose
const flightSchema = new Schema<IFlight>(
  {
    numeroVuelo: {
      type: String,
      required: [true, 'El número de vuelo es requerido'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{2}-\d{3,4}$/, 'Formato de número de vuelo inválido (ej: AM-1234)']
    },
    aerolinea: {
      type: String,
      required: [true, 'La aerolínea es requerida'],
      trim: true,
      default: 'AeroLambda'
    },
    origen: {
      ciudad: {
        type: String,
        required: [true, 'La ciudad de origen es requerida'],
        trim: true
      },
      codigo: {
        type: String,
        required: [true, 'El código IATA de origen es requerido'],
        trim: true,
        uppercase: true,
        minlength: 3,
        maxlength: 3
      },
      aeropuerto: {
        type: String,
        required: [true, 'El nombre del aeropuerto de origen es requerido'],
        trim: true
      }
    },
    destino: {
      ciudad: {
        type: String,
        required: [true, 'La ciudad de destino es requerida'],
        trim: true
      },
      codigo: {
        type: String,
        required: [true, 'El código IATA de destino es requerido'],
        trim: true,
        uppercase: true,
        minlength: 3,
        maxlength: 3
      },
      aeropuerto: {
        type: String,
        required: [true, 'El nombre del aeropuerto de destino es requerido'],
        trim: true
      }
    },
    fechaSalida: {
      type: Date,
      required: [true, 'La fecha de salida es requerida']
    },
    horaSalida: {
      type: String,
      required: [true, 'La hora de salida es requerida'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
    },
    fechaLlegada: {
      type: Date,
      required: [true, 'La fecha de llegada es requerida']
    },
    horaLlegada: {
      type: String,
      required: [true, 'La hora de llegada es requerida'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
    },
    duracion: {
      type: String,
      required: [true, 'La duración es requerida'],
      match: [/^\d{1,2}h\s\d{1,2}m$/, 'Formato de duración inválido (ej: 2h 30m)']
    },
    precio: {
      type: Number,
      required: [true, 'El precio es requerido'],
      min: [0, 'El precio no puede ser negativo']
    },
    capacidadTotal: {
      type: Number,
      required: [true, 'La capacidad total es requerida'],
      min: [1, 'La capacidad debe ser al menos 1'],
      max: [300, 'La capacidad máxima es 300 asientos']
    },
    asientosDisponibles: {
      type: Number,
      required: true,
      min: [0, 'Los asientos disponibles no pueden ser negativos']
    },
    estado: {
      type: String,
      enum: ['programado', 'en_vuelo', 'completado', 'cancelado'],
      default: 'programado'
    },
    tipoVuelo: {
      type: String,
      enum: ['directo', '1_escala', '2+_escalas'],
      default: 'directo'
    }
  },
  {
    timestamps: true
  }
);

// Índices para mejorar las búsquedas
flightSchema.index({ 'origen.codigo': 1, 'destino.codigo': 1, fechaSalida: 1 });
flightSchema.index({ numeroVuelo: 1 });
flightSchema.index({ estado: 1 });

// Middleware: Validar que la fecha+hora de llegada sea posterior a la de salida
flightSchema.pre('save', function (next) {
  // Combinar fecha y hora para comparación correcta
  const [horaSalidaHoras, horaSalidaMinutos] = this.horaSalida.split(':').map(Number);
  const [horaLlegadaHoras, horaLlegadaMinutos] = this.horaLlegada.split(':').map(Number);

  const fechaHoraSalida = new Date(this.fechaSalida);
  fechaHoraSalida.setHours(horaSalidaHoras, horaSalidaMinutos, 0, 0);

  const fechaHoraLlegada = new Date(this.fechaLlegada);
  fechaHoraLlegada.setHours(horaLlegadaHoras, horaLlegadaMinutos, 0, 0);

  if (fechaHoraLlegada <= fechaHoraSalida) {
    return next(new Error('La fecha y hora de llegada deben ser posteriores a la fecha y hora de salida'));
  }
  
  next();
});

// Middleware: Inicializar asientos disponibles igual a capacidad total si es nuevo
flightSchema.pre('save', function (next) {
  if (this.isNew && !this.asientosDisponibles) {
    this.asientosDisponibles = this.capacidadTotal;
  }
  next();
});

// Crear y exportar el modelo
const Flight = mongoose.model<IFlight>('Flight', flightSchema);

export default Flight;