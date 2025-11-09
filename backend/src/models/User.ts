import mongoose, { Document, Schema, Types  } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface para el documento de Usuario
export interface IUser extends Document {
  _id: Types.ObjectId;  // ← Agregar esta línea
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  rol: 'cliente' | 'admin';
  activo: boolean;
  fechaRegistro: Date;
  ultimoAcceso?: Date;
  // Métodos
  compararPassword(passwordIngresado: string): Promise<boolean>;
}
// Schema de Mongoose
const userSchema = new Schema<IUser>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
    },
    apellido: {
      type: String,
      required: [true, 'El apellido es requerido'],
      trim: true,
      maxlength: [50, 'El apellido no puede tener más de 50 caracteres']
    },
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor ingrese un email válido'
      ]
    },
    password: {
      type: String,
      required: [true, 'La contraseña es requerida'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false // No incluir password en queries por defecto
    },
    telefono: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Por favor ingrese un teléfono válido']
    },
    rol: {
      type: String,
      enum: ['cliente', 'admin'],
      default: 'cliente'
    },
    activo: {
      type: Boolean,
      default: true
    },
    fechaRegistro: {
      type: Date,
      default: Date.now
    },
    ultimoAcceso: {
      type: Date
    }
  },
  {
    timestamps: true // Crea automáticamente createdAt y updatedAt
  }
);

// Middleware: Hashear password antes de guardar
userSchema.pre('save', async function (next) {
  // Solo hashear si el password fue modificado
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Método para comparar passwords
userSchema.methods.compararPassword = async function (
  passwordIngresado: string
): Promise<boolean> {
  return await bcrypt.compare(passwordIngresado, this.password);
};

// Crear y exportar el modelo
const User = mongoose.model<IUser>('User', userSchema);

export default User;