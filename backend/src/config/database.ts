import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aerolambda';
    
    await mongoose.connect(mongoUri);
    
    console.log('MongoDB conectado correctamente');
    console.log(`Base de datos: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('Error al conectar MongoDB:', error);
    process.exit(1); // Salir si no hay conexión
  }
};

// Manejar eventos de desconexión
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB desconectado');
});

mongoose.connection.on('error', (err) => {
  console.error('Error de MongoDB:', err);
});

export default connectDB;