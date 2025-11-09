import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';

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

// Conectar a la base de datos y luego iniciar el servidor
const startServer = async () => {
  try {
    // Conectar a MongoDB
    await connectDB();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`AeroLambda Backend - TypeScript`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar
startServer();

export default app;