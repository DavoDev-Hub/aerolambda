// Usuario
export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: 'cliente' | 'admin';
  fechaRegistro: string;
}

// Vuelo
export interface Flight {
  _id: string;
  numeroVuelo: string;
  aerolinea: string;
  origen: {
    ciudad: string;
    codigo: string;
    aeropuerto: string;
  };
  destino: {
    ciudad: string;
    codigo: string;
    aeropuerto: string;
  };
  fechaSalida: string;
  horaSalida: string;
  fechaLlegada: string;
  horaLlegada: string;
  duracion: string;
  precio: number;
  capacidadTotal: number;
  asientosDisponibles: number;
  estado: 'programado' | 'en_vuelo' | 'completado' | 'cancelado';
  tipoVuelo: 'directo' | '1_escala' | '2+_escalas';
}

// Asiento
export interface Seat {
  _id: string;
  numero: string;
  fila: number;
  columna: string;
  tipo: 'economica' | 'ejecutiva';
  estado: 'disponible' | 'ocupado' | 'bloqueado';
}

// Pasajero
export interface Passenger {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  tipoDocumento: 'INE' | 'Pasaporte';
  numeroDocumento: string;
}

// Reserva
export interface Booking {
  _id: string;
  codigoReserva: string;
  usuario: string;
  vuelo: Flight;
  asiento: Seat;
  pasajero: Passenger;
  precioTotal: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  metodoPago?: string;
  fechaReserva: string;
  fechaCancelacion?: string;
}

// Respuestas de la API
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  token: string;
  usuario: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}