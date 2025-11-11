import { MapPin, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SearchHeaderProps {
  origin?: string;
  destination?: string;
  date?: string;
  passengers?: number;
  onModifySearch?: () => void;
}

export default function SearchHeader({
  origin = 'MEX',
  destination = 'CUN',
  date = '15 Dic, 2024',
  passengers = 1,
  onModifySearch,
}: SearchHeaderProps) {
  return (
    <div className="bg-primary text-primary-foreground py-6 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Resultados de búsqueda</h1>

        {/* Condensed Search Bar */}
        <div className="bg-white text-foreground rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-md">
          <div className="flex items-center gap-2 flex-1">
            <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex items-center gap-1">
              <span className="font-semibold">{origin}</span>
              <span className="text-muted-foreground">→</span>
              <span className="font-semibold">{destination}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1 md:flex-initial">
            <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-sm">{date}</span>
          </div>

          <div className="flex items-center gap-2 flex-1 md:flex-initial">
            <Users className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm">{passengers} {passengers === 1 ? 'pasajero' : 'pasajeros'}</span>
          </div>

          <Button
            variant="outline"
            className="w-full md:w-auto"
            onClick={onModifySearch}
          >
            Modificar búsqueda
          </Button>
        </div>
      </div>
    </div>
  );
}