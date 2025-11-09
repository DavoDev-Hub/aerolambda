import { Request, Response, NextFunction } from 'express';
import { verificarToken } from '../utils/jwt';

// Extender la interfaz de Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: string;
        email: string;
        rol: 'cliente' | 'admin';
      };
    }
  }
}

export const autenticar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No se proporcionó token de autenticación'
      });
      return;
    }

    // Extraer el token (formato: "Bearer <token>")
    const token = authHeader.split(' ')[1];

    // Verificar token
    const decoded = verificarToken(token);

    // Agregar información del usuario al request
    req.usuario = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol
    };

    next();
  } catch (error: any) {
    console.error('Error de autenticación:', error);
    
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
      return;
    }
    
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Error al verificar token'
    });
  }
};

// Middleware para verificar que el usuario sea admin
export const esAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.usuario) {
    res.status(401).json({
      success: false,
      message: 'No autenticado'
    });
    return;
  }

  if (req.usuario.rol !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de administrador'
    });
    return;
  }

  next();
};