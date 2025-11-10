import { z } from 'zod';

// Schema de creación de reserva
export const crearReservaSchema = z.object({
  body: z.object({
    vueloId: z
      .string()
      .min(1, 'El ID del vuelo es requerido'),
    
    asientoId: z
      .string()
      .min(1, 'El ID del asiento es requerido'),
    
    pasajero: z.object({
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
        .email('Email inválido')
        .toLowerCase()
        .trim(),
      
      telefono: z
        .string()
        .regex(/^\+?[\d\s\-\(\)]+$/, 'Teléfono inválido')
        .optional(),
      
      tipoDocumento: z
        .enum(['INE', 'Pasaporte']),
      
      numeroDocumento: z
        .string()
        .min(5, 'El número de documento debe tener al menos 5 caracteres')
        .trim()
    })
  })
});

// Schema de confirmación de pago
export const confirmarPagoSchema = z.object({
  body: z.object({
    reservaId: z
      .string()
      .min(1, 'El ID de la reserva es requerido'),
    
    metodoPago: z
      .string()
      .optional()
      .default('Tarjeta (Simulado)')
  })
});

// Tipos para TypeScript
export type CrearReservaInput = z.infer<typeof crearReservaSchema>['body'];
export type ConfirmarPagoInput = z.infer<typeof confirmarPagoSchema>['body'];