import { z } from 'zod';

// Schema de registro
export const registroSchema = z.object({
  body: z.object({
    nombre: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(50, 'El nombre no puede tener más de 50 caracteres')
      .trim(),
    
    apellido: z
      .string()
      .min(2, 'El apellido debe tener al menos 2 caracteres')
      .max(50, 'El apellido no puede tener más de 50 caracteres')
      .trim(),
    
    email: z
      .string()
      .email('Ingrese un email válido')
      .toLowerCase()
      .trim(),
    
    password: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(100, 'La contraseña es demasiado larga'),
    
    telefono: z
      .string()
      .regex(/^\+?[\d\s\-\(\)]+$/, 'Teléfono inválido')
      .optional(),
    
    rol: z
      .enum(['cliente', 'admin'])
      .optional()
      .default('cliente')
  })
});

// Schema de login
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Ingrese un email válido')
      .toLowerCase()
      .trim(),
    
    password: z
      .string()
      .min(1, 'La contraseña es requerida')
  })
});

// Schema de recuperación de contraseña
export const recuperarPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Ingrese un email válido')
      .toLowerCase()
      .trim()
  })
});

// Tipos para TypeScript
export type RegistroInput = z.infer<typeof registroSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RecuperarPasswordInput = z.infer<typeof recuperarPasswordSchema>['body'];