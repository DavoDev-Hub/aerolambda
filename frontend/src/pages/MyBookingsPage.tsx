import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/flight/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Plane, 
  Calendar, 
  User, 
  CreditCard, 
  FileDown, 
  X,
  Eye,
  Clock,
  Armchair,
  Luggage,
  Timer
} from 'lucide-react';
import toast from 'react-hot-toast';

type ReservationStatus = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

interface Reservation {
  _id: string;
  codigoReserva: string;
  estado: ReservationStatus;
  vuelo: {
    numeroVuelo: string;
    origen: {
      aeropuerto: string | undefined;
      ciudad: string;
      codigo: string;
    };
    destino: {
      aeropuerto: string | undefined;
      ciudad: string;
      codigo: string;
    };
    fechaSalida: string;
    horaSalida: string;
    precio: number;
    equipaje?: {
      mano: {
        permitido: boolean;
        peso: number;
        dimensiones: string;
      };
      documentado: {
        permitido: boolean;
        peso: number;
        piezas: number;
        precioExtra: number;
      };
    };
  };
  asiento: {
    numero: string;
    tipo?: string;
  };
  pasajero: {
    nombre: string;
    apellido: string;
  };
  equipaje: {
    mano: {
      incluido: boolean;
      peso: number;
      dimensiones: string;
    };
    documentado: {
      incluido: boolean;
      piezasIncluidas: number;
      piezasAdicionales: number;
      pesoMaximo: number;
      costoAdicional: number;
    };
  };
  precioTotal: number;
  createdAt: string;
}

const statusStyles: Record<ReservationStatus, string> = {
  pendiente: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmada: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  completada: 'bg-slate-100 text-slate-800 border-slate-200',
  cancelada: 'bg-rose-100 text-rose-800 border-rose-200',
};

