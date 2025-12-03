/* eslint-disable @typescript-eslint/no-unused-vars */
import toast from 'react-hot-toast';

/**
 * Interceptor global para manejar errores de autenticación
 */

// Variable para controlar si ya se mostró el mensaje (evitar spam)
let redirectingToLogin = false;

/**
 * Función helper para hacer fetch con manejo automático de 401
 */
export const authFetch = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  // Agregar token automáticamente si existe
  const token = localStorage.getItem('token');
  
  const headers = new Headers(options.headers);
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // Si es 401, el token expiró o es inválido
  if (response.status === 401) {
    handleUnauthorized();
    throw new Error('Sesión expirada');
  }
  
  return response;
};

/**
 * Maneja errores 401 (Unauthorized)
 */
export const handleUnauthorized = () => {
  // Evitar múltiples redirecciones
  if (redirectingToLogin) return;
  
  redirectingToLogin = true;
  
  // Limpiar datos de sesión
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Mostrar mensaje
  toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', {
    duration: 4000,
    id: 'session-expired' // Evita duplicados
  });
  
  // Redirigir al login después de un momento
  setTimeout(() => {
    window.location.href = '/login';
    redirectingToLogin = false;
  }, 1500);
};

/**
 * Hook para verificar token en cada petición
 */
export const setupAuthInterceptor = () => {
  // Interceptar fetch global
  const originalFetch = window.fetch;
  
  window.fetch = async (...args) => {
    const [url, config] = args;
    
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await originalFetch(url, config);
      
      // Si es 401, manejar
      if (response.status === 401) {
        handleUnauthorized();
        
        // Devolver respuesta de error
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Sesión expirada' 
          }), 
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };
};

/**
 * Función helper para verificar si el token es válido (opcional)
 */
export const isTokenValid = (): boolean => {
  const token = localStorage.getItem('token');
  
  if (!token) return false;
  
  try {
    // Decodificar JWT para verificar expiración
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convertir a millisegundos
    
    // Verificar si expiró
    return Date.now() < exp;
  } catch (error) {
    return false;
  }
};

/**
 * Función para renovar el token periódicamente (opcional)
 */
export const startTokenRefreshInterval = () => {
  // Verificar cada 5 minutos
  const interval = setInterval(() => {
    if (!isTokenValid()) {
      handleUnauthorized();
      clearInterval(interval);
    }
  }, 5 * 60 * 1000); // 5 minutos
  
  return () => clearInterval(interval);
};