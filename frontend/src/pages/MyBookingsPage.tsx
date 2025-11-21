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
  // MapPin, // No se usa
  CreditCard, 
  FileDown, 
  X,
  Eye,
  Clock,
  Armchair
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

// Colores actualizados para mejor contraste
const statusStyles: Record<ReservationStatus, string> = {
  pendiente: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmada: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  completada: 'bg-slate-100 text-slate-800 border-slate-200',
  cancelada: 'bg-rose-100 text-rose-800 border-rose-200',
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

  // --- LÓGICA DEL BACKEND INTACTA ---
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

  // --- RENDERIZADO ---

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
        
        {/* Header de la sección con animación */}
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

        {/* Tabs Estilizados */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex p-1 bg-white rounded-xl shadow-sm w-fit border border-gray-200"
        >
          {[
            { id: 'proximos', label: 'Próximos vuelos' },
            { id: 'pasados', label: 'Vuelos pasados' },
            { id: 'cancelados', label: 'Cancelados' }
          ].map((tab) => (
            <button
              key={tab.id}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                relative px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                ${activeTab === tab.id 
                  ? 'text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
              `}
            >
              {/* Fondo animado para la tab activa */}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Lista de Reservas */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
          <AnimatePresence mode='wait'>
            {filteredReservations.length > 0 ? (
              filteredReservations.map((reservation, index) => (
                <motion.div
                  key={reservation._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden border border-gray-200 bg-white hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
                    
                    {/* Card Header: Ruta y Estado */}
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50">
                      <div className="flex justify-between items-start mb-6">
                        <Badge className={`px-3 py-1 text-xs font-semibold border ${statusStyles[reservation.estado]}`}>
                          {statusLabels[reservation.estado]}
                        </Badge>
                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          {reservation.codigoReserva}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Origen</p>
                          <h3 className="text-xl font-bold text-gray-900">{reservation.vuelo.origen.ciudad}</h3>
                          <p className="text-sm text-primary font-semibold">{reservation.vuelo.origen.codigo}</p>
                        </div>

                        {/* Visualización de Ruta con Avión */}
                        <div className="flex-1 px-6 flex flex-col items-center justify-center">
                          <div className="w-full flex items-center gap-2">
                            <div className="h-[2px] w-full bg-gray-200 relative">
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-full border border-gray-100 group-hover:border-blue-200 group-hover:scale-110 transition-all">
                                <Plane className="w-4 h-4 text-primary transform rotate-90" />
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">Directo</p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Destino</p>
                          <h3 className="text-xl font-bold text-gray-900">{reservation.vuelo.destino.ciudad}</h3>
                          <p className="text-sm text-primary font-semibold">{reservation.vuelo.destino.codigo}</p>
                        </div>
                      </div>
                    </div>

                    {/* Card Body: Detalles */}
                    <div className="p-6 bg-white flex-1">
                      <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                        
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg text-primary">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Fecha</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {new Date(reservation.vuelo.fechaSalida).toLocaleDateString('es-MX', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg text-primary">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Hora</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {reservation.vuelo.horaSalida}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg text-primary">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Pasajero</p>
                            <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]" title={`${reservation.pasajero.nombre} ${reservation.pasajero.apellido}`}>
                              {reservation.pasajero.nombre} {reservation.pasajero.apellido}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg text-primary">
                            <Armchair className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Asiento</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {reservation.asiento.numero}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Precio - Destacado */}
                      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                         <div className="flex items-center gap-2 text-gray-500">
                            <CreditCard className="w-4 h-4" />
                            <span className="text-xs font-medium">Total pagado</span>
                         </div>
                         <p className="text-lg font-bold text-gray-900">
                            ${reservation.precioTotal.toLocaleString()} <span className="text-xs text-gray-500 font-normal">MXN</span>
                         </p>
                      </div>
                    </div>

                    {/* Card Footer: Acciones */}
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                      {/* Botón Ver Detalles: Alineación corregida con flex items-center justify-center */}
                      <Button 
                        variant="default"
                        className="flex-1 flex items-center justify-center bg-white !text-primary border border-primary/20 hover:bg-primary hover:!text-white transition-colors shadow-sm"
                        size="sm"
                        onClick={() => navigate(`/reservas/${reservation._id}/confirmacion`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver detalles
                      </Button>
                                            
                      {/* Botón Comprobante: Color gris por defecto y centrado */}
                      {(reservation.estado === 'completada' || reservation.estado === 'confirmada') && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center justify-center bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                          onClick={() => navigate(`/reservas/${reservation._id}/confirmacion`)}
                          title="Ver comprobante"
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                      )}

                      {reservation.estado === 'confirmada' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center justify-center bg-white text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 transition-colors"
                          title="Cancelar reserva"
                          onClick={() => handleCancelReservation(reservation._id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              // Empty State Animado
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-full"
              >
                <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
                  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                    <div className="mb-6 rounded-full bg-white p-6 shadow-sm ring-1 ring-gray-100">
                      <Plane className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-gray-900">
                      {activeTab === 'proximos' && 'No tienes vuelos próximos'}
                      {activeTab === 'pasados' && 'No tienes vuelos pasados'}
                      {activeTab === 'cancelados' && 'No tienes reservas canceladas'}
                    </h3>
                    <p className="mb-8 text-gray-500 max-w-md">
                      Explora nuestros destinos y comienza a planear tu próxima aventura con AeroLambda.
                    </p>
                    <Button 
                      size="lg" 
                      className="rounded-full px-8 font-semibold shadow-lg hover:shadow-primary/25 transition-all"
                      onClick={() => navigate('/')}
                    >
                      Buscar vuelos
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}