import { MapPin, Calendar, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

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
    // CAMBIO 1: Reduje pt-24 a pt-6. Como ya tenemos el espaciador del Header, no necesitamos tanto padding aquí.
    <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 py-8 px-4 shadow-lg relative overflow-hidden">
      
      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Título */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-white"
        >
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Resultados de búsqueda</h1>
          <p className="text-blue-100 text-sm mt-1 opacity-90">Encontramos las mejores opciones para tu viaje</p>
        </motion.div>

        {/* Barra de Búsqueda */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl p-3 md:p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl"
        >
          {/* Datos del vuelo */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 flex-1 w-full md:w-auto px-2">
            
            {/* Ruta */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="p-2 bg-white/20 rounded-lg shrink-0">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider font-bold text-blue-100 opacity-80">Ruta</span>
                <div className="flex items-center gap-2 font-bold text-base md:text-lg whitespace-nowrap">
                  <span>{origin}</span>
                  <span className="text-blue-200">→</span>
                  <span>{destination}</span>
                </div>
              </div>
            </div>

            <div className="w-full h-px md:w-px md:h-10 bg-white/20 hidden md:block"></div>

            {/* Fecha */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="p-2 bg-white/20 rounded-lg shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider font-bold text-blue-100 opacity-80">Fecha</span>
                <span className="font-semibold text-sm md:text-base capitalize">{date}</span>
              </div>
            </div>

            <div className="w-full h-px md:w-px md:h-10 bg-white/20 hidden md:block"></div>

            {/* Pasajeros */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="p-2 bg-white/20 rounded-lg shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] uppercase tracking-wider font-bold text-blue-100 opacity-80">Viajeros</span>
                 <span className="font-semibold text-sm md:text-base">{passengers} {passengers === 1 ? 'Persona' : 'Personas'}</span>
              </div>
            </div>
          </div>


          <Button
            onClick={onModifySearch}
            className="w-full md:w-auto 
              bg-blue-600 text-white border-2 border-blue-400 
              hover:bg-white hover:text-blue-700 hover:border-white
              font-bold shadow-lg px-6 h-12 
              flex items-center justify-center gap-2 z-20 transition-all"
          >
            <Search className="w-4 h-4 stroke-[3]" />
            <span>Modificar</span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}