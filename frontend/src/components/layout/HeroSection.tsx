export default function HeroSection() {
  return (
    <section className="relative w-full h-96 md:h-[500px] bg-gradient-to-br from-primary via-accent to-secondary overflow-hidden flex items-center justify-center">
      {/* Decorative circles */}
      <div className="absolute top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
          Encuentra tu próximo destino
        </h2>
        <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
          Vuela a más de 200 destinos con AeroLambda. Precios competitivos y servicios de calidad.
        </p>
      </div>
    </section>
  );
}