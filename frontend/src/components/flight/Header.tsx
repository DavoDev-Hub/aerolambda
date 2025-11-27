import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import UserMenu from '@/components/ui/UserMenu';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const isTransparent = isHome && !isScrolled;

  // Clases dinámicas
  const headerClass = isTransparent
    ? 'bg-gradient-to-b from-black/60 to-transparent pt-2' 
    : 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm py-0';

  const textClass = isTransparent 
    ? 'text-white hover:text-white/90 drop-shadow-md font-bold' 
    : 'text-gray-600 hover:text-gray-900 font-medium';

  const activeLinkClass = isTransparent 
    ? 'text-white drop-shadow-md font-bold' 
    : 'text-primary font-bold';

  const activeBarClass = isTransparent ? 'bg-white shadow-sm' : 'bg-primary';

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${headerClass}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-16' : 'h-24'}`}>
            
            {/* LOGO LAMBDA */}
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-3 group"
            >
              <div className={`w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-transform group-hover:scale-105 ${isTransparent ? 'bg-primary/90 backdrop-blur-md' : 'bg-primary'}`}>
                <span className="text-2xl text-white font-bold leading-none pb-1">λ</span>
              </div>
              <span className={`text-xl font-bold tracking-tight transition-colors ${isTransparent ? 'text-white drop-shadow-md' : 'text-gray-900'}`}>
                AeroLambda
              </span>
            </button>

            {/* NAVEGACIÓN CENTRAL */}
            <nav className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => navigate('/')}
                className="relative px-4 py-2 group"
              >
                <span className={`text-base transition-colors ${isActive('/') ? activeLinkClass : textClass}`}>
                  Vuelos
                </span>
                <span 
                  className={`absolute bottom-0 left-4 right-4 h-0.5 transition-transform origin-left duration-300 ${activeBarClass} ${
                    isActive('/') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                ></span>
              </button>
              
              {isLoggedIn && (
                <button 
                  onClick={() => navigate('/mis-reservas')}
                  className="relative px-4 py-2 group"
                >
                  <span className={`text-base transition-colors ${isActive('/mis-reservas') ? activeLinkClass : textClass}`}>
                    Mis Reservas
                  </span>
                  <span 
                    className={`absolute bottom-0 left-4 right-4 h-0.5 transition-transform origin-left duration-300 ${activeBarClass} ${
                      isActive('/mis-reservas') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  ></span>
                </button>
              )}
            </nav>

            {/* USER MENU / LOGIN */}
            <div className="flex items-center gap-4">
              <div className={`hidden md:block w-px h-8 ${isTransparent ? 'bg-white/40' : 'bg-gray-200'}`}></div>

              {isLoggedIn ? (
                <div className={`${isTransparent ? 'text-white font-semibold drop-shadow-md [&_span]:text-white' : 'text-gray-900'}`}>
                  <UserMenu /> 
                </div>
              ) : (
                <Button 
                  onClick={() => navigate('/login')}
                  variant={isTransparent ? "outline" : "default"}
                  className={`font-bold transition-all ${
                    isTransparent 
                      ? 'border-white text-white hover:bg-white hover:text-blue-900 backdrop-blur-sm' 
                      : ''
                  }`}
                >
                  Iniciar sesión
                </Button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* 👇 SOLUCIÓN: ESPACIADOR FANTASMA
          Solo se renderiza si NO estamos en la Home.
          Empuja el contenido hacia abajo la altura exacta del Header (h-24 = 96px).
      */}
      {!isHome && <div className="h-24 bg-transparent w-full" />}
    </>
  );
}