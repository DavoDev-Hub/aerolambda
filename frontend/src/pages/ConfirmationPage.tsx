import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Importamos framer-motion
import Header from '@/components/flight/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
// Eliminamos Separator de ui/Separator porque usaremos uno custom estilo ticket
import {
  Check,
  Plane,
  User,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  Download,
  Search,
} from 'lucide-react';

export default function ConfirmationPage() {
  const { reservaId } = useParams<{ reservaId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reservaData, setReservaData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [, setUserData] = useState<any>(null);

  // --- LÓGICA DE BACKEND INTACTA ---
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

  // --- ESTADOS DE CARGA Y ERROR ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Generando tu pase de abordar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !reservaData) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error de carga</h3>
            <p className="text-gray-500 mb-6">{error || 'No se pudo cargar la confirmación'}</p>
            <Button onClick={() => navigate('/')} className="w-full">
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
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />
      
      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          
          {/* Mensaje de Éxito Animado */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full mb-6 shadow-lg shadow-green-200"
            >
              <Check className="w-12 h-12 text-white stroke-[3]" />
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">¡Estás listo para volar!</h1>
            <p className="text-lg text-gray-600">
              Tu reserva <span className="font-mono font-bold text-primary">{reservaData.codigoReserva}</span> ha sido confirmada.
            </p>
          </motion.div>

          {/* Tarjeta estilo "Boarding Pass" */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="overflow-hidden border-none shadow-2xl bg-white rounded-3xl mb-8 relative">
              
              {/* Decoración superior (Header del Ticket) */}
              <div className="bg-primary p-6 sm:p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-10 -translate-y-10">
                  <Plane className="w-64 h-64" />
                </div>
                
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">Vuelo</p>
                    <p className="text-3xl font-bold tracking-wider">{vuelo.numeroVuelo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-sm font-medium mb-1">Clase</p>
                    <p className="text-xl font-bold capitalize">{asiento.tipo || 'Económica'}</p>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                   <div>
                      <p className="text-4xl font-bold">{vuelo.origen.codigo}</p>
                      <p className="text-blue-100 text-sm mt-1">{vuelo.origen.ciudad}</p>
                   </div>
                   
                   <div className="flex-1 px-4 flex flex-col items-center">
                      <div className="w-full flex items-center gap-2">
                         <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                         <div className="flex-1 border-t-2 border-dashed border-blue-300/50 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                               <Plane className="w-5 h-5 text-white transform rotate-90" />
                            </div>
                         </div>
                         <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                      </div>
                      <p className="text-xs text-blue-100 mt-2">{vuelo.duracion}</p>
                   </div>

                   <div className="text-right">
                      <p className="text-4xl font-bold">{vuelo.destino.codigo}</p>
                      <p className="text-blue-100 text-sm mt-1">{vuelo.destino.ciudad}</p>
                   </div>
                </div>
              </div>

              {/* Cuerpo del Ticket */}
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-8 gap-x-4">
                  
                  <div>
                    <div className="flex items-center gap-2 text-gray-400 mb-1 text-xs uppercase font-bold tracking-wider">
                      <Calendar className="w-3 h-3" /> Fecha
                    </div>
                    <p className="font-bold text-gray-900 text-lg">
                      {new Date(vuelo.fechaSalida).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-400 mb-1 text-xs uppercase font-bold tracking-wider">
                      <Clock className="w-3 h-3" /> Hora
                    </div>
                    <p className="font-bold text-gray-900 text-lg">
                      {vuelo.horaSalida}
                    </p>
                  </div>

                  <div className="col-span-2 sm:col-span-2">
                     <div className="flex items-center gap-2 text-gray-400 mb-1 text-xs uppercase font-bold tracking-wider">
                      <User className="w-3 h-3" /> Pasajero
                    </div>
                    <p className="font-bold text-gray-900 text-lg truncate">
                      {pasajero.nombre} {pasajero.apellido}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-400 mb-1 text-xs uppercase font-bold tracking-wider">
                      <MapPin className="w-3 h-3" /> Puerta
                    </div>
                    <p className="font-bold text-gray-900 text-lg">
                       --
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-400 mb-1 text-xs uppercase font-bold tracking-wider">
                      <User className="w-3 h-3" /> Asiento
                    </div>
                    <p className="font-bold text-primary text-2xl">
                       {asiento.numero}
                    </p>
                  </div>
                  

                </div>
              </div>

              {/* Separador punteado estilo ticket */}
              <div className="relative flex items-center justify-center">
                 <div className="absolute left-0 w-6 h-6 bg-slate-50 rounded-full -translate-x-1/2"></div>
                 <div className="w-full border-t-2 border-dashed border-gray-200"></div>
                 <div className="absolute right-0 w-6 h-6 bg-slate-50 rounded-full translate-x-1/2"></div>
              </div>

              {/* Footer del Ticket (Código y Precio) */}
              <div className="p-6 sm:p-8 bg-gray-50/50">
                 <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-center sm:text-left">
                       <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Código de Reserva</p>
                       <p className="text-2xl font-mono font-bold text-gray-900 tracking-widest">{reservaData.codigoReserva}</p>
                    </div>
                    
                    <div className="text-center sm:text-right">
                       <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Pagado</p>
                       <p className="text-2xl font-bold text-primary">${reservaData.precioTotal?.toLocaleString()} MXN</p>
                    </div>
                 </div>
              </div>
            </Card>
          </motion.div>
          
          {/* Botones de Acción - Alineación corregida */}
          <div className="space-y-3 max-w-md mx-auto">
            <Button 
              size="lg" 
              className="w-full h-14 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all text-base font-semibold flex items-center justify-center gap-2"
              onClick={() => window.print()}
            >
              <Download className="w-5 h-5" />
              <span>Descargar pase de abordar</span>
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                size="lg" 
                className="h-12 bg-white hover:bg-gray-50 border-gray-200 flex items-center justify-center gap-2"
                onClick={() => navigate('/mis-reservas')}
              >
                <User className="w-4 h-4" />
                <span>Mis reservas</span>
              </Button>

              <Button 
                variant="outline" 
                size="lg" 
                className="h-12 bg-white hover:bg-gray-50 border-gray-200 flex items-center justify-center gap-2"
                onClick={() => navigate('/')}
              >
                <Search className="w-4 h-4" />
                <span>Buscar otro</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}