import { motion } from 'framer-motion';
import planeSunset from '@/utils/plane-sunset.png';
// IMPORTANTE: Ajusta esta ruta si tus carpetas son diferentes, 
// pero según tu imagen debería ser:
import FlightSearchForm from '../flight/FlightSearchForm'; 

export default function HeroSection() {
  return (
    <section className="relative w-full flex-1 flex items-center justify-center overflow-hidden">
      
      {/* 1. Imagen de Fondo */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
        style={{
          backgroundImage: `url(${planeSunset})`,
        }}
      >
        {/* Overlays para oscurecer la imagen y que se lea el texto */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
      </div>

      {/* 2. Contenido Principal */}
      <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6 flex flex-col items-center gap-10 py-20">
        
        {/* Títulos Animados */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl"
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-2xl tracking-tight">
            Encuentra tu <span className="text-blue-400">próximo destino</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-100/90 max-w-2xl mx-auto drop-shadow-lg font-light">
            Vuela hacia tus sueños de forma fácil, rápida y segura con AeroLambda.
          </p>
        </motion.div>

        {/* 3. Aquí insertamos el Formulario (que viene del otro archivo) */}
        <div className="w-full">
            <FlightSearchForm />
        </div>

      </div>
    </section>
  );
}