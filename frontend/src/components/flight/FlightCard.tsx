import { useNavigate } from 'react-router-dom';
import { Plane, Clock, ArrowRight, Luggage } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';

export interface Flight {
  _id?: string;
  id?: string;
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
}

export default function FlightCard({ flight, numPasajeros = 1 }: FlightCardProps) {
  const navigate = useNavigate();

  const handleSelect = () => {
    navigate(`/vuelos/${flight._id || flight.id}/asientos`, {
      state: { 
        numPasajeros: numPasajeros
      }
    });
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 group bg-white">
        <div className="flex flex-col md:flex-row">
          
          {/* Sección Izquierda: Información del Vuelo */}
          <div className="flex-1 p-6">
            {/* Header de la tarjeta */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                {/* Logo simulado de aerolínea */}
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Plane className="w-4 h-4 text-primary transform -rotate-45" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{flight.aerolinea}</p>
                  <p className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                    {flight.numeroVuelo}
                  </p>
                </div>
              </div>
              
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                {flight.tipoVuelo === 'directo' ? 'Vuelo Directo' : flight.tipoVuelo.replace('_', ' ')}
              </Badge>
            </div>

            {/* Ruta y Horarios */}
            <div className="flex items-center justify-between gap-4">
              {/* Salida */}
              <div className="text-left min-w-[80px]">
                <p className="text-2xl font-bold text-gray-900">{flight.horaSalida}</p>
                <p className="text-sm font-semibold text-gray-600">{flight.origen.codigo}</p>
                <p className="text-xs text-gray-400 truncate max-w-[100px]">{flight.origen.ciudad}</p>
              </div>

              {/* Visualización Gráfica del Trayecto */}
              <div className="flex-1 flex flex-col items-center px-4">
                <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3" />
                  {flight.duracion}
                </div>
                <div className="w-full flex items-center gap-2 relative h-4">
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  <div className="flex-1 h-[2px] bg-gray-200 relative">
                    {/* Avión animado en hover */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-full border border-gray-200 group-hover:border-primary group-hover:text-primary transition-colors duration-300">
                      <Plane className="w-3 h-3 text-gray-400 group-hover:text-primary transform rotate-90 transition-colors" />
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
              </div>

              {/* Llegada */}
              <div className="text-right min-w-[80px]">
                <p className="text-2xl font-bold text-gray-900">{flight.horaLlegada}</p>
                <p className="text-sm font-semibold text-gray-600">{flight.destino.codigo}</p>
                <p className="text-xs text-gray-400 truncate max-w-[100px]">{flight.destino.ciudad}</p>
              </div>
            </div>
            
            {/* Footer info extra */}
            <div className="mt-6 flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <Luggage className="w-3 h-3" />
                    <span>1 objeto personal</span>
                </div>
                <div className="flex items-center gap-1">
                   <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                   <span>{flight.asientosDisponibles} asientos restantes</span>
                </div>
            </div>
          </div>

          {/* Sección Derecha: Precio y Acción */}
          <div className="flex md:flex-col items-center justify-between md:justify-center p-6 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-100 min-w-[200px]">
            <div className="text-left md:text-center mb-0 md:mb-4">
              <p className="text-xs text-gray-500 mb-1">Precio por persona</p>
              <p className="text-2xl font-bold text-primary">
                ${flight.precio.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">MXN</p>
            </div>

          <Button
            onClick={handleSelect}
            className="w-auto md:w-full bg-primary hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all rounded-lg font-semibold flex items-center justify-center"
          >
            Seleccionar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}