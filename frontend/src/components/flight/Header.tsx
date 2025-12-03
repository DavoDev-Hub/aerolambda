import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import UserMenu from '@/components/ui/UserMenu';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ ACTUALIZADO: Incluye '/perfil' en el modo oscuro
  const isDarkPage = 
    location.pathname === '/' || 
    location.pathname === '/mis-reservas' || 
    location.pathname === '/perfil' ||
    location.pathname.startsWith('/vuelos/') ||
    location.pathname.startsWith('/reservas/'); 

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

  // ESTILOS DINÁMICOS
  let headerClass = '';
  let textClass = '';
  let activeLinkClass = '';
  let activeBarClass = '';
  let logoTextClass = '';
  let separatorClass = '';

  if (isDarkPage) {
    // --- MODO OSCURO ---
    if (isScrolled) {
      headerClass = 'bg-slate-950/90 backdrop-blur-md border-b border-white/10 shadow-lg py-0';
    } else {
      headerClass = 'bg-gradient-to-b from-black/60 to-transparent pt-4 border-transparent';
    }
    textClass = 'text-gray-300 hover:text-white font-medium transition-colors';
    activeLinkClass = 'text-white font-bold';
    activeBarClass = 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]';
    logoTextClass = 'text-white drop-shadow-md';
    separatorClass = 'bg-white/20';
  } else {
    // --- MODO CLARO ---
    headerClass = 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm py-0';
    textClass = 'text-gray-600 hover:text-gray-900 font-medium transition-colors';
    activeLinkClass = 'text-primary font-bold';
    activeBarClass = 'bg-primary';
    logoTextClass = 'text-gray-900';
    separatorClass = 'bg-gray-200';
  }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'}`}>
            
            <button onClick={() => navigate('/')} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-transform group-hover:scale-105 bg-primary">
                <span className="text-2xl text-white font-bold leading-none pb-1">λ</span>
              </div>
              <span className={`text-xl font-bold tracking-tight transition-colors ${logoTextClass}`}>
                AeroLambda
              </span>
            </button>

            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => navigate('/')} className="relative py-2 group">
                <span className={`text-base ${isActive('/') ? activeLinkClass : textClass}`}>Vuelos</span>
                <span className={`absolute bottom-0 left-0 right-0 h-0.5 transition-transform origin-center duration-300 ${activeBarClass} ${isActive('/') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </button>
              
              {isLoggedIn && (
                <button onClick={() => navigate('/mis-reservas')} className="relative py-2 group">
                  <span className={`text-base ${isActive('/mis-reservas') ? activeLinkClass : textClass}`}>Mis Reservas</span>
                  <span className={`absolute bottom-0 left-0 right-0 h-0.5 transition-transform origin-center duration-300 ${activeBarClass} ${isActive('/mis-reservas') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                </button>
              )}
            </nav>

            <div className="flex items-center gap-4">
              <div className={`hidden md:block w-px h-8 ${separatorClass}`}></div>
              {isLoggedIn ? (
                <div className={isDarkPage ? "[&_span]:text-white [&_svg]:text-gray-300" : ""}>
                  <UserMenu /> 
                </div>
              ) : (
                <Button 
                  onClick={() => navigate('/login')}
                  variant={isDarkPage ? "outline" : "default"}
                  className={`font-bold transition-all ${isDarkPage ? 'border-white/30 text-white hover:bg-white hover:text-blue-900 backdrop-blur-sm' : ''}`}
                >
                  Iniciar sesión
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      {!isDarkPage && <div className="h-20 bg-transparent w-full" />}
    </>
  );
}