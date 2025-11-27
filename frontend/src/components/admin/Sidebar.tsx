import { Plane, BarChart3, Calendar, LogOut, LayoutDashboard } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { id: 'flights', label: 'Vuelos', icon: Plane, path: '/admin/vuelos' },
    { id: 'reservations', label: 'Reservas', icon: Calendar, path: '/admin/reservas' },
    { id: 'reports', label: 'Reportes', icon: BarChart3, path: '/admin/reportes' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="w-72 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 shadow-2xl z-50">
      {/* Logo Area */}
      <div className="h-20 flex items-center gap-3 px-8 border-b border-slate-800 bg-slate-950/50">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
          <span className="text-2xl font-bold pb-1 text-white">λ</span>
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight text-white">AeroLambda</h1>
          <p className="text-xs text-slate-400 font-medium">Panel Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Menu Principal
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-200'}`} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Actions - Solo Logout para no agregar cosas sin backend */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/30">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all border border-transparent hover:border-red-900/30"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}