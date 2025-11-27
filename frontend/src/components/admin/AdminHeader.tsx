import { User } from 'lucide-react'; // Quitamos Bell y Search si no son funcionales
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

  return (
    <header className="h-20 bg-white sticky top-0 z-40 px-8 flex items-center justify-between border-b border-slate-200 shadow-sm">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          {pageTitle}
        </h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Perfil Simplificado */}
        <div className="flex items-center gap-3 pl-6">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-700">{userName}</p>
            <p className="text-xs text-slate-500 font-medium">Administrador</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 border border-blue-200 shadow-sm">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}