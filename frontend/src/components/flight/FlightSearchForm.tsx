import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Search, ArrowRightLeft } from 'lucide-react';
import { motion } from 'framer-motion';

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
    isRoundTrip: true,
    passengers: 1,
  });

  const handleChange = <K extends keyof FlightSearchFormData>(
    field: K,
    value: FlightSearchFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Tus validaciones originales
    if (!formData.origin || !formData.destination || !formData.departureDate) {
      alert('Por favor completa los campos requeridos');
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
              className="w-full h-12 pl-10 pr-4 bg-white text-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">Origen</option>
              {mexicanCities.map((city) => (
                <option key={city.code} value={city.code}>{city.name}</option>
              ))}
            </select>
          </div>

          {/* Icono decorativo */}
          <div className="hidden md:flex md:col-span-1 items-center justify-center">
             <ArrowRightLeft className="text-white/80 w-5 h-5" />
          </div>

          {/* Destino */}
          <div className="md:col-span-3 relative group">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 z-10 w-5 h-5" />
            <select
              value={formData.destination}
              onChange={(e) => handleChange('destination', e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-white text-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">Destino</option>
              {mexicanCities.map((city) => (
                <option key={city.code} value={city.code}>{city.name}</option>
              ))}
            </select>
          </div>

          {/* Fechas */}
          <div className={`${formData.isRoundTrip ? 'md:col-span-2' : 'md:col-span-3'} relative`}>
            <input
              type="date"
              value={formData.departureDate}
              onChange={(e) => handleChange('departureDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full h-12 px-4 bg-white text-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {formData.isRoundTrip && (
            <div className="md:col-span-2 relative">
              <input
                type="date"
                value={formData.returnDate}
                onChange={(e) => handleChange('returnDate', e.target.value)}
                min={formData.departureDate || new Date().toISOString().split('T')[0]}
                className="w-full h-12 px-4 bg-white text-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

           {/* Botón Buscar */}
           <div className={`${formData.isRoundTrip ? 'md:col-span-1' : 'md:col-span-2'}`}>
            <button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pasajeros */}
        <div className="mt-4 flex justify-end">
            <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-lg text-white">
                <Users className="w-4 h-4" />
                <select 
                    value={formData.passengers}
                    onChange={(e) => handleChange('passengers', parseInt(e.target.value))}
                    className="bg-transparent border-none text-sm text-white focus:ring-0 cursor-pointer"
                >
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n} className="text-black">{n} Pasajero{n > 1 ? 's' : ''}</option>)}
                </select>
            </div>
        </div>
      </form>
    </motion.div>
  );
}