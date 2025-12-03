import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';

// Importar rutas
import authRoutes from './routes/auth.routes';
import flightRoutes from './routes/flight.routes';
import seatRoutes from './routes/seat.routes';
import bookingRoutes from './routes/booking.routes';
import dashboardRoutes from './routes/dashboard.routes';

// Cargar variables de entorno
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS dinámico para desarrollo y producción
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL || 'https://aerolambda-frontend.onrender.com'
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (como mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    message: 'AeroLambda API está funcionando',
    timestamp: new Date().toISOString(),
    database: 'MongoDB conectado',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rutas de la aplicación
app.use('/api/auth', authRoutes);
app.use('/api/vuelos', flightRoutes);
app.use('/api/asientos', seatRoutes);
app.use('/api/reservas', bookingRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Manejador de rutas no encontradas
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Conectar a la base de datos y luego iniciar el servidor
const startServer = async () => {
  try {
    // Conectar a MongoDB
    await connectDB();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`✈️  AeroLambda Backend - ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌍 CORS habilitado para: ${allowedOrigins.join(', ')}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar
startServer();


// ===============================================
// 🧹 JOB DE LIMPIEZA DE RESERVAS PENDIENTES
// ===============================================
import Seat from './models/Seat';
import Booking from './models/Booking';
import Flight from './models/Flight';

const limpiarReservasPendientes = async () => {
  try {
    const hace15Min = new Date(Date.now() - 15 * 60 * 1000);
    
    const reservasExpiradas = await Booking.find({
      estado: 'pendiente',
      createdAt: { $lt: hace15Min }
    });

    for (const reserva of reservasExpiradas) {
      console.log(`❌ Cancelando reserva expirada: ${reserva.codigoReserva}`);
      
      // Cambiar estado a cancelada
      reserva.estado = 'cancelada';
      await reserva.save();
      
      // Liberar asiento
      const asiento = await Seat.findById(reserva.asiento);
      if (asiento && asiento.estado === 'bloqueado') {
        asiento.estado = 'disponible';
        asiento.reserva = undefined;
        asiento.bloqueadoHasta = undefined;
        await asiento.save();
        
        // ✅ CORRECCIÓN: NO incrementar asientosDisponibles
        // Razón: Cuando se crea una reserva PENDIENTE, NO se decrementa asientosDisponibles
        // Solo se decrementa cuando se CONFIRMA el pago
        // Por lo tanto, al expirar una pendiente, NO debemos incrementar
        // (porque nunca se decrementó en primer lugar)
        
        console.log(`  ✅ Asiento ${asiento.numero} liberado`);
      }
    }
    
    if (reservasExpiradas.length > 0) {
      console.log(`✅ ${reservasExpiradas.length} reservas pendientes canceladas`);
    }
  } catch (error) {
    console.error('❌ Error al limpiar reservas pendientes:', error);
  }
};

// Ejecutar cada 5 minutos
setInterval(limpiarReservasPendientes, 5 * 60 * 1000);
console.log('🔄 Job de limpieza de reservas iniciado (cada 5 minutos)');

// Ejecutar una vez al iniciar
limpiarReservasPendientes();

export default app;