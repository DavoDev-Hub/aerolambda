/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Search, ArrowRightLeft, Calendar, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker-custom.css';

type FlightSearchFormData = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  isRoundTrip: boolean;
  passengers: number;
};

interface City {
  codigo: string;
  ciudad: string;
  aeropuerto: string;
}

interface AvailableRoute {
  origen: City;
  destino: City;
  fechasDisponibles: string[];
}

export default function FlightSearchForm() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FlightSearchFormData>({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    isRoundTrip: true,
    passengers: 1,
  });

  const [availableRoutes, setAvailableRoutes] = useState<AvailableRoute[]>([]);
  const [origins, setOrigins] = useState<City[]>([]);
  const [destinations, setDestinations] = useState<City[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false); // ✅ Cambiado a false
  const [showPassengers, setShowPassengers] = useState(false);

  // Cargar rutas disponibles al montar
  useEffect(() => {
    fetchAvailableRoutes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualizar destinos cuando cambia el origen
  useEffect(() => {
    if (formData.origin) {
      // Si hay rutas disponibles del servidor, filtrar dinámicamente
      if (availableRoutes.length > 0) {
        const possibleDestinations = availableRoutes
          .filter(route => route.origen.codigo === formData.origin)
          .map(route => route.destino);
        
        // Eliminar duplicados
        const uniqueDestinations = possibleDestinations.filter((dest, index, self) =>
          index === self.findIndex(d => d.codigo === dest.codigo)
        );
        
        setDestinations(uniqueDestinations);
        
        // Limpiar destino si ya no es válido
        if (formData.destination && !uniqueDestinations.find(d => d.codigo === formData.destination)) {
          setFormData(prev => ({ ...prev, destination: '', departureDate: '', returnDate: '' }));
        }
      } else {
        // ✅ Modo fallback: mostrar todas las ciudades excepto el origen
        const filteredDestinations = origins.filter(city => city.codigo !== formData.origin);
        setDestinations(filteredDestinations);
      }
    } else {
      setDestinations([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.origin, availableRoutes, origins]);

  // Actualizar fechas disponibles cuando cambia origen/destino
  useEffect(() => {
    if (formData.origin && formData.destination) {
      const route = availableRoutes.find(
        r => r.origen.codigo === formData.origin && r.destino.codigo === formData.destination
      );
      
      if (route) {
        setAvailableDates(route.fechasDisponibles);
      } else {
        setAvailableDates([]);
      }
      
      // Limpiar fecha si ya no es válida
      if (formData.departureDate && route && !route.fechasDisponibles.includes(formData.departureDate)) {
        setFormData(prev => ({ ...prev, departureDate: '', returnDate: '' }));
      }
    } else {
      setAvailableDates([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.origin, formData.destination, availableRoutes]);

  const fetchAvailableRoutes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/vuelos/rutas-disponibles');
      const data = await response.json();

      if (data.success) {
        setAvailableRoutes(data.data.rutas);
        
        // Extraer orígenes únicos
        const uniqueOrigins = data.data.rutas
          .map((route: AvailableRoute) => route.origen)
          .filter((origen: City, index: number, self: City[]) =>
            index === self.findIndex(o => o.codigo === origen.codigo)
          );
        
        setOrigins(uniqueOrigins);
      } else {
        // ✅ Fallback: usar ciudades hardcodeadas
        useFallbackCities();
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      // ✅ Fallback: usar ciudades hardcodeadas
      useFallbackCities();
    } finally {
      setLoading(false);
    }
  };

  // ✅ Función fallback con ciudades predefinidas
  const useFallbackCities = () => {
    const fallbackCities: City[] = [
      { codigo: 'MEX', ciudad: 'Ciudad de México', aeropuerto: 'Aeropuerto Internacional Benito Juárez' },
      { codigo: 'CUN', ciudad: 'Cancún', aeropuerto: 'Aeropuerto Internacional de Cancún' },
      { codigo: 'GDL', ciudad: 'Guadalajara', aeropuerto: 'Aeropuerto Internacional de Guadalajara' },
      { codigo: 'MTY', ciudad: 'Monterrey', aeropuerto: 'Aeropuerto Internacional de Monterrey' },
      { codigo: 'TIJ', ciudad: 'Tijuana', aeropuerto: 'Aeropuerto Internacional de Tijuana' },
      { codigo: 'SJD', ciudad: 'Los Cabos', aeropuerto: 'Aeropuerto Internacional de Los Cabos' },
      { codigo: 'PVR', ciudad: 'Puerto Vallarta', aeropuerto: 'Aeropuerto Internacional de Puerto Vallarta' },
      { codigo: 'MZT', ciudad: 'Mazatlán', aeropuerto: 'Aeropuerto Internacional de Mazatlán' },
    ];

    setOrigins(fallbackCities);
    setDestinations(fallbackCities);
    console.warn('⚠️ Usando ciudades hardcodeadas. Endpoint /api/vuelos/rutas-disponibles no disponible.');
  };

  const handleChange = <K extends keyof FlightSearchFormData>(
    field: K,
    value: FlightSearchFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSwapCities = () => {
    if (formData.origin && formData.destination) {
      setFormData(prev => ({
        ...prev,
        origin: prev.destination,
        destination: prev.origin,
        departureDate: '',
        returnDate: ''
      }));
    }
  };

  const incrementPassengers = () => {
    if (formData.passengers < 9) {
      handleChange('passengers', formData.passengers + 1);
    }
  };

  const decrementPassengers = () => {
    if (formData.passengers > 1) {
      handleChange('passengers', formData.passengers - 1);
    }
  };

  const isDateAvailable = (date: string) => {
    return availableDates.includes(date);
  };

  // Función para verificar si una fecha de objeto Date está disponible
  const isDateObjectAvailable = (date: Date): boolean => {
    const dateString = date.toISOString().split('T')[0];
    return availableRoutes.length === 0 || availableDates.includes(dateString);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.origin || !formData.destination || !formData.departureDate) {
      alert('Por favor completa los campos requeridos');
      return;
    }
    
    // ✅ Solo validar fechas si hay rutas del servidor
    if (availableRoutes.length > 0 && !isDateAvailable(formData.departureDate)) {
      alert('La fecha seleccionada no tiene vuelos disponibles');
      return;
    }
    
    if (formData.isRoundTrip && !formData.returnDate) {
      alert('Por favor selecciona la fecha de vuelta');
      return;
    }

    const searchParams = new URLSearchParams({
      origen: formData.origin,
      destino: formData.destination,
      fecha: formData.departureDate,
      pasajeros: formData.passengers.toString(),
      viaje: formData.isRoundTrip ? 'redondo' : 'sencillo',
    });

    if (formData.isRoundTrip && formData.returnDate) {
      searchParams.append('fechaVuelta', formData.returnDate);
    }

    navigate(`/vuelos/buscar?${searchParams.toString()}`);
  };

  if (loading) {
    return (
      <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl"
    >
      <form onSubmit={handleSubmit}>
        {/* Tabs Tipo de Viaje */}
        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => handleChange('isRoundTrip', true)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              formData.isRoundTrip 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Viaje Redondo
          </button>
          <button
            type="button"
            onClick={() => handleChange('isRoundTrip', false)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !formData.isRoundTrip 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Viaje Sencillo
          </button>
        </div>

        {/* Grid de Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Origen */}
          <div className="md:col-span-3 relative group">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 z-10 w-5 h-5" />
            <select
              value={formData.origin}
              onChange={(e) => handleChange('origin', e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-white text-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none"
              disabled={origins.length === 0}
            >
              <option value="">Origen</option>
              {origins.map((city) => (
                <option key={city.codigo} value={city.codigo}>
                  {city.ciudad}
                </option>
              ))}
            </select>
          </div>

          {/* Icono Swap */}
          <div className="hidden md:flex md:col-span-1 items-center justify-center">
            <button
              type="button"
              onClick={handleSwapCities}
              disabled={!formData.origin || !formData.destination}
              className="p-2 rounded-full hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="Intercambiar ciudades"
            >
              <ArrowRightLeft className="text-white/80 w-5 h-5" />
            </button>
          </div>

          {/* Destino */}
          <div className="md:col-span-3 relative group">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 z-10 w-5 h-5" />
            <select
              value={formData.destination}
              onChange={(e) => handleChange('destination', e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-white text-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none"
              disabled={!formData.origin || destinations.length === 0}
            >
              <option value="">Destino</option>
              {destinations.map((city) => (
                <option key={city.codigo} value={city.codigo}>
                  {city.ciudad}
                </option>
              ))}
            </select>
            {formData.origin && destinations.length === 0 && (
              <p className="absolute -bottom-5 left-0 text-xs text-yellow-300">
                No hay destinos disponibles desde este origen
              </p>
            )}
          </div>

          {/* Fecha Ida */}
          <div className={`${formData.isRoundTrip ? 'md:col-span-2' : 'md:col-span-3'} relative`}>
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 w-4 h-4 pointer-events-none" />
            <DatePicker
              selected={formData.departureDate ? new Date(formData.departureDate) : null}
              onChange={(date: Date | null) => {
                if (date) {
                  handleChange('departureDate', date.toISOString().split('T')[0]);
                }
              }}
              minDate={new Date()}
              filterDate={isDateObjectAvailable}
              disabled={!formData.origin || !formData.destination}
              dateFormat="dd/MM/yyyy"
              placeholderText="dd/mm/aaaa"
              className={`w-full h-12 pl-10 pr-4 bg-white text-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                availableRoutes.length > 0 && formData.departureDate && !isDateAvailable(formData.departureDate) ? 'ring-2 ring-red-500' : ''
              }`}
              calendarClassName="custom-datepicker"
              dayClassName={(date) => {
                const dateString = date.toISOString().split('T')[0];
                if (availableRoutes.length > 0) {
                  return availableDates.includes(dateString)
                    ? 'available-date'
                    : 'unavailable-date';
                }
                return '';
              }}
            />
          </div>

          {/* Fecha Vuelta */}
          {formData.isRoundTrip && (
            <div className="md:col-span-2 relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 w-4 h-4 pointer-events-none" />
              <DatePicker
                selected={formData.returnDate ? new Date(formData.returnDate) : null}
                onChange={(date: Date | null) => {
                  if (date) {
                    handleChange('returnDate', date.toISOString().split('T')[0]);
                  }
                }}
                minDate={formData.departureDate ? new Date(formData.departureDate) : new Date()}
                disabled={!formData.departureDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/aaaa"
                className="w-full h-12 pl-10 pr-4 bg-white text-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                calendarClassName="custom-datepicker"
              />
            </div>
          )}

          {/* Botón Buscar */}
          <div className={`${formData.isRoundTrip ? 'md:col-span-1' : 'md:col-span-2'}`}>
            <button
              type="submit"
              disabled={!formData.origin || !formData.destination || !formData.departureDate}
              className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selector de Pasajeros Mejorado */}
        <div className="mt-4 flex justify-end">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPassengers(!showPassengers)}
              className="flex items-center gap-2 bg-black/20 hover:bg-black/30 px-4 py-2 rounded-lg text-white transition-all"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{formData.passengers} Pasajero{formData.passengers > 1 ? 's' : ''}</span>
            </button>

            {/* Dropdown de Pasajeros */}
            {showPassengers && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-12 bg-white rounded-xl shadow-2xl p-4 z-20 min-w-[200px]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Pasajeros</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={decrementPassengers}
                      disabled={formData.passengers <= 1}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <Minus className="w-4 h-4 text-gray-700" />
                    </button>
                    <span className="text-lg font-bold text-gray-900 w-8 text-center">
                      {formData.passengers}
                    </span>
                    <button
                      type="button"
                      onClick={incrementPassengers}
                      disabled={formData.passengers >= 9}
                      className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassengers(false)}
                  className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all"
                >
                  Aplicar
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Info de fechas disponibles */}
        {availableRoutes.length > 0 && formData.origin && formData.destination && availableDates.length > 0 && (
          <div className="mt-3 text-center">
            <p className="text-xs text-white/70">
              ✈️ {availableDates.length} fecha{availableDates.length > 1 ? 's' : ''} disponible{availableDates.length > 1 ? 's' : ''} para esta ruta
            </p>
          </div>
        )}
      </form>
    </motion.div>
  );
}