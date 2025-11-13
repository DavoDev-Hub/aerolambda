import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/flight/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/Checkbox';
import { Shield, CreditCard, Calendar, Lock, Plane, MapPin, Clock, User } from 'lucide-react';

export default function CheckoutPage() {
  const { reservaId } = useParams<{ reservaId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reservaData, setReservaData] = useState<any>(null);

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    acceptTerms: false,
  });

  useEffect(() => {
    const fetchReserva = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`/api/reservas/${reservaId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al cargar la reserva');
        }

        if (data.success) {
          setReservaData(data.data);
        } else {
          throw new Error(data.message || 'Error al cargar la reserva');
        }
      } catch (err) {
        const error = err as Error;
        console.error('Error fetching booking:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (reservaId) {
      fetchReserva();
    }
  }, [reservaId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentData.acceptTerms) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/reservas/confirmar-pago', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reservaId: reservaId,
          metodoPago: 'Tarjeta (Simulado)'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al confirmar el pago');
      }

      if (data.success) {
        // Navegar a página de confirmación
        navigate(`/reservas/${reservaId}/confirmacion`);
      } else {
        throw new Error(data.message || 'Error al confirmar el pago');
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

  if (error || !reservaData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600 mb-4">❌ {error || 'No se pudo cargar la reserva'}</p>
            <Button onClick={() => navigate('/')}>
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const vuelo = reservaData.vuelo;
  const asiento = reservaData.asiento;
  // const pasajero = reservaData.pasajero;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-700 to-blue-900">
      <Header />

      {/* Security Badge */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="font-medium">Tu pago está protegido con encriptación SSL de 256 bits</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
                  disabled={submitting || !paymentData.acceptTerms}
                >
                  {submitting ? 'Procesando...' : 'Confirmar compra'}
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
                  <span>1 pasajero • Asiento {asiento.numero}</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Precio base</span>
                  <span className="font-semibold">${vuelo.precio?.toLocaleString()} MXN</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Impuestos y cargos</span>
                  <span className="font-semibold">$350 MXN</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cargo por servicio</span>
                  <span className="font-semibold">$0 MXN</span>
                </div>

                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    ${(vuelo.precio + 350)?.toLocaleString()}
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
                  <li>• Reembolso del 80% en canciones 48h antes</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}