import { z } from 'zod';

// Schema para un pasajero individual
const pasajeroSchema = z.object({
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
    .optional()
    .or(z.literal('')),
  
  tipoDocumento: z
    .enum(['INE', 'Pasaporte']),
  
  numeroDocumento: z
    .string()
    .min(5, 'El número de documento debe tener al menos 5 caracteres')
    .trim()
});

// Schema para reserva SIMPLE (1 pasajero)
const reservaSimpleSchema = z.object({
  vueloId: z
    .string()
    .min(1, 'El ID del vuelo es requerido'),
  
  asientoId: z
    .string()
    .min(1, 'El ID del asiento es requerido'),
  
  pasajero: pasajeroSchema
});

// Schema para reserva MÚLTIPLE (varios pasajeros)
const reservaMultipleSchema = z.object({
  vueloId: z
    .string()
    .min(1, 'El ID del vuelo es requerido'),
  
  asientos: z
    .array(z.string().min(1))
    .min(1, 'Debe seleccionar al menos un asiento'),
  
  pasajeros: z
    .array(pasajeroSchema)
    .min(1, 'Debe proporcionar datos de al menos un pasajero')
});

// Schema combinado que acepta AMBOS formatos
export const crearReservaSchema = z.object({
  body: z.union([
    reservaSimpleSchema,
    reservaMultipleSchema
  ])
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
export type CrearReservaSimpleInput = z.infer<typeof reservaSimpleSchema>;
export type CrearReservaMultipleInput = z.infer<typeof reservaMultipleSchema>;
export type CrearReservaInput = CrearReservaSimpleInput | CrearReservaMultipleInput;
export type ConfirmarPagoInput = z.infer<typeof confirmarPagoSchema>['body'];