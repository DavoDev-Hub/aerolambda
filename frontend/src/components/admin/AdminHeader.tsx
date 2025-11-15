import { User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AdminHeaderProps {
  pageTitle: string;
}

export default function AdminHeader({ pageTitle }: AdminHeaderProps) {
  const [userName, setUserName] = useState('Admin');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserName(`${userData.nombre} ${userData.apellido}`);
    }
  }, []);

  const titles: Record<string, string> = {
    'Dashboard': 'Panel de Control',
    'Vuelos': 'Gestión de Vuelos',
    'Reservas': 'Gestión de Reservas',
    'Reportes': 'Reportes y Análisis',
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900">
        {titles[pageTitle] || pageTitle}
      </h2>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-900">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-gray-500">Administrador</p>
          </div>
        </div>
      </div>
    </header>
  );
}