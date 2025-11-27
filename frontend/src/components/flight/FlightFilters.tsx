import { Sun, Moon, Sunset, DollarSign, Clock, GitFork } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface FlightFiltersProps {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  stops: string[];
  setStops: (stops: string[]) => void;
}

export default function FlightFilters({
  priceRange,
  setPriceRange,
  stops,
  setStops,
}: FlightFiltersProps) {
  
  const handleStopsChange = (stop: string) => {
    setStops(stops.includes(stop) ? stops.filter((s) => s !== stop) : [...stops, stop]);
  };

  // Helper para los botones de selección
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const FilterButton = ({ active, onClick, children, className = "" }: any) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
        active
          ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-[1.02]'
          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
      } ${className}`}
    >
      {children}
    </button>
  );

  // Helper para tarjetas de selección (Horarios)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TimeCard = ({ label, time, icon: Icon }: any) => (
    <button
      className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 transition-all group"
    >
      <Icon className="w-6 h-6 text-gray-400 group-hover:text-blue-500 mb-2" />
      <span className="text-xs font-bold text-gray-700 group-hover:text-blue-700">{label}</span>
      <span className="text-[10px] text-gray-400">{time}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      
      {/* 1. Rango de Precio */}
      <Card className="p-6 border-0 shadow-sm bg-white">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-gray-900">Precio Máximo</h3>
        </div>
        
        <div className="px-2">
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between mt-3 text-sm font-medium text-gray-600">
            <span>$0</span>
            <span className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">
              ${priceRange[1].toLocaleString()}
            </span>
          </div>
        </div>
      </Card>

      {/* 2. Escalas (Chips) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <GitFork className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-gray-900 text-sm">Escalas</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterButton 
            active={stops.includes('directo')} 
            onClick={() => handleStopsChange('directo')}
            className="flex-1"
          >
            Directo
          </FilterButton>
          <FilterButton 
            active={stops.includes('1_escala')} 
            onClick={() => handleStopsChange('1_escala')}
            className="flex-1"
          >
            1 Escala
          </FilterButton>
          <FilterButton 
            active={stops.includes('2+_escalas')} 
            onClick={() => handleStopsChange('2+_escalas')}
            className="flex-1"
          >
            2+
          </FilterButton>
        </div>
      </div>

      {/* 3. Horario de Salida (Grid Visual) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Clock className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-gray-900 text-sm">Horario de salida</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <TimeCard label="Mañana" time="00-12h" icon={Sun} id="morning" />
          <TimeCard label="Tarde" time="12-18h" icon={Sunset} id="afternoon" />
          <TimeCard label="Noche" time="18-00h" icon={Moon} id="night" />
        </div>
      </div>

    </div>
  );
}