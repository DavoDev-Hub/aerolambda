import mongoose, { Document, Schema, Types } from 'mongoose';

// Interface para el documento de Asiento
export interface ISeat extends Document {
  _id: Types.ObjectId;
  vuelo: Types.ObjectId;
  numero: string; // Ejemplo: "12A", "15C"
  fila: number;
  columna: string; // A, B, C, D, E, F
  tipo: 'economica' | 'ejecutiva';
  estado: 'disponible' | 'ocupado' | 'bloqueado';
  bloqueadoHasta?: Date; // Para bloqueo temporal durante compra
  reserva?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Schema de Mongoose
const seatSchema = new Schema<ISeat>(
  {
    vuelo: {
      type: Schema.Types.ObjectId,
      ref: 'Flight',
      required: [true, 'El vuelo es requerido'],
      index: true
    },
    numero: {
      type: String,
      required: [true, 'El número de asiento es requerido'],
      trim: true,
      uppercase: true,
      match: [/^\d{1,2}[A-F]$/, 'Formato de asiento inválido (ej: 12A)']
    },
    fila: {
      type: Number,
      required: [true, 'La fila es requerida'],
      min: [1, 'La fila debe ser al menos 1'],
      max: [50, 'La fila máxima es 50']
    },
    columna: {
      type: String,
      required: [true, 'La columna es requerida'],
      enum: ['A', 'B', 'C', 'D', 'E', 'F'],
      uppercase: true
    },
    tipo: {
      type: String,
      enum: ['economica', 'ejecutiva'],
      default: 'economica'
    },
    estado: {
      type: String,
      enum: ['disponible', 'ocupado', 'bloqueado'],
      default: 'disponible'
    },
    bloqueadoHasta: {
      type: Date
    },
    reserva: {
      type: Schema.Types.ObjectId,
      ref: 'Booking'
    }
  },
  {
    timestamps: true
  }
);

// Índice compuesto único: un asiento específico solo puede existir una vez por vuelo
seatSchema.index({ vuelo: 1, numero: 1 }, { unique: true });

// Índice para búsquedas por vuelo y estado
seatSchema.index({ vuelo: 1, estado: 1 });

// Método estático para liberar asientos bloqueados expirados
seatSchema.statics.liberarAsientosBloqueados = async function() {
  const ahora = new Date();
  const resultado = await this.updateMany(
    {
      estado: 'bloqueado',
      bloqueadoHasta: { $lte: ahora }
    },
    {
      $set: { estado: 'disponible' },
      $unset: { bloqueadoHasta: '', reserva: '' }
    }
  );
  return resultado;
};

// Crear y exportar el modelo
const Seat = mongoose.model<ISeat>('Seat', seatSchema);

export default Seat;