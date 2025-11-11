import { useState } from 'react';
import { Calendar, MapPin, Users, Search, Plane } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type FlightSearchFormData = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  isRoundTrip: boolean;
  passengers: number;
};

const mexicanCities = [
  { name: 'Ciudad de México', code: 'MEX' },
  { name: 'Cancún', code: 'CUN' },
  { name: 'Guadalajara', code: 'GDL' },
  { name: 'Monterrey', code: 'MTY' },
  { name: 'Tijuana', code: 'TIJ' },
  { name: 'Los Cabos', code: 'SJD' },
  { name: 'Puerto Vallarta', code: 'PVR' },
  { name: 'Mazatlán', code: 'MZT' },
];

export default function FlightSearchForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FlightSearchFormData>({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    isRoundTrip: false,
    passengers: 1,
  });

  // Tipado sin any: el tipo de "value" depende de la clave "field"
  const handleChange = <K extends keyof FlightSearchFormData>(
    field: K,
    value: FlightSearchFormData[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.origin || !formData.destination || !formData.departureDate) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    // Navegar a resultados de búsqueda con los parámetros
    const searchParams = new URLSearchParams({
      origen: formData.origin,
      destino: formData.destination,
      fecha: formData.departureDate,
    });

    navigate(`/vuelos/buscar?${searchParams.toString()}`);
  };

  return (
    <section className="w-full bg-background py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-border">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Buscar vuelos</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First row - Origin and Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Origin City */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>¿Desde dónde viajas?</span>
                  </div>
                </label>
                <select
                  value={formData.origin}
                  onChange={(e) => handleChange('origin', e.target.value)}
                  className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Selecciona ciudad de origen</option>
                  {mexicanCities.map((city) => (
                    <option key={city.code} value={city.code}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination City */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>¿A dónde vas?</span>
                  </div>
                </label>
                <select
                  value={formData.destination}
                  onChange={(e) => handleChange('destination', e.target.value)}
                  className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Selecciona ciudad destino</option>
                  {mexicanCities.map((city) => (
                    <option key={city.code} value={city.code}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Second row - Dates and Passengers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Departure Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>Fecha de ida</span>
                  </div>
                </label>
                <input
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) => handleChange('departureDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Return Date */}
              {formData.isRoundTrip && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>Fecha de vuelta</span>
                    </div>
                  </label>
                  <input
                    type="date"
                    value={formData.returnDate}
                    onChange={(e) => handleChange('returnDate', e.target.value)}
                    min={
                      formData.departureDate || new Date().toISOString().split('T')[0]
                    }
                    className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              )}

              {/* Passengers */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>Pasajeros</span>
                  </div>
                </label>
                <select
                  value={formData.passengers}
                  onChange={(e) =>
                    handleChange('passengers', parseInt(e.target.value, 10))
                  }
                  className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'pasajero' : 'pasajeros'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Round Trip Checkbox */}
            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="roundTrip"
                checked={formData.isRoundTrip}
                onChange={(e) => handleChange('isRoundTrip', e.target.checked)}
                className="w-5 h-5 rounded border-input bg-background cursor-pointer accent-primary"
              />
              <label htmlFor="roundTrip" className="text-sm font-medium text-foreground cursor-pointer">
                Viaje redondo
              </label>
            </div>

            {/* Search Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-primary hover:opacity-90 text-primary-foreground font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg"
              >
                <Search className="w-5 h-5" />
                Buscar vuelos
              </button>
            </div>
          </form>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/20 mb-4">
              <Plane className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Vuelos directos</h4>
            <p className="text-muted-foreground text-sm">Conecta con tus destinos favoritos sin escalas</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/20 mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Mejor precio garantizado</h4>
            <p className="text-muted-foreground text-sm">Compara y ahorra en tus reservas de vuelo</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/20 mb-4">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">200+ destinos</h4>
            <p className="text-muted-foreground text-sm">Vuela a cualquier parte del país con facilidad</p>
          </div>
        </div>
      </div>
    </section>
  );
}
