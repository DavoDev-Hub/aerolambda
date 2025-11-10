import Seat from '../models/Seat';
import Flight from '../models/Flight';
import { Types } from 'mongoose';

/**
 * Genera los asientos para un vuelo según su capacidad
 * Distribución estándar: 6 asientos por fila (A, B, C - pasillo - D, E, F)
 */
export const generarAsientosParaVuelo = async (vueloId: string | Types.ObjectId) => {
  try {
    // Obtener el vuelo
    const vuelo = await Flight.findById(vueloId);
    if (!vuelo) {
      throw new Error('Vuelo no encontrado');
    }

    // Verificar si ya tiene asientos generados
    const asientosExistentes = await Seat.countDocuments({ vuelo: vueloId });
    if (asientosExistentes > 0) {
      console.log(`El vuelo ${vuelo.numeroVuelo} ya tiene asientos generados`);
      return;
    }

    const capacidad = vuelo.capacidadTotal;
    const asientosPorFila = 6; // A, B, C, D, E, F
    const totalFilas = Math.ceil(capacidad / asientosPorFila);
    const columnas = ['A', 'B', 'C', 'D', 'E', 'F'];

    const asientos: any[] = [];
    let asientosCreados = 0;

    for (let fila = 1; fila <= totalFilas && asientosCreados < capacidad; fila++) {
      for (const columna of columnas) {
        if (asientosCreados >= capacidad) break;

        const numero = `${fila}${columna}`;
        
        // Las primeras 3 filas son ejecutivas (opcional)
        const tipo = fila <= 3 ? 'ejecutiva' : 'economica';

        asientos.push({
          vuelo: vueloId,
          numero,
          fila,
          columna,
          tipo,
          estado: 'disponible'
        });

        asientosCreados++;
      }
    }

    // Insertar todos los asientos
    await Seat.insertMany(asientos);
    
    console.log(`✅ ${asientos.length} asientos generados para el vuelo ${vuelo.numeroVuelo}`);
    return asientos.length;
  } catch (error: any) {
    console.error('Error al generar asientos:', error);
    throw error;
  }
};

/**
 * Libera asientos bloqueados que ya expiraron
 */
export const liberarAsientosBloqueadosExpirados = async () => {
  try {
    const resultado = await (Seat as any).liberarAsientosBloqueados();
    if (resultado.modifiedCount > 0) {
      console.log(`✅ ${resultado.modifiedCount} asientos bloqueados liberados`);
    }
    return resultado;
  } catch (error: any) {
    console.error('Error al liberar asientos bloqueados:', error);
    throw error;
  }
};