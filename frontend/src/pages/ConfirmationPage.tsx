import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import Header from '@/components/flight/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Check, Plane, Calendar, Clock, User, Luggage, Briefcase, Download } from 'lucide-react';
import { generateBoardingPass } from '@/utils/ticketGenerator';
import { API_BASE_URL } from "@/config/api";

export default function ConfirmationPage() {
  const { reservaId } = useParams<{ reservaId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reservaData, setReservaData] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  // Generar QR visual
  useEffect(() => {
    if (reservaData) {
      QRCode.toDataURL(reservaData.codigoReserva, { width: 200, margin: 1, color: { dark: '#1e3a8a' } })
        .then(url => setQrCodeUrl(url));
    }
  }, [reservaData]);

  // Descargar PDF usando el generador maestro
  const handleDownloadPDF = async () => {
    if (!reservaData) return;
    setIsDownloading(true);
    await generateBoardingPass(reservaData);
    setIsDownloading(false);
  };

  // Fetch reserva
  useEffect(() => {
    const fetchReserva = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        if (location.state?.codigoReserva) {
          setReservaData({ _id: reservaId, ...location.state });
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/reservas/${reservaId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) setReservaData(data.data);
        else throw new Error(data.message);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError('No se pudo cargar la reserva');
      } finally {
        setLoading(false);
      }
    };
    fetchReserva();
  }, [reservaId, navigate, location.state]);

  if (loading) return <div className="min-h-screen bg-slate-900"><Header /><div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div></div>;
  if (error) return <div className="min-h-screen bg-slate-900"><Header /><div className="h-screen flex items-center justify-center text-white">{error}</div></div>;

  const { vuelo, asiento, pasajero } = reservaData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-600/10 blur-[100px] pointer-events-none -translate-y-1/2"></div>
      
      <Header />
      
      <div className="py-10 px-4 pt-32 relative z-10 max-w-2xl mx-auto">
        
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6 shadow-lg shadow-green-500/30">
            <Check className="w-10 h-10 text-white stroke-[3]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">¡Estás listo para volar!</h1>
          <p className="text-slate-400">Tu reserva <span className="text-blue-400 font-mono font-bold">{reservaData.codigoReserva}</span> está confirmada.</p>
        </motion.div>

        {/* TARJETA VISUAL DEL BOLETO */}
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card className="overflow-hidden border-none shadow-2xl bg-white rounded-3xl mb-8">
            
            {/* Header Azul */}
            <div className="bg-blue-600 p-8 text-white relative overflow-hidden">
              <Plane className="absolute right-0 top-0 w-64 h-64 opacity-10 -translate-y-10 translate-x-10" />
              
              <div className="relative z-10 flex justify-between mb-8">
                <div>
                  <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Vuelo</p>
                  <p className="text-3xl font-bold">{vuelo.numeroVuelo}</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Clase</p>
                  <p className="text-xl font-bold capitalize">{asiento.tipo || 'Económica'}</p>
                </div>
              </div>

              <div className="relative z-10 flex justify-between items-center">
                {/* Origen */}
                <div className="text-left">
                  <p className="text-5xl font-bold">{vuelo.origen.codigo}</p>
                  <p className="text-lg font-medium text-blue-50">{vuelo.origen.ciudad}</p>
                  <p className="text-xs text-blue-200 mt-1 opacity-80 max-w-[120px]">{vuelo.origen.aeropuerto}</p>
                </div>

                {/* Línea Central */}
                <div className="flex-1 px-4 flex flex-col items-center">
                  <div className="w-full flex items-center gap-2 opacity-50">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    <div className="flex-1 border-t-2 border-dashed border-white"></div>
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  <p className="text-xs text-blue-100 mt-2">{vuelo.duracion}</p>
                </div>

                {/* Destino */}
                <div className="text-right">
                  <p className="text-5xl font-bold">{vuelo.destino.codigo}</p>
                  <p className="text-lg font-medium text-blue-50">{vuelo.destino.ciudad}</p>
                  <p className="text-xs text-blue-200 mt-1 opacity-80 max-w-[120px]">{vuelo.destino.aeropuerto}</p>
                </div>
              </div>
            </div>

            {/* Cuerpo del Boleto */}
            <div className="bg-white p-8">
              <div className="flex flex-col items-center justify-center mb-8">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">ESCANEA PARA ABORDAR</p>
                <div className="p-2 border-4 border-gray-100 rounded-xl">
                  <img src={qrCodeUrl} alt="QR" className="w-40 h-40" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Fecha</p>
                  <p className="text-lg font-bold text-gray-800 capitalize">
                    {new Date(vuelo.fechaSalida).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Hora</p>
                  <p className="text-lg font-bold text-gray-800">{vuelo.horaSalida}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1 flex items-center gap-1"><User className="w-3 h-3"/> Pasajero</p>
                  <p className="text-lg font-bold text-gray-800 truncate">{pasajero.nombre}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1 flex items-center gap-1"><Luggage className="w-3 h-3"/> Asiento</p>
                  <p className="text-3xl font-bold text-blue-600">{asiento.numero}</p>
                </div>
              </div>

              {/* Equipaje */}
              {reservaData.equipaje && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
                   <Briefcase className="w-4 h-4 text-blue-500" />
                   <span>
                     {reservaData.equipaje.mano.incluido ? `Mano ${reservaData.equipaje.mano.peso}kg` : ''}
                     {reservaData.equipaje.mano.incluido && reservaData.equipaje.documentado.incluido ? ' + ' : ''}
                     {reservaData.equipaje.documentado.incluido ? `Doc ${reservaData.equipaje.documentado.piezasIncluidas} pza` : ''}
                   </span>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        <Button 
          size="lg" 
          className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
          onClick={handleDownloadPDF}
          disabled={isDownloading}
        >
          {isDownloading ? 'Generando...' : <><Download className="w-5 h-5"/> Descargar Pase en PDF</>}
        </Button>

        <div className="grid grid-cols-2 gap-4 mt-4">
           <Button variant="outline" className="h-12 border-white/10 text-white hover:bg-white/10" onClick={() => navigate('/mis-reservas')}>Mis Reservas</Button>
           <Button variant="outline" className="h-12 border-white/10 text-white hover:bg-white/10" onClick={() => navigate('/')}>Inicio</Button>
        </div>

      </div>
    </div>
  );
}