import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';

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

  return (
    <div className="space-y-6">
      {/* Price Filter */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 text-foreground">Precio</h3>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="5000"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
            className="w-full accent-primary"
          />
          <input
            type="range"
            min="0"
            max="5000"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-full accent-primary"
          />
          <div className="text-sm text-muted-foreground">
            ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()} MXN
          </div>
        </div>
      </Card>

      {/* Departure Time Filter */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 text-foreground">Horario de salida</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox id="morning" />
            <span className="text-sm">Mañana (06:00 - 12:00)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox id="afternoon" />
            <span className="text-sm">Tarde (12:00 - 18:00)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox id="evening" />
            <span className="text-sm">Noche (18:00 - 06:00)</span>
          </label>
        </div>
      </Card>

      {/* Stops Filter */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 text-foreground">Escalas</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={stops.includes('directo')}
              onCheckedChange={() => handleStopsChange('directo')}
            />
            <span className="text-sm">Directo</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={stops.includes('1_escala')}
              onCheckedChange={() => handleStopsChange('1_escala')}
            />
            <span className="text-sm">1 escala</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={stops.includes('2+_escalas')}
              onCheckedChange={() => handleStopsChange('2+_escalas')}
            />
            <span className="text-sm">2+ escalas</span>
          </label>
        </div>
      </Card>

      {/* Duration Filter */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 text-foreground">Duración</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox id="duration-short" />
            <span className="text-sm">Menos de 10 horas</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox id="duration-medium" />
            <span className="text-sm">10 - 12 horas</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox id="duration-long" />
            <span className="text-sm">Más de 12 horas</span>
          </label>
        </div>
      </Card>
    </div>
  );
}