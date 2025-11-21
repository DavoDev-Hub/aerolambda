import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/flight/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { 
  Plane, 
  Calendar, 
  User, 
  MapPin, 
  CreditCard, 
  ArrowRight, 
  FileDown, 
  X,
  Eye,
  AlertCircle,
  Clock
} from 'lucide-react';

type ReservationStatus = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

interface Reservation {
  _id: string;
  codigoReserva: string;
  estado: ReservationStatus;
  vuelo: {
    numeroVuelo: string;
    origen: {
      ciudad: string;
      codigo: string;
    };
    destino: {
      ciudad: string;
      codigo: string;
    };
    fechaSalida: string;
    horaSalida: string;
    precio: number;
  };
  asiento: {
    numero: string;
  };
  pasajero: {
    nombre: string;
    apellido: string;
  };
  precioTotal: number;
  createdAt: string;
}

const statusColors: Record<ReservationStatus, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  confirmada: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  completada: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  cancelada: 'bg-red-100 text-red-700 hover:bg-red-100',
};

const statusLabels: Record<ReservationStatus, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'proximos' | 'pasados' | 'cancelados'>('proximos');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🆕 Función para calcular tiempo restante
  const calcularTiempoRestante = (createdAt: string) => {
    const ahora = new Date().getTime();
    const creacion = new Date(createdAt).getTime();
    const transcurrido = ahora - creacion;
    const limite = 15 * 60 * 1000; // 15 minutos
    const restante = limite - transcurrido;
    
    if (restante <= 0) return 0;
    return Math.ceil(restante / (60 * 1000)); // minutos
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
          setReservations(data.data.reservas || []);
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
        alert('Reserva cancelada exitosamente');
        // Recargar reservas
        window.location.reload();
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error canceling reservation:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const filteredReservations = reservations.filter((reservation) => {
    const now = new Date();
    const flightDate = new Date(reservation.vuelo.fechaSalida);
    
    if (activeTab === 'proximos') {
      return (reservation.estado === 'confirmada' || reservation.estado === 'pendiente') && flightDate >= now;
    }
    if (activeTab === 'pasados') {
      return reservation.estado === 'completada' || (reservation.estado === 'confirmada' && flightDate < now);
    }
    if (activeTab === 'cancelados') {
      return reservation.estado === 'cancelada';
    }
    return false;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando reservas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600 mb-4">❌ {error}</p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />
      
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg bg-primary p-2">
              <Plane className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Mis Reservas</h1>
          </div>
          <p className="text-muted-foreground text-lg">Consulta y gestiona tus vuelos</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Button
            variant={activeTab === 'proximos' ? 'default' : 'outline'}
            onClick={() => setActiveTab('proximos')}
            className="rounded-full"
          >
            Próximos vuelos
          </Button>
          <Button
            variant={activeTab === 'pasados' ? 'default' : 'outline'}
            onClick={() => setActiveTab('pasados')}
            className="rounded-full"
          >
            Vuelos pasados
          </Button>
          <Button
            variant={activeTab === 'cancelados' ? 'default' : 'outline'}
            onClick={() => setActiveTab('cancelados')}
            className="rounded-full"
          >
            Cancelados
          </Button>
        </div>

        {/* Reservations List */}
        {filteredReservations.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredReservations.map((reservation) => {
              const minutos = calcularTiempoRestante(reservation.createdAt);
              const esExpirable = reservation.estado === 'pendiente' && minutos > 0;
              const estaExpirada = reservation.estado === 'pendiente' && minutos <= 0;

              return (
                <Card key={reservation._id} className="overflow-hidden border-2 transition-shadow hover:shadow-lg">
                  <div className="p-6 space-y-3 pb-4">
                    <div className="flex items-start justify-between">
                      <Badge className={statusColors[reservation.estado]}>
                        {statusLabels[reservation.estado]}
                      </Badge>
                      <span className="text-sm font-mono text-muted-foreground">
                        {reservation.codigoReserva}
                      </span>
                    </div>

                    {/* 🆕 Alert de tiempo restante para pendientes */}
                    {esExpirable && (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <AlertDescription className="text-yellow-900">
                            <p className="font-semibold mb-1">¡Completa tu pago!</p>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4" />
                              <span>
                                Esta reserva expira en <strong>{minutos} minutos</strong>.
                              </span>
                            </div>
                            <p className="text-xs mt-1">
                              El asiento será liberado automáticamente si no completas el pago.
                            </p>
                          </AlertDescription>
                        </div>
                      </Alert>
                    )}

                    {/* 🆕 Alert de expiración para pendientes vencidos */}
                    {estaExpirada && (
                      <Alert className="border-red-200 bg-red-50">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <AlertDescription className="text-red-900">
                            <p className="font-semibold">Reserva expirada</p>
                            <p className="text-sm mt-1">
                              El tiempo para completar el pago ha vencido. Esta reserva será cancelada automáticamente.
                            </p>
                          </AlertDescription>
                        </div>
                      </Alert>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-foreground">
                          {reservation.vuelo.origen.ciudad}
                        </span>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-foreground">
                          {reservation.vuelo.destino.ciudad}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 space-y-3 pb-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Fecha y hora</p>
                          <p className="text-sm font-medium">
                            {new Date(reservation.vuelo.fechaSalida).toLocaleDateString('es-MX', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })} • {reservation.vuelo.horaSalida}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Plane className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Número de vuelo</p>
                          <p className="text-sm font-medium">{reservation.vuelo.numeroVuelo}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Pasajero</p>
                          <p className="text-sm font-medium">
                            {reservation.pasajero.nombre} {reservation.pasajero.apellido}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-4 w-4 items-center justify-center text-muted-foreground">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                            <path d="M9 3v18M15 3v18M3 9h18M3 15h18" strokeWidth="2" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Asiento</p>
                          <p className="text-sm font-medium">{reservation.asiento.numero}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Precio pagado</p>
                        <p className="text-base font-bold text-primary">
                          ${reservation.precioTotal.toLocaleString()} MXN
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t bg-muted/30 p-4">
                    {/* 🆕 Botón "Completar Pago" para pendientes */}
                    {esExpirable && (
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                        onClick={() => navigate(`/reservas/${reservation._id}/pago`)}
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        Completar Pago
                      </Button>
                    )}

                    {/* Botones originales */}
                    {!esExpirable && !estaExpirada && (
                      <Button 
                        variant="outline" 
                        className="flex-1 bg-transparent" 
                        size="sm"
                        onClick={() => navigate(`/reservas/${reservation._id}/confirmacion`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver detalles
                      </Button>
                    )}

                    {reservation.estado === 'confirmada' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive bg-transparent"
                        onClick={() => handleCancelReservation(reservation._id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    )}

                    {(reservation.estado === 'completada' || reservation.estado === 'confirmada') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/reservas/${reservation._id}/confirmacion`)}
                      >
                        <FileDown className="h-4 w-4 mr-1" />
                        Comprobante
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          // Empty State
          <Card className="border-2 border-dashed">
            <div className="flex flex-col items-center justify-center py-16 p-6">
              <div className="mb-6 rounded-full bg-primary/10 p-6">
                <Plane className="h-16 w-16 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                {activeTab === 'proximos' && 'No tienes vuelos próximos'}
                {activeTab === 'pasados' && 'No tienes vuelos pasados'}
                {activeTab === 'cancelados' && 'No tienes reservas canceladas'}
              </h3>
              <p className="mb-6 text-center text-muted-foreground">
                Comienza a planear tu próximo viaje
              </p>
              <Button 
                size="lg" 
                className="rounded-full"
                onClick={() => navigate('/')}
              >
                Buscar vuelos
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}