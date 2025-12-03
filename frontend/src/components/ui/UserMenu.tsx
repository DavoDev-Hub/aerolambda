import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('Usuario');
  const [userRole, setUserRole] = useState('cliente');
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener datos del usuario
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(`${user.nombre} ${user.apellido}`);
      setUserRole(user.rol);
    }

    // Cerrar menú al hacer clic fuera
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/perfil');
    setIsOpen(false);
  };

  const handleAdmin = () => {
    navigate('/admin');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón del menú */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 group
          hover:bg-white/10 
          ${isOpen ? 'bg-white/10' : ''}
        `}
      >
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 ring-2 ring-white/10 group-hover:ring-white/30 transition-all">
          <User className="w-4 h-4 text-white" />
        </div>
        
        {/* Texto: Forzamos herencia de color o blanco explícito */}
        <span className="text-sm font-medium hidden sm:block transition-colors text-white/90 group-hover:text-white">
          {userName}
        </span>
        
        <ChevronDown 
          className={`w-4 h-4 text-white/60 transition-transform duration-300 group-hover:text-white ${isOpen ? 'rotate-180 text-white' : ''}`}
        />
      </button>

      {/* Menú desplegable "Dark Glass" */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 py-2 z-50 overflow-hidden ring-1 ring-black/5 transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header del menú */}
          <div className="px-5 py-4 border-b border-white/10 bg-white/5">
            <p className="text-sm font-bold text-white truncate">{userName}</p>
            <p className="text-xs text-blue-300 capitalize mt-0.5 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              {userRole}
            </p>
          </div>

          {/* Opciones del menú */}
          <div className="p-2 space-y-1">
            <button
              onClick={handleProfile}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all group"
            >
              <div className="p-1.5 bg-slate-800 rounded-lg group-hover:bg-blue-600 transition-colors">
                <Settings className="w-4 h-4 group-hover:text-white" />
              </div>
              Ver perfil
            </button>

            {userRole === 'admin' && (
              <button
                onClick={handleAdmin}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all group"
              >
                <div className="p-1.5 bg-slate-800 rounded-lg group-hover:bg-purple-600 transition-colors">
                   <User className="w-4 h-4 group-hover:text-white" />
                </div>
                Panel de Admin
              </button>
            )}

            <div className="h-px bg-white/10 my-2 mx-2"></div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-200 hover:bg-red-500/10 rounded-xl transition-all group"
            >
              <div className="p-1.5 bg-slate-800 rounded-lg group-hover:bg-red-500/20 transition-colors">
                 <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}