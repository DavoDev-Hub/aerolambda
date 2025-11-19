import { useNavigate } from 'react-router-dom';
import { Plane, Clock, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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
  numPasajeros?: number; // ← AGREGAR ESTA PROP
}

export default function FlightCard({ flight, numPasajeros = 1 }: FlightCardProps) {
  const navigate = useNavigate();

  const handleSelect = () => {
    navigate(`/vuelos/${flight._id || flight.id}/asientos`, {
      state: { 
        numPasajeros: numPasajeros  // ← PASAR EL NÚMERO DE PASAJEROS
      }
    });
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Flight Info */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Departure */}
          <div>
            <p className="text-3xl font-bold text-foreground">{flight.horaSalida}</p>
            <p className="text-sm text-muted-foreground">{flight.origen.codigo}</p>
            <p className="text-xs text-muted-foreground">{flight.origen.ciudad}</p>
          </div>

          {/* Duration & Stops */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <div className="flex-1 border-t-2 border-primary"></div>
              <Plane className="w-5 h-5 text-primary" />
              <div className="flex-1 border-t-2 border-primary"></div>
              <div className="w-2 h-2 rounded-full bg-primary"></div>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {flight.duracion}
            </p>
            <p className="text-xs text-muted-foreground">
              {flight.tipoVuelo === 'directo' ? 'Directo' : flight.tipoVuelo}
            </p>
          </div>

          {/* Arrival */}
          <div>
            <p className="text-3xl font-bold text-foreground">{flight.horaLlegada}</p>
            <p className="text-sm text-muted-foreground">{flight.destino.codigo}</p>
            <p className="text-xs text-muted-foreground">{flight.destino.ciudad}</p>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex flex-col items-end gap-3 min-w-[200px]">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Vuelo {flight.numeroVuelo}</p>
            <p className="text-sm text-muted-foreground">{flight.aerolinea}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Desde</p>
            <p className="text-3xl font-bold text-primary">
              ${flight.precio.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">MXN por persona</p>
          </div>
          <p className="text-xs text-muted-foreground">
            {flight.asientosDisponibles} asientos disponibles
          </p>
          <Button
            onClick={handleSelect}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            Seleccionar
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}