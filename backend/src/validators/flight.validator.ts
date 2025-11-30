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
      .regex(/^\d{1,2}h\s*\d{0,2}m?$|^\d{1,2}h$|^\d{1,2}m$/, 'Formato de duración inválido (ej: 2h 30m, 5h, 45m)')
      .transform(val => {
        const match = val.match(/(\d+)h?\s*(\d+)?m?/i);
        if (!match) return val;
        const horas = match[1] || '0';
        const minutos = match[2] || '0';
        return `${horas}h ${minutos}m`;
      }),
    
    precio: z
      .number()
      .positive('El precio debe ser mayor a 0')
      .max(100000, 'El precio es demasiado alto'),
    
    equipaje: z.object({
      mano: z.object({
        permitido: z.boolean().default(true),
        peso: z.number().min(0, 'El peso no puede ser negativo').max(25, 'Peso máximo 25kg').default(10),
        dimensiones: z.string().min(5, 'Las dimensiones son requeridas').default('55x40x20 cm')
      }).optional().default({
        permitido: true,
        peso: 10,
        dimensiones: '55x40x20 cm'
      }),
      documentado: z.object({
        permitido: z.boolean().default(true),
        peso: z.number().min(0, 'El peso no puede ser negativo').max(32, 'Peso máximo 32kg').default(23),
        piezas: z.number().int().min(0, 'Las piezas no pueden ser negativas').max(5, 'Máximo 5 piezas').default(1),
        precioExtra: z.number().min(0, 'El precio extra no puede ser negativo').max(5000, 'Precio extra muy alto').default(500)
      }).optional().default({
        permitido: true,
        peso: 23,
        piezas: 1,
        precioExtra: 500
      })
    }).optional().default({
      mano: {
        permitido: true,
        peso: 10,
        dimensiones: '55x40x20 cm'
      },
      documentado: {
        permitido: true,
        peso: 23,
        piezas: 1,
        precioExtra: 500
      }
    }),
    
    capacidadTotal: z
      .number()
      .int()
      .min(1, 'La capacidad debe ser al menos 1')
      .max(300, 'La capacidad máxima es 300'),
    
    estado: z
      .enum(['programado', 'en_vuelo', 'completado', 'cancelado', 'retrasado'])
      .optional()
      .default('programado'),
    
    tipoVuelo: z
      .enum(['directo', '1_escala', '2_escalas', '2+_escalas'])
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
      ciudad: z.string().min(2),
      codigo: z.string().length(3).transform(val => val.toUpperCase()),
      aeropuerto: z.string().min(5)
    }).optional(),
    
    destino: z.object({
      ciudad: z.string().min(2),
      codigo: z.string().length(3).transform(val => val.toUpperCase()),
      aeropuerto: z.string().min(5)
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
      .regex(/^\d{1,2}h\s*\d{0,2}m?$|^\d{1,2}h$|^\d{1,2}m$/)
      .transform(val => {
        const match = val.match(/(\d+)h?\s*(\d+)?m?/i);
        if (!match) return val;
        const horas = match[1] || '0';
        const minutos = match[2] || '0';
        return `${horas}h ${minutos}m`;
      })
      .optional(),
    
    precio: z.number().positive().max(100000).optional(),
    
    equipaje: z.object({
      mano: z.object({
        permitido: z.boolean(),
        peso: z.number().min(0).max(25),
        dimensiones: z.string().min(5)
      }).optional(),
      documentado: z.object({
        permitido: z.boolean(),
        peso: z.number().min(0).max(32),
        piezas: z.number().int().min(0).max(5),
        precioExtra: z.number().min(0).max(5000)
      }).optional()
    }).optional(),
    
    capacidadTotal: z.number().int().min(1).max(300).optional(),
    
    estado: z.enum(['programado', 'en_vuelo', 'completado', 'cancelado', 'retrasado']).optional(),
    
    tipoVuelo: z.enum(['directo', '1_escala', '2_escalas', '2+_escalas']).optional()
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
    estado: z.enum(['programado', 'en_vuelo', 'completado', 'cancelado', 'retrasado']).optional()
  })
});

// Tipos para TypeScript
export type CrearVueloInput = z.infer<typeof crearVueloSchema>['body'];
export type ActualizarVueloInput = z.infer<typeof actualizarVueloSchema>['body'];
export type BuscarVuelosInput = z.infer<typeof buscarVuelosSchema>['query'];
