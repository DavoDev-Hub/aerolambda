import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowRight, SearchX } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Header from '@/components/flight/Header';
import SearchHeader from '@/components/flight/SearchHeader';
import FlightCard, { Flight } from '@/components/flight/FlightCard';

// Variantes para la animación escalonada
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
  
  // Estados de datos
  const [flightsIda, setFlightsIda] = useState<Flight[]>([]);
  const [flightsVuelta, setFlightsVuelta] = useState<Flight[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Params
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

        // 1. Buscar vuelos de IDA
        const paramsIda = new URLSearchParams({ origen, destino, fecha });
        const responseIda = await fetch(`/api/vuelos/buscar?${paramsIda.toString()}`);
        
        if (!responseIda.ok) throw new Error('Error al buscar vuelos');
        const dataIda = await responseIda.json();
        
        if (dataIda.success) {
          setFlightsIda(dataIda.data.vuelos || []);
        } else {
          setError(dataIda.message || 'No se encontraron vuelos de ida');
        }

        // 2. Buscar vuelos de VUELTA (si aplica)
        if (esRedondo && fechaVuelta) {
          const paramsVuelta = new URLSearchParams({
            origen: destino, // Invertido
            destino: origen,
            fecha: fechaVuelta,
          });
          const responseVuelta = await fetch(`/api/vuelos/buscar?${paramsVuelta.toString()}`);
          if (responseVuelta.ok) {
            const dataVuelta = await responseVuelta.json();
            if (dataVuelta.success) setFlightsVuelta(dataVuelta.data.vuelos || []);
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

  // Función de ordenamiento
  const sortFlights = (flights: Flight[]) => {
    const sorted = [...flights];
    if (sortBy === 'price') {
      sorted.sort((a, b) => a.precio - b.precio);
    } else if (sortBy === 'duration') {
      sorted.sort((a, b) => {
        // Extraer horas de strings tipo "2h 30m"
        const getMinutes = (str: string) => {
          const hMatch = str.match(/(\d+)h/);
          const mMatch = str.match(/(\d+)m/);
          return (parseInt(hMatch?.[1] || '0') * 60) + parseInt(mMatch?.[1] || '0');
        };
        return getMinutes(a.duracion) - getMinutes(b.duracion);
      });
    }
    return sorted;
  };

  const sortedFlightsIda = sortFlights(flightsIda);
  const sortedFlightsVuelta = sortFlights(flightsVuelta);

  const handleModifySearch = () => {
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    // Ajustar zona horaria para evitar desfases de día
    const date = new Date(dateString + 'T00:00:00'); 
    return date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    // ✅ FONDO DARK GRADIENT UNIFICADO
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 text-slate-200">
      
      {/* Fondo decorativo fijo */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/5 blur-[120px] rounded-full"></div>
      </div>

      <Header />
      
      {/* Search Header (Se integra visualmente) */}
      <div className="relative z-10 pt-20">
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
      </div>

      {/* Contenido Principal Centrado (Sin Sidebar) */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 pb-20 mt-8">
        
        {/* Barra Superior: Contador y Ordenar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 mb-8"
        >
          <div>
            <h2 className="text-xl font-semibold text-white">
              {loading ? 'Buscando vuelos...' : 'Selecciona tu vuelo'}
            </h2>
            {!loading && (
              <p className="text-sm text-slate-400 mt-1">
                {esRedondo 
                  ? `${sortedFlightsIda.length} opciones de ida • ${sortedFlightsVuelta.length} de vuelta`
                  : `${sortedFlightsIda.length} resultados encontrados`
                }
              </p>
            )}
          </div>
          
          <div className="relative group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-5 py-2.5 pr-10 text-sm font-medium text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-lg backdrop-blur-sm"
            >
              <option value="recommended" className="bg-slate-800 text-white">Recomendado</option>
              <option value="price" className="bg-slate-800 text-white">Precio: más bajo</option>
              <option value="duration" className="bg-slate-800 text-white">Duración: más corta</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-white transition-colors" />
          </div>
        </motion.div>

        {/* SKELETON LOADING */}
        {loading && (
          <div className="space-y-6">
             {[1, 2, 3].map((n) => (
               <div key={n} className="w-full h-56 bg-white/5 border border-white/5 rounded-2xl animate-pulse"></div>
             ))}
          </div>
        )}

        {/* ERROR STATE */}
        {error && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="p-12 text-center bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SearchX className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No encontramos vuelos</h3>
              <p className="text-slate-400 mb-8 text-lg">{error}</p>
              <Button onClick={() => navigate('/')} className="bg-white text-slate-900 hover:bg-slate-200">
                  Realizar otra búsqueda
              </Button>
              </Card>
          </motion.div>
        )}

        {/* LISTA DE VUELOS */}
        {!loading && !error && (
          <div className="space-y-16">
            
            {/* IDA */}
            <motion.div variants={containerVariants} initial="hidden" animate="show">
              <div className="flex items-center gap-4 mb-6">
                <Badge className="bg-blue-600 text-white px-3 py-1 text-sm shadow-lg shadow-blue-600/20 border-0">IDA</Badge>
                <div className="flex items-center gap-3 text-xl font-bold text-white">
                  <span>{origen}</span>
                  <ArrowRight className="w-5 h-5 text-slate-500" />
                  <span>{destino}</span>
                </div>
                <div className="h-px bg-white/10 flex-1 ml-4"></div>
                <span className="text-sm text-slate-400 font-medium capitalize hidden sm:block">
                  {formatDate(fecha)}
                </span>
              </div>

              <div className="space-y-6">
                {sortedFlightsIda.length > 0 ? (
                  sortedFlightsIda.map((flight) => (
                    <motion.div key={flight._id || flight.id} variants={itemVariants}>
                        {/* Se pasará prop 'dark' al FlightCard en el siguiente paso */}
                        <FlightCard 
                          flight={flight} 
                          numPasajeros={pasajeros}
                          isBestValue={sortBy === 'price' && flight === sortedFlightsIda[0]}
                        />
                    </motion.div>
                  ))
                ) : (
                  <div className="p-12 text-center bg-white/5 border border-white/10 rounded-2xl border-dashed">
                    <p className="text-slate-400">No hay vuelos de ida disponibles para esta fecha.</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* VUELTA (Si aplica) */}
            {esRedondo && fechaVuelta && (
              <motion.div variants={containerVariants} initial="hidden" animate="show">
                <div className="flex items-center gap-4 mb-6">
                  <Badge className="bg-purple-600 text-white px-3 py-1 text-sm shadow-lg shadow-purple-600/20 border-0">VUELTA</Badge>
                  <div className="flex items-center gap-3 text-xl font-bold text-white">
                    <span>{destino}</span>
                    <ArrowRight className="w-5 h-5 text-slate-500" />
                    <span>{origen}</span>
                  </div>
                  <div className="h-px bg-white/10 flex-1 ml-4"></div>
                  <span className="text-sm text-slate-400 font-medium capitalize hidden sm:block">
                    {formatDate(fechaVuelta)}
                  </span>
                </div>

                <div className="space-y-6">
                  {sortedFlightsVuelta.length > 0 ? (
                    sortedFlightsVuelta.map((flight) => (
                      <motion.div key={flight._id || flight.id} variants={itemVariants}>
                          <FlightCard 
                            flight={flight} 
                            numPasajeros={pasajeros}
                            isBestValue={sortBy === 'price' && flight === sortedFlightsVuelta[0]}
                          />
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-12 text-center bg-white/5 border border-white/10 rounded-2xl border-dashed">
                      <p className="text-slate-400">No hay vuelos de vuelta disponibles.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}