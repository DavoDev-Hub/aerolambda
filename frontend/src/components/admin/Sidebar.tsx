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
    <div className="w-64 bg-[#1e3a8a] text-white flex flex-col border-r border-gray-700 h-screen fixed">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <Plane className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg">AeroLambda</h1>
          <p className="text-xs text-gray-300">Gestión Aérea</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-200 hover:bg-blue-700/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}