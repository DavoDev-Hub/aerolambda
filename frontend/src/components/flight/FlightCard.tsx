import { useNavigate } from 'react-router-dom';
import { Plane, Clock, ArrowRight, Luggage, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';

// Reutilizamos tu interfaz Flight existente (asegúrate de que coincida con tu archivo original)
export interface Flight {
  _id?: string;
  id?: string;
  numeroVuelo: string;
  aerolinea: string;
  origen: { ciudad: string; codigo: string; aeropuerto: string };
  destino: { ciudad: string; codigo: string; aeropuerto: string };
  fechaSalida: string;
  horaSalida: string;
  fechaLlegada: string;
  horaLlegada: string;
  duracion: string;
  precio: number;
  asientosDisponibles: number;
  capacidadTotal: number;
  estado: string;
  tipoVuelo: string;
}

interface FlightCardProps {
  flight: Flight;
  numPasajeros?: number;
  isBestValue?: boolean; // Nuevo prop opcional para destacar vuelos
}

export default function FlightCard({ flight, numPasajeros = 1, isBestValue }: FlightCardProps) {
  const navigate = useNavigate();

  const handleSelect = () => {
    navigate(`/vuelos/${flight._id || flight.id}/asientos`, {
      state: { numPasajeros: numPasajeros }
    });
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative"
    >
      {/* Etiqueta flotante de "Mejor opción" si aplica */}
      {isBestValue && (
        <div className="absolute -top-3 left-6 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
          ⭐ Mejor Precio
        </div>
      )}

      <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 group bg-white rounded-2xl">
        <div className="flex flex-col md:flex-row">
          
          {/* SECCIÓN IZQUIERDA: INFORMACIÓN */}
          <div className="flex-1 p-6 md:p-8">
            <div className="flex justify-between items-start mb-6">
              {/* Aerolínea */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Plane className="w-6 h-6 text-blue-600 transform -rotate-45" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{flight.aerolinea}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {flight.numeroVuelo}
                    </span>
                    <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-200 bg-blue-50">
                      {flight.tipoVuelo.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Ruta Visual */}
            <div className="flex items-center justify-between gap-2 md:gap-8">
              {/* Origen */}
              <div className="text-left w-24">
                <p className="text-3xl font-bold text-gray-900">{flight.horaSalida}</p>
                <p className="text-lg font-semibold text-gray-600">{flight.origen.codigo}</p>
                <p className="text-xs text-gray-400 truncate">{flight.origen.ciudad}</p>
              </div>

              {/* Línea de tiempo animada */}
              <div className="flex-1 flex flex-col items-center px-2">
                <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {flight.duracion}
                </p>
                <div className="w-full relative flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-200"></div>
                  <div className="flex-1 h-[2px] bg-gray-200 relative mx-1">
                    {/* Avión en la línea */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1.5 rounded-full border border-gray-200 shadow-sm group-hover:border-blue-400 group-hover:shadow-md transition-all">
                      <Plane className="w-3 h-3 text-blue-400 transform rotate-90" />
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.2)]"></div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Directo</p>
              </div>

              {/* Destino */}
              <div className="text-right w-24">
                <p className="text-3xl font-bold text-gray-900">{flight.horaLlegada}</p>
                <p className="text-lg font-semibold text-gray-600">{flight.destino.codigo}</p>
                <p className="text-xs text-gray-400 truncate">{flight.destino.ciudad}</p>
              </div>
            </div>
            
            {/* Extras */}
            <div className="mt-8 flex items-center gap-6 pt-4 border-t border-gray-100 text-xs text-gray-500 font-medium">
               <div className="flex items-center gap-1.5">
                   <Briefcase className="w-4 h-4 text-blue-400" />
                   <span>Equipaje de mano</span>
               </div>
               <div className="flex items-center gap-1.5">
                   <Luggage className="w-4 h-4 text-blue-400" />
                   <span>1 maleta (25kg)</span>
               </div>
            </div>
          </div>

{/* SECCIÓN DERECHA: PRECIO Y ACCIÓN */}
          <div className="w-full md:w-64 bg-gray-50/80 p-6 flex flex-row md:flex-col items-center justify-between md:justify-center border-t md:border-t-0 md:border-l border-gray-100">
            
            <div className="text-left md:text-center">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Total por persona</p>
              <div className="flex items-baseline md:justify-center gap-1">
                 <span className="text-sm text-gray-400 font-medium align-top mt-1">$</span>
                 <span className="text-4xl font-bold text-gray-900 tracking-tight">
                   {flight.precio.toLocaleString()}
                 </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 mb-0 md:mb-6">MXN (Impuestos incluidos)</p>
            </div>

            {/* CAMBIO: Botón corregido */}
            <Button
              onClick={handleSelect}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 w-auto md:w-full rounded-xl py-6 px-6 font-bold text-base transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              Seleccionar <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}