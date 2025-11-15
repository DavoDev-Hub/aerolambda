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
    // Verificar autenticación
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      navigate('/login');
      return;
    }

    // Verificar que sea admin
    const userData = JSON.parse(user);
    if (userData.rol !== 'admin') {
      alert('No tienes permisos de administrador');
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col overflow-hidden">
        <AdminHeader pageTitle={pageTitle} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}