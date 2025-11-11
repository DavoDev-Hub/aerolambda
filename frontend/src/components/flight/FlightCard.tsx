import { Users, Plane } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useNavigate } from 'react-router-dom';

export interface Flight {
  _id?: string;
  id?: number;
  numeroVuelo: string;
  aerolinea: string;
  origen: {
    ciudad: string;
    codigo: string;
  };
  destino: {
    ciudad: string;
    codigo: string;
  };
  horaSalida: string;
  horaLlegada: string;
  duracion: string;
  tipoVuelo: 'directo' | '1_escala' | '2+_escalas';
  asientosDisponibles: number;
  precio: number;
}

interface FlightCardProps {
  flight: Flight;
}

const formatTipoVuelo = (tipo: string) => {
  const tipos: { [key: string]: string } = {
    'directo': 'Directo',
    '1_escala': '1 escala',
    '2+_escalas': '2+ escalas',
  };
  return tipos[tipo] || tipo;
};

export default function FlightCard({ flight }: FlightCardProps) {
  const navigate = useNavigate();

  const handleSelect = () => {
    // Navegar a la página de selección de asiento
    navigate(`/vuelos/${flight._id || flight.id}/asientos`);
  };

  return (
    <Card className="p-4 md:p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
        {/* Airline Info */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Plane className="w-6 h-6 text-primary" />
          </div>
        </div>

        {/* Flight Details */}
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <p className="text-sm text-muted-foreground">{flight.aerolinea}</p>
            <p className="text-xs text-muted-foreground">Vuelo {flight.numeroVuelo}</p>
          </div>

          <div className="flex items-center gap-3 mb-3">
            {/* Departure */}
            <div className="text-center">
              <p className="text-xl md:text-2xl font-bold text-foreground">{flight.horaSalida}</p>
              <p className="text-xs text-muted-foreground">{flight.origen.codigo}</p>
              <p className="text-xs text-muted-foreground hidden sm:block">{flight.origen.ciudad}</p>
            </div>

            {/* Flight Icon and Duration */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <Plane className="w-5 h-5 text-primary" />
              <p className="text-xs text-muted-foreground">{flight.duracion}</p>
              <p className="text-xs font-semibold text-foreground">{formatTipoVuelo(flight.tipoVuelo)}</p>
            </div>

            {/* Arrival */}
            <div className="text-center">
              <p className="text-xl md:text-2xl font-bold text-foreground">{flight.horaLlegada}</p>
              <p className="text-xs text-muted-foreground">{flight.destino.codigo}</p>
              <p className="text-xs text-muted-foreground hidden sm:block">{flight.destino.ciudad}</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{flight.asientosDisponibles} asientos disponibles</span>
            </div>
          </div>
        </div>

        {/* Price and Button */}
        <div className="flex flex-col gap-3 items-end w-full md:w-auto">
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">Desde</p>
            <p className="text-2xl md:text-3xl font-bold text-primary">
              ${flight.precio.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">MXN</p>
          </div>
          <Button
            className="w-full md:w-auto"
            onClick={handleSelect}
          >
            Seleccionar
          </Button>
        </div>
      </div>
    </Card>
  );
}