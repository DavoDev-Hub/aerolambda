import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronDown, Filter, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Header from '@/components/flight/Header';
import SearchHeader from '@/components/flight/SearchHeader';
import FlightFilters from '@/components/flight/FlightFilters';
import FlightCard, { Flight } from '@/components/flight/FlightCard';

export default function FlightSearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [sortBy, setSortBy] = useState('recommended');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [stops, setStops] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Vuelos de ida y vuelta
  const [flightsIda, setFlightsIda] = useState<Flight[]>([]);
  const [flightsVuelta, setFlightsVuelta] = useState<Flight[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener parámetros de búsqueda
  const origen = searchParams.get('origen') || '';
  const destino = searchParams.get('destino') || '';
  const fecha = searchParams.get('fecha') || '';
  const fechaVuelta = searchParams.get('fechaVuelta') || '';
  const pasajeros = parseInt(searchParams.get('pasajeros') || '1');
  const viaje = searchParams.get('viaje') || 'sencillo';
  const esRedondo = viaje === 'redondo';

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar vuelos de ida
        const paramsIda = new URLSearchParams({
          origen,
          destino,
          fecha,
        });

        const responseIda = await fetch(`/api/vuelos/buscar?${paramsIda.toString()}`);
        
        if (!responseIda.ok) {
          throw new Error('Error al buscar vuelos');
        }

        const dataIda = await responseIda.json();
        
        if (dataIda.success) {
          setFlightsIda(dataIda.data.vuelos || []);
        } else {
          setError(dataIda.message || 'No se encontraron vuelos de ida');
        }

        // Si es viaje redondo, buscar vuelos de vuelta
        if (esRedondo && fechaVuelta) {
          const paramsVuelta = new URLSearchParams({
            origen: destino, // Invertir origen y destino
            destino: origen,
            fecha: fechaVuelta,
          });

          const responseVuelta = await fetch(`/api/vuelos/buscar?${paramsVuelta.toString()}`);
          
          if (responseVuelta.ok) {
            const dataVuelta = await responseVuelta.json();
            
            if (dataVuelta.success) {
              setFlightsVuelta(dataVuelta.data.vuelos || []);
            }
          }
        }
      } catch (err) {
        const error = err as Error;
        console.error('Error fetching flights:', error);
        setError(error.message || 'Error al cargar los vuelos');
      } finally {
        setLoading(false);
      }
    };

    if (origen && destino) {
      fetchFlights();
    }
  }, [origen, destino, fecha, fechaVuelta, esRedondo]);

  // Filtrar vuelos de ida
  const filteredFlightsIda = flightsIda.filter((flight) => {
    if (flight.precio < priceRange[0] || flight.precio > priceRange[1]) return false;
    if (stops.length > 0 && !stops.includes(flight.tipoVuelo)) return false;
    return true;
  });

  // Filtrar vuelos de vuelta
  const filteredFlightsVuelta = flightsVuelta.filter((flight) => {
    if (flight.precio < priceRange[0] || flight.precio > priceRange[1]) return false;
    if (stops.length > 0 && !stops.includes(flight.tipoVuelo)) return false;
    return true;
  });

  // Ordenar vuelos de ida
  const sortedFlightsIda = [...filteredFlightsIda];
  if (sortBy === 'price') {
    sortedFlightsIda.sort((a, b) => a.precio - b.precio);
  } else if (sortBy === 'duration') {
    sortedFlightsIda.sort((a, b) => {
      const aHours = parseInt(a.duracion);
      const bHours = parseInt(b.duracion);
      return aHours - bHours;
    });
  }

  // Ordenar vuelos de vuelta
  const sortedFlightsVuelta = [...filteredFlightsVuelta];
  if (sortBy === 'price') {
    sortedFlightsVuelta.sort((a, b) => a.precio - b.precio);
  } else if (sortBy === 'duration') {
    sortedFlightsVuelta.sort((a, b) => {
      const aHours = parseInt(a.duracion);
      const bHours = parseInt(b.duracion);
      return aHours - bHours;
    });
  }

  const handleModifySearch = () => {
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Search Header */}
      <SearchHeader
        origin={origen}
        destination={destino}
        date={formatDate(fecha)}
        passengers={pasajeros}
        onModifySearch={handleModifySearch}
      />

      {/* Main Content */}
      <div className="flex gap-6 p-4 md:p-8 max-w-7xl mx-auto">
        {/* Sidebar Filters */}
        {showFilters && (
          <div className="w-full lg:w-64 flex-shrink-0">
            <FlightFilters
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              stops={stops}
              setStops={setStops}
            />
          </div>
        )}

        {/* Results Section */}
        <div className="flex-1 w-full">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            </Button>
          </div>

          {/* Desktop Filters Toggle */}
          <div className="hidden lg:block mb-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Ocultar' : 'Mostrar'} filtros
            </Button>
          </div>

          {/* Sort Dropdown */}
          <div className="mb-6 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {loading ? 'Buscando...' : (
                esRedondo 
                  ? `${sortedFlightsIda.length} vuelos de ida • ${sortedFlightsVuelta.length} vuelos de vuelta`
                  : `${sortedFlightsIda.length} vuelos encontrados`
              )}
            </p>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-border rounded-lg px-4 py-2 pr-8 text-foreground cursor-pointer hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="recommended">Recomendado</option>
                <option value="price">Precio: menor a mayor</option>
                <option value="duration">Duración: menor a mayor</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <Card className="p-8 text-center">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </Card>
          )}

          {/* Error State */}
          {error && !loading && (
            <Card className="p-8 text-center">
              <p className="text-destructive mb-2">❌ {error}</p>
              <Button onClick={() => navigate('/')} className="mt-4">
                Volver al inicio
              </Button>
            </Card>
          )}

          {/* Flights List */}
          {!loading && !error && (
            <div className="space-y-8">
              {/* Vuelos de IDA */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-2xl font-bold text-foreground">
                    Vuelos de ida
                  </h2>
                  <div className="flex items-center gap-1 text-primary">
                    <span className="font-semibold">{origen}</span>
                    <ArrowRight className="w-5 h-5" />
                    <span className="font-semibold">{destino}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(fecha)}
                  </span>
                </div>

                {sortedFlightsIda.length > 0 ? (
                  <div className="space-y-4">
                    {sortedFlightsIda.map((flight) => (
                      <FlightCard 
                        key={flight._id || flight.id} 
                        flight={flight} 
                        numPasajeros={pasajeros}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">
                      No se encontraron vuelos de ida para esta búsqueda
                    </p>
                  </Card>
                )}
              </div>

              {/* Vuelos de VUELTA (solo si es viaje redondo) */}
              {esRedondo && fechaVuelta && (
                <div className="pt-8 border-t-2 border-primary/20">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-2xl font-bold text-foreground">
                      Vuelos de vuelta
                    </h2>
                    <div className="flex items-center gap-1 text-primary">
                      <span className="font-semibold">{destino}</span>
                      <ArrowRight className="w-5 h-5" />
                      <span className="font-semibold">{origen}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(fechaVuelta)}
                    </span>
                  </div>

                  {sortedFlightsVuelta.length > 0 ? (
                    <div className="space-y-4">
                      {sortedFlightsVuelta.map((flight) => (
                        <FlightCard 
                          key={flight._id || flight.id} 
                          flight={flight} 
                          numPasajeros={pasajeros}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">
                        No se encontraron vuelos de vuelta para esta búsqueda
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Intenta seleccionar otra fecha de regreso
                      </p>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Empty State con filtros */}
          {!loading && !error && sortedFlightsIda.length === 0 && flightsIda.length > 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-2">No hay vuelos que coincidan con los filtros</p>
              <p className="text-sm text-muted-foreground">
                Intenta ajustar tus filtros para ver más resultados
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setPriceRange([0, 5000]);
                  setStops([]);
                }}
                className="mt-4"
              >
                Limpiar filtros
              </Button>
            </Card>
          )}

          {/* No Results State */}
          {!loading && !error && flightsIda.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-2">
                No se encontraron vuelos para esta búsqueda
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Intenta modificar tu búsqueda o seleccionar otras fechas
              </p>
              <Button onClick={handleModifySearch}>
                Modificar búsqueda
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}