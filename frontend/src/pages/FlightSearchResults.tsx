import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronDown, Filter, ArrowRight, SearchX, Badge } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Importar animaciones
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Header from '@/components/flight/Header';
import SearchHeader from '@/components/flight/SearchHeader';
import FlightFilters from '@/components/flight/FlightFilters';
import FlightCard, { Flight } from '@/components/flight/FlightCard'; // Asegúrate que importe el nuevo FlightCard

// Variantes para la animación escalonada (stagger)
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

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

  // Funciones de ordenamiento reutilizables
  const sortFlights = (flights: Flight[]) => {
    const sorted = [...flights];
    if (sortBy === 'price') {
      sorted.sort((a, b) => a.precio - b.precio);
    } else if (sortBy === 'duration') {
      sorted.sort((a, b) => {
        const aHours = parseInt(a.duracion);
        const bHours = parseInt(b.duracion);
        return aHours - bHours;
      });
    }
    return sorted;
  };

  const sortedFlightsIda = sortFlights(filteredFlightsIda);
  const sortedFlightsVuelta = sortFlights(filteredFlightsVuelta);

  const handleModifySearch = () => {
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      
      {/* Search Header con animación */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <SearchHeader
          origin={origen}
          destination={destino}
          date={formatDate(fecha)}
          passengers={pasajeros}
          onModifySearch={handleModifySearch}
        />
      </motion.div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8 p-4 md:p-8 max-w-7xl mx-auto">
        
        {/* Sidebar Filters con animación deslizante */}
        <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`w-full lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}
            >
              <FlightFilters
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                stops={stops}
                setStops={setStops}
              />
            </motion.div>
        </AnimatePresence>

        {/* Results Section */}
        <div className="flex-1 w-full">
          
          {/* Toolbar (Filtros móvil y Ordenamiento) */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
          >
            <div className="lg:hidden w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full sm:w-auto bg-white"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Ocultar filtros' : 'Filtrar resultados'}
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto justify-between">
              <p className="text-sm text-gray-500 font-medium">
                {loading ? 'Buscando las mejores opciones...' : (
                  esRedondo 
                    ? `${sortedFlightsIda.length} ida • ${sortedFlightsVuelta.length} vuelta`
                    : `${sortedFlightsIda.length} resultados encontrados`
                )}
              </p>
              
              <div className="relative w-full sm:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-auto appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 cursor-pointer hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                >
                  <option value="recommended">Recomendado</option>
                  <option value="price">Precio: más bajo</option>
                  <option value="duration">Duración: más corta</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
               {[1, 2, 3].map((n) => (
                 <div key={n} className="w-full h-48 bg-white rounded-xl shadow-sm animate-pulse"></div>
               ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="p-12 text-center bg-white">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SearchX className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Algo salió mal</h3>
                <p className="text-gray-500 mb-6">{error}</p>
                <Button onClick={() => navigate('/')} variant="outline">
                    Volver al inicio
                </Button>
                </Card>
            </motion.div>
          )}

          {/* Flights List */}
          {!loading && !error && (
            <div className="space-y-10">
              
              {/* Vuelos de IDA */}
              <motion.div 
                 variants={containerVariants}
                 initial="hidden"
                 animate="show"
              >
                <div className="flex items-center gap-3 mb-5 pb-2 border-b border-gray-200">
                  <Badge className="bg-primary text-white hover:bg-primary px-3">IDA</Badge>
                  <div className="flex items-center gap-2 text-gray-700 text-lg font-bold">
                    <span>{origen}</span>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                    <span>{destino}</span>
                  </div>
                  <span className="text-sm text-gray-500 ml-auto hidden sm:block capitalize">
                    {new Date(fecha).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>

                {sortedFlightsIda.length > 0 ? (
                  <div className="space-y-4">
                    {sortedFlightsIda.map((flight) => (
                      <motion.div key={flight._id || flight.id} variants={itemVariants}>
                          <FlightCard 
                            flight={flight} 
                            numPasajeros={pasajeros}
                          />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center bg-gray-50 border-dashed border-2">
                    <p className="text-gray-500 font-medium">
                      No se encontraron vuelos de ida disponibles con estos filtros.
                    </p>
                  </Card>
                )}
              </motion.div>

              {/* Vuelos de VUELTA (solo si es viaje redondo) */}
              {esRedondo && fechaVuelta && (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="pt-4"
                >
                  <div className="flex items-center gap-3 mb-5 pb-2 border-b border-gray-200">
                    <Badge className="bg-blue-600 text-white hover:bg-blue-700 px-3">VUELTA</Badge>
                    <div className="flex items-center gap-2 text-gray-700 text-lg font-bold">
                      <span>{destino}</span>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                      <span>{origen}</span>
                    </div>
                    <span className="text-sm text-gray-500 ml-auto hidden sm:block capitalize">
                      {new Date(fechaVuelta).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                  </div>

                  {sortedFlightsVuelta.length > 0 ? (
                    <div className="space-y-4">
                      {sortedFlightsVuelta.map((flight) => (
                        <motion.div key={flight._id || flight.id} variants={itemVariants}>
                            <FlightCard 
                              flight={flight} 
                              numPasajeros={pasajeros}
                            />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-12 text-center bg-gray-50 border-dashed border-2">
                      <p className="text-gray-500 font-medium">
                        No se encontraron vuelos de vuelta disponibles.
                      </p>
                    </Card>
                  )}
                </motion.div>
              )}
            </div>
          )}

          {/* Empty State con filtros */}
          {!loading && !error && sortedFlightsIda.length === 0 && flightsIda.length > 0 && (
            <Card className="p-12 text-center bg-white">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Filter className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Sin resultados con estos filtros</h3>
              <p className="text-gray-500 mb-6">
                Intenta ajustar el rango de precios o las escalas para ver más opciones.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setPriceRange([0, 5000]);
                  setStops([]);
                }}
              >
                Limpiar filtros
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}