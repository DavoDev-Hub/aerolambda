import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';

interface AdminLayoutProps {
  children: ReactNode;
  pageTitle: string;
}

export default function AdminLayout({ children, pageTitle }: AdminLayoutProps) {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar autenticación y rol
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.rol !== 'admin') {
      // Si no es admin, mandar al home de cliente
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar fija a la izquierda */}
      <Sidebar />

      {/* Contenedor Principal: Agregamos ml-72 para dejar espacio a la Sidebar */}
      <div className="flex-1 flex flex-col ml-72 transition-all duration-300">
        <AdminHeader pageTitle={pageTitle} />
        
        {/* Main Content con padding adecuado */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}