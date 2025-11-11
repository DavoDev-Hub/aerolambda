import { Plane } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Plane className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-primary">AeroLambda</h1>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-foreground hover:text-primary transition">
            Vuelos
          </Link>
          <Link to="/" className="text-foreground hover:text-primary transition">
            Destinos
          </Link>
          <Link to="/" className="text-foreground hover:text-primary transition">
            Contacto
          </Link>
          <Link
            to="/login"
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition"
          >
            Iniciar sesión
          </Link>
        </nav>
      </div>
    </header>
  );
}