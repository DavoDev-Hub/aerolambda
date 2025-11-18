import planeSunset from '@/utils/plane-sunset.png';

export default function HeroSection() {
  return (
    <section className="relative w-full h-96 md:h-[500px] overflow-hidden flex items-center justify-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${planeSunset})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        {/* Overlay oscuro para mejorar legibilidad del texto */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Gradient overlay para efecto profesional */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
          Encuentra tu próximo destino
        </h2>
        <p className="text-lg md:text-xl text-white/95 max-w-2xl mx-auto drop-shadow-lg">
          Vuela hacía tus sueños, fácil, rápido y seguro con AeroLambda.
        </p>
      </div>

      {/* Decorative gradient bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}