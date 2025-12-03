import { useNavigate } from 'react-router-dom';
import { Plane, Clock, ArrowRight, Luggage, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';

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
  equipaje?: {
    mano: {
      permitido: boolean;
      peso: number;
      dimensiones: string;
    };
    documentado: {
      permitido: boolean;
      peso: number;
      piezas: number;
      precioExtra: number;
    };
  };
  asientosDisponibles: number;
  capacidadTotal: number;
  estado: string;
  tipoVuelo: string;
}

interface FlightCardProps {
  flight: Flight;
  numPasajeros?: number;
  isBestValue?: boolean;
}

export default function FlightCard({ flight, numPasajeros = 1, isBestValue }: FlightCardProps) {
  const navigate = useNavigate();

  const handleSelect = () => {
    navigate(`/vuelos/${flight._id || flight.id}/asientos`, {
      state: { numPasajeros: numPasajeros }
    });
  };

  const equipajeMano = flight.equipaje?.mano || { permitido: true, peso: 10, dimensiones: '55x40x20 cm' };
  const equipajeDocumentado = flight.equipaje?.documentado || { permitido: true, peso: 23, piezas: 1, precioExtra: 500 };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative"
    >
      {isBestValue && (
        <div className="absolute -top-3 left-6 z-10 bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-orange-900/20 border border-white/10">
          ⭐ Mejor Precio
        </div>
      )}

      <Card className="overflow-hidden border border-white/10 shadow-lg hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 group bg-white/5 backdrop-blur-md text-white">
        <div className="flex flex-col md:flex-row">
          
          {/* SECCIÓN IZQUIERDA */}
          <div className="flex-1 p-6 md:p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors border border-white/5">
                  <Plane className="w-6 h-6 text-white transform -rotate-45" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{flight.aerolinea}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      {flight.numeroVuelo}
                    </span>
                    <Badge variant="outline" className="text-[10px] text-blue-300 border-blue-500/30 bg-blue-500/10">
                      {flight.tipoVuelo.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 md:gap-8">
              <div className="text-left w-24">
                <p className="text-3xl font-bold text-white tracking-tight">{flight.horaSalida}</p>
                <p className="text-lg font-semibold text-slate-300">{flight.origen.codigo}</p>
                <p className="text-xs text-slate-500 truncate" title={flight.origen.aeropuerto}>
                  {flight.origen.aeropuerto}
                </p>
              </div>

              <div className="flex-1 flex flex-col items-center px-2">
                <p className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-400" /> {flight.duracion}
                </p>
                <div className="w-full relative flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1 h-[2px] bg-white/10 relative mx-1">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 p-1.5 rounded-full border border-white/10 shadow-sm group-hover:border-blue-500/50 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all">
                      <Plane className="w-3 h-3 text-white transform rotate-90" />
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">Directo</p>
              </div>

              <div className="text-right w-24">
                <p className="text-3xl font-bold text-white tracking-tight">{flight.horaLlegada}</p>
                <p className="text-lg font-semibold text-slate-300">{flight.destino.codigo}</p>
                <p className="text-xs text-slate-500 truncate" title={flight.destino.aeropuerto}>
                  {flight.destino.aeropuerto}
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex items-center gap-6 pt-4 border-t border-white/10 text-xs text-slate-400 font-medium">
              {equipajeMano.permitido && (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  <span>Mano: <span className="text-slate-200">{equipajeMano.peso}kg</span></span>
                </div>
              )}
              {equipajeDocumentado.permitido && (
                <div className="flex items-center gap-2">
                  <Luggage className="w-4 h-4 text-blue-400" />
                  <span>
                    Doc: <span className="text-slate-200">{equipajeDocumentado.piezas} pza</span> ({equipajeDocumentado.peso}kg)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN DERECHA */}
          <div className="w-full md:w-64 bg-white/5 p-6 flex flex-row md:flex-col items-center justify-between md:justify-center border-t md:border-t-0 md:border-l border-white/10">
            <div className="text-left md:text-center">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Total por persona</p>
              <div className="flex items-baseline md:justify-center gap-1">
                <span className="text-sm text-slate-400 font-medium align-top mt-1">$</span>
                <span className="text-4xl font-bold text-white tracking-tight">
                  {flight.precio.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 mb-0 md:mb-6">MXN (Impuestos incluidos)</p>
            </div>

            {/* ✅ BOTÓN CORREGIDO: Azul sólido con texto blanco */}
            <Button
              onClick={handleSelect}
              className="bg-blue-600 text-white hover:bg-blue-500 border-0 shadow-lg shadow-blue-900/50 w-auto md:w-full rounded-xl py-6 px-6 font-bold text-base transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              Seleccionar <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}