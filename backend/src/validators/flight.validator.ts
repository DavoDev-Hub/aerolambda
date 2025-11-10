import { z } from 'zod';

// Schema de creación de vuelo
export const crearVueloSchema = z.object({
  body: z.object({
    numeroVuelo: z
      .string()
      .regex(/^[A-Z]{2}-\d{3,4}$/, 'Formato de número de vuelo inválido (ej: AM-1234)')
      .transform(val => val.toUpperCase()),
    
    aerolinea: z
      .string()
      .min(2, 'El nombre de la aerolínea debe tener al menos 2 caracteres')
      .optional()
      .default('AeroLambda'),
    
    origen: z.object({
      ciudad: z.string().min(2, 'La ciudad de origen es requerida'),
      codigo: z
        .string()
        .length(3, 'El código IATA debe tener 3 caracteres')
        .transform(val => val.toUpperCase()),
      aeropuerto: z.string().min(5, 'El nombre del aeropuerto es requerido')
    }),
    
    destino: z.object({
      ciudad: z.string().min(2, 'La ciudad de destino es requerida'),
      codigo: z
        .string()
        .length(3, 'El código IATA debe tener 3 caracteres')
        .transform(val => val.toUpperCase()),
      aeropuerto: z.string().min(5, 'El nombre del aeropuerto es requerido')
    }),
    
    fechaSalida: z.string().refine(
      (date) => !isNaN(Date.parse(date)),
      'Fecha de salida inválida'
    ),
    
    horaSalida: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
    
    fechaLlegada: z.string().refine(
      (date) => !isNaN(Date.parse(date)),
      'Fecha de llegada inválida'
    ),
    
    horaLlegada: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
    
    duracion: z
      .string()
      .regex(/^\d{1,2}h\s\d{1,2}m$/, 'Formato de duración inválido (ej: 2h 30m)'),
    
    precio: z
      .number()
      .positive('El precio debe ser mayor a 0')
      .max(100000, 'El precio es demasiado alto'),
    
    capacidadTotal: z
      .number()
      .int()
      .min(1, 'La capacidad debe ser al menos 1')
      .max(300, 'La capacidad máxima es 300'),
    
    tipoVuelo: z
      .enum(['directo', '1_escala', '2+_escalas'])
      .optional()
      .default('directo')
  })
});

// Schema de actualización de vuelo
export const actualizarVueloSchema = z.object({
  body: z.object({
    numeroVuelo: z
      .string()
      .regex(/^[A-Z]{2}-\d{3,4}$/, 'Formato de número de vuelo inválido')
      .transform(val => val.toUpperCase())
      .optional(),
    
    aerolinea: z.string().min(2).optional(),
    
    origen: z.object({
      ciudad: z.string().min(2).optional(),
      codigo: z.string().length(3).transform(val => val.toUpperCase()).optional(),
      aeropuerto: z.string().min(5).optional()
    }).optional(),
    
    destino: z.object({
      ciudad: z.string().min(2).optional(),
      codigo: z.string().length(3).transform(val => val.toUpperCase()).optional(),
      aeropuerto: z.string().min(5).optional()
    }).optional(),
    
    fechaSalida: z.string().refine(
      (date) => !isNaN(Date.parse(date)),
      'Fecha de salida inválida'
    ).optional(),
    
    horaSalida: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional(),
    
    fechaLlegada: z.string().refine(
      (date) => !isNaN(Date.parse(date)),
      'Fecha de llegada inválida'
    ).optional(),
    
    horaLlegada: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional(),
    
    duracion: z
      .string()
      .regex(/^\d{1,2}h\s\d{1,2}m$/)
      .optional(),
    
    precio: z.number().positive().max(100000).optional(),
    
    capacidadTotal: z.number().int().min(1).max(300).optional(),
    
    estado: z.enum(['programado', 'en_vuelo', 'completado', 'cancelado']).optional(),
    
    tipoVuelo: z.enum(['directo', '1_escala', '2+_escalas']).optional()
  })
});

// Schema de búsqueda de vuelos
export const buscarVuelosSchema = z.object({
  query: z.object({
    origen: z.string().length(3).transform(val => val.toUpperCase()).optional(),
    destino: z.string().length(3).transform(val => val.toUpperCase()).optional(),
    fecha: z.string().refine(
      (date) => !isNaN(Date.parse(date)),
      'Fecha inválida'
    ).optional(),
    estado: z.enum(['programado', 'en_vuelo', 'completado', 'cancelado']).optional()
  })
});

// Tipos para TypeScript
export type CrearVueloInput = z.infer<typeof crearVueloSchema>['body'];
export type ActualizarVueloInput = z.infer<typeof actualizarVueloSchema>['body'];
export type BuscarVuelosInput = z.infer<typeof buscarVuelosSchema>['query'];