import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/flight/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { CreditCard, Calendar, Lock, Clock, User, AlertCircle, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from "@/config/api";

interface Reserva {
  _id: string;
  vuelo: {
    numeroVuelo: string;
    aerolinea: string;
    origen: { ciudad: string; codigo: string; aeropuerto: string };
    destino: { ciudad: string; codigo: string; aeropuerto: string };
    fechaSalida: string;
    horaSalida: string;
    fechaLlegada: string;
    horaLlegada: string;
    precio: number;
    equipaje?: {
      mano: { permitido: boolean; peso: number; dimensiones: string };
      documentado: { permitido: boolean; peso: number; piezas: number; precioExtra: number };
    };
  };
  asiento: { numero: string; tipo: string };
  pasajero: { nombre: string; apellido: string };
  equipaje: {
    mano: { incluido: boolean; peso: number; dimensions: string };
    documentado: { incluido: boolean; piezasIncluidas: number; piezasAdicionales: number; pesoMaximo: number; costAdicional: number };
  };
  precioTotal: number;
  estado: string;
  createdAt: string;
}

export default function CheckoutPage() {
  const { reservaId } = useParams<{ reservaId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [tiempoRestante, setTiempoRestante] = useState<number>(0);

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    acceptTerms: false,
  });

  const reservaIds = useMemo(() => location.state?.reservaIds || [reservaId], [location.state?.reservaIds, reservaId]);
  const precioTotalState = useMemo(() => location.state?.amount || location.state?.precioTotal, [location.state?.amount, location.state?.precioTotal]);

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
    const fetchReservas = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        const reservasPromises = reservaIds.map((id: string) =>
          fetch(`${API_BASE_URL}/api/reservas/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => { if (!res.ok) throw new Error(`Error ${res.status}`); return res.json(); })
        );

        const reservasData = await Promise.all(reservasPromises);
        const reservasValidas = reservasData.filter(data => data.success).map(data => data.data);

        if (reservasValidas.length === 0) throw new Error('No se encontraron las reservas');

        const reservasPendientes = reservasValidas.filter((r: Reserva) => r.estado === 'pendiente');
        if (reservasPendientes.length > 0) {
          const tiempo = calcularTiempoRestante(reservasPendientes[0].createdAt);
          if (tiempo <= 0) {
            setError('Esta reserva ha expirado. Por favor, realiza una nueva búsqueda.');
            try { await fetch(`${API_BASE_URL}/api/reservas/${reservasPendientes[0]._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); } catch (err) { console.error(err); }
            setLoading(false);
            return;
          }
          setTiempoRestante(tiempo);
        }
        setReservas(reservasValidas);
      } catch (err) {
        const error = err as Error;
        console.error('Error fetching bookings:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (reservaIds && reservaIds.length > 0 && reservaIds[0]) fetchReservas();
    else { setError('No se especificó ID de reserva'); setLoading(false); }
  }, [reservaIds, navigate]);

  useEffect(() => {
    if (tiempoRestante <= 0 || reservas.length === 0) return;
    const interval = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          setError('El tiempo para completar el pago ha expirado.');
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [tiempoRestante, reservas.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tiempoRestante <= 0) {
      alert('El tiempo ha expirado.');
      navigate('/');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }

      const confirmacionesPromises = reservas.map((reserva) =>
        fetch(`${API_BASE_URL}/api/reservas/confirmar-pago`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ reservaId: reserva._id, metodoPago: `Tarjeta terminada en ${paymentData.cardNumber.slice(-4)}` }),
        }).then(res => res.json())
      );

      const confirmaciones = await Promise.all(confirmacionesPromises);
      if (!confirmaciones.every(c => c.success)) throw new Error('Error al confirmar una o más reservas');

      navigate(`/reservas/${reservas[0]._id}/confirmacion`, {
        state: {
          codigoReserva: confirmaciones[0].data?.codigoReserva || reservas[0]._id,
          vuelo: reservas[0].vuelo,
          pasajero: reservas[0].pasajero,
          asiento: reservas[0].asiento,
          precioTotal: total,
          totalReservas: reservas.length
        }
      });
    } catch (err) {
      console.error('Error confirming payment:', err);
      alert('Error al procesar el pago.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900"><Header /><div className="max-w-7xl mx-auto px-4 py-32 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div><p className="text-blue-200">Cargando pago...</p></div></div>;
  if (error) return <div className="min-h-screen bg-slate-900"><Header /><div className="max-w-7xl mx-auto px-4 py-32"><Alert className="border-red-500/50 bg-red-900/20 text-red-200"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert><div className="mt-6 text-center"><Button onClick={() => navigate('/')}>Buscar nuevos vuelos</Button></div></div></div>;
  if (reservas.length === 0) return null;

  const vuelo = reservas[0].vuelo;
  const precioBase = precioTotalState || reservas.reduce((acc, r) => acc + r.precioTotal, 0);
  const total = precioBase

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden">
      {/* Decoración Fondo */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-600/10 blur-[100px] pointer-events-none rounded-full transform -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] pointer-events-none rounded-full transform translate-y-1/3"></div>

      <Header />

      <div className="max-w-7xl mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="mb-10 text-center lg:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Completa tu compra</h1>
          <p className="text-slate-400">Ingresa los datos de tu tarjeta para finalizar la reserva de forma segura</p>
          
          {tiempoRestante > 0 && (
            <Alert className="mt-6 bg-yellow-500/10 border-yellow-500/20 text-yellow-200 max-w-md mx-auto lg:mx-0">
              <Clock className="h-4 w-4 text-yellow-400" />
              <AlertDescription>
                Tiempo restante: <span className="font-bold text-yellow-300 text-lg ml-1">{formatearTiempo(tiempoRestante)}</span>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de Pago */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
                <div className="bg-blue-600/20 p-2 rounded-lg">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Método de Pago</h2>
                
                {/* ✅ ICONOS DE TARJETAS (CSS PURO) */}
                <div className="ml-auto flex gap-3">
                  {/* VISA */}
                  <div className="h-8 w-12 bg-white rounded flex items-center justify-center">
                    <span className="text-blue-800 font-bold italic text-xs tracking-tighter">VISA</span>
                  </div>
                  {/* MASTERCARD */}
                  <div className="h-8 w-12 bg-slate-800 rounded flex items-center justify-center relative overflow-hidden border border-white/10">
                    <div className="w-4 h-4 bg-red-500/90 rounded-full -translate-x-1"></div>
                    <div className="w-4 h-4 bg-yellow-500/90 rounded-full translate-x-1"></div>
                  </div>
                  {/* AMEX */}
                  <div className="h-8 w-12 bg-blue-400 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-[8px] tracking-tighter">AMEX</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber" className="text-slate-300">Número de tarjeta</Label>
                  <div className="relative">
                    <Input id="cardNumber" type="text" placeholder="0000 0000 0000 0000" maxLength={19} value={paymentData.cardNumber} onChange={(e) => {
                      let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                      value = value.match(/.{1,4}/g)?.join(' ') || value;
                      setPaymentData({ ...paymentData, cardNumber: value });
                    }} className="h-12 pl-12 bg-slate-900/50 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20" required />
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardName" className="text-slate-300">Titular de la tarjeta</Label>
                  <div className="relative">
                    <Input id="cardName" type="text" placeholder="NOMBRE APELLIDO" value={paymentData.cardName} onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value.toUpperCase() })} className="h-12 pl-12 bg-slate-900/50 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20" required />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate" className="text-slate-300">Expiración</Label>
                    <div className="relative">
                      <Input id="expiryDate" type="text" placeholder="MM/AA" maxLength={5} value={paymentData.expiryDate} onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2, 4);
                        setPaymentData({ ...paymentData, expiryDate: value });
                      }} className="h-12 pl-12 bg-slate-900/50 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20" required />
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv" className="text-slate-300">CVV / CVC</Label>
                    <div className="relative">
                      <Input id="cvv" type="text" placeholder="123" maxLength={3} value={paymentData.cvv} onChange={(e) => { const value = e.target.value.replace(/\D/g, ''); setPaymentData({ ...paymentData, cvv: value }); }} className="h-12 pl-12 bg-slate-900/50 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20" required />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-900/20 rounded-lg border border-blue-500/10">
                  <Checkbox id="acceptTerms" checked={paymentData.acceptTerms} onCheckedChange={(checked) => setPaymentData({ ...paymentData, acceptTerms: checked as boolean })} className="mt-1 border-white/30 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                  <label htmlFor="acceptTerms" className="text-sm text-slate-300 cursor-pointer leading-relaxed">
                    Acepto los <a href="#" className="text-blue-400 hover:text-blue-300 hover:underline">términos y condiciones</a> y autorizo el cargo a mi tarjeta. <br/>
                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-1"><ShieldCheck className="w-3 h-3" /> Transacción encriptada y segura</span>
                  </label>
                </div>

                <Button type="submit" className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-600/30 border-0" disabled={submitting || !paymentData.acceptTerms || tiempoRestante <= 0}>
                  {submitting ? <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> Procesando...</span> : tiempoRestante <= 0 ? 'Tiempo agotado' : `Pagar $${total.toLocaleString()} MXN`}
                </Button>
              </form>
            </Card>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl sticky top-24">
              <h3 className="text-lg font-bold text-white mb-6">Detalle de la Orden</h3>

              <div className="space-y-4 mb-6 relative">
                {/* Línea de ruta vertical */}
                <div className="absolute left-[7px] top-8 bottom-8 w-0.5 bg-blue-500/30"></div>

                <div className="flex gap-4 relative">
                  <div className="w-4 h-4 rounded-full bg-blue-500 border-4 border-slate-900 shrink-0 mt-1"></div>
                  <div>
                    <p className="text-2xl font-bold text-white tracking-tight">{vuelo.origen.codigo}</p>
                    <p className="text-xs text-slate-400">{vuelo.origen.aeropuerto}</p>
                    <p className="text-sm text-blue-200 mt-1 flex items-center gap-2"><Clock className="w-3 h-3"/> {vuelo.horaSalida}</p>
                  </div>
                </div>

                <div className="flex gap-4 relative">
                  <div className="w-4 h-4 rounded-full bg-white border-4 border-slate-900 shrink-0 mt-1"></div>
                  <div>
                    <p className="text-2xl font-bold text-white tracking-tight">{vuelo.destino.codigo}</p>
                    <p className="text-xs text-slate-400">{vuelo.destino.aeropuerto}</p>
                    <p className="text-sm text-blue-200 mt-1 flex items-center gap-2"><Clock className="w-3 h-3"/> {vuelo.horaLlegada}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Vuelo</span>
                  <span className="text-white font-medium">{vuelo.numeroVuelo}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Pasajeros</span>
                  <span className="text-white font-medium">{reservas.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Fecha</span>
                  <span className="text-white font-medium">{new Date(vuelo.fechaSalida).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="flex justify-between text-sm text-slate-300">
                  <span>Precio</span>
                  <span>${precioBase.toLocaleString()}</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between items-end">
                  <span className="text-lg font-bold text-white">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-400">${total.toLocaleString()}</span>
                    <p className="text-[10px] text-slate-500">MXN</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}