import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/flight/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import {
  CheckCircle2,
  Mail,
  Plane,
  User,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  Download,
  ChevronRight,
} from 'lucide-react';

export default function ConfirmationPage() {
  const { reservaId } = useParams<{ reservaId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reservaData, setReservaData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchReserva = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (!token) {
          navigate('/login');
          return;
        }

        if (user) {
          setUserData(JSON.parse(user));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando confirmación...</p>
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
            <p className="text-red-600 mb-4">❌ {error || 'No se pudo cargar la confirmación'}</p>
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
  const pasajero = reservaData.pasajero;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Success Header */}
          <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">¡Compra confirmada!</h1>
            <p className="text-lg text-muted-foreground">Tu reserva ha sido procesada exitosamente</p>
          </div>

          {/* Booking Code Card */}
          <Card className="mb-6 border-2 border-primary/20 bg-primary/5 p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Código de reserva</p>
            <p className="text-3xl font-bold text-primary mb-2 font-mono tracking-wider">
              {reservaData.codigoReserva}
            </p>
            <p className="text-sm text-muted-foreground">Guarda este código para futuras consultas</p>
          </Card>

          {/* Email Notification */}
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-2">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <AlertDescription className="text-blue-900">
                Hemos enviado la confirmación a tu correo:{' '}
                <span className="font-semibold">{userData?.email || pasajero.email}</span>
              </AlertDescription>
            </div>
          </Alert>

          {/* Flight Details Card */}
          <Card className="mb-6 p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Resumen del vuelo</h2>

            {/* Route */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Origen</p>
                <p className="font-semibold text-foreground">
                  {vuelo.origen.ciudad} ({vuelo.origen.codigo})
                </p>
              </div>
              <div className="px-4">
                <Plane className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm text-muted-foreground mb-1">Destino</p>
                <p className="font-semibold text-foreground">
                  {vuelo.destino.ciudad} ({vuelo.destino.codigo})
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Flight Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium text-foreground">
                    {new Date(vuelo.fechaSalida).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Hora de salida</p>
                  <p className="font-medium text-foreground">{vuelo.horaSalida}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Número de vuelo</p>
                  <p className="font-medium text-foreground">{vuelo.numeroVuelo}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Pasajero</p>
                  <p className="font-medium text-foreground">
                    {pasajero.nombre} {pasajero.apellido}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Seat and Price */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Asiento</p>
                <p className="text-2xl font-bold text-foreground">{asiento.numero}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Precio pagado</p>
                <p className="text-2xl font-bold text-primary">
                  ${reservaData.precioTotal?.toLocaleString()} MXN
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mb-6">
            <Button 
              size="lg" 
              className="w-full h-12"
              onClick={() => window.print()}
            >
              <Download className="w-5 h-5 mr-2" />
              Descargar comprobante
            </Button>

            <Button 
              variant="outline" 
              size="lg" 
              className="w-full h-12"
              onClick={() => navigate('/mis-reservas')}
            >
              Ver mis reservas
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>

            <Button 
              variant="outline" 
              size="lg" 
              className="w-full h-12 bg-transparent"
              onClick={() => navigate('/')}
            >
              Buscar otro vuelo
            </Button>
          </div>

          {/* Important Information */}
          <Alert className="border-amber-200 bg-amber-50">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <AlertDescription className="text-amber-900">
                <div className="space-y-1">
                  <p className="font-semibold">Información importante:</p>
                  <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                    <li>Recuerda llegar al aeropuerto 2 horas antes</li>
                    <li>Presenta tu identificación oficial</li>
                    <li>Revisa el correo para más detalles</li>
                  </ul>
                </div>
              </AlertDescription>
            </div>
          </Alert>
        </div>
      </div>
    </div>
  );
}