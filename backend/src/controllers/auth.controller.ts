import { Request, Response } from 'express';
import User from '../models/User';
import { generarToken } from '../utils/jwt';

// Registro de usuario
export const registro = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, apellido, email, password, telefono, rol } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
      return;
    }

    // Crear nuevo usuario
    const nuevoUsuario = await User.create({
      nombre,
      apellido,
      email,
      password,
      telefono,
      rol: rol || 'cliente'
    });

// Generar token
    const token = generarToken({
      id: nuevoUsuario._id.toString(),
      email: nuevoUsuario.email,
      rol: nuevoUsuario.rol
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        token,
        usuario: {
          id: nuevoUsuario._id,
          nombre: nuevoUsuario.nombre,
          apellido: nuevoUsuario.apellido,
          email: nuevoUsuario.email,
          rol: nuevoUsuario.rol
        }
      }
    });
  } catch (error: any) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

// Login de usuario
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Buscar usuario (incluir password)
    const usuario = await User.findOne({ email }).select('+password');
    
    if (!usuario) {
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
      return;
    }

    // Verificar si está activo
    if (!usuario.activo) {
      res.status(401).json({
        success: false,
        message: 'Tu cuenta ha sido desactivada'
      });
      return;
    }

    // Verificar password
    const passwordCorrecto = await usuario.compararPassword(password);
    if (!passwordCorrecto) {
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
      return;
    }

    // Actualizar último acceso
    usuario.ultimoAcceso = new Date();
    await usuario.save();

// Generar token
    const token = generarToken({
      id: usuario._id.toString(),
      email: usuario.email,
      rol: usuario.rol
    });

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          rol: usuario.rol
        }
      }
    });
  } catch (error: any) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

// Obtener perfil del usuario autenticado
export const perfil = async (req: Request, res: Response): Promise<void> => {
  try {
    // El ID viene del middleware de autenticación
    const userId = req.usuario?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
      return;
    }

    const usuario = await User.findById(userId);
    
    if (!usuario) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: usuario.rol,
        fechaRegistro: usuario.fechaRegistro
      }
    });
  } catch (error: any) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message
    });
  }
};

// Actualizar perfil del usuario autenticado
export const actualizarPerfil = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.usuario?.id;
    const { nombre, apellido, telefono } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
      return;
    }

    // Buscar usuario
    const usuario = await User.findById(userId);
    
    if (!usuario) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    // Actualizar campos permitidos
    if (nombre) usuario.nombre = nombre;
    if (apellido) usuario.apellido = apellido;
    if (telefono !== undefined) usuario.telefono = telefono;

    await usuario.save();

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: usuario.rol
      }
    });
  } catch (error: any) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message
    });
  }
};

// Cambiar contraseña del usuario autenticado
export const cambiarPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.usuario?.id;
    const { passwordActual, passwordNuevo } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
      return;
    }

    // Validar que se proporcionen ambos passwords
    if (!passwordActual || !passwordNuevo) {
      res.status(400).json({
        success: false,
        message: 'Se requiere la contraseña actual y la nueva contraseña'
      });
      return;
    }

    // Validar longitud de nueva contraseña
    if (passwordNuevo.length < 6) {
      res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
      return;
    }

    // Buscar usuario con password
    const usuario = await User.findById(userId).select('+password');
    
    if (!usuario) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    // Verificar contraseña actual
    const passwordCorrecto = await usuario.compararPassword(passwordActual);
    if (!passwordCorrecto) {
      res.status(401).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
      return;
    }

    // Actualizar contraseña (el middleware pre-save la hasheará automáticamente)
    usuario.password = passwordNuevo;
    await usuario.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error: any) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: error.message
    });
  }
};