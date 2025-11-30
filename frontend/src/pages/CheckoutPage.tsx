import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/flight/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { CreditCard, Calendar, Lock, Plane, MapPin, Clock, User, AlertCircle, Luggage } from 'lucide-react';

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
    tipo: string;
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
  const [tiempoRestante, setTiempoRestante] = useState<number>(0); // 🆕 Tiempo restante en segundos

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    acceptTerms: false,
  });

  // IDs de todas las reservas (puede venir del location.state o ser solo una)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reservaIds = location.state?.reservaIds || [reservaId];
  const precioTotalState = location.state?.precioTotal;

  // 🆕 Función para calcular tiempo restante
  const calcularTiempoRestante = (createdAt: string): number => {
    const ahora = new Date().getTime();
    const creacion = new Date(createdAt).getTime();
    const transcurrido = ahora - creacion;
    const limite = 15 * 60 * 1000; // 15 minutos
    const restante = limite - transcurrido;
    
    if (restante <= 0) return 0;
    return Math.floor(restante / 1000); // segundos
  };

  // 🆕 Formatear tiempo en MM:SS
  const formatearTiempo = (segundos: number): string => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          navigate('/login');
          return;
        }

        // Cargar todas las reservas
        const reservasPromises = reservaIds.map((id: string) =>
          fetch(`/api/reservas/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then(res => res.json())
        );

        const reservasData = await Promise.all(reservasPromises);
        
        const reservasValidas = reservasData
          .filter(data => data.success)
          .map(data => data.data);

        if (reservasValidas.length === 0) {
          throw new Error('No se encontraron las reservas');
        }

        // 🆕 Verificar si alguna reserva está en estado pendiente
        const reservasPendientes = reservasValidas.filter(r => r.estado === 'pendiente');
        
        if (reservasPendientes.length > 0) {
          // Calcular tiempo restante de la primera reserva pendiente
          const tiempo = calcularTiempoRestante(reservasPendientes[0].createdAt);
          
          if (tiempo <= 0) {
            // Reserva expirada
            setError('Esta reserva ha expirado. El tiempo límite de 15 minutos para completar el pago ha vencido. Por favor, realiza una nueva búsqueda.');
            
            // Opcional: Cancelar automáticamente la reserva
            try {
              await fetch(`/api/reservas/${reservasPendientes[0]._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });
            } catch (err) {
              console.error('Error al cancelar reserva expirada:', err);
            }
            
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

    if (reservaIds && reservaIds.length > 0) {
      fetchReservas();
    }
  }, [reservaIds, navigate]);

  // 🆕 Actualizar contador cada segundo
  useEffect(() => {
    if (tiempoRestante <= 0 || reservas.length === 0) return;

    const interval = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          // Tiempo agotado
          setError('El tiempo para completar el pago ha expirado. Esta reserva será cancelada automáticamente.');
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tiempoRestante, reservas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🆕 Verificar si el tiempo expiró antes de enviar
    if (tiempoRestante <= 0) {
      alert('El tiempo para completar el pago ha expirado. Por favor, realiza una nueva búsqueda.');
      navigate('/');
      return;
    }

    if (!paymentData.acceptTerms) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');

      // Confirmar pago para todas las reservas
      const confirmPromises = reservaIds.map((id: string) =>
        fetch('/api/reservas/confirmar-pago', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reservaId: id,
            metodoPago: 'Tarjeta de crédito (Simulado)',
          }),
        }).then(res => res.json())
      );

      const results = await Promise.all(confirmPromises);

      const allSuccess = results.every(result => result.success);

      if (allSuccess) {
        // Navegar a confirmación
        navigate(`/reservas/${reservaIds[0]}/confirmacion`, {
          state: { reservaIds }
        });
      } else {
        const failedResults = results.filter(r => !r.success);
        throw new Error(failedResults[0]?.message || 'Error al confirmar algunas reservas');
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error confirming payment:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando información...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || reservas.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 mb-4 text-lg font-semibold">
              {error || 'No se pudieron cargar las reservas'}
            </p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Buscar nuevos vuelos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const primeraReserva = reservas[0];
  const vuelo = primeraReserva.vuelo;
  const precioBase = precioTotalState || reservas.reduce((sum, r) => sum + r.precioTotal, 0);
  const impuestos = Math.round(precioBase * 0.16); // 16% de impuestos
  const total = precioBase + impuestos;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-700 to-blue-900">
      <Header />


      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 🆕 Alert de tiempo restante */}
        {tiempoRestante > 0 && (
          <Alert className={`mb-6 ${tiempoRestante < 120 ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
            <div className="flex items-start gap-2">
              <Clock className={`h-5 w-5 mt-0.5 ${tiempoRestante < 120 ? 'text-red-600' : 'text-yellow-600'}`} />
              <AlertDescription className={tiempoRestante < 120 ? 'text-red-900' : 'text-yellow-900'}>
                <p className="font-semibold mb-1">
                  {tiempoRestante < 120 ? '⚠️ ¡Tiempo por agotarse!' : 'Completa tu compra'}
                </p>
                <p className="text-sm">
                  Tu reserva expirará en: <span className="font-bold text-lg">{formatearTiempo(tiempoRestante)}</span>
                </p>
                <p className="text-xs mt-1">
                  Los asientos serán liberados automáticamente si no completas el pago a tiempo.
                </p>
              </AlertDescription>
            </div>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Información de pago</h2>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <span className="text-yellow-600 text-xl">⚠️</span>
                <p className="text-sm text-yellow-800">
                  Esta es una simulación. No se realizará ningún cargo real
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Card Number */}
                <div className="space-y-2">
                  <Label htmlFor="cardNumber" className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Número de tarjeta
                  </Label>
                  <Input
                    id="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    value={paymentData.cardNumber}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\s/g, '');
                      value = value.replace(/(\d{4})/g, '$1 ').trim();
                      setPaymentData({ ...paymentData, cardNumber: value });
                    }}
                    className="h-12"
                    required
                  />
                  <div className="flex gap-2 mt-2">
                    <div className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">VISA</div>
                    <div className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold">Mastercard</div>
                    <div className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold">AMEX</div>
                  </div>
                </div>

                {/* Card Name */}
                <div className="space-y-2">
                  <Label htmlFor="cardName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nombre en la tarjeta
                  </Label>
                  <Input
                    id="cardName"
                    type="text"
                    placeholder="JUAN PÉREZ"
                    value={paymentData.cardName}
                    onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value.toUpperCase() })}
                    className="h-12"
                    required
                  />
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Fecha de vencimiento
                    </Label>
                    <Input
                      id="expiryDate"
                      type="text"
                      placeholder="MM/AA"
                      maxLength={5}
                      value={paymentData.expiryDate}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2, 4);
                        }
                        setPaymentData({ ...paymentData, expiryDate: value });
                      }}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      CVV
                    </Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      maxLength={3}
                      value={paymentData.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setPaymentData({ ...paymentData, cvv: value });
                      }}
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={paymentData.acceptTerms}
                    onCheckedChange={(checked) => setPaymentData({ ...paymentData, acceptTerms: checked as boolean })}
                    className="mt-1"
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-gray-700 cursor-pointer">
                    Acepto los{' '}
                    <a href="#" className="text-primary font-semibold hover:underline">
                      términos y condiciones
                    </a>{' '}
                    y la{' '}
                    <a href="#" className="text-primary font-semibold hover:underline">
                      política de privacidad
                    </a>
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={submitting || !paymentData.acceptTerms || tiempoRestante <= 0}
                >
                  {submitting ? 'Procesando...' : tiempoRestante <= 0 ? 'Tiempo agotado' : 'Confirmar compra'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Resumen de tu compra</h3>

              {/* Flight Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold">
                    {vuelo.origen.codigo} → {vuelo.destino.codigo}
                  </span>
                </div>
                  <div className="text-xs text-gray-500 mt-1 space-y-1">
                    <div className="flex items-start gap-2">
                      <span className="shrink-0">•</span>
                      <span className="line-clamp-2">{vuelo.origen.aeropuerto}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="shrink-0">•</span>
                      <span className="line-clamp-2">{vuelo.destino.aeropuerto}</span>
                    </div>
                  </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(vuelo.fechaSalida).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{vuelo.horaSalida} - {vuelo.horaLlegada}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Plane className="w-4 h-4" />
                  <span>Vuelo {vuelo.numeroVuelo} • {vuelo.aerolinea}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>
                    {reservas.length} pasajero{reservas.length > 1 ? 's' : ''} • Asiento{reservas.length > 1 ? 's' : ''}{' '}
                    {reservas.map(r => r.asiento.numero).join(', ')}
                  </span>
                </div>
              </div>
              {/* Equipaje Incluido */}
              {vuelo.equipaje && (
                <div className="mb-6 pb-4 border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                    <Luggage className="w-4 h-4" />
                    Equipaje Incluido
                  </h4>
                  <div className="space-y-2">
                    {vuelo.equipaje.mano.permitido && (
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Equipaje de mano</span>
                        <span className="font-medium">{vuelo.equipaje.mano.peso}kg x {reservas.length}</span>
                      </div>
                    )}
                    {vuelo.equipaje.documentado.permitido && (
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Equipaje documentado</span>
                        <span className="font-medium">
                          {vuelo.equipaje.documentado.piezas} {vuelo.equipaje.documentado.piezas === 1 ? 'pieza' : 'piezas'} ({vuelo.equipaje.documentado.peso}kg) x {reservas.length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Pasajeros (si son múltiples) */}
              {reservas.length > 1 && (
                <div className="mb-6 pb-6 border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-sm text-gray-900 mb-3">Pasajeros:</h4>
                  <div className="space-y-2">
                    {reservas.map((reserva, index) => (
                      <div key={reserva._id} className="text-xs text-gray-600">
                        <span className="font-medium">Pasajero {index + 1}:</span>{' '}
                        {reserva.pasajero.nombre} {reserva.pasajero.apellido} - Asiento {reserva.asiento.numero}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Precio base</span>
                  <span className="font-semibold">${precioBase.toLocaleString()} MXN</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Impuestos y cargos</span>
                  <span className="font-semibold">${impuestos.toLocaleString()} MXN</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cargo por servicio</span>
                  <span className="font-semibold">$0 MXN</span>
                </div>

                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    ${total.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 text-right">MXN</p>
              </div>

              {/* Cancellation Policy */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Política de cancelación</h4>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li>• Cancelación gratuita hasta 24h antes</li>
                  <li>• Cambios permitidos con cargo adicional</li>
                  <li>• Reembolso del 80% en cancelaciones +6h antes</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}