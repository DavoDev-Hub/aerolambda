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
  Timer,
  AlertCircle
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
    duracion?: string;
    precio: number;
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
  pendiente: 'bg-amber-500/20 text-amber-300 border-amber-500/50 backdrop-blur-md',
  confirmada: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 backdrop-blur-md',
  completada: 'bg-slate-500/20 text-slate-300 border-slate-500/50 backdrop-blur-md',
  cancelada: 'bg-rose-500/20 text-rose-300 border-rose-500/50 backdrop-blur-md',
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
  const [isDownloading, setIsDownloading] = useState(false);

  const calcularTiempoRestante = (createdAt: string): number => {
    const ahora = new Date().getTime();
    const creacion = new Date(createdAt).getTime();
    const transcurrido = ahora - creacion;
    const limite = 15 * 60 * 1000;
    const restante = limite - transcurrido;
    if (restante <= 0) return 0;
    return Math.floor(restante / 1000);
  };

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
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error al cargar reservas');
        if (data.success) {
          const reservasData = data.data.reservas || data.data || [];
          setReservations(reservasData);
          const tiempos: Record<string, number> = {};
          reservasData
            .filter((r: Reservation) => r.estado === 'pendiente')
            .forEach((r: Reservation) => {
              tiempos[r._id] = calcularTiempoRestante(r.createdAt);
            });
          setTiemposRestantes(tiempos);
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
        if (hayExpiraciones) {
          setTimeout(() => window.location.reload(), 1000);
        }
        return nuevo;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCancelReservation = async (reservaId: string) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reservas/${reservaId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al cancelar reserva');
      if (data.success) {
        toast.success('Reserva cancelada exitosamente');
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err) {
      const error = err as Error;
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleGoToPayment = (reservaId: string, amount: number) => {
    navigate(`/reservas/${reservaId}/pago`, { state: { amount } });
  };

  const handleDownloadTicket = async (reservation: Reservation) => {
    setIsDownloading(true);
    const toastId = toast.loading('Generando boleto...');
    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [200, 80] });
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 15, 80, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('AeroLambda', 10, 60, { angle: 90 });
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('PASE DE ABORDAR / BOARDING PASS', 25, 10);
      doc.setFontSize(8);
      doc.text('PASAJERO / PASSENGER', 25, 20);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(`${reservation.pasajero.nombre} ${reservation.pasajero.apellido}`.toUpperCase(), 25, 25);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('DE / FROM', 25, 35);
      doc.text('A / TO', 70, 35);
      doc.setFontSize(16);
      doc.setTextColor(37, 99, 235);
      doc.setFont('helvetica', 'bold');
      doc.text(reservation.vuelo.origen.codigo, 25, 42);
      doc.text(reservation.vuelo.destino.codigo, 70, 42);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('VUELO / FLIGHT', 25, 55);
      doc.text('FECHA / DATE', 55, 55);
      doc.text('HORA / TIME', 85, 55);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(reservation.vuelo.numeroVuelo, 25, 60);
      doc.text(new Date(reservation.vuelo.fechaSalida).toLocaleDateString(), 55, 60);
      doc.text(reservation.vuelo.horaSalida, 85, 60);
      doc.setFillColor(240, 240, 240);
      doc.rect(115, 15, 30, 20, 'F');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('ASIENTO / SEAT', 120, 20);
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(reservation.asiento.numero, 122, 28);
      doc.setDrawColor(200, 200, 200);
      doc.setLineDashPattern([2, 2], 0);
      doc.line(150, 5, 150, 75);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('PASAJERO', 155, 15);
      doc.setTextColor(0, 0, 0);
      doc.text(reservation.pasajero.apellido, 155, 20);
      doc.setTextColor(100, 100, 100);
      doc.text('VUELO', 155, 30);
      doc.setTextColor(0, 0, 0);
      doc.text(reservation.vuelo.numeroVuelo, 155, 35);
      doc.setTextColor(100, 100, 100);
      doc.text('ASIENTO', 155, 45);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(reservation.asiento.numero, 155, 50);
      doc.save(`Boleto-${reservation.codigoReserva}.pdf`);
      toast.success('Boleto descargado exitosamente', { id: toastId });
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.error('Error al generar el boleto', { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  const filteredReservations = reservations.filter((reservation) => {
    if (!reservation.vuelo || !reservation.vuelo.fechaSalida) return false;
    const now = new Date();
    const flightDate = new Date(reservation.vuelo.fechaSalida);
    if (activeTab === 'pendientes') return reservation.estado === 'pendiente';
    if (activeTab === 'proximos') return reservation.estado === 'confirmada' && flightDate >= now;
    if (activeTab === 'pasados') return reservation.estado === 'completada' || (reservation.estado === 'confirmada' && flightDate < now);
    if (activeTab === 'cancelados') return reservation.estado === 'cancelada';
    return false;
  });

  const pendientesCount = reservations.filter(r => r.estado === 'pendiente').length;
  const proximosCount = reservations.filter(r => r.estado === 'confirmada' && r.vuelo && new Date(r.vuelo.fechaSalida) >= new Date()).length;
  const pasadosCount = reservations.filter(r => r.estado === 'completada' || (r.estado === 'confirmada' && r.vuelo && new Date(r.vuelo.fechaSalida) < new Date())).length;
  const canceladosCount = reservations.filter(r => r.estado === 'cancelada').length;

  if (loading) return <div className="min-h-screen bg-slate-900"><Header /><div className="flex items-center justify-center h-[calc(100vh-64px)]"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div><p className="text-blue-200 font-medium">Cargando tus viajes...</p></div></div></div>;
  if (error) return <div className="min-h-screen bg-slate-900"><Header /><div className="flex items-center justify-center h-[calc(100vh-64px)]"><div className="text-center bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-lg border border-white/10"><div className="flex justify-center mb-4"><AlertCircle className="w-12 h-12 text-red-400" /></div><p className="text-white mb-4 font-medium text-lg">{error}</p><Button onClick={() => window.location.reload()} variant="outline" className="text-white border-white/20 hover:bg-white/10">Reintentar</Button></div></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-600/10 blur-[100px] pointer-events-none rounded-full transform -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] pointer-events-none rounded-full transform translate-y-1/3"></div>

      <Header />
      
      {/* ✅ CAMBIO CLAVE: "pt-32" 
          Esto añade padding superior extra para que el contenido empiece 
          debajo del header flotante (que mide aprox h-24 = 6rem + un poco más).
      */}
      <div className="mx-auto max-w-7xl px-4 pt-32 pb-10 sm:px-6 lg:px-8 relative z-10">
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Mis Reservas</h1>
          <p className="text-slate-400 text-lg">Gestiona tus próximos vuelos y consulta tu historial de aventuras</p>
        </motion.div>

        <div className="mb-8 border-b border-white/10">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button onClick={() => setActiveTab('pendientes')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all ${activeTab === 'pendientes' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'}`}>
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" /> Pendientes {pendientesCount > 0 && <Badge className="bg-amber-500 text-white border-none shadow-lg shadow-amber-500/20">{pendientesCount}</Badge>}
              </div>
            </button>
            <button onClick={() => setActiveTab('proximos')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all ${activeTab === 'proximos' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'}`}>
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4" /> Próximos vuelos {proximosCount > 0 && <Badge className="bg-blue-600 text-white border-none shadow-lg shadow-blue-600/20">{proximosCount}</Badge>}
              </div>
            </button>
            <button onClick={() => setActiveTab('pasados')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all ${activeTab === 'pasados' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'}`}>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> Vuelos pasados {pasadosCount > 0 && <Badge variant="secondary" className="bg-slate-700 text-slate-300">{pasadosCount}</Badge>}
              </div>
            </button>
            <button onClick={() => setActiveTab('cancelados')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all ${activeTab === 'cancelados' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'}`}>
              <div className="flex items-center gap-2">
                <X className="w-4 h-4" /> Cancelados {canceladosCount > 0 && <Badge variant="secondary" className="bg-slate-700 text-slate-300">{canceladosCount}</Badge>}
              </div>
            </button>
          </nav>
        </div>

        <AnimatePresence mode="wait">
          {filteredReservations.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center py-20 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5">
              <div className="mx-auto w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6"><Plane className="w-10 h-10 text-white/50" /></div>
              <h3 className="text-xl font-semibold text-white mb-2">{activeTab === 'pendientes' ? '¡Todo al día!' : 'No se encontraron reservas'}</h3>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">Explora nuestros destinos y empieza a viajar.</p>
              <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 h-auto rounded-full shadow-lg">Explorar Vuelos</Button>
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {filteredReservations.map((reservation) => {
                const tiempoRestante = tiemposRestantes[reservation._id] || 0;
                const estaExpirando = tiempoRestante > 0 && tiempoRestante < 5 * 60;

                return (
                  <motion.div key={reservation._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20 group bg-white/5 backdrop-blur-md border border-white/10 text-white ${activeTab === 'pendientes' ? 'border-amber-500/30' : ''}`}>
                      {activeTab === 'pendientes' && (
                        <div className={`p-4 flex items-center justify-between ${estaExpirando ? 'bg-red-500/20 border-b border-red-500/30' : 'bg-amber-500/10 border-b border-amber-500/20'}`}>
                          <div className="flex items-center gap-2">
                            <Timer className={`w-5 h-5 ${estaExpirando ? 'text-red-400' : 'text-amber-400'}`} />
                            <span className={`font-semibold ${estaExpirando ? 'text-red-300' : 'text-amber-300'}`}>{tiempoRestante > 0 ? `Expira en: ${formatearTiempo(tiempoRestante)}` : 'Expirada'}</span>
                          </div>
                          <Badge className={estaExpirando ? 'bg-red-500' : 'bg-amber-500'}>{estaExpirando ? '⚠️ Urgente' : 'Pendiente'}</Badge>
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1">
                            <Badge className={`${statusStyles[reservation.estado]} font-bold tracking-wide`}>{statusLabels[reservation.estado]}</Badge>
                            <p className="text-xs text-slate-400 mt-2 font-mono">REF: {reservation.codigoReserva}</p>
                          </div>
                          {activeTab !== 'pendientes' && (
                            <Button variant="outline" size="sm" className="border-white/10 text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => navigate(`/reservas/${reservation._id}/confirmacion`)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="mb-6 relative">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-xs text-slate-400 font-bold tracking-wider mb-1">SALIDA</p>
                              <p className="text-3xl font-bold text-white tracking-tight">{reservation.vuelo.origen.codigo}</p>
                              <p className="text-sm text-slate-400 truncate max-w-[120px]">{reservation.vuelo.origen.ciudad}</p>
                            </div>
                            <div className="flex-shrink-0 mx-4 flex flex-col items-center justify-center pt-2">
                              <Plane className="w-6 h-6 text-blue-400 rotate-90 mb-2 drop-shadow-lg" />
                              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                              <p className="text-[10px] text-blue-300/70 mt-1">{reservation.vuelo.duracion || 'Directo'}</p>
                            </div>
                            <div className="flex-1 text-right">
                              <p className="text-xs text-slate-400 font-bold tracking-wider mb-1">LLEGADA</p>
                              <p className="text-3xl font-bold text-white tracking-tight">{reservation.vuelo.destino.codigo}</p>
                              <p className="text-sm text-slate-400 truncate max-w-[120px] ml-auto">{reservation.vuelo.destino.ciudad}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex items-start gap-3">
                            <Calendar className="w-4 h-4 text-blue-400 mt-0.5" />
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">Fecha</p>
                              <p className="text-sm font-medium text-white">{new Date(reservation.vuelo.fechaSalida).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Clock className="w-4 h-4 text-blue-400 mt-0.5" />
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">Hora</p>
                              <p className="text-sm font-medium text-white">{reservation.vuelo.horaSalida}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <User className="w-4 h-4 text-blue-400 mt-0.5" />
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">Pasajero</p>
                              <p className="text-sm font-medium text-white truncate max-w-[100px]">{reservation.pasajero.nombre}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Armchair className="w-4 h-4 text-blue-400 mt-0.5" />
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">Asiento</p>
                              <p className="text-sm font-medium text-white">{reservation.asiento.numero}</p>
                            </div>
                          </div>
                        </div>

                        {/* ✅ EQUIPAJE RESTAURADO Y CORREGIDO */}
                        {reservation.equipaje && (
                          <div className="mb-6 px-3 py-3 bg-blue-500/10 rounded-lg border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Luggage className="w-4 h-4 text-blue-400" />
                              <span className="text-xs font-medium text-blue-200 uppercase tracking-wide">Equipaje</span>
                            </div>
                            <div className="text-xs text-blue-100 flex flex-wrap gap-x-4 gap-y-1">
                              {reservation.equipaje.mano?.incluido ? (
                                <span className="flex items-center gap-1">🎒 Mano <span className="opacity-70">({reservation.equipaje.mano.peso}kg)</span></span>
                              ) : (
                                <span className="flex items-center gap-1 opacity-50"><X className="w-3 h-3" /> Sin Mano</span>
                              )}
                              {reservation.equipaje.documentado?.incluido ? (
                                <span className="flex items-center gap-1">🧳 Doc. <span className="opacity-70">({reservation.equipaje.documentado.piezasIncluidas + reservation.equipaje.documentado.piezasAdicionales} pza)</span></span>
                              ) : (
                                <span className="flex items-center gap-1 opacity-50"><X className="w-3 h-3" /> Sin Documentar</span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-600/20 to-transparent border border-blue-500/20">
                          <span className="text-sm font-medium text-slate-300">Total pagado</span>
                          <span className="text-2xl font-bold text-white">${reservation.precioTotal.toLocaleString()} <span className="text-sm font-normal text-slate-400">MXN</span></span>
                        </div>

                        <div className="flex gap-3">
                          {activeTab === 'pendientes' && tiempoRestante > 0 ? (
                            <>
                              <Button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-900/30 border-0" onClick={() => handleGoToPayment(reservation._id, reservation.precioTotal)}>
                                <CreditCard className="w-4 h-4 mr-2" /> Pagar Ahora
                              </Button>
                              <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50" onClick={() => handleCancelReservation(reservation._id)}>
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : activeTab === 'proximos' ? (
                            <>
                              <Button variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10 hover:border-white/40" onClick={() => navigate(`/reservas/${reservation._id}/confirmacion`)}>
                                <Eye className="w-4 h-4 mr-2" /> Ver Ticket
                              </Button>
                              <Button variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10 hover:border-white/40" onClick={() => handleDownloadTicket(reservation)} disabled={isDownloading}>
                                {isDownloading ? '...' : <><FileDown className="w-4 h-4 mr-2" /> Descargar</>}
                              </Button>
                              <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50" onClick={() => handleCancelReservation(reservation._id)}>
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 hover:border-white/40" onClick={() => navigate(`/reservas/${reservation._id}/confirmacion`)}>
                              <Eye className="w-4 h-4 mr-2" /> Ver Detalles Históricos
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