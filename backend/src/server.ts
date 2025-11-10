import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';

// Importar rutas
import authRoutes from './routes/auth.routes';
import flightRoutes from './routes/flight.routes';

// Cargar variables de entorno
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    message: 'AeroLambda API está funcionando',
    timestamp: new Date().toISOString(),
    database: 'MongoDB conectado'
  });
});

// Rutas de la aplicación
app.use('/api/auth', authRoutes);
app.use('/api/vuelos', flightRoutes);

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
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`AeroLambda Backend - TypeScript`);
      console.log(`Rutas disponibles:`);
      console.log(`   - GET    /api/health`);
      console.log(`   - POST   /api/auth/registro`);
      console.log(`   - POST   /api/auth/login`);
      console.log(`   - GET    /api/auth/perfil`);
      console.log(`   - GET    /api/vuelos/buscar (público)`);
      console.log(`   - POST   /api/vuelos (admin)`);
      console.log(`   - GET    /api/vuelos (admin)`);
      console.log(`   - GET    /api/vuelos/:id (admin)`);
      console.log(`   - PUT    /api/vuelos/:id (admin)`);
      console.log(`   - DELETE /api/vuelos/:id (admin)`);
      console.log(`   - PATCH  /api/vuelos/:id/estado (admin)`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar
startServer();

export default app;