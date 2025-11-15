import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  // Si no hay token, redirigir a login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere admin, verificar rol
  if (requireAdmin && userStr) {
    const user = JSON.parse(userStr);
    if (user.rol !== 'admin') {
      alert('No tienes permisos de administrador');
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}