const statusLabels: Record<ReservationStatus, string> = {
  pendiente: 'Pendiente de Pago',
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pendientes' | 'proximos' | 'pasados' | 'cancelados'>('proximos');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tiemposRestantes, setTiemposRestantes] = useState<Record<string, number>>({});

  // Calcular tiempo restante para una reserva pendiente
  const calcularTiempoRestante = (createdAt: string): number => {
    const ahora = new Date().getTime();
    const creacion = new Date(createdAt).getTime();
    const transcurrido = ahora - creacion;
    const limite = 15 * 60 * 1000; // 15 minutos
    const restante = limite - transcurrido;
    
    if (restante <= 0) return 0;
    return Math.floor(restante / 1000); // segundos
  };

  // Formatear tiempo en MM:SS
  const formatearTiempo = (segundos: number): string => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('/api/reservas/mis-reservas', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al cargar reservas');
        }

        if (data.success) {
          const reservasData = data.data.reservas || data.data || [];
          setReservations(reservasData);
          
          // Calcular tiempos restantes para reservas pendientes
          const tiempos: Record<string, number> = {};
          reservasData
            .filter((r: Reservation) => r.estado === 'pendiente')
            .forEach((r: Reservation) => {
              tiempos[r._id] = calcularTiempoRestante(r.createdAt);
            });
          setTiemposRestantes(tiempos);
        } else {
          throw new Error(data.message || 'Error al cargar reservas');
        }
      } catch (err) {
        const error = err as Error;
        console.error('Error fetching reservations:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [navigate]);

  // Actualizar temporizadores cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setTiemposRestantes((prev) => {
        const nuevo: Record<string, number> = {};
        let hayExpiraciones = false;

        Object.keys(prev).forEach((reservaId) => {
          const tiempoActual = prev[reservaId];
          if (tiempoActual > 0) {
            nuevo[reservaId] = tiempoActual - 1;
          } else {
            nuevo[reservaId] = 0;
            hayExpiraciones = true;
          }
        });

        // Si alguna reserva expiró, recargar
        if (hayExpiraciones) {
          setTimeout(() => window.location.reload(), 1000);
        }

        return nuevo;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCancelReservation = async (reservaId: string) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/reservas/${reservaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cancelar reserva');
      }

      if (data.success) {
        toast.success('Reserva cancelada exitosamente');
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error canceling reservation:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleGoToPayment = (reservaId: string, amount: number) => {
    navigate(`/reservas/${reservaId}/pago`, {
      state: { amount }
    });
  };

  const filteredReservations = reservations.filter((reservation) => {
    if (!reservation.vuelo || !reservation.vuelo.fechaSalida) {
      console.warn('Reserva con vuelo eliminado:', reservation._id);
      return false;
    }

    const now = new Date();
    const flightDate = new Date(reservation.vuelo.fechaSalida);
    
    if (activeTab === 'pendientes') {
      return reservation.estado === 'pendiente';
    }
    if (activeTab === 'proximos') {
      return reservation.estado === 'confirmada' && flightDate >= now;
    }
    if (activeTab === 'pasados') {
      return reservation.estado === 'completada' || (reservation.estado === 'confirmada' && flightDate < now);
    }
    if (activeTab === 'cancelados') {
      return reservation.estado === 'cancelada';
    }
    return false;
  });

  // Contar reservas por estado
  const pendientesCount = reservations.filter(r => r.estado === 'pendiente').length;
  const proximosCount = reservations.filter(r => 
    r.estado === 'confirmada' && r.vuelo && new Date(r.vuelo.fechaSalida) >= new Date()
  ).length;
  const pasadosCount = reservations.filter(r => 
    r.estado === 'completada' || (r.estado === 'confirmada' && r.vuelo && new Date(r.vuelo.fechaSalida) < new Date())
  ).length;
  const canceladosCount = reservations.filter(r => r.estado === 'cancelada').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando tus viajes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center bg-white p-8 rounded-xl shadow-lg">
            <p className="text-red-600 mb-4 font-medium text-lg">❌ {error}</p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
            Mis Reservas
          </h1>
          <p className="text-gray-500 text-lg">
            Gestiona tus próximos vuelos y consulta tu historial
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('pendientes')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'pendientes'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Pendientes
                {pendientesCount > 0 && (
                  <Badge className="bg-amber-500 text-white">{pendientesCount}</Badge>
                )}
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('proximos')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'proximos'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4" />
                Próximos vuelos
                {proximosCount > 0 && (
                  <Badge className="bg-primary text-white">{proximosCount}</Badge>
                )}
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('pasados')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'pasados'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Vuelos pasados
                {pasadosCount > 0 && (
                  <Badge variant="secondary">{pasadosCount}</Badge>
                )}
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('cancelados')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'cancelados'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Cancelados
                {canceladosCount > 0 && (
                  <Badge variant="secondary">{canceladosCount}</Badge>
                )}
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {filteredReservations.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16"
            >
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plane className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {activeTab === 'pendientes' && 'No tienes reservas pendientes'}
                {activeTab === 'proximos' && 'No tienes vuelos próximos'}
                {activeTab === 'pasados' && 'No tienes vuelos pasados'}
                {activeTab === 'cancelados' && 'No tienes reservas canceladas'}
              </h3>
              <p className="text-gray-500 mb-6">
                {activeTab === 'pendientes' && 'Las reservas que no completes en 15 minutos aparecerán aquí'}
                {activeTab === 'proximos' && 'Comienza a planear tu próxima aventura'}
                {activeTab === 'pasados' && 'Aún no has completado ningún viaje'}
                {activeTab === 'cancelados' && 'No has cancelado ninguna reserva'}
              </p>
              <Button onClick={() => navigate('/')}>
                Buscar vuelos
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-2"
            >
              {filteredReservations.map((reservation) => {
                const tiempoRestante = tiemposRestantes[reservation._id] || 0;
                const estaExpirando = tiempoRestante > 0 && tiempoRestante < 5 * 60; // Menos de 5 min

                return (
                  <motion.div
                    key={reservation._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className={`
                      overflow-hidden transition-all duration-300 hover:shadow-xl
                      ${activeTab === 'pendientes' ? 'border-2 border-amber-200 bg-amber-50/30' : ''}
                    `}>
                      {/* Temporizador para Pendientes */}
                      {activeTab === 'pendientes' && (
                        <div className={`
                          p-4 flex items-center justify-between
                          ${estaExpirando ? 'bg-red-100 border-b-2 border-red-200' : 'bg-amber-100 border-b-2 border-amber-200'}
                        `}>
                          <div className="flex items-center gap-2">
                            <Timer className={`w-5 h-5 ${estaExpirando ? 'text-red-600' : 'text-amber-600'}`} />
                            <span className={`font-semibold ${estaExpirando ? 'text-red-700' : 'text-amber-700'}`}>
                              {tiempoRestante > 0 ? (
                                <>Expira en: {formatearTiempo(tiempoRestante)}</>
                              ) : (
                                'Expirada'
                              )}
                            </span>
                          </div>
                          <Badge className={estaExpirando ? 'bg-red-500' : 'bg-amber-500'}>
                            {estaExpirando ? '⚠️ Urgente' : 'Pendiente'}
                          </Badge>
                        </div>
                      )}

                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <Badge className={statusStyles[reservation.estado]}>
                              {statusLabels[reservation.estado]}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-2">
                              Código: {reservation.codigoReserva}
                            </p>
                          </div>
                          {activeTab !== 'pendientes' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/reservas/${reservation._id}/confirmacion`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        {/* Flight Route */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-sm text-gray-500">ORIGEN</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {reservation.vuelo.origen.codigo}
                              </p>
                              <p className="text-xs text-gray-600">
                                {reservation.vuelo.origen.ciudad}
                              </p>
                            </div>

                            <div className="flex-shrink-0 mx-4">
                              <div className="flex flex-col items-center">
                                <Plane className="w-6 h-6 text-primary rotate-90 mb-1" />
                                <div className="h-0.5 w-16 bg-gradient-to-r from-primary to-blue-400"></div>
                              </div>
                            </div>

                            <div className="flex-1 text-right">
                              <p className="text-sm text-gray-500">DESTINO</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {reservation.vuelo.destino.codigo}
                              </p>
                              <p className="text-xs text-gray-600">
                                {reservation.vuelo.destino.ciudad}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">Fecha</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {new Date(reservation.vuelo.fechaSalida).toLocaleDateString('es-MX', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">Hora</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {reservation.vuelo.horaSalida}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">Pasajero</p>
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {reservation.pasajero.nombre}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Armchair className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">Asiento</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {reservation.asiento.numero}
                                {reservation.asiento.tipo && (
                                  <span className="text-xs text-blue-600 ml-1">
                                    ({reservation.asiento.tipo === 'ejecutiva' ? '✨' : '💺'})
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Equipaje */}
                        {reservation.vuelo.equipaje && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex items-center gap-2 mb-2">
                              <Luggage className="w-4 h-4 text-blue-600" />
                              <p className="text-xs font-semibold text-blue-900">Equipaje Incluido</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                              {reservation.vuelo.equipaje.mano.permitido && (
                                <div>✓ Mano: {reservation.vuelo.equipaje.mano.peso}kg</div>
                              )}
                              {reservation.vuelo.equipaje.documentado.permitido && (
                                <div>✓ Documentado: {reservation.vuelo.equipaje.documentado.piezas} pza</div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg border border-primary/20">
                          <span className="text-sm font-medium text-gray-700">Total pagado</span>
                          <span className="text-2xl font-bold text-primary">
                            ${reservation.precioTotal.toLocaleString()} MXN
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {activeTab === 'pendientes' && tiempoRestante > 0 ? (
                            <>
                              <Button
                                className="flex-1 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                                onClick={() => handleGoToPayment(reservation._id, reservation.precioTotal)}
                              >
                                <CreditCard className="w-4 h-4 mr-2" />
                                Ir a pagar
                              </Button>
                              <Button
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => handleCancelReservation(reservation._id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : activeTab === 'proximos' ? (
                            <>
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => navigate(`/reservas/${reservation._id}/confirmacion`)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Ver detalles
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1"
                              >
                                <FileDown className="w-4 h-4 mr-2" />
                                Descargar
                              </Button>
                              <Button
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => handleCancelReservation(reservation._id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => navigate(`/reservas/${reservation._id}/confirmacion`)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Ver detalles
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}