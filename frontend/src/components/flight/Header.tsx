import { useNavigate, useLocation } from 'react-router-dom';
import { Plane } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import UserMenu from '@/components/ui/UserMenu';
import { useEffect, useState } from 'react';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [location]);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Plane className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-foreground">AeroLambda</span>
          </button>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {/* Link: Vuelos */}
            <button 
              onClick={() => navigate('/')}
              className="relative px-4 py-2 group"
            >
              <span 
                className={`font-medium transition-colors ${
                  isActive('/') ? 'text-primary' : 'text-gray-600 group-hover:text-gray-900'
                }`}
              >
                Vuelos
              </span>
              {/* Línea animada */}
              <span 
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-transform ${
                  isActive('/') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}
              ></span>
            </button>
            
            {/* Link: Mis Reservas */}
            {isLoggedIn && (
              <button 
                onClick={() => navigate('/mis-reservas')}
                className="relative px-4 py-2 group"
              >
                <span 
                  className={`font-medium transition-colors ${
                    isActive('/mis-reservas') ? 'text-primary' : 'text-gray-600 group-hover:text-gray-900'
                  }`}
                >
                  Mis Reservas
                </span>
                {/* Línea animada */}
                <span 
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-transform ${
                    isActive('/mis-reservas') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                ></span>
              </button>
            )}

            {/* Separador */}
            <div className="w-px h-8 bg-gray-200 mx-3"></div>

            {/* User Menu o Login Button */}
            {isLoggedIn ? (
              <UserMenu />
            ) : (
              <Button 
                onClick={() => navigate('/login')}
                variant="outline"
                className="font-medium"
              >
                Iniciar sesión
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}