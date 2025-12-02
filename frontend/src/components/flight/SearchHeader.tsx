import { MapPin, Calendar, Users, Search, ArrowRight } from 'lucide-react';
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
    <div className="w-full px-4 py-6 relative z-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Título de la sección */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center md:text-left"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Resultados de tu búsqueda
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Encontramos las mejores opciones para tu próxima aventura
          </p>
        </motion.div>

        {/* Barra de Datos "Glass" */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-5 flex flex-col lg:flex-row gap-6 items-center justify-between shadow-2xl relative overflow-hidden"
        >
          {/* Brillo superior decorativo */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          {/* Datos del vuelo */}
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 flex-1 w-full lg:w-auto justify-center lg:justify-start">
            
            {/* Ruta */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30 text-blue-400">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Ruta</span>
                <div className="flex items-center gap-3 font-bold text-xl text-white">
                  <span>{origin}</span>
                  <ArrowRight className="w-5 h-5 text-slate-500" />
                  <span>{destination}</span>
                </div>
              </div>
            </div>

            {/* Separador Vertical (solo desktop) */}
            <div className="hidden md:block w-px h-12 bg-white/10"></div>

            {/* Fecha */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30 text-purple-400">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Fecha</span>
                <span className="font-bold text-lg text-white capitalize">{date}</span>
              </div>
            </div>

            {/* Separador Vertical (solo desktop) */}
            <div className="hidden md:block w-px h-12 bg-white/10"></div>

            {/* Pasajeros */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-400">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Viajeros</span>
                 <span className="font-bold text-lg text-white">{passengers} {passengers === 1 ? 'Persona' : 'Personas'}</span>
              </div>
            </div>
          </div>

          {/* Botón Modificar */}
          <Button
            onClick={onModifySearch}
            className="w-full lg:w-auto 
              bg-white text-slate-900 border-0 
              hover:bg-blue-50 transition-all duration-300
              font-bold shadow-lg shadow-white/5 
              px-8 h-14 rounded-xl text-base
              flex items-center justify-center gap-2 group"
          >
            <Search className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span>Modificar Búsqueda</span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}